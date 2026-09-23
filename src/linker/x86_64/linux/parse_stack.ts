import mov from "../../../codegen/x86_64/instructions/mov.js";
import { rsp } from "../../../codegen/x86_64/regs.js";
import { ptr64 } from "../../../codegen/x86_64/mem.js";
import { SysVAMD64ABI } from "../../../codegen/x86_64/allocators/sysvamd.js";

export default function parse_stack(): Uint8Array {
    let sysv = new SysVAMD64ABI();

    return new Uint8Array([
        ...mov(sysv.caller_saved.at(0)!, ptr64(rsp)), // argc
        ...mov(sysv.caller_saved.at(1)!, ptr64(rsp, undefined, undefined, 8n)), // argv start
    ]);
}