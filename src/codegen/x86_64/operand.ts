
export enum OperandType {
    Reg,
    Mem,
    Imm
}

export abstract class Operand {
    abstract readonly type: OperandType;
    abstract readonly bits: number;
}