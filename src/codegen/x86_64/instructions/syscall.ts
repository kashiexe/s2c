import mov from "./mov.js"
import { rax } from "../regs.js";

/**
 * generates a syscall instruction (if not given a syscall number or params, it will simply generate the bytes for the syscall instruction itself)
 * @param syscall_number the syscall number to use (only allowed for linux syscalls and such since windows requires pre-requisites before the syscall instruction is even invoked)
 * @param params The parameters to pass to the system call.
 * @returns A Uint8Array containing the bytes of the syscall instruction.
 */
export default function syscall(syscall_number?: number, params?: Uint8Array): Uint8Array {
    // bytes of the syscall itself
    if(!syscall_number) {
        return new Uint8Array([0x0F, 0x05]);
    }

    throw new Error(`[Engine]: auto syscalls have not been implemented yet`);
}