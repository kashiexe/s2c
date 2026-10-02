import Module from "../../module.js";
import Value, { ValueType } from "../../value.js";
import Instruction, { CallInstr } from "../../instr.js";
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
                // if it wasn't set yet, we first check if this val is even real and if it is and it's type string, we simply call "s2rt#strlen" and during linking it will insert the function and relocate the offset
                if(current_val.type === ValueType.string) {
                    let callee = new Value(0, ValueType.func_ref);
                    callee.setName("s2rt#strlen");
                    let res = new Value(module.current_v++, ValueType.u64);
                    return [new CallInstr(callee, [new Value(current_val.id, ValueType.string)], res)];
                }

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