import Function from "./function.js";
import DataObj from "./data.js";
import type BasicBlock from "./bb.js";
import type Value from "./value.js";

export default class Module {
    functions: Function[];
    dataObjs: DataObj[];
    current_v: number = 0;
    file: string;
    code: string;

    constructor(file: string, code: string) {
        this.functions = [];
        this.dataObjs = [];
        this.file = file;
        this.code = code;
    }

    add(entity: Function | DataObj) {
        if(entity instanceof Function) {
            this.functions.push(entity);
        } else if(entity instanceof DataObj) {
            this.dataObjs.push(entity);
        }
    }

    to_string(): string {
        let str = "";

        for(let i = 0; i < this.dataObjs.length; i++) {
            str += this.dataObjs[i]!.to_string();
            str += "\n";
        }

        for(let i = 0; i < this.functions.length; i++) {
            str += this.functions[i]!.to_string();
            str += "\n";
        }

        return str;
    }

    find_symbol(name: string, start_bb: BasicBlock): Value | undefined {
        if(!start_bb.i_get(name)) {
            // have to check parent basic blocks
            let parent_bb = start_bb.parent;
            while(parent_bb) {
                if(parent_bb.i_get(name)) return parent_bb.i_get(name);

                parent_bb = parent_bb.parent;
            }

            return undefined;
        } else start_bb.i_get(name);
    }

    find_data(name: number): DataObj | undefined {
        for(let i = 0; i < this.dataObjs.length; i++) {
            if(this.dataObjs[i]!.id === name) return this.dataObjs[i]!;
        }

        return undefined;
    }
}