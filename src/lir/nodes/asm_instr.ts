import Module from "../module.js";
import { AssemblyInstr, Literal, LitExpr, type Node, NodeType } from "../../parser/node.js";
import Instruction, { AsmInstr, AsmReg } from "../instr.js";
import Value, { ValueType, ValueTypeToString } from "../value.js";
import { code_snippet, e_codes, error } from "../../utils/term.js";
import follow_litexpr from "../methods/follow_litexpr.js";

export default function translate_asm_instr(module: Module, node: AssemblyInstr, extra?: any): Instruction[] | null {
    let instr_name = node.instr.toLowerCase();
    let asm_operands: (AsmReg | Value | number)[] = [];

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
                // follow literal expression which returns a list of instructions
                let instrs = follow_litexpr(module, operand as LitExpr, extra);
                if(!instrs || instrs.length === 0) {
                    error(e_codes.UNDEFINED_SYMBOL, `Undefined variable "${first_name}"`, [code_snippet(module.file, module.code, operand.pos, `This variable was not found in the current scope.`)]);
                    return null;
                } 

                // get value from last instruction
                let instr = instrs[instrs.length - 1]!;
                let val = instr.result!;

                // check if the value is raw (in this instance, we can interact as it has the number necessary for the operands aka comptime)
                if(val.type === ValueType.RAW_NO_INTERACT) {
                    asm_operands.push(Number(val.value));
                } else {
                    asm_operands.push(val!);
                }
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