
export enum RelocType {
    Absolute,
    Relative,
    GotRelative
}

export interface Reloc {
    offset: number;
    type: RelocType;
}

/**
 * this class contains everything the linker needs to know to generate the correct sections and do relocations as easy as possible
 * the goal for code generation is to generate a CGBlock and this block should make the linker's life a whole lot easier
 */
export default class CGBlock {
    os: string;

    // sections
    text: Array<number>;
    bss: Array<number>;
    rodata: Array<number>;
    data: Array<number>;

    // relocations
    relocations: any;

    constructor(os: string) {
        this.os = os;
        this.text = [];
        this.bss = [];
        this.rodata = [];
        this.data = [];
        this.relocations = [];
    }

    add_code(bytes: Uint8Array) {
        this.text.push(...bytes);
    }
}