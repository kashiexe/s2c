import Instruction, { ConstInstr } from "../../../../lir/instr.js";
import { Allocation } from "../../allocators/sysvamd.js";
import { imm64 } from "../../imm.js";
import mov from "../../instructions/mov.js";
import { OperandType } from "../../operand.js";
import type { mem } from "../../mem.js";
import add_rbp from "../operand_rbp.js";

export default function translate_const(instr: ConstInstr, alloc: Allocation): Uint8Array {
    let op = alloc.get(instr.result.id)!;

    if(op.type === OperandType.Mem) op = add_rbp(op, alloc.temp_rbp_offset) as mem;

    return mov(op, imm64(instr.value));
}