import Instruction, { AddInstr, CallInstr, ConstInstr, InstructionType, SubInstr, StringInstr, InstructionTypeNames, AsmInstr } from "../../../lir/instr.js";
import type { Allocation } from "../allocators/sysvamd.js";
import translate_add from "./instructions/add.js";
import translate_const from "./instructions/const.js";
import translate_call from "./instructions/call.js";
import translate_sub from "./instructions/sub.js";
import translate_str from "./instructions/str.js";
import type CGBlock from "../cgblock.js";
import translate_asm from "./instructions/asm.js";

export default function translate_instr(instr: Instruction, alloc: Allocation, cgblock: CGBlock): Uint8Array {
    switch(instr.type) {
        case InstructionType.Const: {
            return translate_const(instr as ConstInstr, alloc);
        }

        case InstructionType.Add: {
            return translate_add(instr as AddInstr, alloc);
        }

        case InstructionType.Sub: {
            return translate_sub(instr as SubInstr, alloc);
        }
        case InstructionType.String: {
            return translate_str(instr as StringInstr, alloc, cgblock);
        }

        case InstructionType.Call: {
            return translate_call(instr as CallInstr, alloc, cgblock);
        }

        case InstructionType.Asm: {
            return translate_asm(instr as AsmInstr, alloc, cgblock);
        }

        case InstructionType.Param: {
            return new Uint8Array([]);
        }
    }

    throw new Error(`[Engine]: Instruction translation not implemented for type ${InstructionTypeNames[instr.type]}`);
}