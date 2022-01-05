
// ADD ELEMENTS 

$(function () {
    $("#countriesDropdown").load("components/countriesDropdown.htm");
});

$(function () {
    $("#continentsDropdown").load("components/continentsDropdown.htm");
});

$(function () {
    $("#indicatorDropdown").load("components/indicatorDropdown.htm");
});

// INTERACTION

let selectedCountry = "Portugal"; // getSelectedCountry(dropdown);
let selectedContinent = "Choose Continent";// getSelectedContinent(dropdown);
let selectedIndicator = "cases"; // getSelectedIndicator(dropdown);



function setSelectedCountry(dropdown) {
    selectedCountry = dropdown.options[dropdown.selectedIndex].text;
    console.log("set " + selectedCountry);
}

function getSelectedCountry() {
    console.log("get " + selectedCountry);
    return selectedCountry;
}

function setSelectedContinent(dropdown) {
    selectedContinent = dropdown.options[dropdown.selectedIndex].text;
    console.log("set " + selectedContinent);
}

function getSelectedContinent() {
    console.log("get " + selectedContinent);
    return selectedContinent;
}

function setSelectedIndicator(dropdown) {
    selectedIndicator = dropdown.options[dropdown.selectedIndex].text;
    console.log("set " + selectedIndicator);
}

function getSelectedIndicator() {
    console.log("get " + selectedIndicator);
    return selectedIndicator;
}

// VISUALIZATION LINE PLOT

let width = 1000;
let height = 300;
let margin = 75;

function draw(data) {

    let selectedCountry = getSelectedCountry();
    let selectedContinent = getSelectedContinent();
    let selectedIndicator = getSelectedIndicator();


    let svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin * 3 / 4)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Number of " + selectedIndicator + " in " + selectedCountry);

    data = data.filter(d => d.country == selectedCountry && d.indicator == selectedIndicator); // TODO: update plot after filtering info

    // The scale does not have extent, as it need all the values
    let x_extent = data.map(d => d.year_week);
    let x_scale = d3.scalePoint()
        .range([margin, width - margin])
        .domain(x_extent);

    // returns a two-size array with min and max values of y from data
    let y_extent = d3.extent(data, d => d.cumulative_count);
    let y_scale = d3.scaleLinear()
        .range([height - margin, margin])
        .domain([0, y_extent[1]]); // adding 0 to let all points have the same base

    let circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d, i) => x_scale(d.year_week))
        .attr("cy", d => y_scale(d.cumulative_count))
        .attr("r", 1);

    let x_axis = d3.axisBottom(x_scale);
    d3.select("svg")
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(x_axis);

    let y_axis = d3.axisLeft(y_scale);
    d3.select("svg")
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin) + ", 0" + ")")
        .call(y_axis);


    let line = d3.line()
        .x((d, i) => x_scale(d.year_week))
        .y(d => y_scale(d.cumulative_count));

    d3.select("svg")
        .append("path")
        .attr("d", line(data))
        .attr("class", "linha");
}

d3.json("datasets/cases_deaths/cases_deaths.json")
    .then(draw)
    .catch(function (err) { console.log(err) });