import Machine from "../machine.js";
import vardecl from "./var.js";
import fundecl from "./fun.js";

const statements: { [key: string]: (machine: Machine, prior_attr: any) => any } = {
    "let": (machine: Machine, prior_attr: any) => vardecl(machine, { is_const: false, ...prior_attr }),
    "const": (machine: Machine, prior_attr: any) => vardecl(machine, { is_const: true, ...prior_attr }),
    "fun": (machine: Machine, prior_attr: any) => fundecl(machine, { ...prior_attr }),
};

export default statements;