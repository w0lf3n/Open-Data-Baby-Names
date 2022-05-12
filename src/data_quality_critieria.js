
const collect = [];

const correct_values = (data) => {

    if (data instanceof Array) {
        data.forEach(dataset => {
            if (dataset.name.includes("/") && !collect.includes(dataset.name)) {
                collect.push(dataset.name);
            }
        });
    }

};

const establish = async (data) => {

    data.forEach(dataset => Object.values(dataset).forEach(set => correct_values(set)));

    console.log(collect);

    return data;
};


export {
    establish
}