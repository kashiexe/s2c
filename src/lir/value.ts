
export enum ValueType {
    i64,
    string,
    func_ref,
    RAW_NO_INTERACT
}

export const ValueTypeToString: Record<ValueType, string> = {
    [ValueType.i64]: "i64",
    [ValueType.string]: "string",
    [ValueType.func_ref]: "func_ref",
    [ValueType.RAW_NO_INTERACT]: "RAW_NO_INTERACT"
}

/**
 * a Value represents any value produced by an instruction.
 */
export default class Value {
    id: number;
    type: ValueType;
    name?: string;
    value?: number | bigint;

    constructor(id: number, type: ValueType) {
        this.id = id;
        this.type = type;
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
}