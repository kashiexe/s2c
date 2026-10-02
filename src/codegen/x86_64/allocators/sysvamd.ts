/*
    no need to change the name of the file as the file already is inside of a 64 bit arch thus it's already implied it's 64 bit
*/

import Module from "../../../lir/module.js";
import TargetABI, { Allocation, FunctionFrame, Interval } from "./target.js";
import { regs, r64, reg, rbp } from "../regs.js";
import type BasicBlock from "../../../lir/bb.js";
import type Value from "../../../lir/value.js";
import { mem, ptr64 } from "../mem.js";
import { TerminatorType, RetTerminator } from "../../../lir/terminator.js";
import { InstructionType } from "../../../lir/instr.js";
export { Allocation } from "./target.js";

/**
 * this class includes all registers that are allocatable, caller saved, callee saved, arg regs and return register according to the SysVAMD64 ABI
 */
export class SysVAMD64ABI extends TargetABI {
    constructor() {
        super(
            // allocatable registers
            [
                r64(regs.rax),
                r64(regs.rcx),
                r64(regs.rdx),
                r64(regs.rbx),
                r64(regs.rsi),
                r64(regs.rdi),
                r64(regs.r8),
                r64(regs.r9),
                r64(regs.r10),
                r64(regs.r11),
                r64(regs.r12),
                r64(regs.r13),
                r64(regs.r14),
                r64(regs.r15)
            ],

            // caller saved
            [
                r64(regs.rax),
                r64(regs.rcx),
                r64(regs.rdx),
                r64(regs.rsi),
                r64(regs.rdi),
                r64(regs.r8),
                r64(regs.r9),
                r64(regs.r10),
                r64(regs.r11)
            ],

            // callee saved
            [
                r64(regs.rbx),
                r64(regs.rbp),
                r64(regs.r12),
                r64(regs.r13),
                r64(regs.r14),
                r64(regs.r15)
            ],

            // argument registers (in order)
            [
                r64(regs.rdi),
                r64(regs.rsi),
                r64(regs.rdx),
                r64(regs.rcx),
                r64(regs.r8),
                r64(regs.r9)
            ],

            // return register
            r64(regs.rax)
        );
    }
}

export { Interval } from "./target.js";

export function block(ctx: Context, block: BasicBlock, func_name: string) {
    let intervals = ctx.intervals;
    let param_count = 0;

    // go through each instruction in the block
    for(let i = 0; i < block.instructions.length; i++) {
        let instr = block.instructions[i]!;

        if(instr.type === InstructionType.Raw) continue;

        // check if instruction is parameter and reserve the correct register
        if(instr.type === InstructionType.Param) {
            let param_regs = ctx.sysv.get("caller_saved");
            let interval = new Interval(i, i + 1, instr.result!, func_name);
            intervals.set(instr.result!, interval);
            interval.permanent = true;

            // check if param register has already been taken, if not, spill it
            if(param_count >= param_regs.length) {
                spill(ctx, instr.result!, interval);
            } else {
                interval.assign(param_regs[param_count]!);
                ctx.allocation.set(instr.result!.id, param_regs[param_count]!);
            }

            param_count++;
            continue;
        }
        
        // first update the operands
        for(let operand of instr.operands()) {
            const id = operand;
            let interval = intervals.get(id);
            
            if(interval) {
                interval.update(i+1);
            } else {
                interval = new Interval(0, i + 1, id, func_name);
                intervals.set(id, interval);
            }
        }

        // check value ID
        if(instr.result) {
            const id = instr.result;
            let interval = intervals.get(id);
            if(!interval) {
                interval = new Interval(i, i + 1, id, func_name);
                intervals.set(id, interval);
            }
        }
    }

    // update live intervals from symbols in terminator
    let term = block.terminator;
    if(term.type === TerminatorType.RET) {
        const ret = term as RetTerminator;
        const id = ret.value;
        if(id !== undefined) {
            const interval = intervals.get(id);

            if(interval) {
                interval.update(block.instructions.length + 1);
            }
        }
    }
}

/**
 * generates the intervals for each value in the module
 * @param ctx 
 * @param module 
 */
export function generate_intervals(ctx: Context, module: Module) {
    for(const func of module.functions) {
        // first go through the entry block
        block(ctx, func.entry, func.name);

        // go through each block
        for(const __block of func.blocks) {
            block(ctx, __block, func.name);
        }
    }
}

/**
 * actually assigns a register/stack slot to a value
 * @param ctx 
 * @param value 
 * @param interval 
 */
export function assign(ctx: Context, value: Value, interval: Interval) {
    // check if interval already has a register (continue if so) or if there's already an interval with this ID
    if(interval.assigned) {
        return;
    };

    // expire old intervals first
    while(ctx.active.length > 0 && ctx.active[0]!.end <= interval.start) {
        // remove the expired interval from active
        const expired = ctx.active.shift()!;

        // if it's not a spilled value, free the register
        if(expired.assigned instanceof reg) {
            ctx.free.push(expired.assigned);
        }
    }
    
    // get function information
    const func_name = interval.func_name;
    let func_info = ctx.allocation.func_information.get(func_name);

    if(!func_info) {
        func_info = new FunctionFrame();
        ctx.allocation.func_information.set(func_name, func_info);
    }

    // check if there's an available register
    if(ctx.free.length > 0) {
        const reg = ctx.free.pop()!;

        // check if reg is callee saved
        const is_callee_saved = ctx.sysv.callee_saved.some(it => it.name === reg.name);

        // update this block's used callee saved registers if it's a callee saved register and it's not already in the list
        if(is_callee_saved && !func_info.used_callee.some(it => it.name === reg.name)) {
            func_info.used_callee.push(reg);
        }

        // allocate register
        interval.assign(reg);
        ctx.allocation.set(value.id, reg);

        // insert into active
        insert(ctx.active, interval);
    } else {
        // spill
        const last = ctx.active[ctx.active.length - 1]!;

        // evict last
        if(last && last.end > interval.end && !last.permanent) {
            let register = last.assigned! as reg;

            // give last's register to the new interval
            interval.assign(register);
            ctx.allocation.set(value.id, register);
            ctx.active.pop();

            // spill evicted last to a stack slot
            spill(ctx, last.value, last);
            
            // insert
            insert(ctx.active, interval);
        } else {
            // actually spill into a stack slot
            spill(ctx, value, interval);
        }
    }
}

export function insert(active: Interval[], interval: Interval) {
    const i = active.findIndex(it => it.end > interval.end);

    if(i === -1) {
        active.push(interval);
    } else {
        active.splice(i, 0, interval);
    }
}

export function spill(ctx: Context, value: Value, interval: Interval) {
    // actually spill into a stack slot
    ctx.current += 8;
    const stack_slot = ptr64(rbp, undefined, undefined, BigInt(-ctx.current));
    interval.assign(stack_slot);
    ctx.allocation.set(value.id, stack_slot);
    
    // update the function frame's spilled size
    const func_info = ctx.allocation.func_information.get(interval.func_name)!;
    func_info.spilled += 8;
}

export interface Context {
    intervals: Map<Value, Interval>;
    allocation: Allocation;
    active: Interval[];
    used_callee: reg[];
    free: reg[];
    current: number;
    sysv: SysVAMD64ABI;
}

export function allocate(module: Module): Allocation {
    let sysv = new SysVAMD64ABI();

    // context through blocks and functions
    let intervals: Map<Value, Interval> = new Map();
    let allocation = new Allocation(sysv, intervals);
    let ctx: Context = { intervals, active: [], used_callee: [], free: sysv.get("allocatable"), current: 0, allocation, sysv };

    // generate the intervals first
    generate_intervals(ctx, module);

    // assign registers to each value based on the intervals
    // sort intervals
    const sorted_intervals = Array.from(intervals.entries()).sort((a, b) => a[1].start - b[1].start);

    for(const [value, interval] of sorted_intervals) {
        assign(ctx, value, interval);
    }

    return allocation;
}