import Module from "../../lir/module.js";
import CGBlock, { Symbol } from "./cgblock.js";
import type { Allocation } from "./allocators/sysvamd.js";
import BasicBlock from "../../lir/bb.js";
import translate_instr from "./lir/translate_instr.js";
import translate_term from "./lir/translate_term.js";
import { InstructionType } from "../../lir/instr.js";
import push from "./instructions/push.js";
import { rbp, rsp } from "./regs.js";
import mov from "./instructions/mov.js";
import sub from "./instructions/sub.js";
import { imm64 } from "./imm.js";
import { ptr64 } from "./mem.js";
import pop from "./instructions/pop.js";
import { DataTypeToString } from "../../lir/data.js";

/**
 * translates a single basic block into x86_64 instructions
 * @param module 
 * @param block 
 * @param alloc 
 * @param os 
 * @param cgblock 
 * @param no_term 
 */
export function translate_block(module: Module, block: BasicBlock, alloc: Allocation, os: string, cgblock: CGBlock, no_term?: boolean) {
    const instructions = block.instructions;

    for(let i = 0; i < instructions.length; i++) {
        const instr = instructions[i]!;

        if(instr.type === InstructionType.Raw) continue;

        // translate instruction
        let bytes = translate_instr(instr, alloc, cgblock);
        cgblock.add(bytes);
    }

    // translate terminator (by default)
    if(!no_term) {
        let bytes = translate_term(block.terminator, alloc);
        cgblock.add(bytes);
    }
}

/**
 * function responsible for translating LIR instructions into x86_64 instructions (allocation needed before this for Allocation class)
 * @param module 
 * @param alloc 
 * @param os 
 */
export default function translate(module: Module, alloc: Allocation, os: string): CGBlock {
    const cgblock = new CGBlock(os);

    // translate the data objects
    for(let i = 0; i < module.dataObjs.length; i++) {
        let data_obj = module.dataObjs[i]!;
        let type = data_obj.type;
        let symbol = new Symbol(
            `${DataTypeToString[type]}$${data_obj.id}`,
            "rodata",
            cgblock.rodata.length,
            data_obj.data.length,
            true
        );
        
        cgblock.add(symbol);
        cgblock.rodata.push(...data_obj.data);
    }

    // translate the functions
    for(let i = 0; i < module.functions.length; i++) {
        const func = module.functions[i]!;

        if(func.name === "main") cgblock.add(cgblock.text.length);

        // add symbol to cgblock
        let symbol = new Symbol(
            func.name, 
            "text",
            cgblock.text.length, 
            0, 
            true
        );

        cgblock.add(symbol);

        // get function info from alloc
        let func_info = alloc.func_information.get(func.name)!;

        // emit prologue [for now, all functions have prologues and epilogues with rbp setup]
        let frame_size = func_info.spilled + func_info.outgoing_spilled + (func_info.used_callee.length * 8) + 8 + 16; // the 16 is an extra padding just in case
        let aligned_frame_size = (frame_size + 15) & ~15; // aligned to 16 bytes

        cgblock.add(new Uint8Array([
            ...push(rbp),
            ...mov(rbp, rsp),
            ...sub(rsp, imm64(BigInt(aligned_frame_size)))
        ]));

        // for each callee saved register used (save it to the stack first)
        for(let i = 0; i < func_info.used_callee.length; i++) {
            let callee = func_info.used_callee[i]!;

            cgblock.add(mov(ptr64(rbp, undefined, undefined, BigInt(-8 * (i + 1))), callee));
        }

        alloc.temp_rbp_offset = func_info.spilled;

        // translate entry block first
        translate_block(module, func.entry, alloc, os, cgblock, true); // no terminator translation for entry block as it requires an epilogue first

        // emit epilogue
        
        // restore rbp
        let epilogue_bytes: number[] = [];
        
        // restore callee saved registers
        for(let i = 0; i < func_info.used_callee.length; i++) {
            let callee = func_info.used_callee[i]!;
            epilogue_bytes.push(...mov(callee, ptr64(rbp, undefined, undefined, BigInt(-8 * (i + 1)))));
        }

        epilogue_bytes = [...epilogue_bytes, ...mov(rsp, rbp), ...pop(rbp)];

        // translate terminator
        let bytes = translate_term(func.entry.terminator, alloc, new Uint8Array(epilogue_bytes));
        cgblock.add(bytes);

        alloc.temp_rbp_offset = 0;

        // translate other blocks
        for(let j = 0; j < func.blocks.length; j++) {
            const block = func.blocks[j]!;
            translate_block(module, block, alloc, os, cgblock);
        }

        // update symbol size
        symbol.size = cgblock.text.length - symbol.offset;
    }

    return cgblock;
}