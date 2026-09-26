import type { mem } from "../mem.js";
import { reg } from "../regs.js";

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

export class Allocation {
    locations: Map<number, reg | mem>; // for now null but will be StackSlot in the future
    func_information: Map<string, FunctionFrame>;
    temp_rbp_offset: number = 0;

    constructor() {
        this.locations = new Map();
        this.func_information = new Map();
    }

    set(id: number, location: reg | mem) {
        this.locations.set(id, location);
    }

    get(id: number): reg | mem | undefined {
        return this.locations.get(id);
    }
}