// setup
const ZOOM_FACTOR = 0.5;
const KEY_ID_NUMBER = "anzahl";
const KEY_ID_NAME = "vorname";


const accumulate_amount = database => database.reduce((prev, curr, index, array) => prev + curr[KEY_ID_NUMBER], 0);

const prepare_dataset_by_index = function (database, index, number_of_places) {

    const current_key = Object.keys(database)[index];

    let current_dataset = database[current_key].names;
    if (current_dataset[0].hasOwnProperty("position")) {
        current_dataset = current_dataset.filter(name => name.position === 1);
    }

    const size = database[current_key].amount;

    const data_snippet = current_dataset.slice(0, number_of_places);
    const remaining = size - accumulate_amount(data_snippet);
    data_snippet.push({vorname: "sonstige", anzahl: remaining});

    const unique_names = current_dataset.filter(name => name.anzahl === 1);
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

    const COLOR_SCALE = d3.scaleOrdinal(d3.schemeDark2);
    const BASE_1000 = d3.transition().duration(1000).ease(d3.easeLinear);


    const prepared_data = dataset.data;
    console.log(prepared_data);

    const side = calculate_side(dataset.size);
    const margin = 50;
    const radius = side / 2 - margin;

    const data_as_arcs = d3.pie()
        .value(d => d[KEY_ID_NUMBER])
        (prepared_data);

    const inner_arc = d3.arc()
        .innerRadius(radius * 0.5) // size of donut hole
        .outerRadius(radius * 0.8);
    
    const labels_arc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const slices = chart.select(".Slices").selectAll("path.Slice")
        .data(data_as_arcs);

    slices
        .enter()
        .append("path")
        .attr("class", "Slice")
        .merge(slices)
        // .attr("stroke", "white")
        .transition(BASE_1000)
        .style("fill", color => COLOR_SCALE(color))
        .attr("d", inner_arc);

    slices.exit()
        .remove();

    const lines = chart.select(".Lines").selectAll("polyline")
        .data(data_as_arcs);
    
    lines.enter()
        .append("polyline");
    
    lines.transition(BASE_1000)
        .attrTween("points", function (d) {
            this._current = this._current || d;
			const interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				const d2 = interpolate(t);
				const pos = labels_arc.centroid(d2);
				pos[0] = radius * 0.95 * (calculate_mid_angle(d2) < Math.PI ? 1 : -1);
				return [inner_arc.centroid(d2), labels_arc.centroid(d2), pos];
			};			
        });

    lines
        .exit()
        .remove();
    
    const labels = chart.select(".Labels").selectAll("text")
        .data(data_as_arcs);
    console.log(data_as_arcs);

    labels.enter()
        .append("text")
        .attr("dy", ".3em") // HARD CODED
        .text(d => d.data[KEY_ID_NAME]);

    labels.transition(BASE_1000)
        .attrTween("transform", function (d) {
            this._current = this._current || d;
			const interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function (t) {
				var d2 = interpolate(t);
				var pos = labels_arc.centroid(d2);
				pos[0] = radius * (calculate_mid_angle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
        }).styleTween("text-anchor", function(d){
			this._current = this._current || d;
			const interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return calculate_mid_angle(d2) < Math.PI ? "start":"end";
			};
		});

    labels
        .exit()
        .remove();

    chart.select(".Year")
        .text(dataset.year);
};

const visualize = function (database, maximum) {


    const length = Object.values(database).length;

    const donut_chart = setup_donut_chart(maximum);

    const variety_data = [];
    let i = 0;
    const chart_animation_timer = d3.timer((elapsed) => {

        if (elapsed > 2000 * i) {
            const dataset = prepare_dataset_by_index(database, i, 3);

            variety_data.push({year: dataset.year, ratio: database[dataset.year].names.length / dataset.size});

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
