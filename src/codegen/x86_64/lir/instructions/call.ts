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

    for(let reg of used_regs) {
        if(reg.name !== rax.name) bytes.push(...push(reg));
    }

    // push rax last
    if(used_regs.find(r => r.name === rax.name)) bytes.push(...push(rax));

    // perform the call
    bytes.push(...call(false, ptr32(rip, undefined, undefined, 0n)));

    block.add(new Reloc(
        (block.text.length + bytes.length) - 4 /* -4 because of the placeholder bytes */,
        "text",
        RelocType.Relative,
        instr.callee.name!,
        4n
    ));

    // create mov rax to result (if there is a rax outliving the call, we need to spill it)
    if(used_regs.find(r => r.name === rax.name) === undefined) {
        bytes.push(...mov(alloc.get(instr.result.id) as reg, rax));
    } else {
        /**
         * if rax was used before the call and lives after the call, we need to update the old rax ID's location to spill it, then rax will become the call's result
         */
    }

    // restore
    for(let i = used_regs.length - 1; i >= 0; i--) {
        let reg = used_regs[i]!;
        if(reg.name !== rax.name) bytes.push(...pop(reg));
    }

    return new Uint8Array(bytes);
}