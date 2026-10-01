import Instruction, { InstructionType } from "./instr.js";
import Terminator, { TerminatorType } from "./terminator.js";
import type Value from "./value.js";

/**
 * basic blocks are a sequence of instructions in which control enters at beginning and leaves at the end
 * (may seem obvious but this kind of concept is very important for optimization and codegen)
 */
export default class BasicBlock {
    id: number;
    name: string;
    instructions: Instruction[];
    terminator: Terminator;
    internal: Map<string, Value>;
    parent: BasicBlock | undefined;

    constructor(id: number, name: string = "") {
        this.id = id;
        this.name = name;
        this.instructions = [];
        this.terminator = new Terminator(TerminatorType.RET);
        this.internal = new Map();
    }

    /**
     * if entity is a terminator, it will simply change the current terminator to the new one
     * @param entity 
     */
    add(entity: Instruction | Terminator) {
        if(entity instanceof Instruction) {
            this.instructions.push(entity);
        } else if(entity instanceof Terminator) {
            this.terminator = entity;
        }
    }

    /**
     * as each basic block can only contain 1 terminator, bulk add only allows multiple instructions
     * @param instructions 
     */
    bulk_add(instructions: Instruction[]) {
        for(let i = 0; i < instructions.length; i++) {
            this.add(instructions[i]!);
        }
    }

    /**
     * add an internal variable
     * @param name 
     * @param val 
     */
    i_add(name: string, val: Value) {
        this.internal.set(name, val);
    }

    i_get(name: string): Value | undefined {
        return this.internal.get(name);
    }

    /**
     * with_name to false disables the "bb{id} ({name}):" line at the beginning of the basic block
     * @param ident 
     * @param with_name 
     * @returns 
     */
    to_string(ident: number = 1, with_name: boolean = true): string {
        let str = "";
        if(with_name) str += `${"\t".repeat(ident)}bb${this.id} (${this.name}):\n`;

        for(let i = 0; i < this.instructions.length; i++) {
            let instr = this.instructions[i]!;

            if(instr.type === InstructionType.Raw) {
                continue;
            }

            str += `${"\t".repeat(ident+1)}${instr.to_string()}\n`;
        }

        str += `${"\t".repeat(ident+1)}${this.terminator.to_string()}\n`;

        return str;
    }
}