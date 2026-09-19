
export enum DataType {
    Const,
    String
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
}