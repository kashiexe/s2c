import { regs, r64 } from "../../codegen/x86_64/regs.js";
import lexer from "../../lexer/lexer.js";
import fs from "fs"
import { parse } from "../../parser/parser.js";

/**
 * for now, it's only a hardcoded program
 */
export function compile() {
    const args = process.argv.slice(2);
    const file = args[0] || "./tests/index.s2";

    const code = fs.readFileSync(file, "utf-8");
    const tokens = lexer(code);

    const ast = parse(tokens);
}