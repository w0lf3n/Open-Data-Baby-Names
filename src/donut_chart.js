
// import {accumulate_amount} from "./helper.js";


// // setup
// const ZOOM_FACTOR = 0.5;

// let Keys = null;
// let Chart = null;


// const createObject = function (...key_value_pairs) {
//     const obj = {};
//     if (key_value_pairs instanceof Array && key_value_pairs.length % 2 === 0) {
//         for (let i = 0; i < key_value_pairs.length; i = i + 2) {
//             obj[key_value_pairs[i]] = key_value_pairs[i + 1];
//         }
//     }
//     return obj;
// };

// /** @type {Array<string>} */
// let legacy_names = [];
// const LEGACY_TRESHOLD = 20;
// const prepare_dataset_by_index = function (current_dataset, key, maximum, number_of_places) {

//     if (current_dataset[0].hasOwnProperty(Keys.range.key)) {
//         current_dataset = current_dataset.filter(set => set[Keys.range.key] <= Keys.range.max);
//     }

//     const data_snippet = [];
//     legacy_names.forEach(name => {
//         const foundItem = current_dataset.find(elem => elem[Keys.id.key] === name && elem[Keys.quantity.key] >= LEGACY_TRESHOLD);
//         if (foundItem) {
//             data_snippet.push(foundItem);
//         }
//     });

//     if (number_of_places > current_dataset.length) {
//         number_of_places = current_dataset.length;
//     }
//     for (let i = 0; i < number_of_places; i = i + 1) {
//         const temp_data = current_dataset[i];
//         const temp_name = temp_data[Keys.id.key];
//         if (!legacy_names.includes(temp_name)) {
//             data_snippet.push(temp_data);
//         }
//     }
//     data_snippet.sort((a, b) => a[Keys.quantity.key] < b[Keys.quantity.key]);
//     legacy_names = data_snippet.map(elem => elem[Keys.id.key]);
    

//     // TODO replace "sonstige" with variable
//     const aggregations = [];
//     const remaining = maximum - accumulate_amount(data_snippet, Keys.quantity.key);
//     aggregations.push(createObject(Keys.id.key, "sonstige", Keys.quantity.key, remaining));

//     // TODO replace "einzigartig" with variable
//     const unique_names = current_dataset.filter(set => set[Keys.quantity.key] === 1);
//     aggregations.push(createObject(Keys.id.key, "einzigartig", Keys.quantity.key, unique_names.length));

//     return {data: data_snippet, aggs: aggregations, size: maximum, title: key};
// };

// const calculate_side = (number) => (number * ZOOM_FACTOR) / Math.sqrt(2);

// // TODO add title
// const setup_donut_chart = function (diagonal) {

//     const side = calculate_side(diagonal);

//     const chart_container = d3.select("body")
// 	    .append("svg")
//         .attr("width", side)
//         .attr("height", side);
    
//     chart_container.append("g")
//         .attr("class", "Legend")
//         .attr("transform", "translate(" + (side - 150) + "," + 50 + ")");

// 	const main_graph = chart_container.append("g")
//         .attr("transform", "translate(" + side / 2 + "," + side / 2 + ")");

//     main_graph.append("g")
//         .attr("class", "Slices");
//     main_graph.append("g")
//         .attr("class", "Labels");
//     main_graph.append("g")
//         .attr("class", "Lines");

//     main_graph.append("text")
//         .attr("class", "Year");
    
//     return chart_container;
// };

// const calculate_mid_angle = arc => arc.startAngle + (arc.endAngle - arc.startAngle) / 2;

// const color_scale = d3.scaleOrdinal(d3.schemeTableau10);

// const update_donut_chart = function (dataset) {

//     const whole_data = [...dataset.aggs, ...dataset.data];

//     const side = calculate_side(dataset.size);
//     const margin = 50;
//     const radius = side / 2 - margin;

//     // console.log(dataset.title, JSON.stringify(dataset.data));
//     // console.log(dataset.title, JSON.stringify(whole_data));

//     color_scale.domain([...whole_data.map(elem => elem[Keys.id.key])]);

//     const data_as_arcs = d3.pie()
//         .value(d => d[Keys.quantity.key])
//         (whole_data);
//     // console.log(data_as_arcs);

//     const inner_arc = d3.arc()
//         .innerRadius(radius * 0.5) // size of donut hole
//         .outerRadius(radius * 0.8);
    
//     const label_arc = d3.arc()
//         .innerRadius(radius * 0.9)
//         .outerRadius(radius * 0.9);

//     const slices = Chart.select(".Slices").selectAll("path.Slice")
//         .data(data_as_arcs);

//     slices
//         .enter()
//         .append("path")
//             .attr("class", "Slice")
//             .style("fill", d => color_scale(d.data[Keys.id.key]))
//             .attr("d", inner_arc)
//         .merge(slices)
//             .style("fill", d => color_scale(d.data[Keys.id.key]))
//             // transition().duration(750).attrTween("d", d => {
//             //     const interpolate = d3.interpolate(this._current, d);
//             //     this._current = interpolate(0);
//             //     return t => arc(interpolate(t));
//             // })
//             .attr("d", inner_arc);

//     slices
//         .exit()
//         .remove();

//     const labels = Chart.select(".Labels").selectAll("text")
//         .data(dataset.aggs);

//     labels.enter()
//         .append("text")
//         .merge(labels)
//         .attr("dy", ".3em") // HARD CODED
//         .text(d => `${d[Keys.id.key]} (${d[Keys.quantity.key]})`)
//             .attr('transform', d => `translate(${label_arc.centroid(data_as_arcs.find(arc => arc.data[Keys.id.key] === d[Keys.id.key]))})`);

//     const legend_circles = Chart.select(".Legend").selectAll("circle")
//         .data(dataset.data);
//     legend_circles
//         .enter() 
//         .append("circle")
//             .attr("cx", 0)
//             .attr("cy", (d, i) => i * 25)
//             .attr("r", 7)
//             .style("fill", d => color_scale(d[Keys.id.key]))
//         .merge(legend_circles);
//     legend_circles.exit().remove();

//     const legend_text = Chart.select(".Legend").selectAll("text")
//         .data(dataset.data);

//     legend_text
//         .enter()
//         .append("text")
//             .attr("x", 20)
//             .attr("y", (d, i) => 5 + i * 25)
//             .style("fill", d => color_scale(d[Keys.id.key]))
//             .text(d => `${d[Keys.id.key]} (${d[Keys.quantity.key]})`)
//             .attr("text-anchor", "left")
//             .style("alignment-baseline", "middle")
//         .merge(legend_text)
//             .text(d => `${d[Keys.id.key]} (${d[Keys.quantity.key]})`)
//     legend_text.exit().remove();

//     Chart.select(".Year")
//         .text(dataset.title);
// };

// const get_all_value_maxima = function (datasource, quantity_key) {
//     const maxima = [];
//     for (const key in datasource) {
//         maxima.push(accumulate_amount(datasource[key], quantity_key));
//     }
//     return maxima;
// };

// const visualize = function (datasource, encoding) {

//     // TODO check encoding correctness
//     Keys = encoding;

//     const maxima = get_all_value_maxima(datasource, Keys.quantity.key);
//     Chart = setup_donut_chart(Math.max(...maxima));

//     const length = Object.values(datasource).length;
//     let i = 0;
//     const chart_animation_timer = d3.timer((elapsed) => {

//         if (elapsed > 2000 * i) {

//             const current_key = Object.keys(datasource)[i];
//             update_donut_chart(prepare_dataset_by_index(
//                 datasource[current_key],
//                 current_key,
//                 maxima[i],
//                 3
//             ));

//             i = i + 1;
            
//             // chart_animation_timer.stop();
//         }

//         if (i >= length) {
//             chart_animation_timer.stop();
//         }

//     }, 0);

// };


const init = function (options) {
    if (options instanceof Object) {

    }
};


export {init};
