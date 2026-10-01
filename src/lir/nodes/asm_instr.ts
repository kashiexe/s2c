import Module from "../module.js";
import { AssemblyInstr, Literal, LitExpr, type Node, NodeType } from "../../parser/node.js";
import Instruction, { AsmInstr, AsmReg } from "../instr.js";
import Value, { ValueType, ValueTypeToString } from "../value.js";
import { code_snippet, e_codes, error } from "../../utils/term.js";

export default function translate_asm_instr(module: Module, node: AssemblyInstr, extra?: any): Instruction[] | null {
    let instr_name = node.instr.toLowerCase();
    let asm_operands = [];

    for(let i = 0; i < node.operands.length; i++) {
        let operand = node.operands[i]!;

        // register or value
        if(operand.type === NodeType.LIT_EXPR) {
            // register if variable not found
            let path = (operand as LitExpr).id;
            let first_name = path.elements[0]!.identifier;
            let var_value = extra.i_get(first_name) as (Value | undefined);

            if(!var_value) {
                asm_operands.push(new AsmReg(first_name));
            } else {
                // check var value type
                if(path.elements.length > 1) {
                    switch(var_value.type) {
                        case ValueType.string: {
                            let param = path.elements[1]!;

                            if(param.identifier === "length") {
                                let str_obj = module.find_data(var_value.id);
                                if(!str_obj) {
                                    error(e_codes.UNDEFINED_SYMBOL, `Undefined string data object "${var_value.name ?? "anon_string"}"`, [code_snippet(module.file, module.code, operand.pos, `This string variable was not found in the module's data objects.`)]);
                                    return null;
                                } else {
                                    asm_operands.push(str_obj.data.length);
                                }
                            }
                            break;
                        }

                        default: {
                            error(e_codes.MISUSE_OF_TYPE, `Cannot access property of non-object value type: ${ValueTypeToString[var_value.type]}`, [code_snippet(module.file, module.code, operand.pos, `The value is of type: ${ValueTypeToString[var_value.type]}`)]);
                            return null;
                        }
                    }

                    continue;
                }
                
                // else we just push the value to the operands list
                asm_operands.push(extra.i_get(first_name));
            }
        } else if(operand.type === NodeType.LITERAL) {
            let literal_value = (operand as Literal).value;

            if(typeof literal_value === "number") {
                asm_operands.push(literal_value);
                continue;
            }

            throw new Error(`[Engine]: Unsupported literal type for assembly instruction operand: ${typeof literal_value}`);
        }
    }

    // create AsmInstr and return it
    let asm_instr = new AsmInstr(instr_name, asm_operands);
    return [ asm_instr ];
}