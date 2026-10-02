import type { imm } from "../imm.js";
import { op_override } from "../regs.js";

/**
 * jump
 * @param far 
 * @param target 
 * @returns 
 */
export default function jmp(far: boolean = false, target?: imm): Uint8Array {
    if(!far) {
        if(target === undefined) {
            return new Uint8Array([0xEB, 0x00]);
        } else {
            let bytes = new Uint8Array(1 + (target.bits/8) + (target.bits===16?1:0));

            if(target.bits === 8) {
                // opcode + imm
                bytes[0] = 0xEB;
                bytes[1] = target.value as number & 0xFF;

                return bytes;
            } else if(target.bits === 16) {
                // prefix + opcode
                bytes[0] = op_override(16);
                bytes[1] = 0xE9;
                
                // immediate
                let view = new DataView(bytes.buffer);
                view.setInt16(target.value as number, 2, true);

                return bytes;
            } else if(target.bits === 32) {
                // opcode
                bytes[0] = 0xE9;
                
                // immediate
                let view = new DataView(bytes.buffer);
                view.setInt32(target.value as number, 1, true);

                return bytes;
            } else {
                throw new Error(`[Engine]: jmp instruction with immediate of ${target.bits} bits is not allowed`);
            }
        }
    }

    throw new Error(`[Engine]: far jmp instruction is not implemented yet`);
}