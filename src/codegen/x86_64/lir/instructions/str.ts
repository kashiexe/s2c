import type { StringInstr } from "../../../../lir/instr.js";
import type { Allocation } from "../../allocators/sysvamd.js";
import lea from "../../instructions/lea.js";
import { OperandType } from "../../operand.js";
import add_rbp from "../operand_rbp.js";
import { ptr32, type mem } from "../../mem.js";
import CGBlock, { Reloc, RelocType } from "../../cgblock.js";
import { rax, rip } from "../../regs.js";
import push from "../../instructions/push.js";
import pop from "../../instructions/pop.js";
import mov from "../../instructions/mov.js";

/**
 * a StringInstr needs it's value to be stored in the rodata section and then a relocation needs to be added to the block so that the linker can resolve the string's address
 */
export default function translate_str(instr: StringInstr, alloc: Allocation, block: CGBlock): Uint8Array {
    let res = alloc.get(instr.result.id)!;

    let bytes: number[] = [];

    // add rbp offset to res if res is a memory operand
    if(res.type === OperandType.Mem) res = add_rbp(res, alloc.temp_rbp_offset) as mem;

    let lea_offset = 0;

    // move placeholder to res    
    if(res.type === OperandType.Mem) {
        let push_rax = push(rax);
        let lea_bytes = lea(rax, ptr32(rip, undefined, undefined, undefined));
        let mov_bytes = mov(res, rax);
        let pop_rax = pop(rax);

        lea_offset = push_rax.length + lea_bytes.length - 4;

        bytes.push(...push_rax, ...lea_bytes, ...mov_bytes, ...pop_rax);
    } else {
        let lea_instr = lea(res, ptr32(rip, undefined, undefined, undefined));

        lea_offset = lea_instr.length - 4;

        bytes.push(...lea_instr);
    }

    // create relocation
    block.add(new Reloc(
        block.text.length + lea_offset,
        "text",
        RelocType.Relative,
        String(`string$${instr.result.id}`),
        -4n
    ));

    return new Uint8Array(bytes);
}