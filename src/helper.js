
const has_property = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

const is_number = (nr) => (typeof nr === "number" && Number.isFinite(nr));


export {
    has_property,
    is_number
};
