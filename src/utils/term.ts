
export enum palette {
    black = 0,
    white = 15,
    red = 9,
    green = 85,
    blue = 45,
    yellow = 221,
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

/**
 * stop style
 * @param style 
 */
export function ss(style: style[]): string {
    return `\x1b[${style.map(s => (s + 20).toString()).join(";")}m`;
}