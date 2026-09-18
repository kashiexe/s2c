import Machine from "../machine.js"
import { Path, type PathElem } from "../node.js"
import { merge, TokenType } from "../../lexer/token.js"

/**
 * parse_path expects the machine.peek() token to be THE triggering IDENTIFIER token
 * in other words, no advancement before calling parse_path
 * @param machine 
 * @returns 
 */
export default function parse_path(machine: Machine): Path | null {
    let token = machine.peek();
    let elements: PathElem[] = [];

    while(
        machine.offset_inb() && 
        token?.type === TokenType.IDENTIFIER
    ) {
        elements.push({
            identifier: token.value as string,
            pos: token.pos
        });
        machine.advance();
        token = machine.peek();
    }

    return new Path(merge((elements[0] as PathElem).pos, (elements[elements.length - 1] as PathElem).pos), elements);
}