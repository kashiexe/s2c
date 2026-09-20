import Module from "../../../lir/module.js";
import TargetABI from "./target.js";
import { regs, r64, reg } from "../regs.js";
import type BasicBlock from "../../../lir/bb.js";
import type Value from "../../../lir/value.js";

/**
 * no need to change the name of the file as the file already is inside of a 64 bit arch thus it's already implied it's 64 bit
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

export class Interval {
    value: Value;
    start: number;
    end: number;
    assigned: reg | null = null;

    constructor(start: number, end: number, value: Value) {
        this.start = start;
        this.end = end;
        this.value = value;
    }

    update(end: number) {
        this.end = end;
    }

    assign(reg: reg) {
        this.assigned = reg;
    }

    get() {
        return this.assigned;
    }
}

export function block(ctx: Context, block: BasicBlock) {
    let intervals = ctx.intervals;

    // go through each instruction in the block
    for(let i = 0; i < block.instructions.length; i++) {
        let instr = block.instructions[i]!;
        
        // first update the operands
        for(let operand of instr.operands()) {
            const id = operand;
            const interval = intervals.get(id);
            
            if(interval) {
                interval.update(i+1);
                ctx.current_free--;
            }
        }

        // check value ID
        if(instr.result) {
            const id = instr.result;
            const interval = new Interval(i, i+1, id);

            if(ctx.current_free < ctx.free.length) {
                const reg = ctx.free[ctx.current_free]!;
                interval.assign(reg);
                ctx.allocation.set(id.id, reg);
                ctx.current_free++;
            } 

            intervals.set(id, interval);
        }
    }
}

export class Allocation {
    locations: Map<number, reg>; // for now null but will be StackSlot in the future

    constructor() {
        this.locations = new Map();
    }

    set(id: number, location: reg) {
        this.locations.set(id, location);
    }

    get(id: number): reg | undefined {
        return this.locations.get(id);
    }
}

export interface Context {
    intervals: Map<Value, Interval>;
    allocation: Allocation;
    active: reg[];
    free: reg[];
    current_free: number;
}

export function allocate(module: Module): Allocation {
    let sysv = new SysVAMD64ABI();

    // context through blocks and functions
    let intervals: Map<Value, Interval> = new Map();
    let allocation = new Allocation();
    let ctx: Context = { intervals, active: [], free: sysv.get("allocatable"), current_free: 0, allocation };

    // go through each function
    for(const func of module.functions) {
        // first go through the entry block
        block(ctx, func.entry);

        // go through each block
        for(const __block of func.blocks) {
            block(ctx, __block);
        }
    }

    return allocation;
}