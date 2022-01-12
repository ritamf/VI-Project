var dropdown_indicator = "cases";
// var dropdown_count = "Normalized" // other dropdown option: "Raw count"
var dropdown_count = "Raw count" // other dropdown option: "Raw count"
var dropdown_year = 2021;
var dropdown_week = 20;

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
    .on('zoom', function () {
        svg
            .selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3.event.transform);
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
            .style("stroke", "transparent")
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
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

        // if (data.get(d.id)[2] != undefined) d3.select("#continent").text("continent: " + data.get(d.id)[2]);
        // if (data.get(d.id)[3] != undefined) d3.select("#population").text("population: " + data.get(d.id)[3]);
    }

    let mouseLeave = function (e, d) {
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
        // d3.select("#continent").text("continent: ");
        // d3.select("#population").text("population: ");

    }

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
        .style("stroke", "transparent")
        .attr("class", "Country")
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)

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
