import type { reg } from "./regs.js";

export type __section_names__ = "text" | "rodata" | "data" | "bss";

export class Symbol {
    name: string;
    section: __section_names__;
    offset: number;
    size: number;
    global: boolean;

    constructor(name: string, section: __section_names__, offset: number, size: number, global: boolean) {
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
    section: __section_names__;
    type: RelocType;
    symbol: string;
    addend: bigint;

    constructor(offset: number, section: __section_names__, type: RelocType, symbol: string, addend: bigint) {
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
    all_sections: __section_names__[] = ["text", "rodata", "data", "bss"];

    // relocations
    relocations: Reloc[];

    // symbols
    symbols: Symbol[] = [];

    // entry offset
    entry: number | undefined;

    // was changed by inline assembly instructions
    changed: reg[] = [];
    asm_changed: reg[] = [];

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

    get(section_name: string | __section_names__): Array<number> | number {
        return this[section_name as keyof CGBlock] as Array<number> | number;
    }

    changed_index(reg: reg | undefined): number | undefined {
        if(!reg) return undefined;
        let index = this.changed.findIndex(r => r.name === reg.name);
        return index === -1 ? undefined : index;
    }

    asm_changed_index(reg: reg | undefined): number | undefined {
        if(!reg) return undefined;
        let index = this.asm_changed.findIndex(r => r.name === reg.name);
        return index === -1 ? undefined : index;
    }
}