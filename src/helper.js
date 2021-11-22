
const accumulate_amount = (dataset, key) => dataset.reduce((prev, curr, index, array) => prev + curr[key], 0);


export {accumulate_amount};
