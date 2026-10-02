import type CGBlock from "../../../codegen/x86_64/cgblock.js";
import mov from "../../../codegen/x86_64/instructions/mov.js";
import cmp from "../../../codegen/x86_64/instructions/cmp.js";
import sub from "../../../codegen/x86_64/instructions/sub.js";
import add from "../../../codegen/x86_64/instructions/add.js";
import ret from "../../../codegen/x86_64/instructions/ret.js";
import jmp from "../../../codegen/x86_64/instructions/jmp.js";
import { rax, rcx } from "../../../codegen/x86_64/regs.js";
import { ptr8 } from "../../../codegen/x86_64/mem.js";
import { imm64, imm8 } from "../../../codegen/x86_64/imm.js";
import { je } from "../../../codegen/x86_64/instructions/jcc.js";
import inc from "../../../codegen/x86_64/instructions/inc.js";

export function strlen(ctx: CGBlock): Uint8Array {
    let bytes = [];

    bytes.push([
        ...mov(rcx, rax),
        ...cmp(ptr8(rcx, undefined, undefined, undefined), imm8(0)),
        ...je(imm8(0x05)), // precalculated
        ...inc(rcx),
        ...jmp(false, imm8(-0x0A)), // precalculated
        ...sub(rcx, rax),
        ...mov(rax, rcx),
        ...ret(false)
    ]);

    return new Uint8Array(bytes.flat());
}