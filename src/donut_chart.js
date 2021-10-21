
import {accumulate_amount} from "./helper.js";


// setup
const ZOOM_FACTOR = 0.5;
const KEY_ID_NUMBER = "anzahl";
const KEY_ID_NAME = "vorname";


const legacy_names = [];
const prepare_dataset_by_index = function (database, index, number_of_places) {

    const current_key = Object.keys(database)[index];
    /** @type {Array} */
    let current_dataset = database[current_key].names;
    if (current_dataset[0].hasOwnProperty("position")) {
        current_dataset = current_dataset.filter(name => name.position === 1);
    }
    const size = database[current_key].amount;

    const data_snippet = legacy_names.map(name => current_dataset.find(elem => elem[KEY_ID_NAME] === name));

    console.log("legacy: " + JSON.stringify(legacy_names));
    console.log("snippet: " + JSON.stringify(data_snippet));

    if (number_of_places > current_dataset.length) {
        number_of_places = current_dataset.length;
    }
    for (let i = 0; i < number_of_places; i = i + 1) {
        const temp_data = current_dataset[i];
        const temp_name = temp_data[KEY_ID_NAME];
        if (!legacy_names.includes(temp_name)) {
            legacy_names.push(temp_name);
            data_snippet.push(temp_data);
        }
    }
    console.log("legacy: " + JSON.stringify(legacy_names));
    console.log("snippet: " + JSON.stringify(data_snippet));


    const remaining = size - accumulate_amount(data_snippet, KEY_ID_NUMBER);
    data_snippet.push({vorname: "sonstige", anzahl: remaining});

    const unique_names = current_dataset.filter(name => name[KEY_ID_NUMBER] === 1);
    data_snippet.push({vorname: "einizgartig", anzahl: unique_names.length});

    return {data: data_snippet, size, year: current_key};
};

const calculate_side = (number) => (number * ZOOM_FACTOR) / Math.sqrt(2);

// TODO add title
const setup_donut_chart = function (diagonal) {

    const side = calculate_side(diagonal);

    const chart_container = d3.select("body")
	    .append("svg")
        .attr("width", side)
        .attr("height", side);
    
    chart_container.append("g")
        .attr("class", "Legend")
        .attr("transform", "translate(" + (side - 150) + "," + 50 + ")");

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
    console.log(JSON.stringify(prepared_data));

    const side = calculate_side(dataset.size);
    const margin = 50;
    const radius = side / 2 - margin;

    const color_domain = ["sonstige", "einzigartig", ...legacy_names];
    const color_scale = d3.scaleOrdinal()
        .domain(color_domain)
        .range(d3.schemeSet2);

    const data_as_arcs = d3.pie()
        .value(d => d[KEY_ID_NUMBER])
        (prepared_data);

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
        .style("fill", d => color_scale(d))
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

    const legend = chart.select(".Legend");

    legend.selectAll("circle")
        .data(color_scale.domain())
        .enter()
        .append("circle")
            .attr("cx", 0)
            .attr("cy", function(d,i){ return i * 25})
            .attr("r", 7)
            .style("fill", d => color_scale(d));

    legend.selectAll("text")
        .data(color_scale.domain())
        .enter()
        .append("text")
            .attr("x", 20)
            .attr("y", function(d,i){ return 5 + i * 25})
            .style("fill", d => color_scale(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

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
            
            chart_animation_timer.stop();
        }

        if (i >= length) {
            chart_animation_timer.stop();
        }

    }, 0);

};


export {accumulate_amount, visualize};
