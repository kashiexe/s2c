import { Operand, OperandType } from "../operand.js";
import type { reg } from "../regs.js";
import type { mem } from "../mem.js";
import type { imm } from "../imm.js";
import { modrm_sib_ext } from "../modrm_sib.js";
import rex, { W } from "../rex.js";

export function sub_r64_imm64(dest: reg, src: imm): Uint8Array {
    const modrm_sib_bytes = modrm_sib_ext(5, dest);
    const bytes = new Uint8Array(2 + modrm_sib_bytes.length + 4);

    // rex prefix
    let rex_byte = rex(W);
    if(dest.name >= 8) rex_byte |= 0x01;
    bytes[0] = rex_byte;
    
    // opcode
    bytes[1] = 0x81;

    // modrm bytes
    bytes.set(modrm_sib_bytes, 2);

    // immediate (sign extended 32 bits to 64)
    let value = src.value;
    let view = new DataView(bytes.buffer);
    view.setInt32(2 + modrm_sib_bytes.length, Number(value), true);
    
    return bytes;
}

export default function sub(dest: Operand, src: Operand): Uint8Array {
    // different bit sizes
    if(dest.bits !== src.bits) throw new Error(`[Engine]: Operand bit sizes must match`);

    // mem to mem
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: mem to mem operations are not allowed`);
    }

    // x to reg
    if(dest.type === OperandType.Reg) {
        if(src.type === OperandType.Imm) {
            if(dest.bits === 64) return sub_r64_imm64(dest as reg, src as imm);
        }
    }

    throw new Error(`[Engine]: `)
}