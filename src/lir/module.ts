import Function from "./function.js";
import DataObj from "./data.js";

export default class Module {
    functions: Function[];
    dataObjs: DataObj[];
    current_v: number = 0;

    constructor() {
        this.functions = [];
        this.dataObjs = [];
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

        for(let i = 0; i < this.functions.length; i++) {
            str += this.functions[i]!.to_string();
            str += "\n";
        }

        return str;
    }
}