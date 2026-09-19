import BasicBlock from "./bb.js";
import StackSlot from "./ss.js";

export default class Function {
    name: string;
    blocks: BasicBlock[];
    entry: BasicBlock;
    stack: StackSlot[];

    constructor(name: string, entry?: BasicBlock) {
        this.name = name;
        this.blocks = [];
        this.entry = entry ?? new BasicBlock(0, "entry");
        this.stack = [];
    }

    /**
     * utility to re-set the entry block of the function
     * @param entry 
     */
    set(entry: BasicBlock) {
        this.entry = entry;
    }

    add(entity: BasicBlock | StackSlot) {
        if(entity instanceof BasicBlock) {
            this.blocks.push(entity);
        } else if(entity instanceof StackSlot) {
            this.stack.push(entity);
        }
    }

    to_string(): string {
        let str = "";
        str += `function ${this.name} {\n`;
        str += `\tentry:\n`;
        str += this.entry.to_string(1, false);
        for(let i = 0; i < this.blocks.length; i++) {
            str += this.blocks[i]!.to_string(1);
        }
        str += "}\n";
        return str;
    }
}