import Module from "../module.js";
import { BinaryExpr } from "../../parser/node.js";
import { SubInstr } from "../instr.js";
import translate_expr from "../methods/translate_expr.js";
import Value, { ValueType }  from "../value.js";

/**
 * extra must be the current BasicBlock scope
 * @param module 
 * @param node 
 * @param extra 
 * @returns 
 */
export default function sub(module: Module, node: BinaryExpr, extra?: any): SubInstr | null {
    let lhs = translate_expr(module, node.lhs, extra, true);
    let rhs = translate_expr(module, node.rhs, extra, true);
    let result = new Value(module.current_v, ValueType.i64);

    module.current_v++;

    if(!lhs || !rhs) {
        return null;
    } else {
        return new SubInstr(lhs[lhs.length - 1]!.result!, rhs[rhs.length - 1]!.result!, result);
    }
}