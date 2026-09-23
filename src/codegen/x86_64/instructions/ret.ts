import type { imm } from "../imm.js";

/**
 * generates bytes depending on far or near return (or with immediate) 
 * @param arg 
 */
export default function ret(far: boolean, arg?: imm): Uint8Array {
    if(arg === undefined) {
        if(far) return new Uint8Array([0xCB]);
        else return new Uint8Array([0xC3]);
    } else {
        let opcode = far ? 0xCA : 0xC2;

        if(arg.bits === 16) return new Uint8Array([opcode, arg.value as number & 0xFF, (arg.value as number >> 8) & 0xFF]);
        else {
            // not allowed
            throw new Error(`[Engine]: far return with immediate of ${arg.bits} bits is not allowed`);
        }
    }
}