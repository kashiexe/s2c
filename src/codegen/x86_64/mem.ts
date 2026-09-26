import { Operand, OperandType} from "./operand.js";
import type { reg } from "./regs.js";

export class mem extends Operand {
    readonly type = OperandType.Mem;
    readonly bits: number;
    readonly base: reg | undefined;
    readonly index: reg | undefined;
    readonly scale: number | undefined;
    displacement: bigint | undefined;
    readonly is_rip: boolean = false;

    constructor(bits: number, base?: reg, index?: reg, scale?: number, displacement?: bigint) {
        super();
        this.bits = bits;
        this.base = base;
        this.index = index;
        this.scale = scale;
        this.displacement = displacement;

        if(base?.rip) this.is_rip = true;
        if(index?.rip) this.is_rip = true;
    }
};

// helpers
export function ptr64(base?: reg, index?: reg, scale?: number, displacement?: bigint) {
    return new mem(64, base, index, scale, displacement);
}

export function ptr32(base?: reg, index?: reg, scale?: number, displacement?: bigint) {
    return new mem(32, base, index, scale, displacement);
}

export function ptr16(base?: reg, index?: reg, scale?: number, displacement?: bigint) {
    return new mem(16, base, index, scale, displacement);
}

export function ptr8(base?: reg, index?: reg, scale?: number, displacement?: bigint) {
    return new mem(8, base, index, scale, displacement);
}