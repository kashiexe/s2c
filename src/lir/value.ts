
export enum ValueType {
    i64,
    string
}

export const ValueTypeToString: Record<ValueType, string> = {
    [ValueType.i64]: "i64",
    [ValueType.string]: "string"
}

/**
 * a Value represents any value produced by an instruction.
 */
export default class Value {
    id: number;
    type: ValueType;

    constructor(id: number, type: ValueType) {
        this.id = id;
        this.type = type;
    }
}