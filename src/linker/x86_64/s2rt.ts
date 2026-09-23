import CGBlock from "../../codegen/x86_64/cgblock.js";
import lnx_parse_stack from "./linux/parse_stack.js";
import call from "../../codegen/x86_64/instructions/call.js";
import { ptr32, ptr64 } from "../../codegen/x86_64/mem.js";
import { rax, rdi, rip } from "../../codegen/x86_64/regs.js";
import { syscalls } from "../../codegen/linux/syscalls.js";
import syscall from "../../codegen/x86_64/instructions/syscall.js";
import mov from "../../codegen/x86_64/instructions/mov.js";
import { imm64 } from "../../codegen/x86_64/imm.js";


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
        
        console.log(this.ctx);
    }

    /**
     * generates _start
     */
    generate() {
        if(this.ctx.os === "linux") {
            this.generate_linux();
        }
    }

    /**
     * linux specific
     */
    generate_linux() {
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
                BigInt(this.ctx.symbols.find(s => (s.name === "main" && s.global))!.offset + syscall_exit.length + 4 /* 4 bytes from the offset */)
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

        console.log(this.ctx.text);
    }
}