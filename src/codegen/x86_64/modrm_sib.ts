import { Operand, OperandType } from "./operand.js";
import { reg } from "./regs.js";
import { mem } from "./mem.js";

export enum mode {
    reg = 0b11,
    disp0 = 0b00,
    disp8 = 0b01,
    disp32 = 0b10
}

export function sib(scale: number, index: number, base: number): number {
    return (scale << 6) | (index << 3) | base;
}

export function modrm(mod: mode, reg: number, rm: number): number {
    return (mod << 6) | (reg << 3) | rm;
}

export default function modrm_sib(dest: Operand, src: Operand): Uint8Array {
    let bytes = new Uint8Array(2);

    // different sizes not allowed
    if(dest.bits !== src.bits) {
        throw new Error(`[Engine]: unsupported modrm/sib instruction for operands of different sizes: ${dest.bits} and ${src.bits}`);
    }

    // mem to mem not allowed
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: unsupported modrm/sib instruction for two memory operands`);
    }

    // reg to reg
    if(dest.type === OperandType.Reg && src.type === OperandType.Reg) {
        return new Uint8Array([modrm(mode.reg, (src as reg).name & 0x7, (dest as reg).name & 0x7)]);
    }

    // identify which is the register and which is the memory operand
    let reg_op = dest.type === OperandType.Reg ? (dest as reg) : (src as reg);
    let mem_op = dest.type === OperandType.Mem ? (dest as mem) : (src as mem);

    // rip relative
    if(mem_op.is_rip) {
        bytes = new Uint8Array(5);
        bytes[0] = modrm(mode.disp32, reg_op.name & 0x7, 0b101);
        let view = new DataView(bytes.buffer);
        view.setInt32(1, Number((src as mem).displacement ?? 0n), true);
        return bytes;
    }

    // base, index, scale, and displacement
    let base = mem_op.base !== undefined ? (mem_op.base.name & 0x7) : undefined;
    let index = mem_op.index !== undefined ? (mem_op.index.name & 0x7) : undefined;
    let scale = mem_op.scale ?? 0;
    let disp = mem_op.displacement;

    // absolute displacement [disp32]
    if(base === undefined && index === undefined) {
        bytes = new Uint8Array(5);
        bytes[0] = modrm(mode.disp0, reg_op.name & 0x7, 0b101);
        let view = new DataView(bytes.buffer);
        view.setInt32(1, Number(disp ?? 0n), true);
        return bytes;
    }

    // needs sib if base is 4 or index is defined
    const needs_sib = (base === 4 || index !== undefined);

    // base 5 with no displacement must use disp8
    if(base === 5 && disp === undefined) {
        disp = 0n; // force disp8
    }

    // get mode and displacement size
    let __mode: mode = mode.disp0;
    let disp_size: number = 0;

    if(disp !== undefined) {
        // check if 8-bit
        if(disp >= -128n && disp <= 127n && !(base === 5 && mem_op.displacement === undefined)) {
            if(disp !== 0n || base === 5) {
                __mode = mode.disp8;
                disp_size = 1;
            }
        } else {
            __mode = mode.disp32;
            disp_size = 4;
        }
    }

    // rm field signals presence of SIB (0b100) or base register
    let rm = needs_sib ? 0b100 : base!;

    // byte buffer 
    let size = 1 + (needs_sib ? 1 : 0) + disp_size;
    let current_offset = 1;
    bytes = new Uint8Array(size);

    // encode modrm
    bytes[0] = modrm(__mode, reg_op.name & 0x7, rm);
    
    // encode SIB (if needed)
    if(needs_sib) {
        let sib_index = mem_op.index?.name ?? 0b100; // 4 means no index
        bytes[1] = sib(mem_op.scale ?? 1, sib_index & 0x7, base!);
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