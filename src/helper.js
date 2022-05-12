
const has_property = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

const is_number = (nr) => (typeof nr === "number" && Number.isFinite(nr));

const is_string = (str) => (typeof str === "string");

export {
    has_property,
    is_number,
    is_string
};
