/* global d3 */

import { has_property } from "./helper.js";


let baby_names = null;
let current_index = null;
let girls_comparison = {};
let boys_comparison = {};

let container = null;
let girls_table = null;
let boys_table = null;
let display_year = null;

const get_fill_color = (name) => {
    const current_name = names_comparison[name];
    if (current_name === undefined) {
        return "#00ff00"; // new entry
    } else if (current_name.prev === -1) {
        return "#00ffff"; // reentry
    }
    return "#dddddd";
};

const create_text = (name, pos) => {
    const current_name = names_comparison[name];
    let symbol = "";
    if (current_name && current_name.prev < pos) {
        symbol = "▲";
    } else if (current_name && current_name.prev > pos) {
        symbol = "▼";
    }
    return `${pos}. ${name} ${symbol}`;
};

const enterRects = (enter) => {
    enter
        .append("g")
        .attr("transform", (d, i) => `translate(${10},${350})`)
        .style("opacity", 0)
        .call(g => g.transition().duration(1000)
            .attr("transform", (d, i) => `translate(${10},${10 + i * 30})`)
            .style("opacity", 1))
        .call(g => g.append("rect")
            .attr("width", 280)
            .attr("height", 25)
            .style("fill", (d, i) => get_fill_color(d.name))
            .style("opacity", 0.8)
            .attr("rx", 3))
        .call(g => g.append("text")
            .attr("x", 5)
            .attr("dy", "1.2em")
            .style("font-size", 14)
            .style("font-family", "sans-serif")
            .text(d => create_text(d.name, d.pos))
            .raise());
};

const updateRects = (update) => update
    .call((g) => g.transition().duration(1000)
        .attr("transform", (d, i) => `translate(${10},${10 + i * 30})`))
    .call(g => g.select("text").text(d => create_text(d.name, d.pos)))
    .call(g => g.select("rect")
        .style("fill", (d, i) => get_fill_color(d.name)));

const exitRects = (exit) => exit.call((g) => g
    .transition()
    .duration(1000)
    .attr("transform", () => `translate(${10},${350})`)
    .style("opacity", 0)
    .remove());

const update_data_table = (table, data) => {
    table.selectAll("g")
    .data(data, d => d.name)
    .join(
        enter => enterRects(enter),
        update => updateRects(update),
        exit => exitRects(exit)
    );
};

const update_comparison = (comparison, dataset) => {

    dataset.forEach(entry => {
        if (has_property(comparison, entry.name)) {
            comparison[entry.name].prev = entry.pos;
        } else {
            comparison[entry.name] = {prev: entry.pos};
        }
    });

    let difference = Object.keys(comparison).filter(x => !dataset.map(entry => entry.name).includes(x));
    console.log(difference);

};

const update = () => {
    let current_dataset = baby_names[current_index];
    display_year.textContent = current_dataset.year;

    update_data_table(girls_table, current_dataset.girls);
    update_data_table(boys_table, current_dataset.boys);

    update_comparison(girls_comparison, current_dataset.girls);
    update_comparison(boys_comparison, current_dataset.boys);

};

const create_table = (name) => {

    const dom_table = document.createElement("div");
    dom_table.className = "Table";
    container.appendChild(dom_table);

    const title = document.createElement("p");
    title.className = "Title";
    title.textContent = name;
    dom_table.appendChild(title);

    const d3_table = d3.select(dom_table)
        .append("svg")
        .attr("width", 300)
        .attr("height", 310);
    
    return d3_table;
};

const init = (data) => {

    baby_names = data;

    container = document.createElement("div");
    container.className = "Container";
    document.body.appendChild(container);

    girls_table = create_table("girls");
    boys_table = create_table("boys");

    display_year = document.createElement("p");
    display_year.className = "Year";

    const button_prev_year = document.createElement("button");
    button_prev_year.textContent = "<";
    button_prev_year.addEventListener("click", () => {
        current_index = current_index + 1;
        if (current_index >= baby_names.length) {
            current_index = 0;
        }
        update();
    });
    button_prev_year.setAttribute("disabled", "disabled");

    const button_next_year = document.createElement("button");
    button_next_year.textContent = ">";
    button_next_year.addEventListener("click", () => {
        current_index = current_index - 1;
        if (current_index < 0) {
            current_index = baby_names.length - 1;
        }
        update();
    });

    const controls = document.createElement("div");
    controls.className = "Controls";
    controls.append(button_prev_year, display_year, button_next_year);
    container.appendChild(controls);

    current_index = baby_names.length - 1;
    update();
};

fetch("dat/gfds.json").then(response => response.json()).then((result) => init(result));

// TODO
// create legend
// mark new entry
// mark reentry
// show rank up = green arrow up
// show rank down = red arrow down
// show steady rank = black disk
// count and display number of 1st, 2nd and 3rd places -> circle in medal color gold, silver, bronce with number count in it
 // count and show top 10 entries ??