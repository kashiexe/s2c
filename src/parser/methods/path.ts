import Machine from "../machine.js"
import { Path, type PathElem, type PathElemModifier, PathElemModifierType } from "../node.js"
import { merge, TokenType } from "../../lexer/token.js"
import parse_expr from "./expr.js"

/**
 * element() <-- call modifier initiates with a ( and end in ) (or whatever OPEN_PAREN and CLOSE_PAREN are set to)
 * @param machine 
 * @returns 
 */
export function parse_call_modifier(machine: Machine): PathElemModifier | null {
    let token = machine.peek();
    if(token?.type !== TokenType.OPEN_PAREN) {
        return null;
    }

    machine.advance();
    token = machine.peek();

    let args = [];

    while(machine.offset_inb() && token?.type !== TokenType.CLOSE_PAREN) {
        // parse arguments here
        let expr = parse_expr(machine, 0);
        token = machine.peek();

        if(token?.type === TokenType.COMMA) {
            machine.advance();
            token = machine.peek();
        }

        if(expr) {
            args.push(expr);
        }
    }

    return { type: PathElemModifierType.Call, args };
}

/**
 * parse_path expects the machine.peek() token to be THE triggering IDENTIFIER token
 * in other words, no advancement before calling parse_path
 * 
 * also, parse_path stops AT the first token that cannot be part of a path
 * @param machine 
 * @returns 
 */
export default function parse_path(machine: Machine): Path | null {
    // initialize preparation for the path node itself
    let token = machine.peek();
    let elements: PathElem[] = [];

    // states
    let is_prop = false;
    let can_be_type = true;

    // begin path loop
    while(
        machine.offset_inb() && 
        token?.type === TokenType.IDENTIFIER
    ) {
        // create element
        let elem: PathElem = { identifier: token.value as string, pos: token.pos, is_prop };

        // look for modifiers
        machine.advance();
        token = machine.peek();

        // EOF
        if(!token) {
            break;
        };

        // check if current token can be start of a modifier
        switch(token?.type) {
            case TokenType.OPEN_PAREN: {
                // CALL modifier
                let modifier = parse_call_modifier(machine);
                if(modifier) {
                    elem.modifiers = elem.modifiers || [];
                    elem.modifiers.push(modifier);
                }
                can_be_type = false;

                break;
            }

            // no modifier
            default: {
                machine.advance(-1);
                break;
            }
        }

        // push current built element and advance to next token
        elements.push(elem);
        machine.advance();
        token = machine.peek();

        // property access
        if(token?.type === TokenType.DOT) {
            is_prop=true;
            machine.advance();
            token = machine.peek();
        }
    }

    if(elements.length === 0) {
        return null;
    }

    let path = new Path(merge((elements[0]!).pos, (elements[elements.length - 1]!).pos), elements);
    path.can_be_type = can_be_type;
    return path;
}