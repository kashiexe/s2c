import ELF from "./linux/elf.js";
import S2RT from "./s2rt.js";
import CGBlock from "../../codegen/x86_64/cgblock.js";

export default class Linker {
    os: string;
    elf?: ELF;
    s2rt: S2RT;

    constructor(os: string, cgblocks: CGBlock[]) {
        this.os = os;
        let global_cgblock = this.combine_cgblock(cgblocks);
        this.s2rt = new S2RT(global_cgblock);
    }

    combine_cgblock(cgblocks: CGBlock[]): CGBlock {
        let cgblock = new CGBlock(this.os);

        for(let block of cgblocks) {
            // update relocations
            for(let reloc of block.relocations) {
                reloc.offset += cgblock.text.length;
            }
            
            // update entry
            if(block.entry !== undefined) {
                cgblock.entry = block.entry + cgblock.text.length;
            }

            // update symbols and push them
            for(let symbol of block.symbols) {
                symbol.offset += cgblock.text.length;
                cgblock.symbols.push(symbol);
            }

            // push sections
            cgblock.text.push(...block.text);
            cgblock.rodata.push(...block.rodata);
            cgblock.data.push(...block.data);
            cgblock.bss += block.bss;

            // push relocations too
            cgblock.relocations.push(...block.relocations);
        }

        return cgblock;
    }

    /**
     * passes control to the correct linker for the target OS
     * (this function is not the one responsible for the actual linking)
     */
    link(info: any) {
        if(this.os === "linux") {
            this.elf = new ELF(info, this.s2rt);
            this.elf.link(info.output);
        }
    }
}