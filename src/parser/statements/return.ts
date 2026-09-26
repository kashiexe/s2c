import Machine from "../machine.js";
import { RetStmt } from "../node.js";
import parse_expr from "../methods/expr.js";
import * as s2t from "../../utils/term.js";
import { merge } from "../../lexer/token.js";

export default function ret(machine: Machine, prior_attr: any): RetStmt | null {
    let pos = machine.peek()!.pos;
    machine.advance();

    let expr = parse_expr(machine, 0);
    
    return new RetStmt(
        merge(pos, machine.peek(-1)?.pos ?? pos),
        expr
    );
}