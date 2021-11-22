

import {get_data_from_backup} from "./fetchAPI.js";

import * as Controls from "./controls.js";
import * as DataCenter from "./data_center.js";
import * as DataTable from "./data_table.js";
import * as DonutChart from "./donut_chart.js";
import * as LineChart from "./line_chart.js";


get_data_from_backup().then(loaded_data => {

    DataCenter.register_data(loaded_data);
    DataCenter.register_structure(
        {
            id: {type: "number"},
            data: {
                id: {key: "vorname", type: "nominal"},
                quantity: {key: "anzahl", type: "quantity"},
                range: {key: "position", type: "index", max: 1}
            }
        }
    );

    const donut_chart = DonutChart.init({});
    const line_chart = LineChart.init({});
    const all_time_favs = DataTable.init({});
    const controls = Controls.init({});

    // data by year
    // get data for first year
    DataCenter.get_dataset(1);

});

    // prepare fetched data for donut chart
    // TODO move to donut_chart.js ??
    
    // TODO specify encoding

    // prepare data for line chart
    // const names_variety = [];
    // let amount_of_most_girls_born = -1;
    // for (const key in loaded_data) {
    //     db_girls_born_by_year[key] = {};
    //     const current_names = loaded_data[key];
    //     db_girls_born_by_year[key].names = current_names;

    //     const amount = accumulate_amount(current_names, KEY_ID_NUMBER);
    //     db_girls_born_by_year[key].amount = amount
    //     if (amount > amount_of_most_girls_born) {
    //         amount_of_most_girls_born = amount;
    //     }

    //     names_variety.push({year: key, ratio: current_names.length / amount});

    // }
    // LineChart.visualize(names_variety);
