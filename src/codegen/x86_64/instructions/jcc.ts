import { imm } from "../../../codegen/x86_64/imm.js";
import { op_override } from "../../../codegen/x86_64/regs.js";

export function je(arg: imm): Uint8Array {
    let bits = arg.bits;

    if(bits === 8) {
        // 0x74 
        return new Uint8Array([0x74, arg.value as number & 0xFF]);
    } else if(bits === 16 || bits === 32) {
        let bytes = new Uint8Array(1 + (bits/8) + (bits===16?1:0));

        let begin = 0;

        // opcode + prefix (if needed)
        if(bits === 16) {
            bytes[begin] = op_override(16);
            begin++;
        }
        bytes[begin] = 0x0F;
        bytes[begin+1] = 0x84;

        // encode imm
        let view = new DataView(bytes.buffer);
        if(bits === 32) {
            view.setInt32(begin+2, arg.value as number, true);
        } else {
            view.setInt16(begin+2, arg.value as number, true);
        }

        return bytes;
    }  

    throw new Error(`[Engine]: Immediate of ${arg.bits} bits is not allowed for JE`)
}