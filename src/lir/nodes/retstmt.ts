import type { RetStmt } from "../../parser/node.js";
import translate_expr from "../methods/translate_expr.js";
import Module from "../module.js";
import Terminator, { RetTerminator } from "../terminator.js";

export default function retstmt(module: Module, node: RetStmt, extra?: any): Terminator | null {
    let expression = node.value;

    if(expression) {
        const value_instructions = translate_expr(module, expression, extra);
        if(value_instructions) {
            extra.bulk_add(value_instructions);
            return new RetTerminator(value_instructions[value_instructions.length - 1]!.result!);
        } else {
            return new RetTerminator();
        }
    }

    return new RetTerminator();
}