import { Operand, OperandType } from "./operand.js";

export enum regs {
    rax = 64, rcx, rdx, rbx, rsp, rbp, rsi, rdi,
    r8, r9, r10, r11, r12, r13, r14, r15
};

export class reg extends Operand {
    readonly type = OperandType.Reg;
    readonly bits: number;
    readonly name: number; // regs - __bits (for the most part)
    readonly rip: boolean = false;

    constructor(bits: number, name: number, is_rip: boolean = false) {
        super();
        this.bits = bits;
        this.name = name;
        this.rip = is_rip;
    }
}

// helpers
export function r64(register: regs): reg {
    return new reg(64, register - 64);
}

export function r32(register: regs): reg {
    return new reg(32, register - 32);
}

export function r16(register: regs): reg {
    return new reg(16, register - 16);
}

export function r8(register: regs): reg {
    return new reg(8, register - 8);
}

// predefined registers

// 64 bit registers
export const rax = r64(regs.rax);
export const rcx = r64(regs.rcx);
export const rdx = r64(regs.rdx);
export const rbx = r64(regs.rbx);
export const rsp = r64(regs.rsp);
export const rbp = r64(regs.rbp);
export const rsi = r64(regs.rsi);
export const rdi = r64(regs.rdi);
export const _r8  = r64(regs.r8);
export const r9  = r64(regs.r9);
export const r10 = r64(regs.r10);
export const r11 = r64(regs.r11);
export const r12 = r64(regs.r12);
export const r13 = r64(regs.r13);
export const r14 = r64(regs.r14);
export const r15 = r64(regs.r15);
export const rip = new reg(64, 0, true);

// misc helpers

export const reg_names: Record<string, reg> = {
    "rax": rax,
    "rcx": rcx,
    "rdx": rdx,
    "rbx": rbx,
    "rsp": rsp,
    "rbp": rbp,
    "rsi": rsi,
    "rdi": rdi,
    "r8":  _r8,
    "r9":  r9,
    "r10": r10,
    "r11": r11,
    "r12": r12,
    "r13": r13,
    "r14": r14,
    "r15": r15
};

/**
 * returns a prefix for the bit size override for an instruction if needed
 * @param bits 
 * @returns 
 */
export function op_override(bits: number): number {
    if(bits === 16) return 0x66;

    throw new Error(`[Engine]: operand override for ${bits} bits has not been implemented yet`);
}