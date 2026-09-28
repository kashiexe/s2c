
export enum ValueType {
    i64,
    string,
    func_ref
}

export const ValueTypeToString: Record<ValueType, string> = {
    [ValueType.i64]: "i64",
    [ValueType.string]: "string",
    [ValueType.func_ref]: "func_ref"
}

/**
 * a Value represents any value produced by an instruction.
 */
export default class Value {
    id: number;
    type: ValueType;
    name?: string;

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
}