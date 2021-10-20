
import {accumulate_amount} from "./helper.js";


// setup
const ZOOM_FACTOR = 0.5;
const KEY_ID_NUMBER = "anzahl";
const KEY_ID_NAME = "vorname";

let names_to_visualize = [];

const prepare_dataset_by_index = function (database, index, number_of_places) {

    const current_key = Object.keys(database)[index];

    let current_dataset = database[current_key].names;
    if (current_dataset[0].hasOwnProperty("position")) {
        current_dataset = current_dataset.filter(name => name.position === 1);
    }

    const size = database[current_key].amount;



    const data_snippet = current_dataset.slice(0, number_of_places);
    console.log(data_snippet);


    const remaining = size - accumulate_amount(data_snippet, KEY_ID_NUMBER);
    data_snippet.push({vorname: "sonstige", anzahl: remaining});

    const unique_names = current_dataset.filter(name => name[KEY_ID_NUMBER] === 1);
    data_snippet.push({vorname: "einizgartig", anzahl: unique_names.length});

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
    main_graph.append("text")
        .attr("class", "Year");

    return chart_container;
};

const calculate_mid_angle = arc => arc.startAngle + (arc.endAngle - arc.startAngle) / 2;

const update_donut_chart = function (chart, dataset) {

    const prepared_data = dataset.data;
    console.log(prepared_data);

    const side = calculate_side(dataset.size);
    const margin = 50;
    const radius = side / 2 - margin;

    const data_as_arcs = d3.pie()
        .value(d => d[KEY_ID_NUMBER])
        (prepared_data);

    // TODO add new domain names if available
    const COLOR_SCALE = d3.scaleOrdinal(d3.schemeCategory10);

    const inner_arc = d3.arc()
        .innerRadius(radius * 0.5) // size of donut hole
        .outerRadius(radius * 0.8);
    
    const label_arc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const slices = chart.select(".Slices").selectAll("path.Slice")
        .data(data_as_arcs);


    slices
        .enter()
        .append("path")
        .attr("class", "Slice")
        .merge(slices)
        .style("fill", color => COLOR_SCALE(color))
        .transition().duration(1000)
        .attr("d", inner_arc);

    const lines = chart.select(".Lines").selectAll("polyline")
        .data(data_as_arcs);
    
    lines.enter()
        .append("polyline")
        .merge(lines)
        .transition().duration(1000)
            .attr('points', d => [inner_arc.centroid(d), label_arc.centroid(d)]);
    
    const labels = chart.select(".Labels").selectAll("text")
        .data(data_as_arcs);

    labels.enter()
        .append("text")
        .merge(labels)
        .attr("dy", ".3em") // HARD CODED
        .transition().duration(1000)
        .text(d => d.data[KEY_ID_NAME])
            .attr('transform', d => `translate(${label_arc.centroid(d)})`)
            .style('text-anchor', d => calculate_mid_angle(d) < Math.PI ? "start" : "end");

    chart.select(".Year")
        .text(dataset.year);
};

const visualize = function (database, maximum) {


    const length = Object.values(database).length;

    const donut_chart = setup_donut_chart(maximum);

    let i = 0;
    const chart_animation_timer = d3.timer((elapsed) => {

        if (elapsed > 2000 * i) {
            const dataset = prepare_dataset_by_index(database, i, 3);

            update_donut_chart(donut_chart, dataset);
            i = i + 1;
            // chart_animation_timer.stop();
        }

        if (i >= length) {
            chart_animation_timer.stop();
        }

    }, 0);

};


export {accumulate_amount, visualize};