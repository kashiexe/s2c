import type Value from "../../../lir/value.js";
import { ptr64, type mem } from "../mem.js";
import { rbp, reg } from "../regs.js";

export default class TargetABI {
    allocatable: reg[];
    caller_saved: reg[];
    callee_saved: reg[];
    arg_registers: reg[];
    ret_register: reg;

    constructor(allocatable: reg[], caller_saved: reg[], callee_saved: reg[], arg_registers: reg[], ret_register: reg) {
        this.allocatable = allocatable;
        this.caller_saved = caller_saved;
        this.callee_saved = callee_saved;
        this.arg_registers = arg_registers;
        this.ret_register = ret_register;
    }

    get(type: "allocatable" | "caller_saved" | "callee_saved" | "arg_registers"): reg[] {
        return this[type];
    }

    arg(i: number): reg | undefined {
        return this.arg_registers[i];
    }

    ret(): reg {
        return this.ret_register;
    }
}

export class FunctionFrame {
    used_callee: reg[];
    
    // already in bytes
    spilled: number = 0;

    // already in bytes
    outgoing_spilled: number = 0;
    
    constructor() {
        this.used_callee = [];
    }

    add(reg: reg) {
        this.used_callee.push(reg);
    }
}

export class Interval {
    value: Value;
    start: number;
    end: number;
    assigned: reg | mem | null = null;
    permanent: boolean = false;
    func_name: string;

    constructor(start: number, end: number, value: Value, func_name: string) {
        this.start = start;
        this.end = end;
        this.value = value;
        this.func_name = func_name;
    }

    update(end: number) {
        this.end = end;
    }

    assign(reg: reg | mem) {
        this.assigned = reg;
    }

    get() {
        return this.assigned;
    }
}

export class Allocation {
    locations: Map<number, reg | mem>; // for now null but will be StackSlot in the future
    func_information: Map<string, FunctionFrame>;
    temp_rbp_offset: number = 0;
    abi: TargetABI;
    intervals: Map<Value, Interval>;

    constructor(abi: TargetABI, intervals: Map<Value, Interval>) {
        this.locations = new Map();
        this.func_information = new Map();
        this.abi = abi;
        this.intervals = intervals;
    }

    set(id: number, location: reg | mem) {
        if(this.locations.has(id)) return;
        else this.locations.set(id, location);
    }

    get(id: number): reg | mem | undefined {
        return this.locations.get(id);
    }

    get_id(register: reg): number | undefined {
        for(let [id, location] of this.locations.entries()) {
            if(location instanceof reg && location.name === register.name) {
                return id;
            }
        }

        return undefined;
    }

    get_interval(id: number): Interval | undefined {
        for(let interval of this.intervals.values()) {
            if(interval.value.id === id) {
                return interval;
            }
        }
        
        return undefined;
    }

    /**
     * returns any free register or memory location for the given position
     * @param position 
     */
    get_free_reg(position: number): reg | mem {
        for(let reg of this.abi.allocatable) {
            let id = this.get_id(reg);
            
            if(id === undefined) {
                return reg;
            }

            let interval = this.get_interval(id);
            
            if(interval && interval.end < position) {
                return reg;
            }
        }

        // if no free register is found, return a memory location (for now, just return a stack slot)
        let stack_slot = ptr64(rbp, undefined, undefined, BigInt(-this.temp_rbp_offset - 8));
        this.temp_rbp_offset += 8;
        return stack_slot;
    }
}