import Module from "../../lir/module.js";
import CGBlock, { Symbol } from "./cgblock.js";
import type { Allocation } from "./allocators/sysvamd.js";
import BasicBlock from "../../lir/bb.js";
import translate_instr from "./lir/translate_instr.js";
import translate_term from "./lir/translate_term.js";

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
        cgblock.add(bytes);
    }

    // translate terminator
    let bytes = translate_term(block.terminator, alloc);
    cgblock.add(bytes);
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

        // translate entry block first
        translate_block(module, func.entry, alloc, os, cgblock);

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