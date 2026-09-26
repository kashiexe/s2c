import type { span, TokenType } from "../lexer/token.js";

export enum NodeType {
    LITERAL,
    PATH,
    LIT_EXPR,
    BINARY_EXPR,
    VAR_DECL,
    FUN_DECL,
    RET_STMT,
    SCOPE
}

export class Node {
    type: NodeType;
    pos: span;
    meta?: Record<string, any>;

    constructor(type: NodeType, pos: span) {
        this.type = type;
        this.pos = pos;
    }

    add_meta(key: string, value: any) {
        if(!this.meta) this.meta = {};
        this.meta[key] = value;
    }
}

export interface PathElem {
    identifier: string;
    pos: span;
    is_prop?: boolean;
    is_member?: boolean;
}

export class Path extends Node {
    elements: PathElem[];

    constructor(position: span, elements: PathElem[]) {
        super(NodeType.PATH, position);
        this.elements = elements;
    }
}

/**
 * represents a variable declaration (first versions of S2 handle very basic variable assignments)
 * a variable declaration must have:
 * - a name
 * - a value (which can be a literal or an expression)
 * - basic attribute (is const or not)
 * and in the future:
 * - complex attributes and traits
 * - type
 * - uninitialized (or not)
 */
export class VarDecl extends Node {
    id: string;
    value: Node | undefined;
    is_const: boolean = false;

    constructor(position: span, id: string, value?: Node, is_const: boolean = false) {
        super(NodeType.VAR_DECL, position);
        this.id = id;
        this.value = value;
        this.is_const = is_const;
    }
}

/**
 * a parameter is pretty much a variable declaration
 */
export class Param extends VarDecl {
    constructor(position: span, id: string, value?: Node, is_const: boolean = false) {
        super(position, id, value, is_const);
    }
}

/**
 * consists of any scope in S2 (function scope, block scope, etc)
 */
export class Scope extends Node {
    nodes: Node[];

    constructor(position: span, nodes: Node[]) {
        super(NodeType.SCOPE, position);
        this.nodes = nodes;
    }
}

/**
 * represents a function declaration (during the first versions of S2, declaration AND implementation will be handled together in the same node)
 * a function declaration requires:
 * - a name
 * - a list of parameters (even if empty)
 * - a body (for now, a body is required [thus implementation], however, in the future the body will not be necessary)
 */
export class FunDecl extends Node {
    name: string;
    params: Param[];
    body: Scope;
    
    constructor(position: span, name: string, params: Param[], body: Scope) {
        super(NodeType.FUN_DECL, position);
        this.name = name;
        this.params = params;
        this.body = body;
    }
}

export class RetStmt extends Node {
    value: Node | null;

    constructor(position: span, value: Node | null) {
        super(NodeType.RET_STMT, position);
        this.value = value;
    }
}

/**
 * corresponds to a literal entity in S2 (numbers, strings, arrays, maps, or anything that can be represented directly at codegen)
 */
export class Literal extends Node {
    value: string | number;

    constructor(position: span, value: string | number) {
        super(NodeType.LITERAL, position);
        this.value = value;
    }
}

/**
 * corresponds to a single IDENTIFIER chain (connected [or not] with other identifiers directly with member/property accesses and other ways)
 */
export class LitExpr extends Node {
    id: Path;

    constructor(position: span, id: Path) {
        super(NodeType.LIT_EXPR, position);
        this.id = id;
    }
}

/**
 * ANY binary expression falls onto this basic
 * there are, however, some binary expressions that will have their own node type as they require special handling
 */
export class BinaryExpr extends Node {
    lhs: Node;
    rhs: Node;
    op: TokenType;

    constructor(position: span, lhs: Node, rhs: Node, op: TokenType) {
        super(NodeType.BINARY_EXPR, position);
        this.lhs = lhs;
        this.rhs = rhs;
        this.op = op;
    }
}
