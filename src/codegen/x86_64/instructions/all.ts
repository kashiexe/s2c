/* 
    contains a map to all instructions
*/
import mov from "./mov.js";
import add from "./add.js";
import call from "./call.js";
import sub from "./sub.js";
import lea from "./lea.js";
import push from "./push.js";
import pop from "./pop.js";
import ret from "./ret.js";
import syscall from "./syscall.js";

export const instructions: Record<string, Function> = {
    "mov": mov,
    "add": add,
    "call": call,
    "sub": sub,
    "lea": lea,
    "push": push,
    "pop": pop,
    "ret": ret,
    "syscall": syscall
}

export default instructions;