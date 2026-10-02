import Module from "../module.js";
import { TokenType } from "../../lexer/token.js";
import { type Node, NodeType, Literal, BinaryExpr, LitExpr } from "../../parser/node.js";
import Instruction, { ConstInstr, StringInstr } from "../instr.js";
import Value, { ValueType } from "../value.js";
import * as instructions from "../instructions/hub.js"
import follow_litexpr from "./follow_litexpr.js";
import DataObj, { DataType } from "../data.js";

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
export default function translate_expr(module: Module, node: Node, extra?: any, push: boolean = false): Instruction[] | null {

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
            } else if(typeof lit.value === "string") {
                // create a value and a string instruction with it
                let val = new Value(module.current_v, ValueType.string);
                module.current_v++;
                let const_instr = new StringInstr(val);
                if(push) extra.add(const_instr);

                // add the string to the module's data section
                let str_data = new Uint8Array(Buffer.from(lit.value + "\0", "utf-8"));
                let data_obj = new DataObj(val.id, DataType.String, str_data, 0);
                module.add(data_obj);

                // return instruction 
                return [ const_instr ];
            }

            throw new Error(`[Engine]: Unsupported literal type: ${typeof lit.value}`);
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

        default: {
            throw new Error(`[Engine]: Unsupported node type: ${node.type}`);
        }
    }
}