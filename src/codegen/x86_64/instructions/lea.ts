import { mem } from "../mem.js";
import { op_override, reg } from "../regs.js";
import rex, { W,R,X,B } from "../rex.js";
import modrm_sib from "../modrm_sib.js";

/**
 * stores effective address
 * @param register 
 * @param op 
 */
export default function lea(register: reg, op: reg | mem): Uint8Array {
    let bytes = [];

    // prefix for 16 bit instruction
    if(register.bits === 16) bytes.push(op_override(16));

    // rex
    if(register.bits === 64) {
        let rex_byte = rex(W);
        if(register.name >= 8) rex_byte |= R;
        if(op instanceof reg && op.name >= 8) rex_byte |= B;
        if(op instanceof mem) {
            if(op.base && op.base.name >= 8) rex_byte |= B;
            if(op.index && op.index.name >= 8) rex_byte |= X;
        }
        bytes.push(rex_byte);
    }

    // opcode
    bytes.push(0x8D);

    // modrm
    bytes.push(...modrm_sib(op, register));

    return new Uint8Array(bytes);
}