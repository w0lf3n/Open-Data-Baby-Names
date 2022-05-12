/* global d3 */

const COLOR_BLUE = "#11abc1";
const COLOR_DEFAULT = "#ddedf4";
const COLOR_GREEN = "#4bac3f";
const COLOR_RED = "#df3062";


let baby_names = null;
let current_index = null;
const comparison_result = {};

let container = null;
let girls_table = null;
let girls_ranking_table = null;
let boys_table = null;
let boys_ranking_table = null;
let display_year = null;

const get_fill_color = (name) => {

    const current = comparison_result[name];
    if (current.old === 0) {
        return COLOR_GREEN; // new entry
    } else if (current.old === -1) {
        return COLOR_BLUE; // reentry
    }
    return COLOR_DEFAULT;
};

/**
 *
 * @param {string} name
 * @param {boolean} initial
 * 
 * @returns {{current: string, best: string}}
 */
const get_positions = (name, initial = false) => {
    const current = comparison_result[name];
    let best = "-";
    if (!initial && current.best > 0 && current.old !== 0) {
        best = current.best;
    }

    return {current: String(current.now), best: String(best)};
};

/**
 * @param {string} name 
 *
 * @returns {{symbol: string, color: string}}
 */
const get_change_symbol = (name) => {
    const current = comparison_result[name];
    let symbol = "";
    let color = "";
    if (current.old > current.now) {
        symbol = "▲";
        color = COLOR_GREEN;
    } else if (current.old < current.now) {
        symbol = "▼";
        color = COLOR_RED;
    }
    return {symbol, color};
};

const update_comparison = (dataset, initial = false) => {
    dataset.forEach(entry => {
        let current = comparison_result[entry.name] || null;
        if (current) {
            // remember best position
            if (current.now > 0 && current.best > current.now) {
                current.best = current.now;
            }
            current.old = current.now;
            current.now = entry.pos;
            if (current.now === 1) {
                current.count = current.count + 1;
            }
        } else {
            // new entry in table
            comparison_result[entry.name] = {
                best: entry.pos,
                now: entry.pos,
                old: (initial) ? entry.pos : 0,
                count: (entry.pos === 1) ? 1 : 0
            };
        }
    });
};

const update_name_on_exit = (name) => {
    comparison_result[name].now = -1;
};

const enterRects = (enter, initial = false) => enter
    .append("p")
    .attr("class", "Entry")
    .style("opacity", 0)
    .style("transform", `translateY(${350}px)`)
    .call(p => {
        const text = p;
        p.transition()
            .duration(initial ? 0 : 1000)
            .style("transform", (_d, i) => `translateY(${i * 30}px)`)
            .style("background-color", (d, _i) => get_fill_color(d.name))
            .style("opacity", 0.7);

        text.append("span").attr("class", "CurrentPosition").text(d => get_positions(d.name).current);
        text.append("span").attr("class", "BestPosition").text(d => get_positions(d.name, initial).best);
        text.append("span").attr("class", "Name").text(d => d.name);
        text.append("span").attr("class", "Change");
    });

const updateRects = (update) => update
    .call(p => p.transition()
        .duration(1000)
        .style("transform", (_d, i) => `translateY(${i * 30}px)`)
        .style("background-color", COLOR_DEFAULT))
    .call(p => p.select(".CurrentPosition").text(d => get_positions(d.name).current))
    .call(p => p.select(".BestPosition").text(d => get_positions(d.name).best))
    .call(p => p.select(".Name").text(d => d.name))
    .call(p => p.select(".Change").text(function (d) {
        const {symbol, color} = get_change_symbol(d.name);
        d3.select(this).style("color", color);
        return symbol;
    }));

const exitRects = (exit) => exit
    .call(p => p.style("backgroud-color", COLOR_RED))
    .call(p => p
        .transition()
        .duration(1000)
        .style("transform", (d) => { update_name_on_exit(d.name); return `translateY(${350}px)`; })
        .style("opacity", 0)
        .remove());

const update_data_table = (table, data, initial = false) => {
console.log(data);

    table.selectAll("p")
    .data(data, d => d.name)
    .join(
        enter => enterRects(enter, initial),
        update => updateRects(update),
        exit => exitRects(exit)
    )
};

const update_presentation = (initial = false) => {

    let current_dataset = baby_names[current_index];
    let year = current_dataset.year;
    if (year.includes("W")) {
        year = year.substring(0, 4) + " ohne neue Bundesländer";
    } else if (year.includes("O")) {
        year = year.substring(0, 4) + " mit neuen Bundesländern";
    }
    display_year.textContent = year;

    update_comparison(current_dataset.girls, initial);
    update_comparison(current_dataset.boys, initial);

    update_data_table(girls_table, current_dataset.girls, initial);
    update_data_table(boys_table, current_dataset.boys, initial);

    update_data_table(girls_ranking_table, Object.values(comparison_result).filter(name => name.count > 0), initial);
    update_data_table(boys_ranking_table, Object.values(comparison_result).filter(name => name.count > 0), initial);

};

const create_table = (name) => {

    const dom_table = document.createElement("div");
    dom_table.className = "Table";
    container.appendChild(dom_table);

    const title = document.createElement("p");
    title.className = "Title";
    title.textContent = name;
    dom_table.appendChild(title);

    return d3.select(dom_table)
        .append("div")
        .attr("class", "Data");
};

const init = (data) => {

    baby_names = data;

    container = document.createElement("div");
    container.className = "Container";
    document.body.appendChild(container);

    girls_table = create_table("girls");
    boys_table = create_table("boys");
    girls_ranking_table = create_table("girls rankings");
    boys_ranking_table = create_table("boys rankings");

    display_year = document.createElement("p");
    display_year.className = "Year";

    const button_prev_year = document.createElement("button");
    button_prev_year.textContent = "<";
    button_prev_year.addEventListener("click", () => {

        current_index = current_index + 1;
    
        // omit certain datasets
        while (baby_names[current_index].year.endsWith("O") && current_index < baby_names.length) {
            current_index = current_index + 1;
        }

        if (current_index >= baby_names.length) {
            current_index = 0;
        }
    
        update_presentation();
    });
    button_prev_year.setAttribute("disabled", "disabled");

    const button_next_year = document.createElement("button");
    button_next_year.textContent = ">";
    button_next_year.addEventListener("click", () => {

        current_index = current_index - 1;

        // omit certain datasets
        while (baby_names[current_index].year.endsWith("O") && current_index >= 0) {
            current_index = current_index - 1;
        }

        if (current_index < 0) {
            current_index = baby_names.length - 1;
        }
    
        update_presentation();
    });

    const controls = document.createElement("div");
    controls.className = "Controls";
    controls.append(button_prev_year, display_year, button_next_year);
    container.appendChild(controls);

    current_index = baby_names.length - 1;
    update_presentation(true);
};

fetch("dat/gfds.json").then(response => response.json())
    .then((result) => init(result));

// TODO
// create legend

// count and display number of 1st, 2nd and 3rd places -> circle in medal color gold, silver, bronce with number count in it

// count number of reentries

// show line graph of selected name
