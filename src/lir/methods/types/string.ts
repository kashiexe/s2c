import Module from "../../module.js";
import Value, { ValueType } from "../../value.js";
import Instruction from "../../instr.js";
import type { PathElem } from "../../../parser/node.js";
import { code_snippet, e_codes, error } from "../../../utils/term.js";
import { ValueTypeToString } from "../../value.js";

/**
 * strings hold some properties and this function is used to access them (compile time, for the most part)
 * @param module 
 * @param current_val 
 * @param prop 
 * @returns 
 */
export default function property(module: Module, current_val: Value, prop: PathElem): Instruction[] | Value | number | null {
    let name = prop.identifier;

    switch(name) {
        /**
         * "hi".length = 3 (hi + null character)
         */
        case "length": {
            let str_obj = module.find_data(current_val.id);
            if(!str_obj) {
                error(e_codes.UNDEFINED_SYMBOL, `Undefined string data object "${current_val.name ?? "anon_string"}"`, [code_snippet(module.file, module.code, prop.pos, `This string variable was not found in the module's data objects.`)]);
                return null;
            } else {
                return str_obj.data.length;
            }
        }

        /**
         * "hi".charAt(0) = 'h'
         */
        case "charAt": {
            console.log("not yet implemented: charAt");
            return null;
        }

        default: {
            error(e_codes.UNDEFINED_SYMBOL, `Undefined property "${name}" for type: ${ValueTypeToString[current_val.type]}`, [code_snippet(module.file, module.code, prop.pos, `The value is of type: ${ValueTypeToString[current_val.type]}`)]);
            return null;
        }
    }
}