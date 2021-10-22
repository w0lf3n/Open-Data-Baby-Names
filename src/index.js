
import {accumulate_amount} from "./helper.js";
import {get_data_from_backup} from "./fetchAPI.js";

import * as DonutChart from "./donut_chart.js";
import * as LineChart from "./line_chart.js";



get_data_from_backup().then(loaded_data => {

    // prepare fetched data for donut chart
    // TODO move to donut_chart.js ??
    
    // TODO specify encoding
    DonutChart.visualize(
        loaded_data,
        {
            id: {key: "vorname", type: "nominal"},
            quantity: {key: "anzahl", type: "quantity"},
            range: {key: "position", type: "index", max: 1}
        }
    );
    // (basic_data_preparation(loaded_data));

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

});
