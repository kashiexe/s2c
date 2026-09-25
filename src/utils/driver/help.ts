import { type cmd } from "./process_args.js";
import * as s2t from "../term.js";
import { version } from "../../s2c.js";

export default function help(command: cmd) {
    // interactive help
    const interact = command.flags["interactive"] ?? false;

    let help_msg = `${s2t.fg(s2t.palette.blue, [s2t.style.bold])}s2c ${s2t.fg(s2t.palette.white)}ー The official compiler for the S2 language. (${s2t.fg(s2t.palette.blue)}${version}${s2t.fg(s2t.palette.white)})

${s2t.fg(s2t.palette.blue, [s2t.style.underline])}USAGE${s2t.reset + s2t.fg(s2t.palette.white)}
  └─ s2c [command] [options] <arguments>

${s2t.fg(s2t.palette.blue, [s2t.style.bold, s2t.style.underline])}CORE COMMANDS${s2t.reset + s2t.fg(s2t.palette.white)}
  ├─ ${s2t.fg(s2t.palette.white, [s2t.style.bold])}compile${s2t.reset + s2t.fg(s2t.palette.white)} \tTranslates S2 source code into an executable binary.
  │  ${s2t.fg(s2t.palette.yellow, [s2t.style.bold])}[! NOTE !] ${s2t.reset + s2t.fg(s2t.palette.white)}it's important to know that the compiler can only (currently) handle a single file at a time and the output will be in x86_64 linux with sysvamd ABI format.
  │
  ├─ ${s2t.fg(s2t.palette.white, [s2t.style.bold])}help${s2t.reset + s2t.fg(s2t.palette.white)} \tDisplays this help message.
  └─ ${s2t.fg(s2t.palette.white, [s2t.style.bold])}version${s2t.reset + s2t.fg(s2t.palette.white)} \tDisplays the current version of the compiler.

${s2t.fg(s2t.palette.blue, [s2t.style.bold, s2t.style.underline])}DIAGNOSTICS & TOOLING${s2t.reset + s2t.fg(s2t.palette.white)}
  ├─ ${s2t.fg(s2t.palette.white, [s2t.style.bold])}fmt${s2t.reset + s2t.fg(s2t.palette.white)} \tFormats the S2 source code (according to standard style guidelines).
  │  ${s2t.fg(s2t.palette.yellow, [s2t.style.bold])}[! NOTE !] ${s2t.reset + s2t.fg(s2t.palette.white)}this command is not yet implemented.
  │
  ├─ ${s2t.fg(s2t.palette.white, [s2t.style.bold])}explain${s2t.reset + s2t.fg(s2t.palette.white)} \tExplains the meaning of a specific error or concept.
  └─ ${s2t.fg(s2t.palette.yellow, [s2t.style.bold])}[! NOTE !] ${s2t.reset + s2t.fg(s2t.palette.white)}this command is not yet implemented.

${s2t.fg(s2t.palette.blue, [s2t.style.bold, s2t.style.underline])}MORE INFORMATION${s2t.reset + s2t.fg(s2t.palette.white)}
  ├─ website: ${s2t.fg(s2t.palette.blue, [s2t.style.bold])}s2-lang \t\t\t${s2t.fg(s2t.palette.yellow)}[not created yet]${s2t.reset + s2t.fg(s2t.palette.white)}
  ├─ community: ${s2t.fg(s2t.palette.blue, [s2t.style.bold])}s2-lang/discord \t${s2t.fg(s2t.palette.yellow)}[not created yet]${s2t.reset + s2t.fg(s2t.palette.white)}
  └─ documentation: ${s2t.fg(s2t.palette.blue, [s2t.style.bold])}docs.s2-lang \t${s2t.fg(s2t.palette.yellow)}[not created yet]${s2t.reset + s2t.fg(s2t.palette.white)}
`;

    if(interact) {
        console.log(

        );
    } else {
        console.log(help_msg);
    }
}