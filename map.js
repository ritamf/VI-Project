// ADD DROPDOWNS

// note: indicator, raw_normalized and year dropdowns have already been created in index.html

let dropdownWeekNum = document.getElementById('weekNumDropdown');
dropdownWeekNum.length = 0;

for (let i = 1; i <= 53; i++) {
    option = document.createElement('option');
    option.text = "#"+i; //weekToString(i);
    option.value = i;
    if (i == 1) option.selected = "selected"; // default week number is selected here
    dropdownWeekNum.add(option);
}


var dropdown_indicator = document.getElementById("indicatorDropdown").value; // "cases" (default) or "deaths"
var dropdown_count = document.getElementById("countDropdown").value; // "Normalized" (default) or "Raw"  
var dropdown_year = +document.getElementById("yearDropdown").value; // "2020" (default) or "2021"
var dropdown_week = +document.getElementById("weekNumDropdown").value; // week 1 (default) to 53

var max_normalized = 0;
var max_raw = 0;

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

colorScale = d3.scaleLinear()
    .domain([0, dropdown_count == "Raw count"? 10000: 0.001])
    .range(["white", "red"]);

// zoom
const zoom = d3.zoom()
    .scaleExtent([0.8, 8])
    .on('zoom', function (e) {
        svg
            .selectAll('path')
                .attr('transform', e.transform);
    });

svg.call(zoom);

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
.then(geodata => {
    d3.json("datasets/cases_deaths/cases_deaths.json")
    .then(covidData => {
        let preProcessedCovidData = preProcessCovidData(covidData);
        console.log(preProcessedCovidData);
        joinedFeatureArray = geodata.features.map(feature => {
            feature.covid = preProcessedCovidData.get(feature.id)
            return feature});
        console.log(joinedFeatureArray);
        console.log(max_normalized, max_raw);
        draw(joinedFeatureArray);
    })
})
.catch( err => {console.log(err)});

function draw(data) {
console.log(data);
    let mouseOver = function (e, d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .5)
            .style("stroke", "grey")
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 2)
            .style("stroke", "black");

        let data_value = "-";
        if (d.covid != undefined) {
            if (d.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week) != undefined) {
                if (dropdown_count == "Normalized") {
                    data_value = d.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].normalized.toExponential(3);
                } else {
                    data_value = d.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].weekly_count;
                }
            }
        }

        d3.select("#countryCode").text("country: " + d.properties.name);
        d3.select("#country").text(e => {
            return dropdown_indicator + ": " + data_value;
        });
    }

    let mouseLeave = function (e, d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", 1)
            .style("stroke", "black")
            .style("stroke-width", 0.2)

        d3.select(this)
            .transition()
            .duration(200)

        d3.select("#countryCode").text("country: ");
        d3.select("#country").text(dropdown_indicator + ": ");

    }

    let titleIndicator;
    if (dropdown_indicator == "cases") {
        titleIndicator = "cases"
        if (dropdown_count == "Normalized") {
            titleIndicator = titleIndicator + " per 100,000 inhabitants";
        }
    } else {
        titleIndicator = "deaths";
        if (dropdown_count == "Normalized") {
            titleIndicator = titleIndicator + " per million inhabitants";
        }
    }

    svg.append("text")
        .attr("x", 300)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Number of " + titleIndicator + " in week " + weekToString(dropdown_week) + " of " + dropdown_year);

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        // set the color of each country
        .attr("fill", feature => {
            let data_value = "black";
            if (feature.covid != undefined) {
                if (feature.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week) != undefined) {
                    if (dropdown_count == "Normalized") {
                        data_value = colorScale(feature.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].normalized);
                    } else {
                        data_value = colorScale(feature.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].weekly_count);
                    }
                }
            }
            return data_value;
        })
            .style("stroke-width", 0.2)
            .style("stroke", "black")
        .attr("class", "Country")
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

    // create legend
    let legend = svg.append("g")
        .attr("class", "legend");
    let gradient = legend.append("linearGradient")
        .attr("id", "svgGradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "0%")
        .attr("y2", "100%");
    gradient.append("stop")
        .attr("class", "start")
        .attr("offset", "0%")
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);
    gradient.append("stop")
        .attr("class", "end")
        .attr("offset", "100%")
        .attr("stop-color", "white")
        .attr("stop-opacity", 1);

    let legend_x_position = 30, legend_y_position = 50, legend_width = 20,
        legend_height = 100, legend_margin = 10, legend_text_offset = 10;

    legend.append("rect")
        .attr("x", legend_x_position - legend_width)
        .attr("y", legend_y_position - legend_margin * 2)
        .attr("width", legend_width * 3)
        .attr("height", legend_height + 2 * legend_margin * 2)
        .attr("stroke", "black")
        .attr("fill", "white");

    legend.append("rect")
        .attr("x", legend_x_position)
        .attr("y", legend_y_position)
        .attr("width", legend_width)
        .attr("height", legend_height)
        .attr("fill", "url(#svgGradient)");
    
    legend.append("text")
        .text(colorScale.domain()[1])
        .attr("x", legend_x_position + legend_width / 2)
        .attr("y", legend_y_position - legend_text_offset)
        .attr("style", "text-anchor:middle;dominant-baseline:middle;");

    legend.append("text")
        .text(colorScale.domain()[0])
        .attr("x", legend_x_position + legend_width / 2)
        .attr("y", legend_y_position + legend_height + legend_text_offset)
        .attr("style", "text-anchor:middle;dominant-baseline:middle;");

}

function preProcessCovidData(data) {
    
    data = data.filter(d => d.hasOwnProperty("weekly_count"));

    let preProcessedData = data.map(d => {
        year = +d.year_week.split("-")[0];
        week = +d.year_week.split("-")[1];
        startDayNr = 1 + (week - 1) * 7;
        startDate = new Date(year, 0, startDayNr);
        d.year_week = startDate;
        d.year = year;
        d.week = week;
        d.week_string = weekToString(week);
        d.weekly_count = +d.weekly_count;
        d.population = +d.population;
        d.normalized = d.weekly_count / d.population;
        if (d.normalized > max_normalized) {
            max_normalized = d.normalized;
        }
        if (d.weekly_count > max_raw) {
            max_raw = d.weekly_count;
        }
        return d;
    });

    groupedData = d3.group(preProcessedData,
        group1 => group1.country_code,
        group2 => group2.indicator,
        group3 => group3.year,
        group4 => group4.week);

    return groupedData;
}

function weekToString(week_nr) {
    startDayNr = 1 + (week_nr - 1) * 7;
    startDate = new Date(year, 0, startDayNr);
    endDate = new Date(year, 0, startDayNr + 6);
    if (startDate.getFullYear() != endDate.getFullYear()) {
        endDate = new Date(startDate.getYear(), 
                            startDate.getMonth(),
                            31)
    }
    const dateFormat = { month: 'short', day: 'numeric' };
    return String(startDate.getDate()).padStart(2,"0") + "/" + String(startDate.getMonth() + 1).padStart(2,"0") + " - " + String(endDate.getDate()).padStart(2,"0") + "/" + String(endDate.getMonth() + 1).padStart(2,"0");
}




// DROPDOWN  - SET SELECTED FUNCTIONS

function setSelectedCount(dropdown) {
    selectedCount = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    console.log("set " + selectedCount);
}

function setSelectedIndicator(dropdown) {
    selectedIndicator = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    console.log("set " + selectedIndicator);
}

function setSelectedWeekNum(dropdown) {
    selectedCountry = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    console.log("set " + selectedCountry);
}

function setSelectedYear(dropdown) {
    selectedIndicator = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    console.log("set " + selectedIndicator);
}
