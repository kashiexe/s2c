import { Operand, OperandType } from "../operand.js";
import type { reg } from "../regs.js";
import type { mem } from "../mem.js";
import type { imm } from "../imm.js";
import rex, { W,R,B,X } from "../rex.js";
import modrm_sib from "../modrm_sib.js";

export function mov_r64_imm64(dest: reg, src: imm): Uint8Array {
    let bytes = new Uint8Array(10);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;

    // opcode
    bytes[1] = 0xB8 + (dest.name & 0x7);

    // immediate value
    let value = src.value as bigint;
    let view = new DataView(bytes.buffer);
    view.setBigInt64(2, value, true);

    // return the bytes
    return bytes;
}

export function mov_r64_r64(dest: reg, src: reg): Uint8Array {
    const modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);
    
    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;
    if(src.name >= 8) bytes[0] |= R;
    
    // opcode
    bytes[1] = 0x89;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    // return the bytes
    return bytes;
}

export function mov_r32_r32(dest: reg, src: reg): Uint8Array {
    let bytes = new Uint8Array(2);

    // opcode
    bytes[0] = 0x8B;

    // modrm byte
    bytes[1] = modrm_sib(dest, src)[0]!;

    // return the bytes
    return bytes;
}

export function mov_r16_r16(dest: reg, src: reg): Uint8Array {
    let bytes = new Uint8Array(2);

    // opcode
    bytes[0] = 0x8B;

    // modrm byte
    bytes[1] = modrm_sib(dest, src)[0]!;

    // return the bytes
    return bytes;
}

export function mov_r8_r8(dest: reg, src: reg): Uint8Array {
    const modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // empty rex
    bytes[0] = rex();

    // opcode
    bytes[1] = 0x8A;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    return bytes;
}

export function mov_r64_mem(dest: reg, src: mem): Uint8Array {
    let modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= R;
    if(src.base && src.base.name >= 8) bytes[0] |= B;
    if(src.index && src.index.name >= 8) bytes[0] |= X;

    // opcode
    bytes[1] = 0x8B;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    return bytes;
}

export default function mov(dest: Operand, src: Operand): Uint8Array {
    // different sizes not allowed
    if(dest.bits !== src.bits) {
        throw new Error(`[Engine]: unsupported mov instruction for operands of different sizes: ${dest.bits} and ${src.bits}`);
    }

    // mem to mem not allowed
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: unsupported mov instruction for two memory operands`);
    }

    // reg to imm
    if(dest.type === OperandType.Reg) {
        if(src.type === OperandType.Imm) {
            if(dest.bits === 64) return mov_r64_imm64(dest as reg, src as imm);
        } else if(src.type === OperandType.Reg) {
            if(dest.bits === 64) return mov_r64_r64(dest as reg, src as reg);
            else if(dest.bits === 32) return mov_r32_r32(dest as reg, src as reg);
            else if(dest.bits === 16) return mov_r16_r16(dest as reg, src as reg);
            else if(dest.bits === 8) return mov_r8_r8(dest as reg, src as reg);
        } else if(src.type === OperandType.Mem) {
            if(dest.bits === 64) return mov_r64_mem(dest as reg, src as mem);
        }
    }

    // unimplemented
    throw new Error(`[Engine]: unsupported mov instruction for operands of types ${dest.type} and ${src.type}`);
}