import Module from "../../lir/module.js";
import CGBlock from "./cgblock.js";
import type { Allocation } from "./allocators/sysvamd.js";
import BasicBlock from "../../lir/bb.js";
import translate_instr from "./lir/translate_instr.js";

/**
 * translates a single basic block into x86_64 instructions
 * @param module 
 * @param block 
 * @param alloc 
 * @param os 
 * @param cgblock 
 */
export function translate_block(module: Module, block: BasicBlock, alloc: Allocation, os: string, cgblock: CGBlock) {
    const instructions = block.instructions;

    for(let i = 0; i < instructions.length; i++) {
        const instr = instructions[i]!;

        // translate instruction
        let bytes = translate_instr(instr, alloc);
        cgblock.add_code(bytes);
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

    for(let i = 0; i < module.functions.length; i++) {
        const func = module.functions[i]!;

        translate_block(module, func.entry, alloc, os, cgblock);

        for(let j = 0; j < func.blocks.length; j++) {
            const block = func.blocks[j]!;
            translate_block(module, block, alloc, os, cgblock);
        }
    }

    console.log(cgblock);

    return cgblock;
}