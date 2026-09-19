
export default class StackSlot {
    id: number;
    size: number;
    align: number;
    name: string;

    constructor(id: number, size: number, align: number, name: string) {
        this.id = id;
        this.size = size;
        this.align = align;
        this.name = name;
    }
}