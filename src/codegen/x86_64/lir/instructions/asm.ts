import { AsmReg, type AsmInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import CGBlock from "../../cgblock.js";
import { imm64 } from "../../imm.js";
import instructions from "../../instructions/all.js";
import { reg_names } from "../../regs.js";

export default function translate_asm(instr: AsmInstr, alloc: Allocation, cgblock: CGBlock): Uint8Array {
    let instr_name = instr.instr;
    let instr_func = instructions[instr_name];

    if(!instr_func) {
        throw new Error(`[Engine]: Unrecognized assembly instruction: ${instr_name}`);
    } else {
        let final_operands = [];

        for(let i = 0; i < instr.asm_operands.length; i++) {
            let operand = instr.asm_operands[i]!;

            if(typeof operand === "number") {
                final_operands.push(imm64(BigInt(operand)));
            } else if(operand instanceof AsmReg) {
                let reg_name = operand.name;
                
                if(!Object.hasOwn(reg_names, reg_name)) {
                    throw new Error(`[Engine]: Unrecognized register name: ${reg_name}`);
                } else {
                    final_operands.push(reg_names[reg_name]);
                }
            } else {
                // value
                let value_id = operand.id;
                let value_location = alloc.get(value_id);
                
                if(!value_location) {
                    throw new Error(`[Engine]: Value with id ${value_id} has no allocated location.`);
                } else {
                    final_operands.push(value_location);
                }
            }
        }

        return instr_func(...final_operands);
    }
}