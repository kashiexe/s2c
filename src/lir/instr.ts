import Value, { ValueTypeToString } from "./value.js";

export enum InstructionType {
    Raw,
    Const,
    String,
    Add,
    Sub,
    Load,
    Store,
    Call,
    Asm
}

export const InstructionTypeNames: Record<InstructionType, string> = {
    [InstructionType.Raw]: "Raw",
    [InstructionType.Const]: "Const",
    [InstructionType.String]: "String",
    [InstructionType.Add]: "Add",
    [InstructionType.Sub]: "Sub",
    [InstructionType.Load]: "Load",
    [InstructionType.Store]: "Store",
    [InstructionType.Call]: "Call",
    [InstructionType.Asm]: "Asm"
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

export class StringInstr extends Instruction {
    result: Value;
    
    constructor(result: Value) {
        super(InstructionType.String);
        this.result = result;
    }

    to_string(): string {
        let str = "";
        str += `%${this.result.id}<${ValueTypeToString[this.result.type]}>: CONST string$${this.result.id}`;
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

export class SubInstr extends BinaryInstr {
    constructor(lhs: Value, rhs: Value, result: Value) {
        super(InstructionType.Sub, lhs, rhs, result);
    }
    
    to_string(): string {
        let str = "";
        str += `%${this.result.id}<${ValueTypeToString[this.result.type]}>: %${this.lhs.id}<${ValueTypeToString[this.lhs.type]}> - %${this.rhs.id}<${ValueTypeToString[this.rhs.type]}>`
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
    result: Value;

    constructor(callee: Value, args: Value[], result: Value) {
        super(InstructionType.Call);
        this.callee = callee;
        this.args = args;
        this.result = result;
    }

    operands(): Value[] {
        return [this.callee, ...this.args];
    }

    to_string(): string {
        let str = "";

        if(this.result) {
            str += `%${this.result.id}<${ValueTypeToString[this.result.type]}>: `;
        }

        str += `CALL $${this.callee.name ?? "anon_function"}<${ValueTypeToString[this.callee.type]}>(`;
        str += this.args.map(arg => `%${arg.id}<${ValueTypeToString[arg.type]}>`).join(", ");
        str += `)`;

        return str;
    }
}

export class AsmReg {
    name: string;
    bits: number = 0;

    constructor(name: string, bits: number = 0) {
        this.name = name;
        this.bits = bits;
    }
}

export class AsmInstr extends Instruction {
    instr: string;
    asm_operands: (AsmReg | Value | number)[];

    constructor(instr: string, operands: (AsmReg | Value)[]) {
        super(InstructionType.Asm);
        this.instr = instr;
        this.asm_operands = operands;
    }

    to_string(): string {
        let str = "";
        str += `asm#${this.instr} `;
        str += this.asm_operands.map(op => {
            if(op instanceof AsmReg) {
                return `${op.name}`;
            } else if(op instanceof Value) {
                return `%${op.id}<${ValueTypeToString[op.type]}>`;
            } else if(typeof op === "number") {
                return op;
            }
        }).join(", ");
        return str;
    }

    operands(): Value[] {
        return this.asm_operands.filter(op => op instanceof Value) as Value[];
    }
}