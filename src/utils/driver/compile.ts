import lexer from "../../lexer/lexer.js";
import fs from "fs"
import { parse } from "../../parser/parser.js";
import lir from "../../lir/lir.js";
import arch from "../../codegen/codegen.js";

/**
 * for now, it's only a hardcoded program
 */
export function compile() {
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
    x86_64(module, "sysvamd", "linux");
}