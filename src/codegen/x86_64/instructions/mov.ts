import { Operand, OperandType } from "../operand.js";
import type { reg } from "../regs.js";
import type { imm } from "../imm.js";
import rex, { W,R,B } from "../rex.js";
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
    let bytes = new Uint8Array(3);
    
    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;
    if(src.name >= 8) bytes[0] |= R;
    
    // opcode
    bytes[1] = 0x89;

    // modrm byte
    bytes[2] = modrm_sib(dest, src)[0]!;

    // return the bytes
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
    if(dest.type === OperandType.Reg && src.type === OperandType.Imm) {
        if(dest.bits === 64) return mov_r64_imm64(dest as reg, src as imm);
    }

    // unimplemented
    throw new Error(`[Engine]: unsupported mov instruction for operands of types ${dest.type} and ${src.type}`);
}