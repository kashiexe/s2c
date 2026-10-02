import { Operand, OperandType } from "../operand.js";
import { modrm_sib_ext } from "../modrm_sib.js";
import rex, { W,R,X,B } from "../rex.js";
import type { reg } from "../regs.js";
import type { mem } from "../mem.js";

export default function inc(op: Operand): Uint8Array {
    let bytes: number[] = [];

    if(op.type === OperandType.Reg) {
        // rex byte
        let reg_op = op as reg;
        if(op.bits === 64) {
            let rex_byte = rex(W);
            if(reg_op.name >= 8) {
                rex_byte |= B;
            }
            bytes.push(rex_byte);
        }
    
        // opcode
        if(op.bits > 8) bytes.push(0xFF);
        else bytes.push(0xFE);

        // modrm
        let modrm_byte = modrm_sib_ext(0, reg_op);
        bytes.push(...modrm_byte);

        return new Uint8Array(bytes);
    } else if(op.type === OperandType.Mem) {
        let mem_op = op as mem;
        
        // rex byte
        if(op.bits === 64) {
            let rex_byte = rex(W);
            if(mem_op.base && mem_op.base.name >= 8) {
                rex_byte |= B;
            }
            if(mem_op.index && mem_op.index.name >= 8) {
                rex_byte |= X;
            }
            bytes.push(rex_byte);
        }

        // opcode
        if(op.bits > 8) bytes.push(0xFF);
        else bytes.push(0xFE);

        // modrm + sib + displacement
        let modrm_bytes = modrm_sib_ext(0, mem_op);
        bytes.push(...modrm_bytes);

        return new Uint8Array(bytes);
    }


    throw new Error(`[Engine]: inc instruction not yet implemented for type ${op.type}`);

}