/* 
    comprises all linux specific types, interfaces, classes and utilities into one single file to export as "* as linux" 
    (which is then sub divided into architectures)
*/

import { syscalls } from "./codegen/linux/syscalls.js";

export {
    syscalls
}