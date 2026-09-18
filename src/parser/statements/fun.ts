import Machine from "../machine.js";
import { FunDecl } from "../node.js";
import parse_scope from "../methods/scope.js";
import parse_param from "../methods/param.js";
import { TokenType } from "../../lexer/token.js";
import * as s2t from "../../utils/term.js";

export default function fundecl(machine: Machine, prior_attr: any): FunDecl | null {
    machine.advance();

    let token = machine.peek();

    if(!token || token.type !== TokenType.IDENTIFIER) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected function name after function declaration keyword (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.column + s2t.reset}).`);
        machine.error = true;
        return null;
    }

    machine.advance(); // consume the identifier

    // expect opening paren
    let open_paren = machine.peek();
    if(!open_paren || open_paren.type !== TokenType.OPEN_PAREN) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected beginning of parameter list after function name in function declaration (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.column + s2t.reset}).`);
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

    // expect open brace
    let open_brace = machine.peek();
    if(!open_brace || open_brace.type !== TokenType.OPEN_BRACE) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected beginning of function body after parameter list in function declaration (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.column + s2t.reset}).`);
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
    
    return new FunDecl(open_paren.pos, token.value as string, params, body);
}