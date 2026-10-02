import { Operand, OperandType } from "../operand.js";
import type { reg } from "../regs.js";
import type { imm } from "../imm.js";
import rex, { W,B,R,X } from "../rex.js";
import modrm_sib, { modrm_sib_ext } from "../modrm_sib.js";
import type { mem } from "../mem.js";

export function add_r64_r64(dest: reg, src: reg): Uint8Array {
    let bytes = new Uint8Array(3);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;
    if(src.name >= 8) bytes[0] |= R;

    // opcode
    bytes[1] = 0x01;

    // modrm byte
    bytes[2] = modrm_sib(dest, src)[0]!;
    
    // return the bytes
    return bytes;
}

export function add_mem_r64(dest: mem, src: reg): Uint8Array {
    // modrm and sib bytes
    const modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);
    
    // rex prefix
    bytes[0] = rex(W);
    if(dest.base && dest.base.name >= 8) bytes[0] |= B;
    if(dest.index && dest.index.name >= 8) bytes[0] |= X;
    if(src.name >= 8) bytes[0] |= R;

    // opcode
    bytes[1] = 0x01;

    // set modrm sib bytes
    bytes.set(modrm_sib_bytes, 2);

    // return the bytes
    return bytes;
}

export function add_rm64_imm32(dest: reg | mem, src: imm): Uint8Array {
    let modrm_sib = modrm_sib_ext(0, dest);
    let bytes = new Uint8Array(2 + modrm_sib.length + 4);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.type === OperandType.Reg && (dest as reg).name >= 8) bytes[0] |= B;
    if(dest.type === OperandType.Mem) {
        if((dest as mem).base && (dest as mem).base!.name >= 8) bytes[0] |= B;
        if((dest as mem).index && (dest as mem).index!.name >= 8) bytes[0] |= X;
    }

    // opcode
    bytes[1] = 0x81;

    // set modrm sib bytes
    bytes.set(modrm_sib, 2);

    // encode the imm32
    let view = new DataView(bytes.buffer);
    view.setInt32(2 + modrm_sib.length, Number(src.value), true);

    // return the bytes
    return bytes;
}

export default function add(dest: Operand, src: Operand): Uint8Array {
    // different sizes not allowed
    if(src.bits > dest.bits) {
        throw new Error(`[Engine]: unsupported add instruction for operands of different sizes: ${dest.bits} and ${src.bits}`);
    }

    // mem to mem not allowed
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: unsupported add instruction for two memory operands`);
    }

    // reg to reg
    if(dest.type === OperandType.Reg) {
        if(src.type === OperandType.Reg) {
            if(dest.bits === 64) return add_r64_r64(dest as reg, src as reg);
        } else if(src.type === OperandType.Imm) {
            if(dest.bits === 64) return add_rm64_imm32(dest as reg, src as imm);
        }
    } else if(dest.type === OperandType.Mem) {
        if(src.type === OperandType.Reg) {
            if(dest.bits === 64) return add_mem_r64(dest as mem, src as reg);
        }
    }

    // unimplemented
    throw new Error(`[Engine]: unsupported add instruction for operands of types ${dest.type} and ${src.type}`);
}