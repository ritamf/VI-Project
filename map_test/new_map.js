var dropdown_indicator = "cases";
var dropdown_count = "Normalized" // other dropdown option: "Raw count"
var dropdown_year = 2021;
var dropdown_week = 20;

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
.then(geodata => {console.log(geodata);
    d3.json("cases_deaths.json")
    .then(covidData => {
        // console.log(geodata);
        let preProcessedCovidData = preProcessCovidData(covidData);
        console.log(preProcessedCovidData);
        joinedFeatureArray = geodata.features.map(feature => {
            feature.properties.covid = preProcessedCovidData.get(feature.properties.adm0_a3_is)
            return feature});
        // console.log(joinedFeatureArray);
        draw(joinedFeatureArray);
    })
})
.catch( err => {console.log(err)});

function draw(geo_data) {

    let mouseOver = function (e, d) {
        console.log(d);
        let data_value = "-";
        if (d.properties.covid != undefined) {
            if (d.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week) != undefined) {
                if (dropdown_count == "Normalized") {
                    data_value = d.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].normalized.toExponential(3);
                } else {
                    data_value = d.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].weekly_count;
                }
            }
        }
        d3.select("#countryCode").text(data_value);
    }
    
    let mouseLeave = function (e, d) {
        d3.select("#countryCode").text("mouse over off")
    }

    let margin = 75,
        width = 1400,
        height = 600;

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    const zoomed = d3.zoom()
        .scaleExtent([0.8, 8])
        .on('zoom', function () {
            svg
                .selectAll('path') // To prevent stroke width from scaling
                .attr('transform', d3.event.transform);
        });
    
    svg.call(zoomed);

    let map = svg.append("g")
        .attr('class', 'map');

    let projection = d3.geoMercator();

    colorScale = d3.scaleThreshold()
    .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
    .range(d3.schemeBlues[7]);

    let path = d3.geoPath(projection);
    map.selectAll("path")
        .data(geo_data)
        .join("path")
            .attr("d", feature => {
                // console.log(feature.properties.hasOwnProperty("covid"));
                // console.log(feature.properties.covid.get(dropdown_indicator) == undefined);
                return path(feature)})
            .attr("fill", feature => {
                let data_value = "black";
                if (feature.properties.covid != undefined) {
                    if (feature.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week) != undefined) {
                        if (dropdown_count == "Normalized") {
                            data_value = colorScale(feature.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].normalized);
                        } else {
                            data_value = colorScale(feature.properties.covid.get(dropdown_indicator).get(dropdown_year).get(dropdown_week)[0].weekly_count);
                        }
                    }
                }
                return data_value;
            })
            .on("mouseover", (d,e) => mouseOver(d,e))
            .on("mouseleave", (d,e) => mouseLeave(d,e));

};

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
