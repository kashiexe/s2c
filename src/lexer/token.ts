
export enum TokenType {
    // foundational literals
    IDENTIFIER,
    NUMBER,
    STRING,

    // foundational blocks
    MNEMONIC,
    ASM_INSTR,
    ASM_REG,
    
    // operators
    NL,             // newline
    END,            // ; (end of statement)
    PLUS,
    MINUS,
    MUL,
    DIV,
    ASSIGN,         // =
    OPEN_PAREN,     // (
    CLOSE_PAREN,    // )
    OPEN_BRACE,     // {
    CLOSE_BRACE,    // }
}

/**
 * includes single-character and multi-character operators
 */
export const SymbolTokens: Record<string, TokenType> = {
    "\n": TokenType.NL,
    ";": TokenType.END,
    "+": TokenType.PLUS,
    "-": TokenType.MINUS,
    "*": TokenType.MUL,
    "/": TokenType.DIV,
    "=": TokenType.ASSIGN,
    "(": TokenType.OPEN_PAREN,
    ")": TokenType.CLOSE_PAREN,
    "{": TokenType.OPEN_BRACE,
    "}": TokenType.CLOSE_BRACE
}

export interface span {
    line: number;
    column: number;
    offset: number;
    length: number;
}

// this includes useful metadata for the parser (and subsequent components ofc)
export interface TokenMetadata {
    // generally for numbers (although could be used for other literals), concrete examples are 2s (2 seconds, used in the std.chrono library)
    suffix?: string; 
}

export interface Token {
    type: TokenType;
    value: string | number;
    pos: span;
    meta?: TokenMetadata;
}

/**
 * chars allowed: A-Z, a-z, _
 */
export const is_char = (c: string): boolean => { return c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90 || c.charCodeAt(0) === 95 || c.charCodeAt(0) >= 97 && c.charCodeAt(0) <= 122; };

/**
 * digits allowed: 0-9
 */
export const is_digit = (c: string): boolean => { return c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57; };

// list with all mnemonics in S2
export const mnemonics = ["fun","let"]

// all bases allowed for numbers in S2
export type prefixes = "x" | "b" | "o";

export const bases: Record<prefixes, number> = {
    "x": 16,
    "b": 2,
    "o": 8
}