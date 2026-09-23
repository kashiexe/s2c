import { Operand, OperandType } from "../operand.js";
import { op_override, type reg } from "../regs.js";
import rex, { B } from "../rex.js";

/**
 * strangely enough, both r64 and r32 have the same encoding, the CPU simply ignores the instruction of bit-width that is not being used
 * so for example, if the CPU is in protected mode, push r32 is gonna be used over r64, and vice versa for long mode
 * @param reg 
 * @returns 
 */
export function push_r64(reg: number): Uint8Array {
    let bytes = [];

    // 0x50 + reg
    if(reg > 7) bytes.push(rex(B));

    bytes.push(0x50 + (reg & 0x7));

    return new Uint8Array(bytes);
}

export default function push(op: Operand): Uint8Array {


    if(op.type === OperandType.Reg) {
        if(op.bits === 64 || op.bits === 32) return push_r64((op as reg).name);
        if(op.bits === 16) return new Uint8Array([op_override(16), 0x50 + ((op as reg).name & 0x7)]);
    }

    throw new Error(`[Engine]: push instruction for operand ${op.type} has not been implemented yet`);

}