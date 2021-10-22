
import {accumulate_amount} from "./helper.js";


// setup
const ZOOM_FACTOR = 0.5;

let Keys = null;
let Chart = null;


const createObject = function (...key_value_pairs) {
    const obj = {};
    if (key_value_pairs instanceof Array && key_value_pairs.length % 2 === 0) {
        for (let i = 0; i < key_value_pairs.length; i = i + 2) {
            obj[key_value_pairs[i]] = key_value_pairs[i + 1];
        }
    }
    return obj;
};

/** @type {Array<string>} */
let legacy_names = [];
const LEGACY_TRESHOLD = 10;
const prepare_dataset_by_index = function (current_dataset, key, maximum, number_of_places) {

    if (current_dataset[0].hasOwnProperty(Keys.range.key)) {
        current_dataset = current_dataset.filter(set => set[Keys.range.key] <= Keys.range.max);
    }

    const data_snippet = [];
    legacy_names.forEach(name => {
        const foundItem = current_dataset.find(elem => elem[Keys.id.key] === name && elem[Keys.quantity.key] >= LEGACY_TRESHOLD);
        if (foundItem) {
            data_snippet.push(foundItem);
        }
    });

    console.log("legacy: " + JSON.stringify(legacy_names));
    console.log("snippet: " + JSON.stringify(data_snippet));

    if (number_of_places > current_dataset.length) {
        number_of_places = current_dataset.length;
    }
    for (let i = 0; i < number_of_places; i = i + 1) {
        const temp_data = current_dataset[i];
        const temp_name = temp_data[Keys.id.key];
        if (!legacy_names.includes(temp_name)) {
            data_snippet.push(temp_data);
        }
    }
    legacy_names = data_snippet.map(elem => elem[Keys.id.key]);

    console.log("legacy: " + JSON.stringify(legacy_names));
    console.log("snippet: " + JSON.stringify(data_snippet));

    // TODO replace "sonstige" with variable
    const remaining = maximum - accumulate_amount(data_snippet, Keys.quantity.key);
    data_snippet.push(createObject(Keys.id.key, "sonstige", Keys.quantity.key, remaining));

    // TODO replace "einzigartig" with variable
    const unique_names = current_dataset.filter(set => set[Keys.quantity.key] === 1);
    data_snippet.push(createObject(Keys.id.key, "einzigartig", Keys.quantity.key, unique_names.length));

    return {data: data_snippet, size: maximum, title: key};
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

const color_scale = d3.scaleOrdinal(d3.schemeTableau10);

const update_donut_chart = function (dataset) {

    const prepared_data = dataset.data;
    console.log(JSON.stringify(prepared_data));

    const side = calculate_side(dataset.size);
    const margin = 50;
    const radius = side / 2 - margin;

    // TODO replace strings with integer
    color_scale.domain(["sonstige", "einzigartig", ...legacy_names]);

    const data_as_arcs = d3.pie()
        .value(d => d[Keys.quantity.key])
        (prepared_data);

    const inner_arc = d3.arc()
        .innerRadius(radius * 0.5) // size of donut hole
        .outerRadius(radius * 0.8);
    
    const label_arc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const slices = Chart.select(".Slices").selectAll("path.Slice")
        .data(data_as_arcs);
    // console.log(color_scale("Sophie"));
    slices
        .enter()
        .append("path")
        .attr("class", "Slice")
        .merge(slices)
        .style("fill", d => color_scale(d.data[Keys.id.key]))
        .transition().duration(1000)
        .attr("d", inner_arc);

    // const lines = Chart.select(".Lines").selectAll("polyline")
    //     .data(data_as_arcs);
    
    // lines.enter()
    //     .append("polyline")
    //     .merge(lines)
    //     .transition().duration(1000)
    //         .attr('points', d => [inner_arc.centroid(d), label_arc.centroid(d)]);
    
    // const labels = Chart.select(".Labels").selectAll("text")
    //     .data(data_as_arcs);

    // labels.enter()
    //     .append("text")
    //     .merge(labels)
    //     .attr("dy", ".3em") // HARD CODED
    //     .transition().duration(1000)
    //     .text(d => d.data[Keys.id.key])
    //         .attr('transform', d => `translate(${label_arc.centroid(d)})`)
    //         .style('text-anchor', d => calculate_mid_angle(d) < Math.PI ? "start" : "end");

    const legend = Chart.select(".Legend");

    legend.selectAll("circle")
        .data(color_scale.domain())
        .enter()
        .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => i * 25)
            .attr("r", 7)
            .style("fill", d => color_scale(d));
    // console.log(color_scale("Sophie"));
    legend.selectAll("text")
        .data((color_scale.domain()))
        .enter()
        .append("text")
            .attr("x", 20)
            .attr("y", (d, i) => 5 + i * 25)
            .style("fill", d => color_scale(d))
            .text(d => d)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");

    Chart.select(".Year")
        .text(dataset.title);
};

const get_all_value_maxima = function (datasource, quantity_key) {
    const maxima = [];
    for (const key in datasource) {
        maxima.push(accumulate_amount(datasource[key], quantity_key));
    }
    return maxima;
};

const visualize = function (datasource, encoding) {

    // TODO check encoding correctness
    Keys = encoding;

    const maxima = get_all_value_maxima(datasource, Keys.quantity.key);
    Chart = setup_donut_chart(Math.max(...maxima));

    const length = Object.values(datasource).length;
    let i = 0;
    const chart_animation_timer = d3.timer((elapsed) => {

        if (elapsed > 2000 * i) {

            const current_key = Object.keys(datasource)[i];
            update_donut_chart(prepare_dataset_by_index(
                datasource[current_key],
                current_key,
                maxima[i],
                3
            ));

            i = i + 1;
            
            // chart_animation_timer.stop();
        }

        if (i >= length) {
            chart_animation_timer.stop();
        }

    }, 0);

};


export {visualize};
