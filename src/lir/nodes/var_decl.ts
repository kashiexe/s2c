import Module from "../module.js"
import { type Node, type VarDecl } from "../../parser/node.js"
import Instruction from "../instr.js"
import translate_expr from "../methods/translate_expr.js"

export default function var_decl(module: Module, node: Node, extra?: any): Instruction[] | null {
    // var_decl identifier will be the last instruction in the list of instructions as everything else needs to be evaluated first
    const instructions: Instruction[] = [];

    const vardecl = node as VarDecl;
    let value = vardecl.value!;

    const value_instructions = translate_expr(module, value, extra);
    if(value_instructions) {
        instructions.push(...value_instructions);
    } else {
        return null;
    }

    extra.i_add(vardecl.id, instructions[instructions.length - 1]!.result!);

    return instructions;
}