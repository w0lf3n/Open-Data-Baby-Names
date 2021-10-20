
const API_QUERY_GIRL_NAMES_PER_YEAR = "https://geo.sv.rostock.de/download/opendata/vornamen_von_neugeborenen_%YEAR%/vornamen_von_weiblichen_neugeborenen_%YEAR%.json";

const fetchJSON = async function (url) {
    const response = await fetch(url);
    return await response.json();
};

const get_data_via_rest_api = async function (yearStart, yearEnd) {

    const promises = [];

    for (let i = yearStart; i <= yearEnd; i = i + 1) {
        promises.push(fetchJSON(API_QUERY_GIRL_NAMES_PER_YEAR.replace(/%YEAR%/g, String(i))));
    }

    const fetchedData = {};
    const responseData = await Promise.all(promises);
    responseData.forEach((dataset, index) => {
        fetchedData[String(index + yearStart)] = dataset;
    });
    return fetchedData;
};

const get_data_from_backup = () => fetchJSON("dat/girls_first_names_per_year.json");


export {get_data_from_backup, get_data_from_backup};
