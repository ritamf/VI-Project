// ADD ELEMENTS 

$(function () {
    $("#country-dropdown").load("components/countriesDropdown.htm");
});

$(function () {
    $("#continents-dropdown").load("components/continentsDropdown.htm");
});

$(function () {
    $("#country-dropdownIndicator").load("components/indicatorDropdown.htm");
});

// INTERACTION

var selectedCountry = "China"; // getSelectedCountry(dropdown);
var selectedContinent = "Choose Continent";// getSelectedContinent(dropdown);
var selectedIndicator = "cases"; // getSelectedIndicator(dropdown);
var selectedYear = 2020;

function preProcessData(data) {

    let preProcessedData = data.map(d => {
        year = +d["year_week"].split("-")[0];
        week = +d["year_week"].split("-")[1];
        startDayNr = 1 + (week - 1) * 7;
        endDayNr = startDayNr + 6;
        startDate = new Date(year, 0, startDayNr);
        endDate = new Date(year, 0, startDayNr + 6);
        d["year_week"] = new Date(year, 0, startDayNr);
        const dateFormat = { month: 'short', day: 'numeric' };
        if (startDate.getYear() == endDate.getYear()) {
            d["date_string"] = String(startDate.getDate()).padStart(2,"0") + "/" + String(startDate.getMonth() + 1).padStart(2,"0") + " - " + String(endDate.getDate()).padStart(2,"0") + "/" + String(endDate.getMonth() + 1).padStart(2,"0");
        } else {
            d["date_string"] = String(startDate.getDate()).padStart(2,"0") + "/" + String(startDate.getMonth() + 1).padStart(2,"0") + " - " + String(endDate.getDate()).padStart(2,"0") + "/" + String(endDate.getMonth() + 1).padStart(2,"0");
        }
        return d;
    });
    
    return preProcessedData;
}

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

var width = 1300;
var height = 400;
var margin = 90;

function draw(data) {

    var selectedCountry = getSelectedCountry();
    var selectedContinent = getSelectedContinent();
    var selectedIndicator = getSelectedIndicator();

    var svg = d3.select('.div-line-plot').append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.append("text") // title of plot is added here
        .attr("x", width / 2)
        .attr("y", margin * 3 / 4)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Number of " + selectedIndicator + " in " + selectedCountry);

    data = data.filter(d => d.country == selectedCountry && d.indicator == selectedIndicator); // TODO: update plot after filtering info
console.log(data);
    // The scale does not have extent, as it need all the values
    var x_extent = data.map((d, i) => i);
    var x_scale = d3.scalePoint()
        .range([margin, width - margin])
        .domain(x_extent);

    // returns a two-size array with min and max values of y from data
    var y_extent = d3.extent(data, d => d.weekly_count);
    var y_scale = d3.scaleLinear()
        .range([height - margin, margin])
        .domain([0, y_extent[1]]);

    var circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", (d, i) => x_scale(i))
        .attr("cy", d => y_scale(d.weekly_count))
        .attr("r", 3);

    var x_axis = d3.axisBottom(x_scale);
    d3.select("svg")
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(x_axis)
        .selectAll("text") // selects all values in the x axis and rotates them 90 degrees 
        .data(data)
        .text(d => d["date_string"])
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .attr("dx", "-.8em")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-80)");

    var y_axis = d3.axisLeft(y_scale);
    d3.select("svg")
        .append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin) + ", 0" + ")")
        .call(y_axis);


    var line = d3.line()
        .x((d, i) => x_scale(i))
        .y(d => y_scale(d.weekly_count));

    d3.select("svg")
        .append("path")
        .attr("d", line(data))
        .attr("class", "linha");
}

d3.json("datasets/cases_deaths/cases_deaths.json")
    .then(data => {
        let preProcessedData = preProcessData(data);
        draw(preProcessedData);
    })
    .catch(function (err) { console.log(err) });
