import Terminator, { RetTerminator, TerminatorType } from "../../../lir/terminator.js";
import { Allocation } from "../allocators/sysvamd.js";
import mov from "../instructions/mov.js";
import ret from "../instructions/ret.js";
import { rax } from "../regs.js";

export default function translate_term(term: Terminator, alloc: Allocation): Uint8Array {
    if(term.type === TerminatorType.RET) {
        const ret_term = term as RetTerminator;

        if(!ret_term.value) {
            return ret(false);
        } else {
            const value = alloc.get(ret_term.value.id)!;
            let mov_bytes = new Uint8Array();

            // mov value ID to rax (if not rax)
            if(value.name !== rax.name) {
                mov_bytes = new Uint8Array([...mov_bytes, ...mov(value, rax)]);
            }

            // return with mov + ret
            return new Uint8Array([...mov_bytes, ...ret(false)]);
        }
    }

    throw new Error(`[Engine]: type of terminator not supported yet (type: ${term.type})`);
}