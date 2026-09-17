
export enum TokenType {

}

export interface pos {
    line: number;
    column: number;
    offset: number;
    length: number;
}

export interface Token {
    type: TokenType;
    value: string | number;
    pos: pos;
}

