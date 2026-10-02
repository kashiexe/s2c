import { Path } from "../parser/node.js";

export enum ValueType {
    u8, u16, u32, u64,
    i8, i16, i32, i64,
    string,
    func_ref,
    RAW_NO_INTERACT
}

export const ValueTypeToString: Record<ValueType, string> = {
    [ValueType.u8]: "u8",
    [ValueType.u16]: "u16",
    [ValueType.u32]: "u32",
    [ValueType.u64]: "u64",
    [ValueType.i8]: "i8",
    [ValueType.i16]: "i16",
    [ValueType.i32]: "i32",
    [ValueType.i64]: "i64",
    [ValueType.string]: "string",
    [ValueType.func_ref]: "func_ref",
    [ValueType.RAW_NO_INTERACT]: "RAW_NO_INTERACT"
}

export function path_to_value_type(path: Path): ValueType | null {
    if(path.elements.length === 1) {
        const elem = path.elements[0]!;
        let name = elem.identifier;

        switch(name) {
            case "u8": return ValueType.u8;
            case "u16": return ValueType.u16;
            case "u32": return ValueType.u32;
            case "u64": return ValueType.u64;
            case "i8": return ValueType.i8;
            case "i16": return ValueType.i16;
            case "i32": return ValueType.i32;
            case "i64": return ValueType.i64;
            case "string": return ValueType.string;
            default: return null;
        }
    } 

    return null;
}

/**
 * a Value represents any value produced by an instruction.
 */
export default class Value {
    id: number;
    type: ValueType;
    name?: string;
    value?: number | bigint;
    is_pointer?: boolean;

    constructor(id: number, type: ValueType) {
        this.id = id;
        this.type = type;
        if(type === ValueType.func_ref) {
            this.id = -1; // func_refs can't have IDs
        }
    }

    /**
     * only works for func_ref values
     * @param name 
     */
    setName(name: string) {
        this.name = name;
    }

    /**
     * these cannot be interacted with as they are "raw values"
     * @param value 
     */
    setValue(value: number | bigint) {
        this.value = value;
    }

    to_string(): string {
        return `%${this.id}<${ValueTypeToString[this.type]}${this.is_pointer?"*":""}>`;
    }
}