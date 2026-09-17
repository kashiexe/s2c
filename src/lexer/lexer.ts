import { type Token } from "./token.js";

export default function lexer(code: string): Token[] {
    const tokens: Token[] = [];

    // track position
    let line = 1, column = 0;

    for(let i = 0; i < code.length; i++) {
        let c: string = code[i] as string, n = "", nn = "";
        
    }

    return tokens;
}