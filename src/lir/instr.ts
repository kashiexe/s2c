import Value, { ValueTypeToString } from "./value.js";

export enum InstructionType {
    Raw,
    Const,
    Add,
    Load,
    Store,
    Call
}

export default class Instruction {
    type: InstructionType;
    result?: Value | undefined;

    constructor(type: InstructionType, result?: Value) {
        this.type = type;
        this.result = result;
    }

    to_string(): string {
        let str = "";
        if(this.result) str = `%${this.result.id}<${ValueTypeToString[this.result.type]}>`;
        return str;
    }

    operands(): Value[] {
        return [];
    }
}

export class ConstInstr extends Instruction {
    value: bigint;
    result: Value;

    constructor(value: bigint, result: Value) {
        super(InstructionType.Const);
        this.value = value;
        this.result = result;
    }

    to_string(): string {
        let str = "";
        str += `%${this.result.id}<${ValueTypeToString[this.result.type]}>: CONST ${this.value}`;
        return str;
    }

    operands(): Value[] {
        return [];
    }
}

export class BinaryInstr extends Instruction {
    lhs: Value
    rhs: Value;
    result: Value;
    
    constructor(type: InstructionType, lhs: Value, rhs: Value, result: Value) {
        super(type);
        this.lhs = lhs;
        this.rhs = rhs;
        this.result = result;
    }

    to_string(): string {
        let str = "";
        return str;
    }

    operands(): Value[] {
        return [this.lhs, this.rhs];
    }
}

export class AddInstr extends BinaryInstr {
    constructor(lhs: Value, rhs: Value, result: Value) {
        super(InstructionType.Add, lhs, rhs, result);
    }

    to_string(): string {
        let str = "";
        str += `%${this.result.id}<${ValueTypeToString[this.result.type]}>: %${this.lhs.id}<${ValueTypeToString[this.lhs.type]}> + %${this.rhs.id}<${ValueTypeToString[this.rhs.type]}>`
        return str;
    }
}

export class LoadInstr extends Instruction {
    address: Value;
    result: Value;
    
    constructor(address: Value, result: Value) {
        super(InstructionType.Load);
        this.address = address;
        this.result = result;
    }

    operands(): Value[] {
        return [this.address];
    }
}

export class StoreInstr extends Instruction {
    address: Value;
    value: Value;

    constructor(address: Value, value: Value) {
        super(InstructionType.Store);
        this.address = address;
        this.value = value;
    }

    operands(): Value[] {
        return [this.address, this.value];
    }
}

export class CallInstr extends Instruction {
    callee: Value;
    args: Value[];
    result?: Value | undefined;

    constructor(callee: Value, args: Value[], result?: Value) {
        super(InstructionType.Call);
        this.callee = callee;
        this.args = args;
        this.result = result;
    }

    operands(): Value[] {
        return [this.callee, ...this.args];
    }
}