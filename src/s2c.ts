import compile from "./utils/driver/compile.js";
import help from "./utils/driver/help.js";
import process_args from "./utils/driver/process_args.js";
import __version from "./utils/driver/version.js";
import { fg, palette, reset, style } from "./utils/term.js";

export const version = "0.0.1";

export const commands: Record<string, Function> = {
    "compile": compile,
    "help": help,
    "version": __version
};

export default function s2c() {
    const cmd = process_args();

    let func = commands[cmd.name];
    if(func) {
        let code = func(cmd);
        process.exit(code ?? 0);
    } else {
        if(cmd.name.length > 0) console.error(`${fg(palette.red, [style.bold])}[s2c] [CLI]: ${fg(palette.white)}Unimplemented command "${fg(palette.red) + cmd.name + fg(palette.white)}"${reset}`);
        else {
            console.error(`${fg(palette.red, [style.bold])}[s2c] [CLI]: ${fg(palette.white)}No command was provided! (type "s2c help" to see available commands)${reset}`);
        }

        process.exit(1);
    }
}