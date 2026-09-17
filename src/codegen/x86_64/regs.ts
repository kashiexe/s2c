
export enum regs {
    rax = 64, rcx, rdx, rbx, rsp, rbp, rsi, rdi,
    r8, r9, r10, r11, r12, r13, r14, r15
};

export class reg {
    readonly __bits: number;
    readonly __name: number; // regs - __bits (for the most part)

    constructor(bits: number, name: number) {
        this.__bits = bits;
        this.__name = name;
    }
}

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
