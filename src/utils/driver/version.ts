import { type cmd } from "./process_args.js";
import { version } from "../../s2c.js";
import { fg, palette, style, reset } from "../term.js";

export default function __version(command: cmd) {
    console.log(
        `${fg(palette.blue, [style.bold])}s2c ${fg(palette.white)}ー The official compiler for the S2 language. (${fg(palette.blue)}${version}${fg(palette.white)})${reset}
${fg(palette.white, [style.bold])}└─ Made in ${fg(palette.blue)}TypeScript v${process.versions.node}${fg(palette.white)} by ${fg(palette.green)}Kashi${fg(palette.white)}.`);
}