import fun_decl from "./fun_decl.js";
import scope from "./scope.js"
import var_decl from "./var_decl.js"
import retstmt from "./retstmt.js"
import asm_instr from "./asm_instr.js"

const nodes = {
    fun_decl,
    scope,
    var_decl,
    retstmt,
    asm_instr
}

export default nodes;