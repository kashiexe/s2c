import lexer from "../../lexer/lexer.js";
import fs from "fs"
import { parse } from "../../parser/parser.js";
import lir from "../../lir/lir.js";
import arch from "../../codegen/codegen.js";
import Linker from "../../linker/x86_64/link.js";

/**
 * for now, it can only support a single file and the output is in x86_64 linux sysvamd ABI format.
 */
export function compile() {
    const now = new Date();
    const args = process.argv.slice(2);
    const file = args[0] || "./tests/index.s2";

    const code = fs.readFileSync(file, "utf-8");
    const tokens = lexer(code);

    const ast = parse(tokens);
    const module = lir(ast);
    fs.writeFileSync(`./build/${file.split('/').pop()!.split('.')[0]}_ast.json`, JSON.stringify(ast, null, 4));
    fs.writeFileSync(`./build/${file.split('/').pop()!.split('.')[0]}.s2i`, module.to_string());

    // execute
    const x86_64 = arch["x86_64"].execute;
    const cgblock = x86_64(module, "sysvamd", "linux");

    // link
    const linker = new Linker("linux", [cgblock]);
    linker.link({
        output: `./build/${file.split('/').pop()!.split('.')[0]}`,
    });
    const end = new Date();
    const duration = end.getTime() - now.getTime();

    console.log(`\x1b[38;5;39;1m• \x1b[38;5;15mCompiled \x1b[38;5;222;4m${file}\x1b[38;5;15;24m to \x1b[38;5;85;4m./build/${file.split('/').pop()!.split('.')[0]}\x1b[38;5;15;24m in \x1b[38;5;219m${duration}\x1b[38;5;15mms\x1b[0m`);
}