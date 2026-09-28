
export enum OperandType {
    Reg,
    Mem,
    Imm
}

export const OperandTypeNames = {
    [OperandType.Reg]: "reg",
    [OperandType.Mem]: "mem",
    [OperandType.Imm]: "imm"
};

export abstract class Operand {
    abstract readonly type: OperandType;
    abstract readonly bits: number;
}