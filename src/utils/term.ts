
export enum palette {
    black = 0,
    white = 15,
    red = 9,
    green = 46,
    blue = 21,
    yellow = 226,
    cyan = 51,
    magenta = 201,
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