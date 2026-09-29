import { TokenType, type Token, is_char, is_digit, mnemonics, bases, SymbolTokens } from "./token.js";
import * as s2t from "../utils/term.js";

export default function lexer(code: string): Token[] {
    const tokens: Token[] = [];

    // track position
    let line = 1, column = 0;
    let before_num = "";

    for(let i = 0; i < code.length; i++) {
        let c: string = code[i] as string, n = "", nn = "";

        if((i + 1) < code.length) n = code[i + 1] as string;
        if((i + 2) < code.length) nn = code[i + 2] as string;
        
        // update position
        if(c === "\n") {
            line++;
            column = 0;
            tokens.push({ type: TokenType.NL, value: "\n", pos: { line, column, offset: i, length: 1 } });
        } else {
            column++;
        }

        // check if is character
        if(is_char(c)) {
            let word = c;
            i++;
            column++;

            // snatch word
            while(i < code.length && (is_char(code[i] as string) || is_digit(code[i] as string))) {
                word += code[i];
                i++;
                column++;
            }

            // get back to lex the token after the word
            i--;
            column--;

            let type = TokenType.IDENTIFIER;

            // check if mnemonic
            if(mnemonics.includes(word)) type = TokenType.MNEMONIC;

            // push token
            tokens.push({ type, value: word, pos: { line, column, offset: i - word.length, length: word.length } });

        } else if(is_digit(c)) {
            // initialize number
            let num: string = before_num + c, suffixes: string = "";
            let base = 10;
            before_num = "";
            i++;
            column++;

            // snatch number
            while(
                i < code.length 
                && 
                (is_digit(code[i] as string) || is_char(code[i] as string) || code[i] === "." || code[i] === "_")
            ) {
                let c: string = code[i] as string;

                // if it's an allowed base prefix, set the base and skip the prefix
                if(bases[c.toLowerCase() as keyof typeof bases]) {
                    base = bases[c.toLowerCase() as keyof typeof bases];
                    i++;
                    column++;
                    continue;
                } else if(c === "_") {
                    // ignore underscores in numbers
                } else if(c === ".") {
                    // if it's a dot we need to check next character and if number already has a dot
                    if(num.includes(".")) {
                        // range
                        if(num[num.length - 1] === ".") {
                            num = num.slice(0, num.length - 1);
                            i--;
                            column--;
                            break;
                        } else {
                            // too many dots
                            console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error:${s2t.reset + s2t.fg(s2t.palette.white)} too many dots in number at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + line + s2t.reset + s2t.fg(s2t.palette.white)}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + column + s2t.reset + s2t.fg(s2t.palette.white)}`);
                        }
                    }
                } else if(is_char(c)) {
                    // if it's a character, it could be a custom suffix, an "e" or a valid hex digit if base = 16

                    // if it's not a valid hex digit, throw error
                    if(base === 16 && !(c.toLowerCase() >= "a" && c.toLowerCase() <= "f")) {
                        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error:${s2t.reset + s2t.fg(s2t.palette.white)} invalid hex digit in number at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + line + s2t.reset + s2t.fg(s2t.palette.white)}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + column + s2t.reset + s2t.fg(s2t.palette.white)}`);
                        return [];
                    } else if(base === 10 && c.toLowerCase() === "e" && (num.includes("e") || num.includes("E"))) {
                        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error:${s2t.reset + s2t.fg(s2t.palette.white)} too many "e" in number at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + line + s2t.reset + s2t.fg(s2t.palette.white)}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + column + s2t.reset + s2t.fg(s2t.palette.white)}`);
                        return [];
                    } else {
                        // custom suffix (should not add to the number itself)
                        suffixes += c;
                        i++;
                        column++;
                        continue;
                    }
                }

                num += code[i];
                i++;
                column++;
            }

            // get back to lex the token after the number
            i--;
            column--;

            let value: number = 0;

            if(base !== 10) value = parseInt(num, base);
            else {
                value = Number(num);
            }

            tokens.push({ type: TokenType.NUMBER, value, pos: { line, column, offset: i - num.length, length: num.length }, meta: { suffix: suffixes } });
        } else {

            switch(c) {
                case "/": {
                    // single line comment
                    if(n === "/") {
                        while(i < code.length && code[i] !== "\n") {
                            i++;
                            column++;
                        }

                        i++;
                        line++;
                        column = 0;
                    } else if(n === "*") {
                        // multi line comment
                        i += 2;
                        column += 2;
                        
                        while(i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
                            if(code[i] === "\n") {
                                line++;
                                column = 0;
                            } else {
                                column++;
                            }
                            i++;
                        }

                        i += 2;
                        column += 2;
                    }
                    break;
                }

                case '"': {
                    // string literal
                    let str_content = "";
                    i++;
                    column++;

                    while(i < code.length && code[i] !== '"') {
                        str_content += code[i];
                        i++;
                        column++;
                    }

                    tokens.push({ type: TokenType.STRING, value: str_content, pos: { line, column, offset: i - str_content.length - 1, length: str_content.length + 2 } });

                    break;
                }

                default: {
                    let operator_3c = nn + n + c, operator_2c = n + c, operator_1c = c;

                    let final_operator = "";
                    
                    if(operator_3c in SymbolTokens) final_operator = operator_3c;
                    else if(operator_2c in SymbolTokens) final_operator = operator_2c;
                    else if(operator_1c in SymbolTokens) final_operator = operator_1c;

                    if(final_operator.length > 0) {
                        tokens.push({ type: SymbolTokens[final_operator] as TokenType, value: final_operator, pos: { line, column, offset: i - final_operator.length + 1, length: final_operator.length } });
                        i += final_operator.length - 1;
                        column += final_operator.length - 1;
                    } else if(!/\s/.test(c)){ // check if it's not whitespace
                        console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error:${s2t.reset + s2t.fg(s2t.palette.white)} unknown character "${s2t.fg(s2t.palette.white, [s2t.style.bold]) + c + s2t.reset + s2t.fg(s2t.palette.white)}" at ${s2t.fg(s2t.palette.white, [s2t.style.bold]) + line + s2t.reset + s2t.fg(s2t.palette.white)}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + column + s2t.reset + s2t.fg(s2t.palette.white)}`);
                        return [];
                    }
                }
            }

        }
    }

    return tokens;
}