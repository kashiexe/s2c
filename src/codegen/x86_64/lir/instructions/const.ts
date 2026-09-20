import Instruction, { ConstInstr } from "../../../../lir/instr.js";
import { Allocation } from "../../allocators/sysvamd.js";
import { imm64 } from "../../imm.js";
import mov from "../../instructions/mov.js";

export default function translate_const(instr: ConstInstr, alloc: Allocation): Uint8Array {
    return mov(alloc.get(instr.result.id)!, imm64(instr.value));
}