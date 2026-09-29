
export enum DataType {
    Const,
    String
}

export const DataTypeToString: Record<DataType, string> = {
    [DataType.Const]: "const",
    [DataType.String]: "string"
}

export default class DataObj {
    id: number;
    type: DataType;
    data: Uint8Array;
    align: number;

    constructor(id: number, type: DataType, data: Uint8Array, align: number) {
        this.id = id;
        this.type = type;
        this.data = data;
        this.align = align;
    }

    to_string(): string {
        let str = "";

        str += `${DataTypeToString[this.type]}$${this.id}: [${this.data}] (align: ${this.align})`;
        str += "\n";

        return str;
    }
}