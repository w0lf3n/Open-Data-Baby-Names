
import {accumulate_amount} from "./helper.js";

let Properties = {};
const possible_ids = [];

const extract_keys = function (database) {

    if (database instanceof Array) {

        database.forEach(dataset => {

            if (dataset instanceof Object) {
                Object.keys(dataset).forEach(key => {

                    const all_keys = Object.values(Properties);
                    if (!all_keys.includes(key)) {
                        Properties[`key${all_keys.length}`] = key;
                    }
    
                });
            }
 
        });
    }

};

const init_check_ids_object = function () {
    const check_object = {};
    Object.values(Properties).forEach(key => {
        check_object[key] = [];
    });
    return check_object;
};

const secure_completeness = function (database) {

    if (database instanceof Array) {

        database.forEach(dataset => {

            if (dataset instanceof Object) {

                Object.keys(Properties).forEach(key => {

                    if (!dataset.hasOwnProperty(key)) {
                        if (Properties[key].hasOwnProperty("min") || Properties[key].hasOwnProperty("max")) {
                            dataset[key] = Properties[key]["min"] || Properties[key]["max"];
                        } else {
                            dataset[key] = null;
                        }
                    }

                });

            }

        });

        console.log(database);

    }

};

const prepare_unknown = function (datasource) {

    for (const key in datasource) {
        extract_keys(datasource[key]);
    }

    for (const key in datasource) {
        secure_completeness(datasource[key], key);
    }

    console.log(possible_ids);

    // TODO finalize step
    // const prepped_db = {};

    // for (const key in database) {
    //     prepped_db[key] = {};
    //     prepped_db[key].data = database[key];
    //     extract_keys(database[key]);
    // }

    // TODO integrate maximum value of database
    // database = prepped_db;
    // let maximum = -1;
    // const amount = accumulate_amount(database[key], DATA_KEY_ID.NUMBER);
    // prepped_db[key].amount = amount
    // if (amount > maximum) {
    //     maximum = amount;
    // }
};

/**
 * This prepares the datasource to be processed by the visualization methods.
 * If the data structure is known. You can specify certain property behaviour.
 *
 * @param {Object} datasource object storing databases 
 * @param {Object} encoding object storing settings related to properties of datasets
 */
const prepare_with_properties = function (datasource, encoding) {

    if (encoding instanceof Object) {
        // TODO create check Keys correctness method
        Properties = encoding;
    }

    if (Properties !== null) {

        for (const key in datasource) {
            secure_completeness(datasource[key]);
        }

    } else {
        // TODO error ??
        // TODO return null
    }
    
}


export {
    prepare_with_properties,
    prepare_unknown
};
