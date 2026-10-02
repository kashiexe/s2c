import Machine from "../machine.js";
import { FunDecl } from "../node.js";
import parse_scope from "../methods/scope.js";
import parse_param from "../methods/param.js";
import { TokenType } from "../../lexer/token.js";
import * as s2t from "../../utils/term.js";
import { error, e_codes, code_snippet } from "../../utils/term.js";
import parse_path from "../methods/path.js";

export default function fundecl(machine: Machine, prior_attr: any): FunDecl | null {
    machine.advance();

    let token = machine.peek();

    if(!token || token.type !== TokenType.IDENTIFIER) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected function name after function declaration keyword`, [code_snippet(machine.file, machine.code, token?.pos ?? { line: 0, column: 0, offset: 0, length: 0 }, "Expected function name after function declaration keyword")]);
        machine.error = true;
        return null;
    }

    machine.advance(); // consume the identifier

    // expect opening paren
    let open_paren = machine.peek();
    if(!open_paren || open_paren.type !== TokenType.OPEN_PAREN) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected beginning of parameter list after function name in function declaration`, [code_snippet(machine.file, machine.code, open_paren?.pos ?? { line: 0, column: 0, offset: 0, length: 0 }, "Expected beginning of parameter list after function name in function declaration")]);
        machine.error = true;
        return null;
    }

    machine.advance();

    // get parameters
    const params = parse_param(machine);
    if(!params) {
        machine.error = true;
        return null;
    }

    // check if arrow for return type
    let arrow = machine.peek();
    let type = undefined;
    if(arrow && arrow.type === TokenType.ARROW) {
        machine.advance(); // consume the arrow

        // get return type
        type = parse_path(machine);
        if(!type) {
            machine.error = true;
            return null;
        }
    }

    // expect open brace
    let open_brace = machine.peek();
    if(!open_brace || open_brace.type !== TokenType.OPEN_BRACE) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected beginning of function body after parameter list in function declaration`, [code_snippet(machine.file, machine.code, open_brace?.pos ?? { line: 0, column: 0, offset: 0, length: 0 }, "Expected beginning of function body after parameter list in function declaration")]);
        machine.error = true;
        return null;
    }

    machine.advance();
    
    // get function body
    const body = parse_scope(machine);
    if(!body) {
        machine.error = true;
        return null;
    }

    return new FunDecl(open_paren.pos, token.value as string, params, body, type);
}