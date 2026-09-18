import Machine from "../machine.js";
import { TokenType } from "../../lexer/token.js";

export default function skip_nl(machine: Machine): void {
    let token = machine.peek();
    
    while(token?.type === TokenType.NL) {
        machine.advance();
        token = machine.peek();
    }
}