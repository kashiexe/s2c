import type { __section_names__ } from "../../../codegen/x86_64/cgblock.js";
import type S2RT from "../s2rt.js";
import fs, { chmodSync } from "fs";

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
    magic: number;
    class: number;
    endianness: number;
    version: number;
    os_abi: osabi;
    abi_version: number;
    padding: Uint8Array;
    type: etype;
    machine: number;
    version2: number;
    entry: bigint;
    phoff: bigint;
    shoff: bigint;
    flags: number;
    ehsize: number;
    phentsize: number;
    phnum: number;
    shentsize: number;
    shnum: number;
    shstrndx: number;

    constructor(os_abi: osabi = osabi.sysv, type: etype = etype.executable) {
        this.magic = 0x464C457F;
        this.class = 2;
        this.endianness = 1;
        this.version = 1;
        this.os_abi = os_abi;
        this.abi_version = 0;
        this.padding = new Uint8Array(7);
        this.type = type;
        this.machine = 0x3E;
        this.version2 = 1;
        this.entry = 0n;
        this.phoff = 64n;
        this.shoff = 0n;
        this.flags = 0;
        this.ehsize = 64;
        this.phentsize = 56;
        this.phnum = 0;
        this.shentsize = 64;
        this.shnum = 0;
        this.shstrndx = 0;
    }

    to_bytes(): Uint8Array {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, this.magic, true);                    // e_magic
        view.setUint8(4, this.class);                           // e_class (2 for 64-bit)
        view.setUint8(5, this.endianness);                      // endianness (1 for LE)
        view.setUint8(6, this.version);                         // e_version
        view.setUint8(7, this.os_abi);                          // e_osabi
        view.setUint8(8, this.abi_version);                     // e_abiversion
        // padding to 16
        view.setUint16(16, this.type, true);                    // e_type
        view.setUint16(18, this.machine, true);                 // e_machine (0x3E for x86_64)
        view.setUint32(20, this.version2, true);                // e_version (1 currently)
        view.setBigUint64(24, this.entry, true);                // e_entry
        view.setBigUint64(32, this.phoff, true);                // e_phoff (program header offset)
        view.setBigUint64(40, this.shoff, true);                // e_shoff (section header offset [0 for now])
        view.setUint32(48, this.flags, true);                   // e_flags (for x86_64 this isn't important)
        view.setUint16(52, this.ehsize, true);                  // e_ehsize (ELF header size [64 bytes])
        view.setUint16(54, this.phentsize, true);               // e_phentsize (program header entry size)
        view.setUint16(56, this.phnum, true);                   // e_phnum (number of program headers)
        view.setUint16(58, this.shentsize, true);               // e_shentsize (section header entry size)
        view.setUint16(60, this.shnum, true);                   // e_shnum (number of section headers)
        view.setUint16(62, this.shstrndx, true);                // e_shstrndx (section header string table index)
        return this.bytes;
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

    type: SegmentType;
    flags: SegmentFlags;
    offset: bigint;
    vaddr: bigint;
    paddr: bigint;
    filesz: bigint;
    memsz: bigint;
    align: bigint;

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
        this.type = type;
        this.flags = flags;
        this.offset = offset;
        this.vaddr = vaddr;
        this.paddr = paddr;
        this.filesz = filesz;
        this.memsz = memsz;
        this.align = align;

    }

    to_bytes(): Uint8Array {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, this.type, true);          // p_type
        view.setUint32(4, this.flags, true);         // p_flags
        view.setBigUint64(8, this.offset, true);     // p_offset
        view.setBigUint64(16, this.vaddr, true);     // p_vaddr
        view.setBigUint64(24, this.paddr, true);     // p_paddr
        view.setBigUint64(32, this.filesz, true);    // p_filesz
        view.setBigUint64(40, this.memsz, true);     // p_memsz
        view.setBigUint64(48, this.align, true);     // p_align

        return this.bytes;
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


export const section_info: Record<__section_names__, { type: SectionType, flags: SectionFlags }> = {
    text: { type: SectionType.progbits, flags: SectionFlags.alloc | SectionFlags.execinstr },
    rodata: { type: SectionType.progbits, flags: SectionFlags.alloc },
    data: { type: SectionType.progbits, flags: SectionFlags.alloc | SectionFlags.write },
    bss: { type: SectionType.nobits, flags: SectionFlags.alloc | SectionFlags.write }
};

export class shdr {
    bytes: Uint8Array = new Uint8Array(64);
    name: number;
    type: SectionType;
    flags: SectionFlags;
    addr: bigint;
    offset: bigint
    size: bigint;
    link: number;
    info: number;
    addralign: bigint;
    entsize: bigint;
    
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
        this.name = name;
        this.type = type;
        this.flags = flags;
        this.addr = addr;
        this.offset = offset;
        this.size = size;
        this.link = link;
        this.info = info;
        this.addralign = addralign;
        this.entsize = entsize;
    }

    to_bytes(): Uint8Array {
        let view = new DataView(this.bytes.buffer);
        view.setUint32(0, this.name, true);              // sh_name
        view.setUint32(4, this.type, true);              // sh_type
        view.setBigUint64(8, BigInt(this.flags), true);  // sh_flags
        view.setBigUint64(16, this.addr, true);          // sh_addr
        view.setBigUint64(24, this.offset, true);        // sh_offset
        view.setBigUint64(32, this.size, true);          // sh_size
        view.setUint32(40, this.link, true);             // sh_link
        view.setUint32(44, this.info, true);             // sh_info
        view.setBigUint64(48, this.addralign, true);     // sh_addralign
        view.setBigUint64(56, this.entsize, true);       // sh_entsize
        return this.bytes;
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
    nonseg_sections: Section[] = [];

    constructor(info: any, s2rt: S2RT) {
        this.header = new ehdr(info.os_abi ?? osabi.sysv, info.type ?? etype.executable);
        this.s2rt = s2rt;
    }

    create_sections(): Section[] {
        let sections: Section[] = [];
        let cgblock = this.s2rt.ctx;
        let current_offset = 0n;

        for(let section_name of cgblock.all_sections) {
            let section_data = cgblock.get(section_name) as number[];

            if(section_data.length > 0) {
                let padding = 16;

                // create section header
                let section_header = new shdr(
                    0,
                    section_info[section_name].type,
                    section_info[section_name].flags,
                    BigInt(0x400000),
                    current_offset,
                    BigInt(section_data.length + padding - (section_data.length % padding)),
                    0,
                    0,
                    BigInt(padding),
                    0n
                );
                
                // update offset
                current_offset += BigInt(section_data.length + padding - (section_data.length % padding));

                // create section
                let data = new Uint8Array([
                    ...section_data, 
                    ...new Array(padding - (section_data.length % padding)).fill(0)
                ]);
                let section = new Section(`.${section_name}\0`, section_header, data);
                sections.push(section);
            }
        }

        return sections;
    }

    generate_segments(sections: Section[]) {

        // go through each section and generate segments depending on it's flags
        for(let section of sections) {
            let flags = section.shdr.flags;
            this.header.shnum++;

            if(flags & SectionFlags.alloc) {
                let flags_to_find: SegmentFlags = SegmentFlags.executable;

                // RW 
                if(flags & SectionFlags.write) {
                    // update flags_to_find
                    flags_to_find = SegmentFlags.writable;
                } 
                // R-X
                else if(flags & SectionFlags.execinstr) {
                    // update flags_to_find
                    flags_to_find = SegmentFlags.executable; // only reason I have this is for readability
                } 
                // R--
                else {
                    // update flags_to_find
                    flags_to_find = SegmentFlags.readable;
                }

                // try to find a segment with the same flags
                let segment = this.segments.find(s => (s.header.flags & flags_to_find) === flags_to_find);

                // create segment if it doesn't exist
                if(!segment) {
                    let v_addr = 0x400000n;
                    
                    let segment_header = new phdr(
                        SegmentType.load,
                        flags_to_find,
                        BigInt(section.shdr.offset),
                        v_addr + BigInt(section.shdr.offset),
                        v_addr + BigInt(section.shdr.offset),           // p_addr can be the same as v_addr
                        BigInt(section.shdr.size),                      // p_filesz

                        // p_memsz can be the same (unless bss)
                        BigInt(section.shdr.size + BigInt((section.name === "bss") ? section.shdr.size : 0)),

                        0x1000n                                         // alignment (4KB)
                    );

                    // update elf's header and push segment
                    this.header.phnum++;

                    let segment = new Segment(segment_header, [section]);
                    this.segments.push(segment);
                    continue;
                }

                // if there is already a segment with the same flags, we need to update its header and add the section to it
                segment.header.filesz += BigInt(section.shdr.size);
                segment.header.memsz += BigInt(section.shdr.size);
                segment.sections.push(section);

                // update the segment's header's p_memsz if the section is bss
                if(section.name === "bss") {
                    segment.header.memsz += BigInt(section.shdr.size);
                }
            }

            // other sections that are not part of a segment will be handled separately during link()
            this.nonseg_sections.push(section);
        }
    }

    resolve_relocations(sections: Section[]) {
        let relocations = this.s2rt.ctx.relocations;

        for(let reloc of relocations) {

        }
    }

    // creates shstrtab section
    shstrtab() {
        let data: number[] = [];

        // push null section name
        data.push(0);

        let i = 1;

        // push section names
        for(let section of this.segments.flatMap(s => s.sections).concat(this.nonseg_sections)) {
            // update section header's name index
            section.shdr.name = i;

            let name_bytes = new TextEncoder().encode(section.name);
            data.push(...name_bytes);
            i++;
        }
        
        // push shstrtab section name
        data.push(...new TextEncoder().encode(".shstrtab\0"));

        // generate section and push it to nonseg_sections
        let shstrtab_header = new shdr(
            i, // index of the shstrtab section name in the string table (it's always the last section)
            SectionType.strtab,
            SectionFlags.alloc,
            0x400000n,
            BigInt(this.segments.reduce((acc, s) => acc + s.sections.reduce((acc2, s2) => acc2 + s2.data.length, 0), 0) + this.nonseg_sections.reduce((acc, s) => acc + s.data.length, 0)),
            BigInt(data.length),
            0,
            0,
            1n,
            0n
        );

        let shstrtab_section = new Section(".shstrtab\0", shstrtab_header, new Uint8Array(data));
        this.nonseg_sections.push(shstrtab_section);
    }

    link(output: string) {
        let sections = this.create_sections();
        this.generate_segments(sections); // updates this.segments
        this.resolve_relocations(sections);
        this.shstrtab(); 

        // begin writing the ELF file
        let elf_bytes: number[] = [];

        // sizes
        this.header.phnum = this.segments.length;
        let ehsize = BigInt(this.header.ehsize);
        let ph_total_size = BigInt(this.header.phentsize) * BigInt(this.header.phnum);

        this.header.phoff = ehsize;

        // initiate buffers for each elf component
        let program_headers_bytes: number[] = [];
        let section_payloads: number[] = [];
        let section_header_bytes: number[] = [];

        // process segments
        for(let segment of this.segments) {
            // update program header
            let current_offset = ehsize + ph_total_size + BigInt(section_payloads.length);
            
            // add padding
            let trem = segment.header.vaddr % segment.header.align;
            let crem = current_offset % segment.header.align;
            let padding = (trem - crem + segment.header.align) % segment.header.align;

            if(padding > 0n) {
                section_payloads.push(...new Array(Number(padding)).fill(0));
                current_offset += padding;
            }

            // track memsz
            let memsz: bigint = 0n;
            let filesz: bigint = 0n;

            // update section headers
            for(let section of segment.sections) {
                // update section header
                let sec_offset = ehsize + ph_total_size + BigInt(section_payloads.length);

                section.shdr.offset = sec_offset;
                section_header_bytes.push(...section.shdr.to_bytes());
                
                // push payload
                section_payloads.push(...section.data);

                // update entry
                if(section.name === ".text\0") {
                    this.header.entry = section.shdr.addr + BigInt(this.s2rt.exe_entry);
                }

                // update memsz and filesz
                memsz += BigInt(section.data.length);
                filesz += BigInt(section.data.length);

                // update based on NOBITS
                if(section.name === ".bss\0") {
                    memsz += section.shdr.size;
                }
            }

            // update segment's header
            segment.header.filesz = filesz;
            segment.header.memsz = memsz;
            
            // update and push program header
            segment.header.offset = current_offset;
            program_headers_bytes.push(...segment.header.to_bytes());
        }

        // render non-segment sections
        for(let section of this.nonseg_sections) {
            // update section header
            let current_offset = ehsize + ph_total_size + BigInt(section_payloads.length);
            section.shdr.offset = current_offset;
            section.shdr.addr = 0n;

            // add section payload to section_payloads
            section_payloads.push(...section.data);

            // add section header to section_header_bytes
            section_header_bytes.push(...section.shdr.to_bytes());
        }

        // write elf header
        this.header.shnum = this.segments.reduce((acc, s) => acc + s.sections.length, 0) + this.nonseg_sections.length + 1;
        this.header.shstrndx = this.header.shnum - 1; // shstrtab is always the last section
        this.header.shoff = ehsize + ph_total_size + BigInt(section_payloads.length);
        elf_bytes.push(...this.header.to_bytes());

        // write program headers
        elf_bytes.push(...program_headers_bytes);

        // write section payloads
        elf_bytes.push(...section_payloads);

        // write null section header
        let null_section_header = shdr.null();
        elf_bytes.push(...null_section_header.to_bytes());

        // write section headers
        elf_bytes.push(...section_header_bytes);

        // first write the elf file itself
        fs.writeFileSync(output, new Uint8Array(elf_bytes));

        // now try to give it execute permissions
        try {
            chmodSync(output, 0o755);
        } catch(e) {
            console.error(`[s2c]: Failed to give execute permissions to ${output}: ${e}`);
        }
    }
};