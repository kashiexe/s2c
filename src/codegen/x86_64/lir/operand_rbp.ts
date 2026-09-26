import { Operand, OperandType } from "../operand.js";
import { mem } from "../mem.js";
import { rbp } from "../regs.js";

export default function add_rbp(op: Operand, rbp_offset: number): Operand {
    if(op.type !== OperandType.Mem) {
        return op;
    }

    let mem_op = op as mem;
    let copy = new mem(mem_op.bits, mem_op.base, mem_op.index, mem_op.scale, mem_op.displacement);
    if(copy.base?.name === rbp.name) {
        let new_offset = (copy.displacement ?? 0n) - BigInt(rbp_offset);
        if(copy.displacement) copy.displacement = new_offset;
    }

    return copy;
}