import Instruction, { AddInstr, ConstInstr, InstructionType } from "../../../lir/instr.js";
import type { Allocation } from "../allocators/sysvamd.js";
import translate_add from "./instructions/add.js";
import translate_const from "./instructions/const.js";

export default function translate_instr(instr: Instruction, alloc: Allocation): Uint8Array {
    switch(instr.type) {
        case InstructionType.Const: {
            return translate_const(instr as ConstInstr, alloc);
        }

        case InstructionType.Add: {
            return translate_add(instr as AddInstr, alloc);
        }
    }

    throw new Error(`[Engine]: Instruction translation not implemented for type ${InstructionType[instr.type]}`);
}