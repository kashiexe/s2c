import Terminator, { RetTerminator, TerminatorType } from "../../../lir/terminator.js";
import { Allocation } from "../allocators/sysvamd.js";
import mov from "../instructions/mov.js";
import ret from "../instructions/ret.js";
import type { mem } from "../mem.js";
import { OperandType } from "../operand.js";
import { rax } from "../regs.js";
import add_rbp from "./operand_rbp.js";

export default function translate_term(term: Terminator, alloc: Allocation, insert_bytes?: Uint8Array): Uint8Array {
    if(term.type === TerminatorType.RET) {
        const ret_term = term as RetTerminator;

        if(!ret_term.value) {
            return new Uint8Array([...(insert_bytes || []), ...ret(false)]);
        } else {
            let value = alloc.get(ret_term.value.id)!;

            if(value.type === OperandType.Mem) value = add_rbp(value, alloc.temp_rbp_offset) as mem;

            let mov_bytes = new Uint8Array();

            // mov value ID to rax (if not rax)
            if(value.type === OperandType.Mem || (value.type === OperandType.Reg && value.name !== rax.name)) {
                mov_bytes = new Uint8Array([...mov_bytes, ...mov(rax, value)]);
            }

            // return with mov + ret
            return new Uint8Array([...mov_bytes, ...(insert_bytes || []), ...ret(false)]);
        }
    }

    throw new Error(`[Engine]: type of terminator not supported yet (type: ${term.type})`);
}