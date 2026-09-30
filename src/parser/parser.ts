/*
    s2c - Parser entry point

    Copyright (c) 2026 s2c
    SPDX-License-Identifier: LGPL-3.0-only

    This file is part of the s2c Codebase.
    See the LICENSE file in the root directory for further details.
*/
import { type Token, TokenType } from "../lexer/token.js";
import AST from "./ast.js";
import Machine from "./machine.js";
import { Node, NodeType, VarDecl } from "./node.js";
import statements from "./statements/hub.js";
import * as s2t from "../utils/term.js";
import asm_instr from "./statements/asm_instr.js";

/**
 * reads a single token and parses it based on it's type (transfering control to a sub-parser if possible)
 * @param token 
 * @param machine 
 * @returns the parsed node, or null if parsing failed
 */
export function parse_token(token: Token, machine: Machine): Node | null {
    // check token type and transfer control to sub-parser if possible
    switch(token.type) {
        case TokenType.MNEMONIC: {
            if(token.value in statements) {
                const stmt_node = (statements[token.value]!)(machine, {});

                return stmt_node;
            } else {
                console.error(`${s2t.fg(s2t.palette.red, [s2t.style.bold])}Error:${s2t.reset + s2t.fg(s2t.palette.white)} keyword "${s2t.fg(s2t.palette.white, [s2t.style.bold]) + token.value + s2t.reset + s2t.fg(s2t.palette.white)}" has not yet been implemented. (${s2t.fg(s2t.palette.white, [s2t.style.bold]) + token.pos.line + s2t.reset + s2t.fg(s2t.palette.white)}:${s2t.fg(s2t.palette.white, [s2t.style.bold]) + token.pos.column + s2t.reset + s2t.fg(s2t.palette.white)})`);
            }
            break;
        }

        // assembly instruction (most likely)
        case TokenType.AT: {
            machine.advance();
            return asm_instr(machine);
        }
    }

    // fallback
    return null;
}

/**
 * parses a provided list of S2 tokens into an AST (requires lexer to be run first)
 * ```ts
 * const code: string = fs.readFileSync("./index.s2", "utf-8");
 * const tokens: Token[] = lexer(code);
 * const ast: AST = parse(tokens, code);
 * ```
 * @param {Token[]} tokens the list of tokens to parse
 * @param {string} code the original source code (for diagnostics)
 * @param {string} file the original source file (for diagnostics)
 * @returns {AST} the parsed AST
 */
export function parse(tokens: Token[], code: string, file: string): AST {
    // initialize AST and machine
    const ast = new AST();
    const machine = new Machine(ast, tokens, code, file);

    // for each token (until EOF), parse and add to AST
    while(machine.peek() !== null) {
        // if not EOF, there is a token, so we can assume it's not undefined
        const token = machine.peek();

        const node = parse_token(token!, machine);

        if(node) {
            ast.push(node);
        } 

        if(machine.error) return new AST(); // return empty AST if error

        machine.advance();
    }

    return ast;
}