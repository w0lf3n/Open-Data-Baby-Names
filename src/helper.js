
const accumulate_amount = (database, key) => database.reduce((prev, curr, index, array) => prev + curr[key], 0);


export {accumulate_amount};
