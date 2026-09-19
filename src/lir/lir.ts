import AST from "../parser/ast.js";
import { FunDecl, type Node, NodeType } from "../parser/node.js";
import Module from "./module.js";
import nodes from "./nodes/hub.js";
import Instruction from "./instr.js";
import type DataObj from "./data.js";
import type Function from "./function.js"
import BasicBlock from "./bb.js";

export function translate_node(module: Module, node: Node, extra?: any): Function | DataObj | BasicBlock | Instruction[] | null {
    switch(node.type) {
        case NodeType.FUN_DECL: {
            return nodes.fun_decl(module, node as FunDecl);
        }

        // returns list of instructions
        case NodeType.SCOPE: {
            return nodes.scope(module, node, extra);
        }

        case NodeType.VAR_DECL: {
            return nodes.var_decl(module, node, extra);
        }
    }

    return null;
}

export default function lir(ast: AST): Module {
    const module = new Module();

    for(let i = 0; i < ast.nodes.length; i++) {
        const node = ast.nodes[i] as Node;

        const entity = translate_node(module, node);
        if(entity) {
            if(!Array.isArray(entity) && !(entity instanceof BasicBlock)) module.add(entity);
            // still don't know what to do with top-level instructions and other blocks
        } else {
            return new Module();
        }
    }

    return module;
}