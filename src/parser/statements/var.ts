import Machine from "../machine.js";
import { VarDecl } from "../node.js";
import * as s2t from "../../utils/term.js";
import { type Token, TokenType } from "../../lexer/token.js";
import parse_expr from "../methods/expr.js";

/**
 * initially, a variable declaration in s2 only supports the syntax:
 * ```
 * let|const <identifier> = <expression> <EOF/END/NL>
 * ```
 * 
 * however, future s2 models will include complex syntax such as:
 * ```
 * let|const|type <type (if no type before)|attr|identifier> <":" + <type> | <identifier (if attr) + (":" + <type> | null) | attr (if identifier) + (":" + <type> | null)> <"=" + <expression> | EOF/END/NL>
 * ```
 * 
 * it is important to note that a variable can NOT have "const"/"let" as an attribute AFTER a type (if variable declaration is <type> <identifier>, the variable will be non-const no matter what)
 */
export default function vardecl(machine: Machine, prior_attr: any, what: string = "variable declaration"): VarDecl | null {
    machine.advance(); // consume the keyword

    const is_const = prior_attr.is_const ?? false;

    const token1 = machine.peek();
    if(!token1) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Unexpected end of input while parsing ${what} (at ${machine.peek(-1)?.pos.line}:${machine.peek(-1)?.pos.column}).`);
        machine.error = true;
        return null;
    }

 
    // for now, expect identifier
    if((token1 as Token).type !== TokenType.IDENTIFIER) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected identifier after ${what} keyword (at ${machine.peek(-1)?.pos.line}:${machine.peek(-1)?.pos.column}).`);
        return null;
    }

    // advance and check if assign
    machine.advance();

    const token2 = machine.peek();

    if(!token2 || (token2 as Token).type !== TokenType.ASSIGN) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected assignment operator after ${what} (at ${machine.peek(-1)?.pos.line}:${machine.peek(-1)?.pos.column}).`);
        machine.error = true;
        return null;
    }

    machine.advance();

    // parse expression
    let value = parse_expr(machine, 0);

    if(!value) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected expression after assignment operator in ${what} (at ${machine.peek(-1)?.pos.line}:${machine.peek(-1)?.pos.column}).`);
        machine.error = true;
        return null;
    }

    let variable = new VarDecl((token1 as Token).pos, (token1 as Token).value as string, value, is_const);

    return variable;
}