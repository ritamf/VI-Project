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
        d["year_week"] = startDate;
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

    var x_linear_scale = d3.scaleLinear()
        .range([margin, width - margin])
        .domain([0, data.length - 1])
        .clamp(true);

    var x_extent = d3.extent(data, d => d.year_week);
    var x_time_scale = d3.scaleTime()
        .range([margin, width - margin])
        .domain([x_extent[0], x_extent[1]]);

    // returns a two-size array with min and max values of y from data
    var y_extent = d3.extent(data, d => d.weekly_count);
    var y_scale = d3.scaleLinear()
        .range([height - margin, margin])
        .domain([0, y_extent[1]]);

    var circles = svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x_time_scale(d.year_week))
        .attr("cy", d => y_scale(d.weekly_count))
        .attr("r", 3);

    var x_axis = d3.axisBottom(x_time_scale)
        .ticks(d3.timeMonth.every(1))
        .tickFormat(date => {
            if (d3.timeYear(date) < date) {
            return d3.timeFormat('%b')(date);
            } else {
            return d3.timeFormat('%Y')(date);
            }
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin) + ", 0" + ")")
        .call(y_axis);

    var line = d3.line()
        .x(d => x_time_scale(d.year_week))
        .y(d => y_scale(d.weekly_count));

    svg.append("path")
        .attr("d", line(data))
        .attr("class", "linha");

    let datapointlabel = svg.append("g")
        .attr("class", "datapointlabel")
        .attr("visibility", "hidden");

    let datapointlabel_width = 100,
        datapointlabel_height = 50,
        datapointlabel_margin = 4;
    datapointlabel.append("rect")
            .attr("width", datapointlabel_width)
            .attr("height", datapointlabel_height)
            .attr("x", x_linear_scale(0))
            .attr("y", y_scale(0) - datapointlabel_height / 2)
            .attr("rx", 2)
            .attr("fill", "white")
            .attr("stroke", "black");
    
    datapointlabel.append("text")
        .attr("x", datapointlabel_margin + x_linear_scale(0))
        .attr("y", datapointlabel_margin + y_scale(0) - datapointlabel_height / 2)
        .attr("style", "text-anchor:left;dominant-baseline:hanging;")
        .append("tspan")
        .clone()
        .clone();
        
    function handleMouseOverEvent(e) {

        let mouse = d3.pointer(e),
            data_index = Math.round(x_linear_scale.invert(mouse[0])), 
            draw_area_width = width - margin * 2,
            increment_size = draw_area_width / (data.length - 1),
            relative_x = mouse[0] - margin,
            relative_y = mouse[1] - margin,
            x = data_index * increment_size,
            y = y_scale(data[data_index].weekly_count) - (height - margin);
            console.log(y);
    
        if (relative_x >= 0 && relative_x <= width - margin * 2 &&
            relative_y >= 0 && relative_y <= height - margin * 2 ) {
            svg.select("g.datapointlabel")
                .attr("visibility", "visible")
                .attr("transform","translate(" + x + "," + y + ")")
                .select("text tspan")
                    .text(data[data_index].weekly_count);
        } else {
            svg.select("g.datapointlabel")
                .attr("visibility", "hidden");
        }
    }
        
    svg.on("mouseover", e => handleMouseOverEvent(e))
        .on("mousemove", e => handleMouseOverEvent(e))
        .on("mouseout", e => handleMouseOverEvent(e));
}

d3.json("datasets/cases_deaths/cases_deaths.json")
    .then(data => {
        let preProcessedData = preProcessData(data);
        draw(preProcessedData);
    })
    .catch(function (err) { console.log(err) });
