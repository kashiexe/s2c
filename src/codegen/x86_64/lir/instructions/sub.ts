import type { SubInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import sub from "../../instructions/sub.js";
import mov from "../../instructions/mov.js";
import push from "../../instructions/push.js";
import pop from "../../instructions/pop.js";
import { OperandType } from "../../operand.js";
import { rax } from "../../regs.js";
import add_rbp from "../operand_rbp.js";
import type { mem } from "../../mem.js";

export default function translate_sub(instr: SubInstr, alloc: Allocation): Uint8Array {
    let res = alloc.get(instr.result.id)!;
    let lhs = alloc.get(instr.lhs.id)!;
    let rhs = alloc.get(instr.rhs.id)!;

    let bytes: number[] = [];

    if(lhs.type === OperandType.Mem) lhs = add_rbp(lhs, alloc.temp_rbp_offset) as mem;
    if(rhs.type === OperandType.Mem) rhs = add_rbp(rhs, alloc.temp_rbp_offset) as mem;
    if(res.type === OperandType.Mem) res = add_rbp(res, alloc.temp_rbp_offset) as mem;

    // use result register if possible
    if(res.type === OperandType.Reg && !(res === rhs && res !== lhs)) {
        if(res !== lhs) bytes.push(...mov(res, lhs));

        bytes.push(...sub(res, rhs));
        return new Uint8Array(bytes);
    }

    // if result is spilled, use another register temporarily
    bytes.push(...push(rax));
    bytes.push(...mov(rax, lhs));
    bytes.push(...sub(rax, rhs));

    if(res.type === OperandType.Mem || res !== rax) {
        bytes.push(...mov(res, rax));
    }

    bytes.push(...pop(rax));

    return new Uint8Array(bytes);
}