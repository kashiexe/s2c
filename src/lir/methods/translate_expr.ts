import Module from "../module.js";
import { TokenType } from "../../lexer/token.js";
import { type Node, NodeType, Literal, BinaryExpr, LitExpr } from "../../parser/node.js";
import Instruction, { ConstInstr } from "../instr.js";
import Value, { ValueType } from "../value.js";
import * as instructions from "../instructions/hub.js"
import follow_litexpr from "./follow_litexpr.js";

export function expr_type(module: Module, node: Node, extra?: any): Instruction | null {
    let expr = node as BinaryExpr;

    switch(expr.op) {
        case TokenType.PLUS: {
            return instructions.add(module, expr, extra);
        }

        case TokenType.MINUS: {
            return instructions.sub(module, expr, extra);
        }
    }

    return null;
}

/**
 * extra must be a BasicBlock
 * @param module 
 * @param node 
 * @param extra 
 * @returns 
 */
export default function translate_expr(module: Module, node: Node, extra?: any, push?: boolean): Instruction[] | null {

    switch(node.type) {
        // number, string, ...
        case NodeType.LITERAL: {
            let lit = node as Literal;
            if(typeof lit.value === "number") {
                let val = new Value(module.current_v, ValueType.i64);
                module.current_v++;
                let const_instr = new ConstInstr(BigInt(lit.value), val);
                if(push) extra.add(const_instr);
                return [ const_instr ];
            }
        }

        // var
        case NodeType.LIT_EXPR: {
            let lit = node as LitExpr;
            let instr = follow_litexpr(module, lit, extra);
            if(push && instr) extra.bulk_add(instr);
            return instr;
        }

        // a <op> b
        case NodeType.BINARY_EXPR: {
            let instr = expr_type(module, node, extra);
            if(push && instr) extra.add(instr);
            return [ instr! ];
        }
    }

    return null;
}