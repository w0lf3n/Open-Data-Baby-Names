
let _database = null;
let _properties = [];

// TODO fake implementation
const assure_data_quality = function (data) {

    return data;
};

// TODO fake implementation
const register_data = function (data) {

    _database = assure_data_quality(data);

};

// TODO fake implementation
const register_structure = function (properties) {
    if (properties instanceof Object) {
        _properties = properties;
    }
};


export {register_data, register_structure};
