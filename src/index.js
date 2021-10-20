import {get_data_from_backup} from "./fetchAPI.js";


const db_girls_born_by_year = {};

// setup
const ZOOM_FACTOR = 0.2;
const KEY_ID_NUMBER = "anzahl";
const KEY_ID_NAME = "vorname";

const accumulate_amount = database => database.reduce((prev, curr, index, array) => prev + curr[KEY_ID_NUMBER], 0);

const prepare_dataset_by_index = function (index, number_of_places) {

    const current_key = Object.keys(db_girls_born_by_year)[index];

    let current_dataset = db_girls_born_by_year[current_key].names;
    if (current_dataset[0].hasOwnProperty("position")) {
        current_dataset = current_dataset.filter((name) => name.position === 1);
    }

    const size = db_girls_born_by_year[current_key].amount;

    const data_snippet = current_dataset.slice(0, number_of_places);
    const remaining = size - accumulate_amount(data_snippet);
    data_snippet.push({vorname: "restliche", anzahl: remaining});

    return {data: data_snippet, size, year: current_key};
};

const calculate_side = (number) => (number * ZOOM_FACTOR) / Math.sqrt(2);

// add title
const setup_donut_chart = function (diagonal) {

    const side = calculate_side(diagonal);

    const chart_container = d3.select("body")
	    .append("svg")
        .attr("width", side)
        .attr("height", side);

	const main_graph = chart_container.append("g")
        .attr("transform", "translate(" + side / 2 + "," + side / 2 + ")");

    main_graph.append("g")
        .attr("class", "Slices");
    main_graph.append("g")
        .attr("class", "Labels");
    main_graph.append("g")
        .attr("class", "Lines");

    return chart_container;
};

const calculate_mid_angle = arc => arc.startAngle + (arc.endAngle - arc.startAngle) / 2;

const update_donut_chart = function (chart, dataset) {

    const prepared_data = dataset.data;

    const side = calculate_side(dataset.size);
    const margin = 50;
    const radius = side / 2 - margin;

    //  and labels and lines

    const color_scale = d3.scaleOrdinal(d3.schemeDark2);

    const data_as_arcs = d3.pie()
        .value(d => d[KEY_ID_NUMBER])
        (prepared_data);

    const inner_arc = d3.arc()
        .innerRadius(radius * 0.5) // size of donut hole
        .outerRadius(radius * 0.8);
    
    const labels_arc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const t = d3.transition()
        .duration(1000)
        .ease(d3.easeLinear);

    const current_chart = chart.select(".Slices").selectAll("path.Slice")
        .data(data_as_arcs);

    current_chart
        .enter()
        .append("path")
        .attr("class", "Slice")
        .merge(current_chart)
        .attr("stroke", "white")
        .transition(t)
        .attr("fill", color => color_scale(color))
        .attr("d", inner_arc);

    current_chart
        .exit()
        .remove();

    // const lines = chart.select(".Lines")
    //     .selectAll("polyline")
    //     .data(data_as_arcs)
    //     .enter()
    //     //.merge(current_chart)
    //     .append("polyline")
    //         .attr("points", function (d) {
    //             const pos = labels_arc.centroid(d);
    //             pos[0] = radius * 0.85 * (calculate_mid_angle(d) < Math.PI ? 1 : -1);
    //             return [inner_arc.centroid(d), labels_arc.centroid(d), pos];
    //         });
    // lines
    //     .exit()
    //     .remove();
    
    // const labels = chart.select(".Labels").selectAll("text")
    //     .data(data_as_arcs)
    //     .enter()
    //     //.merge(current_chart)
    //     .append("text")
    //         .text(d => d.data[KEY_ID_NAME])
    //         .attr("transform", d => {
    //             const pos = labels_arc.centroid(d);
    //             pos[0] = radius * 0.9 * (calculate_mid_angle(d) < Math.PI ? 1 : -1);
    //             return `translate(${pos})`;
    //         })
    //         .style("text-anchor", d => calculate_mid_angle(d) < Math.PI ? "start" : "end");
    // labels
    //     .exit()
    //     .remove();

    
    // const year = chart.select("g").append("text")
    //     .attr("class", "Year")
    //     .text(dataset.year);
    //     //.merge(current_chart);
    // year
    //     .exit()
    //     .remove();
};

get_data_from_backup().then(loaded_data => {

    // prepare fetched data
    let amount_of_most_girls_born = -1;
    for (const key in loaded_data) {
        db_girls_born_by_year[key] = {};
        db_girls_born_by_year[key].names = loaded_data[key];

        const amount = accumulate_amount(loaded_data[key]);
        db_girls_born_by_year[key].amount = amount
        if (amount > amount_of_most_girls_born) {
            amount_of_most_girls_born = amount;
        }
    }
    const length = Object.values(db_girls_born_by_year).length;

    const donut_chart = setup_donut_chart(amount_of_most_girls_born);

    const variety_data = [];
    let i = 0;
    const chart_animation_timer = d3.timer((elapsed) => {

        if (elapsed > 2000 * i) {
            const dataset = prepare_dataset_by_index(i, 3);
            variety_data.push({year: dataset.year, ratio: db_girls_born_by_year[dataset.year].names.length / dataset.size});
            update_donut_chart(donut_chart, dataset);
            i = i + 1;
            // chart_animation_timer.stop();
        }

        if (i >= length) {
            chart_animation_timer.stop();
        }

    }, 0);

});
