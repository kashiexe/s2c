import { Operand, OperandType } from "./operand.js";

export class imm extends Operand {
    readonly type = OperandType.Imm;
    readonly bits: number;
    readonly value: number | bigint;

    constructor(bits: number, value: number | bigint) {
        super();
        this.bits = bits;
        this.value = value;
    }
}

export function imm8(value: number) {
    return new imm(8, value);
}

export function imm16(value: number) {
    return new imm(16, value);
}

export function imm32(value: number) {
    return new imm(32, value);
}

export function imm64(value: bigint) {
    return new imm(64, value);
}