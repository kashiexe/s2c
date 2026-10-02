import Machine from "../machine.js";
import { Path, VarDecl } from "../node.js";
import { error, e_codes, code_snippet } from "../../utils/term.js";
import { type Token, TokenType } from "../../lexer/token.js";
import parse_expr from "../methods/expr.js";
import parse_path from "../methods/path.js";

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

    // expect identifier first
    const token1 = machine.peek();
    if(!token1 || (token1 as Token).type !== TokenType.IDENTIFIER) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected identifier after ${what}, got "${token1?.value ?? "EOF"}"`, [code_snippet(machine.file, machine.code, (token1?.pos ?? machine.peek(-1)!.pos), `Unexpected "${token1?.value ?? "EOF"}"`)]);
        machine.error = true;
        return null;
    }

    // advance and check if assign
    machine.advance();

    let assign = machine.peek();

    // default to auto
    let type = new Path((token1 as Token).pos, [{
        pos: {
            line: (token1 as Token).pos.line,
            column: (token1 as Token).pos.column,
            offset: (token1 as Token).pos.offset,
            length: 4
        },
        identifier: "auto"
    }]);

    // check if : type
    if(assign && (assign as Token).type === TokenType.COLON) {
        machine.advance();

        let parsed_type = parse_path(machine);

        if(parsed_type) type = parsed_type;
        assign = machine.peek();
    }

    // check if assign instead
    if(!assign || (assign as Token).type !== TokenType.ASSIGN) {
        let uninitialized_variable = new VarDecl((token1 as Token).pos, (token1 as Token).value as string, undefined, is_const);
        return uninitialized_variable;
    }

    // advance if inbound
    if(machine.offset_inb()) machine.advance();

    // parse expression
    let value = parse_expr(machine, 0);

    if(!value) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected expression after assignment operator in ${what}, got "${machine.peek()?.value ?? "EOF"}"`, [code_snippet(machine.file, machine.code, (machine.peek()?.pos ?? machine.peek(-1)!.pos), `Unexpected "${machine.peek()?.value ?? "EOF"}"`)]);
        machine.error = true;
        return null;
    }

    let variable = new VarDecl((token1 as Token).pos, (token1 as Token).value as string, value, is_const);

    return variable;
}