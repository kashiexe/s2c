import Machine from "../machine.js";
import { BinaryExpr, Literal, LitExpr, Node } from "../node.js";
import { TokenType, def_span, get_p, is_right_associative, merge } from "../../lexer/token.js";
import parse_path from "./path.js";

export function parse_nud(machine: Machine): Node | null {
    let token = machine.peek();
    let type = token?.type;

    switch(type) {
        case TokenType.NUMBER: 
        case TokenType.STRING: {
            machine.advance();
            return new Literal(token?.pos ?? def_span(), token?.value ?? "");
        }

        case TokenType.IDENTIFIER: {
            let path = parse_path(machine);
            if(!path) return null;

            return new LitExpr(path.pos, path);
        }
    }

    return null;
}

export function parse_led(machine: Machine, left: Node): Node | null {
    let token = machine.peek();
    let op = token?.type ?? 0;
    let score = get_p(op);

    // consume operator
    machine.advance();

    let rhs;

    if(is_right_associative(op)) {
        rhs = parse_expr(machine, score - 1);
    } else {
        rhs = parse_expr(machine, score);
    }
    
    if(!rhs) return null;

    return new BinaryExpr(merge(left.pos, rhs.pos), left, rhs, op);
}

export default function parse_expr(machine: Machine, min_precedence: number, lhs?: Node): Node | null {
    let left = lhs ?? parse_nud(machine);

    if(!left) return null;

    while(machine.offset_inb() && get_p(machine.peek()?.type ?? 0) > min_precedence) {
        left = parse_led(machine, left) ?? left;
    }

    return left;
}