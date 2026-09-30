import AST from "../parser/ast.js";
import { FunDecl, type Node, NodeType, RetStmt, AssemblyInstr, NodeTypeNames } from "../parser/node.js";
import Module from "./module.js";
import nodes from "./nodes/hub.js";
import Instruction from "./instr.js";
import type DataObj from "./data.js";
import type Function from "./function.js"
import BasicBlock from "./bb.js";
import Terminator from "./terminator.js";

export function translate_node(module: Module, node: Node, extra?: any): Function | DataObj | BasicBlock | Terminator | Instruction[] | null {
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

        case NodeType.RET_STMT: {
            return nodes.retstmt(module, node as RetStmt, extra);
        }
    }

    throw new Error(`[Engine]: Unsupported node type: ${NodeTypeNames[node.type]}`);
}

export default function lir(ast: AST): Module {
    const module = new Module();

    for(let i = 0; i < ast.nodes.length; i++) {
        const node = ast.nodes[i] as Node;

        const entity = translate_node(module, node);
        if(entity) {
            if(!Array.isArray(entity) && !(entity instanceof BasicBlock) && !(entity instanceof Terminator)) module.add(entity);
            // still don't know what to do with top-level instructions and other blocks
        } else {
            return new Module();
        }
    }

    return module;
}