import type { AddInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import add from "../../instructions/add.js";
import mov from "../../instructions/mov.js";
import { rax } from "../../regs.js";

export default function translate_add(instr: AddInstr, alloc: Allocation): Uint8Array {
    const res = alloc.get(instr.result.id)!;
    const lhs = alloc.get(instr.lhs.id)!;
    const rhs = alloc.get(instr.rhs.id)!;

    let bytes = add(lhs, rhs);

    // move to result if result is not rax
    if(res.name !== rax.name) {
        bytes = new Uint8Array([...bytes, ...mov(res, rax)]);
    }

    return bytes;
}