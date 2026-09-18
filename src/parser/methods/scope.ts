import { parse_token } from "../parser.js";
import Machine from "../machine.js";
import { Scope } from "../node.js";
import { TokenType, type span } from "../../lexer/token.js";
import * as s2t from "../../utils/term.js";
import skip_nl from "./skip_nl.js";

export default function parse_scope(machine: Machine): Scope | null {
    let token = machine.peek();
    let first_token = token;
    let nodes = [];

    while(machine.offset_inb() && token?.type !== TokenType.CLOSE_BRACE) {
        // skip new lines
        skip_nl(machine);

        token = machine.peek();

        if(token?.type === TokenType.CLOSE_BRACE) break;
    
        const node = parse_token(token!, machine);
        
        if(node) {
            nodes.push(node);
        } else {
            machine.error = true;
            return null;
        }

        machine.advance();
        token=machine.peek();
    }

    if(!token || token.type !== TokenType.CLOSE_BRACE) {
        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error${s2t.reset + s2t.fg(s2t.palette.white)}: Expected closing brace for scope (at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + token?.pos.line + s2t.reset}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + token?.pos.column + s2t.reset}).`);
        machine.error = true;
        return null;
    }

    return new Scope({
        line: (first_token?.pos as span).line,
        column: (first_token?.pos as span).column,
        offset: (first_token?.pos as span).offset,
        length: (machine.peek(-1)?.pos.offset ?? 0) - (first_token?.pos as span).offset
    }, nodes);
}