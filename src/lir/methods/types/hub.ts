import { ValueType } from "../../value.js";
import property from "./string.js";

export const type_methods: Partial<Record<ValueType, Record<string, Function>>> = {
    [ValueType.string]: {
        "property": property
    }
}

export default type_methods;