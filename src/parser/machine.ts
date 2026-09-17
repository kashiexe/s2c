import AST from "./ast.js";
import { type Token } from "../lexer/token.js";

export default class Machine {
    ast: AST;
    tokens: Token[];
    offset: number = 0;
    error: boolean = false;

    constructor(ast: AST, tokens: Token[]) {
        this.ast = ast;
        this.tokens = tokens;
    }

    advance(offset: number = 1): void {
        this.offset += offset;
    }

    peek(offset?: number): Token | null {
        return this.tokens[this.offset + (offset ?? 0)] ?? null;
    }
}