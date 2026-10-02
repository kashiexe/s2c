import { CallInstr } from "../../../../lir/instr.js";
import { Allocation } from "../../allocators/sysvamd.js";
import call from "../../instructions/call.js";
import { rax, rbp, rip, rsp, type reg } from "../../regs.js";
import push from "../../instructions/push.js";
import { ptr32 } from "../../mem.js";
import pop from "../../instructions/pop.js";
import CGBlock, { Reloc, RelocType } from "../../cgblock.js";
import mov from "../../instructions/mov.js";
import sub from "../../instructions/sub.js";
import { imm64 } from "../../imm.js";
import { OperandType } from "../../operand.js";
import add from "../../instructions/add.js";

/**
 * 
 * @param instr 
 * @param alloc 
 * @param module 
 * @returns 
 */
export default function translate_call(instr: CallInstr, alloc: Allocation, block: CGBlock): Uint8Array {
    // first, get the caller-saved registers that are currently in use
    let all_used: number[] = [];
    let possible_caller_saved = alloc.abi.get("caller_saved");

    for(let caller_saved of possible_caller_saved) {
        let id = alloc.get_id(caller_saved);
        if(id !== undefined) {
            all_used.push(id);
        }
    }

    // check liveness of all_used values and check if they live beyond the call instruction (and if so, save them to the stack)
    let used_regs: reg[] = [];

    let call_pos = alloc.get_interval(instr.result.id)!.start;

    for(let id of all_used) {
        let location = alloc.get(id);
        let interval = alloc.get_interval(id);

        if(interval && interval.end > call_pos) {
            used_regs.push(location as reg);
        }
    }

    // now, we save the used_regs to the stack, generate call bytes (with placeholder) and restore them again
    let bytes = [];

    // preserve asm instruction used regs
    let preserved_asm_regs: reg[] = [];
    let all_pushes = 0;

    instr.args.forEach(arg => {
        let id = arg.id;

        // check if it's changed
        let location = alloc.get(id);

        let index = block.changed_index(location as reg);
        if(location && location.type === OperandType.Reg && index !== undefined) {

            // pop all registers that were pushed after this register
            for(let j = block.changed.length - 1; j > index; j--) {
                let reg_to_pop = block.changed[j];
                if(reg_to_pop) {
                    // preserve assembly instruction changes
                    if(block.asm_changed_index(reg_to_pop) !== undefined) {
                        for(let k = block.asm_changed.length - 1; k >= 0; k--) {
                            let asm_reg = block.asm_changed[k];
                            if(asm_reg && asm_reg.name === reg_to_pop.name) {
                                all_pushes++;
                                bytes.push(...push(asm_reg));
                                preserved_asm_regs.push(asm_reg);
                                break;
                            }
                        }
                    }
                    bytes.push(...pop(reg_to_pop));
                }
            }

            // remove the register from the changed list
            block.changed.splice(index, 1);

            // push the other registers back to the stack
            for(let j = index; j < block.changed.length; j++) {
                let reg_to_push = block.changed[j];
                if(reg_to_push) {
                    all_pushes++;
                    bytes.push(...push(reg_to_push));
                }
            }
        }
    })

    for(let reg of used_regs) {
        if(reg.name !== rax.name) {
            all_pushes++;
            bytes.push(...push(reg));
        }
    }

    // push rax last
    if(used_regs.find(r => r.name === rax.name)) {
        all_pushes++;
        bytes.push(...push(rax));
    }

    // push all arguments
    let caller_saved = alloc.abi.get("arg_registers");
    let used_cs = [];
    for(let i = 0; i < instr.args.length; i++) {
        let arg = instr.args[i]!;

        let arg_loc = alloc.get(arg.id);
        if(arg_loc) {
            let caller_arg = caller_saved[i];
            used_cs.push(caller_arg);
            if(caller_arg) {
                all_pushes++;
                bytes.push(...push(caller_arg));
                if(caller_arg != arg_loc) bytes.push(...mov(caller_arg, arg_loc));
            } else {
                throw new Error(`[Engine]: calls with more than ${caller_saved.length} are not allowed yet.`);
            }
        } else {
            throw new Error(`[Engine]: Unexpected error with argument ${arg.id} not existing`);
        }
    }

    // stack needs to be 16-byte aligned (if amount of pushes is odd, we need to sub rsp by 8 to align it)
    if(all_pushes % 2 !== 0) {
        bytes.push(...sub(rsp, imm64(8n)));
    }

    // perform the call
    bytes.push(...call(false, ptr32(rip, undefined, undefined, 0n)));

    block.add(new Reloc(
        (block.text.length + bytes.length) - 4 /* -4 because of the placeholder bytes */,
        "text",
        RelocType.Relative,
        instr.callee.name!,
        -4n
    ));

    // create mov rax to result (if there is a rax outliving the call, we need to spill it)
    if(used_regs.find(r => r.name === rax.name) === undefined) {
        bytes.push(...mov(alloc.get(instr.result.id) as reg, rax));
    } else {
        /**
         * if rax was used before the call and lives after the call, we need to update the old rax ID's location to spill it, then rax will become the call's result
         */
    }

    // used caller saved
    for(let i = 0; i < used_cs.length; i++) {
        // pop used_cs
        bytes.push(...pop(used_cs[i]!));
    }

    // go through each asm changed register and pop them from the stack
    for(let i = preserved_asm_regs.length - 1; i >= 0; i--) {
        let reg = preserved_asm_regs[i]!;
        bytes.push(...pop(reg));
    }

    // restore
    for(let i = used_regs.length - 1; i >= 0; i--) {
        let reg = used_regs[i]!;
        if(reg.name !== rax.name) bytes.push(...pop(reg));
    }

    return new Uint8Array(bytes);
}