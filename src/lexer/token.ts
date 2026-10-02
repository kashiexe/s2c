
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
    COMMA,          // ,
    DOT,            // . (property access)
    MEMBER,         // :: (member access)
    ARROW,          // -> (used for function return types)
    LAMBDA,         // => (used for lambda functions)
    AT,             // @ (used mainly for assembly instructions or for @user/package imports) [although it will be able to be used for operator overloading in the future]
    COLON
}

export const Precedence: Record<number, number> = {
    [TokenType.MUL]: 17,
    [TokenType.DIV]: 17,
    [TokenType.PLUS]: 16,
    [TokenType.MINUS]: 16,
    [TokenType.ASSIGN]: 1
}

export function get_p(num: number): number {
    return Precedence[num] ?? 0;
}

export const right_associative: number[] = [
    TokenType.ASSIGN
];

export function is_right_associative(num: number): boolean {
    return right_associative.includes(num);
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
    "}": TokenType.CLOSE_BRACE,
    ",": TokenType.COMMA,
    ".": TokenType.DOT,
    "::": TokenType.MEMBER,
    "->": TokenType.ARROW,
    "=>": TokenType.LAMBDA,
    "@": TokenType.AT,
    ":": TokenType.COLON
}

export interface span {
    line: number;
    column: number;
    offset: number;
    length: number;
}

/**
 * simple utility to reduce verbose
 * @returns 
 */
export function def_span(): span {
    return { line: 0, column: 0, offset: 0, length: 0 };
}

/**
 * utility to merge spans
 */
export function merge(pos1: span, pos2: span): span {
    return {
        line: pos1.line,
        column: pos1.column,
        offset: pos1.offset,
        length: pos2.offset + pos2.length - pos1.offset
    }
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
export const mnemonics = ["fun","let","const","return"]

// all bases allowed for numbers in S2
export type prefixes = "x" | "b" | "o";

export const bases: Record<prefixes, number> = {
    "x": 16,
    "b": 2,
    "o": 8
}