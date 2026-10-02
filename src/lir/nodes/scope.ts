import Module from "../module.js";
import { type Node, Scope } from "../../parser/node.js";
import BasicBlock from "../bb.js";
import { translate_node } from "../lir.js";
import Terminator from "../terminator.js";

export default function scope(module: Module, node: Node, extra?: any): BasicBlock | null {
    let func = Object.hasOwn(extra, "func") ? extra.func! : extra;
    let block = Object.hasOwn(extra, "entry") ? extra.entry! : undefined;
    const basic_block = new BasicBlock(0, "scope");
    if(block) basic_block.merge_internals(block);

    let scope = node as Scope;

    for(let i = 0; i < scope.nodes.length; i++) {
        let entity = translate_node(module, scope.nodes[i] as Node, basic_block);
        if(entity) {
            if(Array.isArray(entity)) { // Instruction[]
                basic_block.bulk_add(entity);
            } else if(entity instanceof BasicBlock) { // add to extra (should be a Function)
                func.add(entity);
            } else if(entity instanceof Terminator) {
                basic_block.terminator = entity;
            }
        } else {
            return null;
        }
    }

    return basic_block;
}