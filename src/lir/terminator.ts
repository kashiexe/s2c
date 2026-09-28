import Value, { ValueTypeToString } from "./value.js";
import BasicBlock from "./bb.js";

export enum TerminatorType {
    RET,
    JMP,
    BR
}

/**
 * terminators are instructions that terminate a basic block and transfer control to another basic block
 */
export default class Terminator {
    type: TerminatorType;
    
    constructor(type: TerminatorType) {
        this.type = type;
    }

    to_string(): string {
        return "";
    }
}

/**
 * return terminator
 * passes control to the caller
 */
export class RetTerminator extends Terminator {
    value?: Value | undefined;

    constructor(value?: Value) {
        super(TerminatorType.RET);
        this.value = value;
    }

    override to_string(): string {
        let str = "";
        if(this.value) str += `RET %${this.value.id}<${ValueTypeToString[this.value.type]}>`;
        else str += "RET";
        return str;
    }
}

/**
 * jump terminator
 * passes control to another basic block
 */
export class JmpTerminator extends Terminator {
    target: BasicBlock;

    constructor(target: BasicBlock) {
        super(TerminatorType.JMP);
        this.target = target;
    }

    override to_string(): string {
        let str = "";
        str += `JMP bb${this.target.id} (${this.target.name})`;
        return str;
    }
}

/**
 * branch terminator
 * passes control based on a condition to one of two basic blocks
 */
export class BrTerminator extends Terminator {
    condition: Value;
    thenTarget: BasicBlock;
    elseTarget: BasicBlock;
    
    constructor(condition: Value, thenTarget: BasicBlock, elseTarget: BasicBlock) {
        super(TerminatorType.BR);
        this.condition = condition;
        this.thenTarget = thenTarget;
        this.elseTarget = elseTarget;
    }

    override to_string(): string {
        let str = "";
        str += `BR %${this.condition.id}<${ValueTypeToString[this.condition.type]}> bb${this.thenTarget.id} (${this.thenTarget.name}) bb${this.elseTarget.id} (${this.elseTarget.name})`;
        return str;
    }
}