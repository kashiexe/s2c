import { type Token, TokenType } from "../lexer/token.js";
import AST from "./ast.js";
import Machine from "./machine.js";
import { Node, NodeType, VarDecl } from "./node.js";
import statements from "./statements/hub.js";
import * as s2t from "../utils/term.js";

/**
 * 
 * @param token 
 * @param machine 
 * @returns the parsed node, or null if parsing failed
 */
export function parse_token(token: Token, machine: Machine): Node | null {

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
    }

    return null;
}

export function parse(tokens: Token[]): AST {
    const ast = new AST();
    const machine = new Machine(ast, tokens);

    while(machine.peek() !== null) {
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