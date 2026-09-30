import AST from "./ast.js";
import { type Token } from "../lexer/token.js";

export default class Machine {
    ast: AST;
    tokens: Token[];
    offset: number = 0;
    error: boolean = false;
    code: string;
    file: string;

    constructor(ast: AST, tokens: Token[], code: string, file: string) {
        this.ast = ast;
        this.tokens = tokens;
        this.code = code;
        this.file = file;
    }

    advance(offset: number = 1): void {
        this.offset += offset;
    }

    peek(offset?: number): Token | null {
        return this.tokens[this.offset + (offset ?? 0)] ?? null;
    }

    /**
     * quickly checks if offset is within bounds (removes verbose)
     * @returns 
     */
    offset_inb(): boolean {
        return this.offset < this.tokens.length;
    }
}