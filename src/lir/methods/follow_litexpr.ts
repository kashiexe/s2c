import Module from "../module.js";
import { PathElemModifierType, type LitExpr } from "../../parser/node.js";
import Instruction, { CallInstr, InstructionType } from "../instr.js";
import Value, { ValueType } from "../value.js";
import { translate_node } from "../lir.js";

/**
 * extra being the current basicblock
 * @param module 
 * @param node 
 * @param extra 
 */
export default function follow_litexpr(module: Module, node: LitExpr, extra?: any): Instruction[] | null {
    let path = node.id;

    let val: any;

    for(let i = 0; i < path.elements.length; i++) {
        let elem = path.elements[i]!;

        // check if there are modifiers
        if(elem.modifiers && elem.modifiers.length > 0) {
            // for now, there can only be one call modifier
            let mod = elem.modifiers[0]!;
            if(mod.type === PathElemModifierType.Call) {
                // create callee
                let callee = new Value(0, ValueType.func_ref);
                callee.setName(elem.identifier);

                // create call instruction
                let instructions: Instruction[] = [];
                let nodes = mod.args.map(arg => {
                    let node = translate_node(module, arg, extra);
                    if(node instanceof Instruction) {
                        instructions.push(node);
                    }
                    return extra.i_get(arg as any);
                });

                let result = new Value(module.current_v++, ValueType.i64);
                let instr = new CallInstr(callee, nodes, result);
                return [ ...instructions, instr ];
            }
        }

        // if there are no modifiers, then this is a literal variable
        val = extra.i_get(elem.identifier);
    }
    
    if(val) {
        return [ new Instruction(InstructionType.Raw, val) ];
    }

    return null;
}