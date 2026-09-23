import type S2RT from "../s2rt.js";

export enum osabi {
    none,
    sysv = 0,
    hpux = 1,
    netbsd = 2,
    linux = 3,
    solaris = 6,
    freebsd = 9,
    arm = 97,
    standalone = 255
}

export enum etype {
    relocatable = 1,
    executable,
    shared,
    core
}

export class ehdr {
    bytes: Uint8Array = new Uint8Array(64);

    constructor(os_abi: osabi = osabi.sysv, type: etype = etype.executable) {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, 0x464C457F, true);    // e_magic
        view.setUint8(4, 2);                    // e_class (2 for 64-bit)
        view.setUint8(5, 1);                    // endianness (1 for LE)
        view.setUint8(6, 1);                    // e_version
        view.setUint8(7, os_abi);               // e_osabi
        view.setUint8(8, 0);                    // e_abiversion
        // padding to 16
        view.setUint16(16, type, true);         // e_type
        view.setUint16(18, 0x3E, true);         // e_machine (0x3E for x86_64)
        view.setUint32(20, 1, true);            // e_version (1 currently)
        view.setBigUint64(24, 0n, true);        // e_entry
        view.setBigUint64(32, 64n, true);       // e_phoff (program header offset)
        view.setBigUint64(40, 0n, true);        // e_shoff (section header offset [0 for now])
        view.setUint32(48, 0, true);            // e_flags (for x86_64 this isn't important)
        view.setUint16(52, 64, true);           // e_ehsize (ELF header size [64 bytes])
        view.setUint16(54, 56, true);           // e_phentsize (program header entry size)
        view.setUint16(56, 1, true);            // e_phnum (number of program headers)
        view.setUint16(58, 64, true);           // e_shentsize (section header entry size)
        view.setUint16(60, 0, true);            // e_shnum (number of section headers)
        view.setUint16(62, 0, true);            // e_shstrndx (section header string table index)
    }
}

export enum SegmentType {
    null,
    load,
    dynamic,
    interp,
    note
};

export enum SegmentFlags {
    executable = 1,
    writable = 2,
    readable = 4
}

export class phdr {
    bytes: Uint8Array = new Uint8Array(56);

    constructor(
        type: SegmentType, 
        flags: SegmentFlags, 
        offset: bigint, 
        vaddr: bigint, 
        paddr: bigint, 
        filesz: bigint, 
        memsz: bigint, 
        align: bigint
    ) {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, type, true);          // p_type
        view.setUint32(4, flags, true);         // p_flags
        view.setBigUint64(8, offset, true);     // p_offset
        view.setBigUint64(16, vaddr, true);     // p_vaddr
        view.setBigUint64(24, paddr, true);     // p_paddr
        view.setBigUint64(32, filesz, true);    // p_filesz
        view.setBigUint64(40, memsz, true);     // p_memsz
        view.setBigUint64(48, align, true);     // p_align
    }
}

export enum SectionType {
    null,
    progbits,
    symtab,
    strtab,
    rela,
    hash,
    dynamic,
    note,
    nobits,
    rel,
    shlib,
    dynsym,
    init_array,
    fini_array,
    preinit_array,
    group,
    symtab_shndx,
    loos=0x60000000,
    hios=0x6fffffff,
    loproc=0x70000000,
    hiproc=0x7fffffff,
    louser=0x80000000,
    hiuser=0xffffffff
}

export enum SectionFlags {
    null,
    write = 0x1,
    alloc = 0x2,
    execinstr = 0x4,
    merge = 0x10,
    strings = 0x20,
    info_link = 0x40,
    link_order = 0x80,
    os_nonconforming = 0x100,
    group = 0x200,
    tls = 0x400,
    mask_os = 0x0ff00000,
    mask_proc = 0xf0000000
}

export class shdr {
    bytes: Uint8Array = new Uint8Array(64);
    
    constructor(
        name: number, 
        type: SectionType, 
        flags: SectionFlags, 
        addr: bigint, 
        offset: bigint, 
        size: bigint, 
        link: number, 
        info: number, 
        addralign: bigint, 
        entsize: bigint
    ) {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, name, true);              // sh_name
        view.setUint32(4, type, true);              // sh_type
        view.setBigUint64(8, BigInt(flags), true);  // sh_flags
        view.setBigUint64(16, addr, true);          // sh_addr
        view.setBigUint64(24, offset, true);        // sh_offset
        view.setBigUint64(32, size, true);          // sh_size
        view.setUint32(40, link, true);             // sh_link
        view.setUint32(44, info, true);             // sh_info
        view.setBigUint64(48, addralign, true);     // sh_addralign
        view.setBigUint64(56, entsize, true);       // sh_entsize
    }

    static null(): shdr {
        return new shdr(0, SectionType.null, SectionFlags.null, 0n, 0n, 0n, 0, 0, 0n, 0n);
    }
}

export class Section {
    shdr: shdr;
    data: Uint8Array;
    name: string;

    constructor(name: string, shdr: shdr, data: Uint8Array) {
        this.name = name;
        this.shdr = shdr;
        this.data = data;
    }
}

export class Segment {
    header: phdr;
    sections: Section[] = [];

    constructor(header: phdr, sections: Section[]) {
        this.header = header;
        this.sections = sections;
    }
}

export default class ELF {
    header: ehdr;
    s2rt: S2RT;
    segments: Segment[] = [];

    constructor(info: any, s2rt: S2RT) {
        this.header = new ehdr(info.os_abi ?? osabi.sysv, info.type ?? etype.executable);
        this.s2rt = s2rt;
    }
};