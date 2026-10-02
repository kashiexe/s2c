import { AsmReg, type AsmInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import CGBlock from "../../cgblock.js";
import { imm64 } from "../../imm.js";
import instructions from "../../instructions/all.js";
import push from "../../instructions/push.js";
import { rbx, reg_names } from "../../regs.js";
import { OperandType } from "../../operand.js";
import pop from "../../instructions/pop.js";
import mov from "../../instructions/mov.js";

export default function translate_asm(instr: AsmInstr, alloc: Allocation, cgblock: CGBlock): Uint8Array {
    let instr_name = instr.instr;
    let instr_func = instructions[instr_name];

    if(!instr_func) {
        throw new Error(`[Engine]: Unrecognized assembly instruction: ${instr_name}`);
    } else {
        let final_operands = [];
        let pre_bytes: number[] = [];
        let post_bytes: number[] = [];

        for(let i = 0; i < instr.asm_operands.length; i++) {
            let operand = instr.asm_operands[i]!;

            if(typeof operand === "number") {
                final_operands.push(imm64(BigInt(operand)));
            }  else if (operand instanceof AsmReg) {
                const reg_name = operand.name;

                if (!Object.hasOwn(reg_names, reg_name)) {
                    throw new Error(
                        `[Engine]: Unrecognized register name: ${reg_name}`
                    );
                }

                // get reg and changed index
                const reg = reg_names[reg_name]!;
                const changed_index = cgblock.changed_index(reg);

                // save allocator's original register
                if (
                    alloc.get_id(reg) !== undefined &&
                    changed_index === undefined
                ) {
                    pre_bytes.push(...push(reg));
                    cgblock.changed.push(reg);
                }

                // track the register in the changed list if it's not already there
                if (
                    cgblock.changed_index(reg) !== undefined &&
                    cgblock.asm_changed_index(reg) === undefined
                ) {
                    cgblock.asm_changed.push(reg);
                }

                final_operands.push(reg);
            } else {
                // value
                let value_id = operand.id;
                let value_location = alloc.get(value_id);
                
                if(!value_location) {
                    throw new Error(`[Engine]: Value with id ${value_id} has no allocated location.`);
                } else {
                    if(value_location.type === OperandType.Reg && cgblock.changed_index(value_location) !== undefined) {
                        // pop the register from the stack
                        let index = cgblock.changed_index(value_location)!;

                        // pop all registers that were pushed after this register
                        for(let j = cgblock.changed.length - 1; j >= index; j--) {
                            let reg_to_pop = cgblock.changed[j];

                            // check if it's last register and if it's in asm_changed
                            if(j == index && reg_to_pop && cgblock.asm_changed_index(reg_to_pop) !== undefined) {
                                // move to temporary register and push it back to the stack
                                let temp_reg = alloc.get_free_reg(alloc.get_interval(value_id)!.start);

                                pre_bytes.push(
                                    ...mov(temp_reg, reg_to_pop)
                                );

                                // check if the changed register outlives the current, if so, we need to push it before moving the temporary register
                                if(alloc.get_interval(value_id)!.end <= alloc.get_interval(alloc.get_id(reg_to_pop)!)!.end) {
                                    post_bytes.push(...push(reg_to_pop));
                                }

                                post_bytes.push(
                                    ...mov(reg_to_pop, temp_reg)
                                );
                            }

                            if(reg_to_pop) {
                                pre_bytes.push(...pop(reg_to_pop));
                            }
                        }

                        const changed_reg = cgblock.changed[index];
                        
                        // remove the register from the changed list
                        cgblock.changed.splice(index, 1);

                        if(changed_reg) {
                            const asm_changed_index = cgblock.asm_changed_index(changed_reg);

                            if (asm_changed_index !== undefined) {
                                cgblock.asm_changed.splice(asm_changed_index, 1);
                            }
                        }

                        // push the other registers back to the stack
                        for(let j = index; j < cgblock.changed.length; j++) {
                            let reg_to_push = cgblock.changed[j];
                            if(reg_to_push) {
                                pre_bytes.push(...push(reg_to_push));
                            }
                        }
                    }

                    final_operands.push(value_location);
                }
            }
        }

        return new Uint8Array([...pre_bytes, ...instr_func(...final_operands), ...post_bytes]);
    }
}