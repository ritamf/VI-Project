
// The svg
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
    .scale(70)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Data and declare colorScale
var data = d3.map();
var colorScale;

// Load external data and boot
d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
    .defer(d3.csv, "datasets/cases_deaths/cases_deaths.csv", function (d) {

        data.set(d.country_code, [d.country, d.country_code, d.continent, +d.population, d.indicator, +d.weekly_count, d.year_week, +d.rate_14_day, +d.cumulative_count, d.source]);

        var attribute = +data.get(d.country_code)[3]

        colorScale = d3.scaleThreshold()
            .domain([Math.min(attribute), Math.min(attribute) * 10, Math.min(attribute) * 100, Math.min(attribute) * 3, Math.min(attribute) * 10 / 3, Math.max(attribute)])
            .range(d3.schemeBlues[7]);
    })
    .await(ready);

function ready(error, topo) {

    let mouseOver = function (d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
            .style("stroke", "transparent")
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black");

        d3.select("#countryCode").text("country code: " + d.id);
        if (data.get(d.id)[0] != undefined) d3.select("#country").text("country: " + data.get(d.id)[0]);
        if (data.get(d.id)[2] != undefined) d3.select("#continent").text("continent: " + data.get(d.id)[2]);
        if (data.get(d.id)[3] != undefined) d3.select("#population").text("population: " + data.get(d.id)[3]);
    }

    let mouseLeave = function (d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
            .style("stroke", "transparent")

        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")

        d3.select("#countryCode").text("country code: ");
        d3.select("#country").text("country: ");
        d3.select("#continent").text("continent: ");
        d3.select("#population").text("population: ");

    }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", function (d) {
            var population = data.get(d.id);
            return colorScale(population) || "black";
        })
        .style("stroke", "transparent")
        .attr("class", "Country")
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

}