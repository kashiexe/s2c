import { Operand, OperandType } from "./operand.js";
import { reg } from "./regs.js";
import { mem } from "./mem.js";

export enum mode {
    reg = 0b11,
    disp0 = 0b00,
    disp8 = 0b01,
    disp32 = 0b10
}

/**
 * mnemonics like inc, dec, ... repurpose the middle 3 bits of the modrm byte to encode the operation
 */
export enum ff_opcode {
    inc = 0b000,
    dec = 0b001,
    call = 0b010,
    call_far = 0b011,
    jmp = 0b100,
    jmp_far = 0b101,
    push = 0b110
}

/**
 * utility to generate the SIB byte's scale field
 */
export function sib_scale(scale: number): number {
    switch(scale) {
        case 1: return 0b00;
        case 2: return 0b01;
        case 4: return 0b10;
        case 8: return 0b11;
        default:
            throw new Error(`[Engine]: unsupported scale factor ${scale}`);
    }
}

export function sib(scale: number, index: number, base: number): number {
    return (sib_scale(scale) << 6) | (index << 3) | base;
}

export function modrm(mod: mode, reg: number, rm: number): number {
    return (mod << 6) | (reg << 3) | rm;
}

/**
 * reg is posted on the reg field and op is posted on the rm field (if reg-reg for example)
 * @param reg this should be the src register (if reg-reg)
 * @param op this should be the dest operand (if reg-reg)
 * @returns 
 */
export function modrm_sib_raw(reg: number, op: Operand): Uint8Array {
    let bytes: Uint8Array;

    // reg to reg
    if(op.type === OperandType.Reg) {
        return new Uint8Array([modrm(mode.reg, reg & 0x7, (op as reg).name & 0x7)]);
    }

    let mem_op = op as mem;

    // rip relative
    if(mem_op.is_rip) {
        bytes = new Uint8Array(5);
        bytes[0] = modrm(mode.disp32, reg & 0x7, 0b101);
        let view = new DataView(bytes.buffer);
        view.setInt32(1, Number(mem_op.displacement ?? 0n), true);
        return bytes;
    }

    // base, index, scale, and displacement
    let base = mem_op.base !== undefined ? (mem_op.base.name & 0x7) : undefined;
    let index = mem_op.index !== undefined ? (mem_op.index.name & 0x7) : undefined;
    let disp = mem_op.displacement;

    // rsp cannot be used as an index register
    if(index === 4) {
        throw new Error(`[Engine]: "rsp/r12" cannot be used as an index register`);
    }

    // absolute displacement [disp32]
    if(base === undefined && index === undefined) {
        bytes = new Uint8Array(5);
        bytes[0] = modrm(mode.disp0, reg & 0x7, 0b101);
        let view = new DataView(bytes.buffer);
        view.setInt32(1, Number(disp ?? 0n), true);
        return bytes;
    }

    // needs sib
    const needs_sib = (base === 4 || index !== undefined);

    // no base with index * scale + disp32
    if (base === undefined && index !== undefined) {
        bytes = new Uint8Array(6);
        bytes[0] = modrm(mode.disp0, reg & 0x7, 0b100);     // SIB required
        bytes[1] = sib(mem_op.scale ?? 1, index, 0b101);    // no base
        let view = new DataView(bytes.buffer);
        view.setInt32(2, Number(disp ?? 0n), true);
        return bytes;
    }

    // base 5 with no displacement must use disp8
    if(base === 5 && disp === undefined) {
        disp = 0n; // force disp8
    }

    // get mode and displacement size
    let __mode: mode = mode.disp0;
    let disp_size: number = 0;

    if(disp !== undefined) {
        // check if 8-bit
        if(disp >= -128n && disp <= 127n) {
            if(disp !== 0n || base === 5) {
                __mode = mode.disp8;
                disp_size = 1;
            }
        } else {
            __mode = mode.disp32;
            disp_size = 4;
        }
    }

    // rm field depending on whether SIB is needed
    let rm = needs_sib ? 0b100 : base!;
    
    // byte buffer 
    let size = 1 + (needs_sib ? 1 : 0) + disp_size;
    let current_offset = 1;
    bytes = new Uint8Array(size);

    // encode modrm
    bytes[0] = modrm(__mode, reg & 0x7, rm);
    
    // encode SIB (if needed)
    if(needs_sib) {
        let sib_index = index ?? 0b100; // 4 means no index
        let sib_base = base ?? 0b101; // 5 means no base
        bytes[1] = sib(mem_op.scale ?? 1, sib_index & 0x7, sib_base & 0x7);
        current_offset++;
    }

    // encode displacement (depending on size)
    if(disp_size === 1) {
        bytes[current_offset] = Number(disp! & 0xFFn);
    } else if(disp_size === 4) {
        let view = new DataView(bytes.buffer);
        view.setInt32(current_offset, Number(disp!), true);
    }

    return bytes;
}

/**
 * utility to generate modrm/sib bytes for instructions which repurpose the middle 3 bits of the modrm byte to encode the operation
 * @param ext 
 * @param op 
 * @returns 
 */
export function modrm_sib_ext(ext: number, op: Operand): Uint8Array {
    return modrm_sib_raw(ext, op);
}

/**
 * general utility to generate modrm/sib bytes for dest src operands
 * ```js 
 * modrm_sib(dest, src) // if rm-reg instruction
 * ```
 * or
 * ```js
 * modrm_sib(src, dest) // if reg-rm instruction
 * ```
 */
export default function modrm_sib(dest: Operand, src: Operand): Uint8Array {
    if (dest.bits !== src.bits) {
        throw new Error(`[Engine]: cannot generate modrm/sib bytes for operands of different sizes: (dest<${dest.bits}>, src<${src.bits}>)`);
    }

    if(dest.type === OperandType.Reg && src.type === OperandType.Reg) {
        return modrm_sib_raw((src as reg).name & 0x7, dest);
    }

    // operands wrapped in their respective classes
    let reg_op = dest.type === OperandType.Reg ? (dest as reg) : (src as reg);
    let mem_op = dest.type === OperandType.Mem ? dest : src;

    // generate the bytes and return
    return modrm_sib_raw(reg_op.name & 0x7, mem_op);
}