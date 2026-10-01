import lexer from "../../lexer/lexer.js";
import fs from "fs"
import path from "path"
import process from "process"
import { parse } from "../../parser/parser.js";
import lir from "../../lir/lir.js";
import arch from "../../codegen/codegen.js";
import Linker from "../../linker/x86_64/link.js";
import type { cmd } from "./process_args.js";
import * as s2t from "../term.js"

/**
 * ```ts
 * const start = process.hrtime.bigint();
 * const end = process.hrtime.bigint();
 * const duration = (end - start);
 * ```
 * @param time in ns
 */
export function process_time(time: bigint): string {
    let suffixes = ["ns", "μs", "ms", "s"];
    let i = 0;
    let t = Number(time);
    
    while(t >= 1000 && i < suffixes.length - 1) {
        t /= 1000;
        i++;
    }

    return `${t.toFixed(3)}${suffixes[i]}`;
}

/**
 * for now, it can only support a single file and the output is in x86_64 linux sysvamd ABI format.
 */
export default function compile(command: cmd) {
    // remove information from command
    const file = (command.value.length > 0) ? command.value : "./index.s2";
    let output = command.flags["output"];

    if(!output) {
        fs.mkdirSync("./build", { recursive: true });
        output = `./build/${path.parse(file).name}`;
    }

    // check if file exists
    if(!fs.existsSync(file)) {
        console.error(
            `${s2t.fg(s2t.palette.red, [s2t.style.bold])}[s2c] Error: ${s2t.fg(s2t.palette.white)}File ${s2t.fg(s2t.palette.red, [s2t.style.bold, s2t.style.underline])}${file}${s2t.ss([s2t.style.underline]) + s2t.fg(s2t.palette.white)} does not exist!${s2t.reset}`
        );
        return 1;
    }

    // begin compiling
    const now = process.hrtime.bigint();
    const code = fs.readFileSync(file, "utf-8");
    const tokens = lexer(code, file);

    const ast = parse(tokens, code, file);
    const module = lir(ast, file, code);

    // check if debug flag is set
    if(command.flags["debug"]) {
        let what_wrote = "nothing was written to disk because the program is empty."

        // write AST
        if(ast.nodes.length > 0) {
            fs.writeFileSync(`${output}_ast.json`, JSON.stringify(ast, null, 4));
            what_wrote = `${s2t.fg(s2t.palette.white)}AST was written to ${s2t.fg(s2t.palette.blue, [s2t.style.underline])}${output}_ast.json${s2t.ss([s2t.style.underline]) + s2t.fg(s2t.palette.white)}`;
        }

        // write LIR
        let lir_output = module.to_string();
        if(lir_output.length > 0) {
            fs.writeFileSync(`${output}.s2i`, lir_output);
            if(what_wrote.startsWith("nothing")) {
                what_wrote = `${s2t.fg(s2t.palette.white)} LIR was written to ${s2t.fg(s2t.palette.blue, [s2t.style.underline])}${output}.s2i${s2t.ss([s2t.style.underline]) + s2t.fg(s2t.palette.white)}`;
            } else {
                what_wrote += `${s2t.fg(s2t.palette.white)} and LIR was written to ${s2t.fg(s2t.palette.blue, [s2t.style.underline])}${output}.s2i${s2t.ss([s2t.style.underline]) + s2t.fg(s2t.palette.white)}`;
            }
        }

        // write log
        console.log(`${s2t.fg(s2t.palette.blue, [s2t.style.bold])}• ${s2t.fg(s2t.palette.white)}${what_wrote}${s2t.reset}`);
    }

    // module is empty, cannot continue
    if(module.functions.length === 0) {
        console.error(
            `${s2t.fg(s2t.palette.red, [s2t.style.bold])}❌${s2t.fg(s2t.palette.white)} Compilation failed. ${s2t.fg(s2t.palette.red, [s2t.style.bold])}No output was generated.${s2t.reset}`
        );
        return 1;
    };

    // execute
    const x86_64 = arch["x86_64"].execute;
    const cgblock = x86_64(module, "sysvamd", "linux");

    // link
    const linker = new Linker("linux", [cgblock]);
    linker.link({
        output
    });
    const end = process.hrtime.bigint();
    const duration = (end - now);

    // compiled!
    console.log(`\x1b[38;5;45;1m• \x1b[38;5;15mCompiled \x1b[38;5;45;4m${file}\x1b[38;5;15;24m to \x1b[38;5;45;4m${output}\x1b[38;5;15;24m in \x1b[38;5;7m${process_time(duration)}\x1b[0m`);
    return 0;
}