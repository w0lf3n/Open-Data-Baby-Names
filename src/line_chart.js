
const visualize = function (dataset) {

    // set the dimensions and margins of the graph
    const margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("body")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // group the data: I want to draw one line per group
    const sumstat = d3.group(dataset, d => d.ratio);

    // Add X axis --> it is a date format
    const x = d3.scaleLinear()
        .domain(d3.extent(dataset, d => d.year))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x).ticks(5));
    
    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return +d.ratio; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    const color = d3.scaleOrdinal()

    console.log(sumstat);
    // Draw the line
    svg.selectAll(".line")
        .data(sumstat)
        .join("path")
            .attr("fill", "none")
            .attr("stroke", d => color(d[0]))
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
            return d3.line()
                .x(d => x(d.year))
                .y(d => y(+d.ratio))
                (d[1])
            });

};


export {visualize};
