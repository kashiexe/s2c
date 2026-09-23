import { mem } from "../mem.js";
import { reg } from "../regs.js";

export default function call(far: boolean, arg: mem | reg): Uint8Array {
    if(!far) {
        if(arg instanceof mem) {
            // check if relative
            if(arg.is_rip) {
                let opcode = 0xE8;

                // placeholder for x bytes (depending on arg.bits)
                let bytes = new Uint8Array(arg.bits / 8);

                // if it already has an offset, we can calculate the relative offset
                if(arg.displacement) {
                    let relative_offset = arg.displacement - BigInt(bytes.length);
                    let view = new DataView(bytes.buffer);
                    if(arg.bits === 32) {
                        view.setInt32(0, Number(relative_offset), true);
                    } else if(arg.bits === 64) {
                        view.setBigInt64(0, relative_offset, true);
                    }
                }

                return new Uint8Array([opcode, ...bytes]);
            } else {
                // modrm byte
                throw new Error(`[Engine]: absolute calls are not implemented yet`);
            }
        } else {
            throw new Error(`[Engine]: reg calls are not implemented yet`);
        }
    }

    throw new Error(`[Engine]: far call is not implemented yet`);
}