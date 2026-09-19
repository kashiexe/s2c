import Module from "../module.js";
import { type LitExpr } from "../../parser/node.js";
import Instruction, { InstructionType } from "../instr.js";

/**
 * extra being the current basicblock
 * @param module 
 * @param node 
 * @param extra 
 */
export default function follow_litexpr(module: Module, node: LitExpr, extra?: any): Instruction[] | null {
    let path = node.id;

    for(let i = 0; i < path.elements.length; i++) {
        let elem = path.elements[i]!;

        // for now, assume there are ONLY identifier elements
        let val = extra.i_get(elem.identifier);
        if(val) {
            return [ new Instruction(InstructionType.Raw, val) ];
        }
    }

    return null;
}