var dropdown_indicator = "cases";
var dropdown_year = 2021;
var dropdown_week = 47;


d3.json("custom.geo.json")
.then(geodata => {
    d3.json("cases_deaths.json")
    .then(covidData => {
        console.log(geodata);
        let preProcessedCovidData = preProcessCovidData(covidData);
        console.log(preProcessedCovidData);
        joinedFeatureArray = geodata.features.map(feature => {
            feature.properties.covid = preProcessedCovidData.get(feature.properties.adm0_a3_is)
            return feature});
        console.log(joinedFeatureArray);
        draw(joinedFeatureArray);
    })
})
.catch( err => {console.log(err)});

function draw(geo_data) {

    let margin = 75,
        width = 1400,
        height = 600;

    let svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

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
            .attr("d", feature => path(feature))
            .attr("fill", feature => {
                covid = feature.properties.covid;
                if (covid === undefined) {
                    return "black";
                } else {
                    data = covid.get(dropdown_indicator).get(dropdown_year).filter(line => line.week == dropdown_week)[0];
                    if (data === undefined) {
                        return "black";
                    }
                    console.log(data);
                    return colorScale(data.weekly_count);
                }
            });

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
        return d;
    });

    groupedData = d3.group(preProcessedData,
        group1 => group1.country_code,
        group2 => group2.indicator,
        group3 => group3.year);

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