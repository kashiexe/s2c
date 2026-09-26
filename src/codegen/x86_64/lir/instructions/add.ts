import type { AddInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import add from "../../instructions/add.js";
import mov from "../../instructions/mov.js";
import push from "../../instructions/push.js";
import pop from "../../instructions/pop.js";
import { OperandType } from "../../operand.js";
import { rax } from "../../regs.js";
import add_rbp from "../operand_rbp.js";
import type { mem } from "../../mem.js";

export default function translate_add(instr: AddInstr, alloc: Allocation): Uint8Array {
    let res = alloc.get(instr.result.id)!;
    let lhs = alloc.get(instr.lhs.id)!;
    let rhs = alloc.get(instr.rhs.id)!;

    let bytes: any;

    if(lhs.type === OperandType.Mem) lhs = add_rbp(lhs, alloc.temp_rbp_offset) as mem;
    if(rhs.type === OperandType.Mem) rhs = add_rbp(rhs, alloc.temp_rbp_offset) as mem;
    if(res.type === OperandType.Mem) res = add_rbp(res, alloc.temp_rbp_offset) as mem;

    // if both are spilled, we need to load one of them into a register
    // for that, we will push rax to the stack, load lhs into rax, add rhs to rax and then move rax to the result (and then pop rax from the stack again)
    if(lhs.type === OperandType.Mem && rhs.type === OperandType.Mem) {
        bytes = new Uint8Array([
            ...push(rax),
            ...mov(rax, lhs),
            ...add(rax, rhs),
            ...mov(res, rax),
            ...pop(rax)
        ]);
        return bytes;
    }

    // technically speaking, you can do operation with "mem" as a dest operand but it's better to avoid that because of read-modify-write performance
    if(lhs.type === OperandType.Mem) {
        bytes = new Uint8Array([
            ...push(rax),
            ...mov(rax, lhs),
            ...add(rax, rhs),
            ...pop(rax)
        ]);
    } else {
        bytes = add(lhs, rhs);
    }

    // for both spilled res and lhs, do the same logic we did before
    if(res.type === OperandType.Mem && lhs.type === OperandType.Mem) {
        bytes = new Uint8Array([
            ...bytes, 
            ...push(rax),
            ...mov(rax, lhs),
            ...mov(res, rax),
            ...pop(rax)
        ]);
    } else {
        bytes = new Uint8Array([...bytes, ...mov(res, lhs)]);
    }

    return bytes;
}