/*

*/
export const commands_list = ["help", "compile", "version", "fmt", "explain"];

export interface flag {
    name: string;
    value: string | number | boolean;
}

export interface cmd {
    name: string;
    value: string;
    flags: Record<string, string | number | boolean>;
}

/**
 * parses a flag depending on name (--flag=value -> flag [name] value [value]) or name + value (--flag value -> flag [name] value [value])
 * @param name first argument of the flag (the name of the flag/flag+value (if -- = syntax))
 * @param value second argument of the flag (for value)
 * @param is_short if only one dash is used (short flag) or two dashes (long flag)
 * @returns 
 */
export function parse_flag(name: string, value: string | undefined, is_short: boolean): flag[] | flag {
    let parts = name.split("=");
    let true_name = parts[0]!;
    let true_value = parts[1] ?? value ?? "true"; // there should always be a value
    let parsed_value: string | number | boolean = true_value;

    // parse value
    try {
        if(!isNaN(Number(true_value))) {
            parsed_value = Number(true_value);
        } else if(true_value.toLowerCase() === "true") {
            parsed_value = true;
        } else if(true_value.toLowerCase() === "false") {
            parsed_value = false;
        }
    } catch(e) {}

    // check if short
    if(is_short) {
        // generate multiple flags for each character of name
        return true_name.split("").map(c => ({ name: c, value: parsed_value }));
    } else {
        // long flag (a single flag)
        return { name: true_name, value: parsed_value };
    }
}

export default function process_args(): cmd {
    const args = process.argv.slice(2);
    const command: cmd = {
        name: "",
        value: "",
        flags: {},
    };

    // if no arguments, default to help command
    if(args.length === 0) {
        command.name = "help";
        command.value = "";
        return command;
    }

    for(let i = 0; i < args.length; i++) {
        const arg = args[i]!;

        // flag
        if(arg.startsWith("-")) {
            // split flag into different parts
            const is_short = arg.at(1) !== "-";
            const flag_name = is_short ? arg.slice(1) : arg.slice(2);
            const flag_value = args[i+1] && !args[i+1]!.startsWith("-") ? args[i+1]! : undefined;

            // parse the flag
            const flag = parse_flag(flag_name, flag_value, is_short);
            if(flag) {
                if(Array.isArray(flag)) {
                    flag.forEach(f => { command.flags[f.name] = f.value; });
                } else {
                    command.flags[flag.name] = flag.value;
                }
                if(flag_value) { i++; }
            } // ignore if flag was not recognized
        } else {
            // raw argument (could be command or value)
            if(command.name.length === 0 && commands_list.includes(arg)) {
                command.name = arg;
            } else {
                command.value = arg;
            }
        }
    }

    return command;
}