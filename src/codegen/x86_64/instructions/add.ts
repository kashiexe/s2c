import { Operand, OperandType } from "../operand.js";
import type { reg } from "../regs.js";
import type { imm } from "../imm.js";
import rex, { W,B,R } from "../rex.js";
import modrm_sib from "../modrm_sib.js";

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

export default function add(dest: Operand, src: Operand): Uint8Array {
    // different sizes not allowed
    if(dest.bits !== src.bits) {
        throw new Error(`[Engine]: unsupported add instruction for operands of different sizes: ${dest.bits} and ${src.bits}`);
    }

    // mem to mem not allowed
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: unsupported add instruction for two memory operands`);
    }

    // reg to reg
    if(dest.type === OperandType.Reg && src.type === OperandType.Reg) {
        if(dest.bits === 64) return add_r64_r64(dest as reg, src as reg);
    }

    // unimplemented
    throw new Error(`[Engine]: unsupported add instruction for operands of types ${dest.type} and ${src.type}`);
}