import { AssemblyInstr } from "../node.js";
import Machine from "../machine.js";
import { merge, TokenType } from "../../lexer/token.js";
import { code_snippet, e_codes, error } from "../../utils/term.js";
import parse_expr from "../methods/expr.js";

/**
 * @ must be consumed prior to calling this sub-parser
 * @param machine 
 * @returns 
 */
export default function asm_instr(machine: Machine): AssemblyInstr | null {
    // first token should be an identifier
    const token = machine.peek();

    // expect name of instruction
    if(token?.type !== TokenType.IDENTIFIER) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected instruction name after "@", but got "${token?.value ?? "EOF"}" instead.`, [code_snippet(machine.file, machine.code, token?.pos ?? (machine.peek(-1)!.pos), `unexpected instruction name`)]);
        return null;
    }

    // assert current token as instruction's name which is a string
    let instr = token.value as string;

    // expect operands
    let operands = [];

    machine.advance();
    let open_paren = machine.peek();

    if(open_paren?.type !== TokenType.OPEN_PAREN) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected "(" to construct operands for instruction "${instr}", but got "${open_paren?.value ?? "EOF"}" instead.`, [code_snippet(machine.file, machine.code, open_paren?.pos ?? (machine.peek(-1)!.pos), `unexpected "${open_paren?.value ?? "EOF"}"`)]);
        return null;
    }

    // collect operands
    machine.advance();
    let current = machine.peek();
    let valid = true;

    while(machine.offset_inb() && current?.type !== TokenType.CLOSE_PAREN) {
        // parse expression for operand
        let expr = parse_expr(machine, 0);
        
        // check if it's valid to push
        if(expr) {
            if(!valid) {
                error(e_codes.UNEXPECTED_TOKEN, `Expected "," to separate operands for instruction "${instr}", but got "${current?.value ?? "EOF"}" instead.`, [code_snippet(machine.file, machine.code, expr.pos, `unexpected "${current?.value ?? "EOF"}"`)]);
                return null;
            }

            operands.push(expr);
        } else {
            return null;
        }

        // check for comma
        current = machine.peek();
        if(current?.type === TokenType.COMMA) {
            machine.advance();
            current = machine.peek();
        } else {
            valid = false;
        }
    }

    // check if asm instruction closed
    if(current?.type !== TokenType.CLOSE_PAREN) {
        error(e_codes.UNEXPECTED_TOKEN, `Expected ")" to close the operand list for instruction "${instr}", but got "${current?.value ?? "EOF"}" instead.`, [code_snippet(machine.file, machine.code, current?.pos ?? (machine.peek(-1))!.pos, `unexpected "${current?.value ?? "EOF"}"`)]);
        return null;
    }

    // if everything was fine with the assembly instruction, generate node and return
    let asm_instr = new AssemblyInstr(merge(token!.pos, current!.pos), instr, operands);

    return asm_instr;
}