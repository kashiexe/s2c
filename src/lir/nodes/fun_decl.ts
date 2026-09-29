import Module from "../module.js";
import Function from "../function.js";
import { FunDecl } from "../../parser/node.js";
import BasicBlock from "../bb.js";
import { translate_node } from "../lir.js"
import { RetTerminator } from "../terminator.js";
import Value, { ValueType } from "../value.js";
import { ConstInstr } from "../instr.js";

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

    // default main return
    if(node.name === "main" && !(entry.terminator as RetTerminator)?.value) {
        let ret_val = new ConstInstr(0n, new Value(module.current_v++, ValueType.i64));
        entry.add(ret_val);
        entry.terminator = new RetTerminator(ret_val.result);
    }

    return func;
}