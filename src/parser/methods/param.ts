import Machine from "../machine.js"
import { Param, Path } from "../node.js"
import { TokenType, type Token } from "../../lexer/token.js"
import { error, e_codes, code_snippet } from "../../utils/term.js"
import parse_path from "./path.js"

/**
 * stops AT the first token that cannot be part of a parameter (aka after it)
 * 
 * @param machine 
 * @returns 
 */
export function param(machine: Machine): Param | null {
    let token = machine.peek();

    while(machine.offset_inb() && token?.type === TokenType.IDENTIFIER) {
        const id = token.value as string;

        if(token?.type === TokenType.IDENTIFIER) {
            machine.advance();
            token = machine.peek();

            if(token?.type === TokenType.COLON) {
                machine.advance(); // consume the colon

                let type = parse_path(machine);
                if(!type) {
                    machine.error = true;
                    return null;
                }

                return new Param((token as Token).pos, id, type);
            }

            // no type parameter defaults to "any" type
            return new Param((token as Token).pos, id, new Path((token as Token).pos, [{
                pos: (token as Token).pos,
                identifier: "any"
            }]));
        }
    }

    return null;
}

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
        const param_node = param(machine);
        if(!param_node) {
            machine.error = true;
            return null;
        }

        token = machine.peek();

        // check if pointer
        if(token?.type === TokenType.MUL) {
            param_node.is_pointer = true;
            machine.advance();
            token = machine.peek();
        }

        params.push(param_node);

        if(token?.type !== TokenType.COMMA && token?.type !== TokenType.CLOSE_PAREN) {
            error(e_codes.UNEXPECTED_TOKEN, `Expected a "," or a ")" after function parameter, instead got ${token?.type ?? "EOF"}`, [code_snippet(machine.file, machine.code, token?.pos ?? machine.peek(-1)!.pos, "")]);
            machine.error = true;
            return null;
        } else if(token?.type === TokenType.COMMA) {
            machine.advance();
            token = machine.peek();
        }
    }

    if(token?.type !== TokenType.CLOSE_PAREN) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected closing parenthesis after function parameters, instead got ${token?.type ?? "EOF"}`, [code_snippet(machine.file, machine.code, token?.pos ?? machine.peek(-1)!.pos, "")]);
        machine.error = true;
        return null;
    }

    machine.advance(); // consume the closing paren

    return params;
}