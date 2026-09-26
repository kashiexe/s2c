import { Operand, OperandType } from "../operand.js";
import { op_override, type reg } from "../regs.js";
import type { mem } from "../mem.js";
import type { imm } from "../imm.js";
import rex, { W,R,B,X } from "../rex.js";
import modrm_sib, { modrm_sib_ext } from "../modrm_sib.js";

export function mov_r64_imm64(dest: reg, src: imm): Uint8Array {
    let bytes = new Uint8Array(10);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;

    // opcode
    bytes[1] = 0xB8 + (dest.name & 0x7);

    // immediate value
    let value = src.value as bigint;
    let view = new DataView(bytes.buffer);
    view.setBigInt64(2, value, true);

    // return the bytes
    return bytes;
}

export function mov_r64_r64(dest: reg, src: reg): Uint8Array {
    const modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);
    
    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= B;
    if(src.name >= 8) bytes[0] |= R;
    
    // opcode
    bytes[1] = 0x89;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    // return the bytes
    return bytes;
}

export function mov_r32_r32(dest: reg, src: reg): Uint8Array {
    let bytes = new Uint8Array(2);

    // opcode
    bytes[0] = 0x8B;

    // modrm byte
    bytes[1] = modrm_sib(dest, src)[0]!;

    // return the bytes
    return bytes;
}

export function mov_r16_r16(dest: reg, src: reg): Uint8Array {
    let bytes = new Uint8Array(3);

    // prefix to force 16-bit operand size
    bytes[0] = op_override(16);

    // opcode
    bytes[1] = 0x8B;

    // modrm byte
    bytes[2] = modrm_sib(dest, src)[0]!;

    // return the bytes
    return bytes;
}

export function mov_r8_r8(dest: reg, src: reg): Uint8Array {
    const modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // empty rex
    bytes[0] = rex();

    // opcode
    bytes[1] = 0x8A;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    return bytes;
}

export function mov_r64_mem(dest: reg, src: mem): Uint8Array {
    let modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.name >= 8) bytes[0] |= R;
    if(src.base && src.base.name >= 8) bytes[0] |= B;
    if(src.index && src.index.name >= 8) bytes[0] |= X;

    // opcode
    bytes[1] = 0x8B;

    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);

    return bytes;
}

export function mov_mem_r64(dest: mem, src: reg): Uint8Array {
    let modrm_sib_bytes = modrm_sib(dest, src);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length);

    // rex prefix
    bytes[0] = rex(W);
    if(dest.base && dest.base.name >= 8) bytes[0] |= B;
    if(dest.index && dest.index.name >= 8) bytes[0] |= X;
    if(src.name >= 8) bytes[0] |= R;
    
    // opcode
    bytes[1] = 0x89;
    
    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);
    
    return bytes;
}

/**
 * if your intention is to truly move a 64-bit immediate value into memory, it's recommended to move that immediate to a temporary register first and THEN move that register to the memory slot
 * like so:
 * ```ts
 * push(rax);       // save value in rax
 * mov(rax, imm64); // move immediate to rax
 * add(mem, rax);   // move rax to your memory slot
 * pop(rax);        // restore value in rax
 * ```
 * this instruction converts your imm64 to an imm32 as x86_64 only supports moving (sign-extended) 32-bit immediate values to memory
 */
export function mov_mem_imm64(dest: mem, src: imm): Uint8Array {
    let modrm_sib_bytes = modrm_sib_ext(0, dest);
    let bytes = new Uint8Array(2 + modrm_sib_bytes.length + 4);
    
    // rex prefix
    bytes[0] = rex(W);
    if(dest.base && dest.base.name >= 8) bytes[0] |= B;
    if(dest.index && dest.index.name >= 8) bytes[0] |= X;
    
    // opcode
    bytes[1] = 0xC7;
    
    // modrm and sib bytes
    bytes.set(modrm_sib_bytes, 2);
    
    // immediate value (imm64 is actually imm32 with sign extension)
    let value = Number(src.value);
    let view = new DataView(bytes.buffer, bytes.byteOffset + 2 + modrm_sib_bytes.length, 4);
    view.setInt32(0, value, true);

    return bytes;
}

export default function mov(dest: Operand, src: Operand): Uint8Array {
    // different sizes not allowed
    if(dest.bits !== src.bits) {
        throw new Error(`[Engine]: unsupported mov instruction for operands of different sizes: ${dest.bits} and ${src.bits}`);
    }

    // mem to mem not allowed
    if(dest.type === OperandType.Mem && src.type === OperandType.Mem) {
        throw new Error(`[Engine]: unsupported mov instruction for two memory operands`);
    }

    // reg to imm
    if(dest.type === OperandType.Reg) {
        if(src.type === OperandType.Imm) {
            if(dest.bits === 64) return mov_r64_imm64(dest as reg, src as imm);
        } else if(src.type === OperandType.Reg) {
            if(dest.bits === 64) return mov_r64_r64(dest as reg, src as reg);
            else if(dest.bits === 32) return mov_r32_r32(dest as reg, src as reg);
            else if(dest.bits === 16) return mov_r16_r16(dest as reg, src as reg);
            else if(dest.bits === 8) return mov_r8_r8(dest as reg, src as reg);
        } else if(src.type === OperandType.Mem) {
            if(dest.bits === 64) return mov_r64_mem(dest as reg, src as mem);
        }
    } else if(dest.type === OperandType.Mem) {
        if(src.type === OperandType.Reg) {
            if(dest.bits === 64) return mov_mem_r64(dest as mem, src as reg);
        } else if(src.type === OperandType.Imm) {
            if(dest.bits === 64) return mov_mem_imm64(dest as mem, src as imm);
        }
    }

    // unimplemented
    throw new Error(`[Engine]: unsupported mov instruction for operands of types ${dest.type} and ${src.type}`);
}