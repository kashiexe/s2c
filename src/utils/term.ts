import type { span } from "../lexer/token.js";

export enum palette {
    black = 0,
    white = 15,
    red = 9,
    green = 85,
    blue = 45,
    yellow = 221,
    cyan = 51,
    magenta = 201,
    gray = 8,
    pink = 219
}

export enum style {
    bold = 1,
    dim = 2,
    italic = 3,
    underline = 4,
}

export const reset = "\x1b[0m";
export const esc = "\x1b";

export function fg(color: palette, styles?: style[]): string {
    return `\x1b[38;5;${color}${styles ? ";" + styles.map(s => s.toString()).join(";") : ""}m`;
}

export function bg(color: palette, styles?: style[]): string {
    return `\x1b[48;5;${color}${styles ? ";" + styles.map(s => s.toString()).join(";") : ""}m`;
}

/**
 * stop style
 * @param style 
 */
export function ss(style: style[]): string {
    return `\x1b[${style.map(s => (s + 20).toString()).join(";")}m`;
}

/**
 * this function will lex through the source code but without calling the main lexer as it will flag errors and invalidate tokens
 * @param code 
 */
export function syntax_highlight(code: string): string {


    return code;
}

/**
 * creates a code snippet with a pointer to the error with an extra message next to it (it also highlights the s2 code)
 * @param code 
 * @param span 
 * @param extra_info 
 * @returns 
 */
export function code_snippet(file: string, code: string, span: span, extra_info: string): string {
    // split code into lines and get the necessary lines
    const lines = code.split("\n");
    const prev_line = lines[span.line - 2];
    const line = lines[span.line - 1];

    // if there isn't a line, no code snippet can be generated, so empty string
    if(line === undefined) return "";

    // the pointer line beneath the line with error
    const pointer_line = " ".repeat(span.column) + "^".repeat(span.length);

    // line digits
    let last_line_digits = (span.line-1).toString().length;
    let line_digits = span.line.toString().length;

    // highlighted lines
    let highlighted_line = syntax_highlight(line);
    let highlighted_prev_line = prev_line ? syntax_highlight(prev_line) : undefined;

    // highlight token in line
    let i = span.column;
    let len = Math.max(1, span.length);
    let before = highlighted_line.slice(0,i);
    let token = highlighted_line.slice(i, i + len) || " ";
    let after = highlighted_line.slice(i + len);

    highlighted_line = before + bg(palette.pink, [style.bold]) + fg(palette.black) + token + reset + after;

    // build code snippet
    let str = `${fg(palette.white, [style.bold])}--> ${file}:${span.line}:${span.column+1}\n`;
    str += `${fg(palette.gray)}${" ".repeat(line_digits)} |\n`;
    if(highlighted_prev_line !== undefined) str += `${fg(palette.blue)}${span.line - 1} ${fg(palette.gray)}${" ".repeat(line_digits-last_line_digits)}| ${reset + fg(palette.white)}${highlighted_prev_line}\n`;
    str += `${fg(palette.blue, [style.bold])}${span.line} ${fg(palette.gray)}| ${reset + fg(palette.white)}${highlighted_line}\n`;
    str += `${fg(palette.gray, [style.bold])}${" ".repeat(line_digits)} | ${reset + fg(palette.white)}${pointer_line}`;

    if(extra_info) {
        str += `\n${fg(palette.gray, [style.bold])}${" ".repeat(line_digits)} | ${" ".repeat(span.column)}|\n`;
        str += `${fg(palette.gray)}${" ".repeat(line_digits)} | ${" ".repeat(span.column)}= ${reset + fg(palette.white, [style.dim])}${extra_info}\n${reset}`;
    }

    return str;
}


export enum e_codes {
    // general errors


    // lexer errors
    UNEXPECTED_CHAR = 1000,


    // parser errors
    UNEXPECTED_TOKEN = 2000,
}

export function error(e_code: number, message: string, snippets: string[]): void {
    console.error(`${fg(palette.red, [style.bold])}[${e_code}] Error: ${fg(palette.white)}${message}${reset}\n\n`);

    for(const snippet of snippets) {
        console.error(snippet + "\n");
    }
}