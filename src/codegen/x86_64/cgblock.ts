export type Section = "text" | "rodata" | "data" | "bss";

export class Symbol {
    name: string;
    section: Section;
    offset: number;
    size: number;
    global: boolean;

    constructor(name: string, section: Section, offset: number, size: number, global: boolean) {
        this.name = name;
        this.section = section;
        this.offset = offset;
        this.size = size;
        this.global = global;
    }
}

export enum RelocType {
    Absolute,
    Relative,
    GotRelative
}

export class Reloc {
    offset: number;
    section: Section;
    type: RelocType;
    symbol: string;
    addend: bigint;

    constructor(offset: number, section: Section, type: RelocType, symbol: string, addend: bigint) {
        this.offset = offset;
        this.section = section;
        this.type = type;
        this.symbol = symbol;
        this.addend = addend;
    }
}

/**
 * this class contains everything the linker needs to know to generate the correct sections and do relocations as easy as possible
 * the goal for code generation is to generate a CGBlock and this block should make the linker's life a whole lot easier
 */
export default class CGBlock {
    os: string;

    // sections
    text: Array<number>;
    rodata: Array<number>;
    data: Array<number>;
    bss: number;

    // relocations
    relocations: Reloc[];

    // symbols
    symbols: Symbol[] = [];

    // entry offset
    entry: number | undefined;

    constructor(os: string) {
        this.os = os;
        this.text = [];
        this.bss = 0;
        this.rodata = [];
        this.data = [];
        this.relocations = [];
    }

    add(what: Symbol | Uint8Array | Reloc | number) {
        if(what instanceof Uint8Array) {
            this.text.push(...what);
        } else if(typeof what === "number") {
            this.entry = what;
        } else if(what instanceof Reloc) {
            this.relocations.push(what as Reloc);
        } else {
            this.symbols.push(what as Symbol);
        }
    }
}