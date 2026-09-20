import Module from "../../lir/module.js";
import { Allocation, allocate as sysvamd_allocate } from "./allocators/sysvamd.js"
import type CGBlock from "./cgblock.js";
import translate from "./translator.js";

export const allocators: Record<string, (module: Module) => Allocation> = {
    sysvamd: sysvamd_allocate
}

export function execute(module: Module, allocator: string = "sysvamd", os: string = "linux"): CGBlock {
    const allocate = allocators[allocator];
    if (!allocate) {
        throw new Error(`[Engine]: Allocator ${allocator} not found`);
    }

    const allocation = allocate(module);
    return translate(module, allocation, os);
}