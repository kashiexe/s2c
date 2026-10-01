import { Operand, OperandType } from "./operand.js";

export enum regs {
    al = 8, cl, dl, bl,
    ah = 8, ch, dh, bh,
    sil, dil, bpl, spl,
    r8b, r9b, r10b, r11b, r12b, r13b, r14b, r15b,

    ax = 16, cx, dx, bx, sp, bp, si, di,
    r8w, r9w, r10w, r11w, r12w, r13w, r14w, r15w,

    eax = 32, ecx, edx, ebx, esp, ebp, esi, edi,
    r8d, r9d, r10d, r11d, r12d, r13d, r14d, r15d,

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

// 8 bit registers
export const al = r8(regs.al);
export const cl = r8(regs.cl);
export const dl = r8(regs.dl);
export const bl = r8(regs.bl);
export const ah = r8(regs.ah);
export const ch = r8(regs.ch);
export const dh = r8(regs.dh);
export const bh = r8(regs.bh);
export const sil = r8(regs.sil);
export const dil = r8(regs.dil);
export const bpl = r8(regs.bpl);
export const spl = r8(regs.spl);
export const r8b = r8(regs.r8b);
export const r9b = r8(regs.r9b);
export const r10b = r8(regs.r10b);
export const r11b = r8(regs.r11b);
export const r12b = r8(regs.r12b);
export const r13b = r8(regs.r13b);
export const r14b = r8(regs.r14b);
export const r15b = r8(regs.r15b);

// 16 bit registers
export const ax = r16(regs.ax);
export const cx = r16(regs.cx);
export const dx = r16(regs.dx);
export const bx = r16(regs.bx);
export const sp = r16(regs.sp);
export const bp = r16(regs.bp);
export const si = r16(regs.si);
export const di = r16(regs.di);
export const r8w = r16(regs.r8w);
export const r9w = r16(regs.r9w);
export const r10w = r16(regs.r10w);
export const r11w = r16(regs.r11w);
export const r12w = r16(regs.r12w);
export const r13w = r16(regs.r13w);
export const r14w = r16(regs.r14w);
export const r15w = r16(regs.r15w);

// 32 bit registers
export const eax = r32(regs.eax);
export const ecx = r32(regs.ecx);
export const edx = r32(regs.edx);
export const ebx = r32(regs.ebx);
export const esp = r32(regs.esp);
export const ebp = r32(regs.ebp);
export const esi = r32(regs.esi);
export const edi = r32(regs.edi);
export const r8d = r32(regs.r8d);
export const r9d = r32(regs.r9d);
export const r10d = r32(regs.r10d);
export const r11d = r32(regs.r11d);
export const r12d = r32(regs.r12d);
export const r13d = r32(regs.r13d);
export const r14d = r32(regs.r14d);
export const r15d = r32(regs.r15d);

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
    // 8 bit
    "al": al,
    "cl": cl,
    "dl": dl,
    "bl": bl,
    "ah": ah,
    "ch": ch,
    "dh": dh,
    "bh": bh,
    "sil": sil,
    "dil": dil,
    "bpl": bpl,
    "spl": spl,
    "r8b": r8b,
    "r9b": r9b,
    "r10b": r10b,
    "r11b": r11b,
    "r12b": r12b,
    "r13b": r13b,
    "r14b": r14b,
    "r15b": r15b,

    // 16 bit
    "ax": ax,
    "cx": cx,
    "dx": dx,
    "bx": bx,
    "sp": sp,
    "bp": bp,
    "si": si,
    "di": di,
    "r8w": r8w,
    "r9w": r9w,
    "r10w": r10w,
    "r11w": r11w,
    "r12w": r12w,
    "r13w": r13w,
    "r14w": r14w,
    "r15w": r15w,

    // 32 bit
    "eax": eax,
    "ecx": ecx,
    "edx": edx,
    "ebx": ebx,
    "esp": esp,
    "ebp": ebp,
    "esi": esi,
    "edi": edi,
    "r8d": r8d,
    "r9d": r9d,
    "r10d": r10d,
    "r11d": r11d,
    "r12d": r12d,
    "r13d": r13d,
    "r14d": r14d,
    "r15d": r15d,

    // 64 bit
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