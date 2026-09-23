
export const W = 0b1000;
export const R = 0b0100;
export const X = 0b0010;
export const B = 0b0001;

export default function rex(modes?: number) {
    return 0b01000000 | ((modes ?? 0) & 0b1111);
}