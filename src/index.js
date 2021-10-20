import {get_data_from_backup} from "./fetchAPI.js";
import * as DonutChart from "./donut_chart.js";


get_data_from_backup().then(loaded_data => {

    const db_girls_born_by_year = {};

    // prepare fetched data
    let amount_of_most_girls_born = -1;
    for (const key in loaded_data) {
        db_girls_born_by_year[key] = {};
        db_girls_born_by_year[key].names = loaded_data[key];

        const amount = DonutChart.accumulate_amount(loaded_data[key]);
        db_girls_born_by_year[key].amount = amount
        if (amount > amount_of_most_girls_born) {
            amount_of_most_girls_born = amount;
        }
    }
    const length = Object.values(db_girls_born_by_year).length;

    DonutChart.visualize(db_girls_born_by_year, amount_of_most_girls_born);

});
