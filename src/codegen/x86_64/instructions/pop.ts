import { Operand, OperandType } from "../operand.js";
import { reg, op_override } from "../regs.js";

export function pop_r64(reg: reg): Uint8Array {
    let bytes = [];

    // 0x58 + reg
    if(reg.name > 7) bytes.push(0x41); // REX.B

    bytes.push(0x58 + (reg.name & 0x7));
    
    return new Uint8Array(bytes);
}

export default function pop(op: Operand): Uint8Array {

    if(op.type === OperandType.Reg) {
        if(op.bits === 64 || op.bits === 32) return pop_r64(op as reg);
        if(op.bits === 16) return new Uint8Array([op_override(16), 0x58 + ((op as reg).name & 0x7)]);
    }

    throw new Error(`[Engine]: pop instruction for operand ${op.type} has not been implemented yet`);
}