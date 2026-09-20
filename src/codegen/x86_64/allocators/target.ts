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

    get(type: "allocatable" | "caller_saved" | "callee_saved"): reg[] {
        return this[type];
    }

    arg(i: number): reg | undefined {
        return this.arg_registers[i];
    }

    ret(): reg {
        return this.ret_register;
    }
}