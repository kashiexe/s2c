import { Node } from "./node.js";

export default class AST {
    nodes: Node[] = [];

    constructor() {}

    push(node: Node) {
        this.nodes.push(node);
    }
}