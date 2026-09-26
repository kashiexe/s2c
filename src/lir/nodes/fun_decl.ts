import Module from "../module.js";
import Function from "../function.js";
import { FunDecl } from "../../parser/node.js";
import BasicBlock from "../bb.js";
import { translate_node } from "../lir.js"

export default function fun_decl(module: Module, node: FunDecl): Function | null {
    const func = new Function(node.name);

    let body = node.body;
    // entry is automatically the body (at least initially)
    // create a BB for the body
    let entry = new BasicBlock(0, "entry"); // entries are ALWAYS id=0

    // parse instructions
    const basic_block = translate_node(module, body, func);
    if(basic_block) {
        entry = basic_block as BasicBlock;
        entry.id = 0;
        entry.name = "entry";
    } else {
        return null;
    }

    func.set(entry);

    return func;
}