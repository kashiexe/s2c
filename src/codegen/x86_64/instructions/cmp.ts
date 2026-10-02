import { Operand, OperandType } from "../operand.js";
import { op_override, type reg } from "../regs.js";
import type { mem } from "../mem.js";
import type { imm } from "../imm.js";
import rex, { W,R,B,X } from "../rex.js";
import modrm_sib, { modrm_sib_ext } from "../modrm_sib.js";

export function cmp_rm8_imm8(op1: reg | mem, op2: imm): Uint8Array {
    const modrm_sib_bytes = modrm_sib_ext(7, op1);
    const bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // opcode
    bytes[0] = 0x80;

    // modrm
    bytes.set(modrm_sib_bytes, 1);

    // encode the imm
    let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    view.setUint8(1 + modrm_sib_bytes.length, op2.value as number);
    
    return bytes;
}

export default function cmp(op1: Operand, op2: Operand): Uint8Array {
    if(op1.bits !== op2.bits) {
        throw new Error(`[Engine]: cmp instruction operands must have the same bits, got ${op1.bits} and ${op2.bits}`);
    }

    if(op1.type === OperandType.Mem && op2.type === OperandType.Mem) {
        throw new Error(`[Engine]: cmp instruction cannot have two memory operands`);
    }

    // check types and sub cmp functions
    if(op1.type === OperandType.Reg) {
        if(op2.type === OperandType.Imm) {
            if(op1.bits === 8) return cmp_rm8_imm8(op1 as reg, op2 as imm);
        }
    } else if(op1.type === OperandType.Mem) {
        if(op2.type === OperandType.Imm) {
            if(op1.bits === 8) return cmp_rm8_imm8(op1 as mem, op2 as imm);
        }
    }

    throw new Error(`[Engine]: cmp instruction not implemented for operands ${op1.type} and ${op2.type}`);
}