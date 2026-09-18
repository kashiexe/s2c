import Machine from "../machine.js"
import { Param } from "../node.js"
import { TokenType } from "../../lexer/token.js"
import * as s2t from "../../utils/term.js"
import vardecl from "../statements/var.js"

/**
 * expects the opening paren to be consumed prior to this function
 * consumes closing paren
 * @param machine 
 * @returns 
 */
export default function parse_param(machine: Machine): Param[] | null {
    let token = machine.peek();
    let params = [];

    while(
        machine.offset_inb() &&
        token?.type !== TokenType.CLOSE_PAREN
    ) {
        const vardecl_node = vardecl(machine, {is_const: false}, "function parameter");
        if(vardecl_node) {
            params.push(new Param(vardecl_node.pos, vardecl_node.id, vardecl_node.value));
        }

        machine.advance();
        token = machine.peek();

        if(token?.type !== TokenType.COMMA && token?.type !== TokenType.CLOSE_PAREN) {
            console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected comma or closing parenthesis after function parameter (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.column + s2t.reset}).`);
            machine.error = true;
            return null;
        } else if(token?.type === TokenType.COMMA) {
            machine.advance();
            token = machine.peek();
        }
    }

    if(token?.type !== TokenType.CLOSE_PAREN) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected closing parenthesis after function parameters (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + machine.peek(-1)?.pos.column + s2t.reset}).`);
        machine.error = true;
        return null;
    }

    machine.advance(); // consume the closing paren

    return params;
}