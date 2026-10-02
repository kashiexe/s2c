import CGBlock, { Symbol } from "../../codegen/x86_64/cgblock.js";
import lnx_parse_stack from "./linux/parse_stack.js";
import call from "../../codegen/x86_64/instructions/call.js";
import { ptr32 } from "../../codegen/x86_64/mem.js";
import { rax, rdi, rip } from "../../codegen/x86_64/regs.js";
import { syscalls } from "../../codegen/linux/syscalls.js";
import syscall from "../../codegen/x86_64/instructions/syscall.js";
import mov from "../../codegen/x86_64/instructions/mov.js";
import { imm64 } from "../../codegen/x86_64/imm.js";
import * as runtime from "./runtime/hub.js"


/**
 * this class generates a small program which is used as the entry point of any s2 program.
 * it is responsible for setting up the stack and calling the main function of the program.
 * it is also responsible for calling the exit syscall when the main function returns.
 * this class is used by the linker to generate the entry point of the program.
 */
export default class S2RT {
    // offset of the actual executable's entry
    exe_entry: number;
    ctx: CGBlock;

    constructor(global_cgblock: CGBlock) {
        this.exe_entry = 0;
        this.ctx = global_cgblock;
        this.generate();
    }

    check_runtime_functions(os: string) {
        let relocs = this.ctx.relocations;

        for(let i = 0; i < relocs.length; i++) {
            let reloc = relocs[i]!;

            if(reloc.symbol.startsWith("s2rt#")) {
                let func_name = reloc.symbol.split("#")[1];
                if(runtime[func_name as keyof typeof runtime] !== undefined) {
                    let bytes = runtime[func_name as keyof typeof runtime](this.ctx);
                    let symbol = new Symbol(`s2rt#${func_name}`, "text", this.ctx.text.length, bytes.length, true);
                    this.ctx.text.push(...bytes);
                    this.ctx.symbols.push(symbol);
                } else {
                    throw new Error(`[Engine]: unimplemented ${func_name} runtime function`);
                }
            }
        }
    }

    /**
     * generates _start
     */
    generate() {
        this.check_runtime_functions(this.ctx.os);

        if(this.ctx.os === "linux") {
            this.generate_linux();
        }
    }

    update_symbol_offsets(offset: number) {
        for(let symbol of this.ctx.symbols) {
            if(symbol.section === "text") symbol.offset += offset;
        }
    }

    update_reloc_offsets(offset: number) {
        for(let reloc of this.ctx.relocations) {
            if(reloc.section === "text") reloc.offset += offset;
        }
    }

    update_txt_offsets(offset: number) {
        // update symbol offsets
        this.update_symbol_offsets(offset);

        // update reloc offsets
        this.update_reloc_offsets(offset);
    }

    /**
     * linux specific
     */
    generate_linux() {
        // get main entry symbol
        let main_symbol = this.ctx.symbols.find(s => (s.name === "main" && s.global))!;

        if(!main_symbol) {
            throw new Error(`[Engine]: no entry point ("main") found in the program.`);
        }

        // first step of the entry point is to set up the stack and call main
        let stack_setup = lnx_parse_stack();

        let syscall_exit = new Uint8Array([
            ...mov(rdi, rax),
            ...mov(rax, imm64(BigInt(syscalls.exit))),
            ...syscall()
        ]);
        
        // call main
        let call_bytes = call(
            false, 
            ptr32(
                rip, 
                undefined, 
                undefined, 
                BigInt(main_symbol.offset + syscall_exit.length + 4 /* 4 bytes from the offset's own bytes */)
            )
        );

        // _start
        let _start = new Uint8Array([
            ...stack_setup,
            ...call_bytes,
            ...syscall_exit
        ]);

        // add _start to the beginning of the text section
        this.ctx.text = Array<number>().concat([..._start, ...this.ctx.text]);

        // update offset
        this.update_txt_offsets(_start.length);
    }
}