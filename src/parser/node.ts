import type { span } from "../lexer/token.js";

export enum NodeType {
    VAR_DECL,
    FUN_DECL
}

export class Node {
    type: NodeType;
    pos: span;

    constructor(type: NodeType, pos: span) {
        this.type = type;
        this.pos = pos;
    }
}

export class VarDecl extends Node {


    constructor(position: span) {
        super(NodeType.VAR_DECL, position);
    }
}

export class FunDecl extends Node {
    
    constructor(position: span) {
        super(NodeType.FUN_DECL, position);
    }
}