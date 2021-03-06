var dropdown_continent = "Europe";
var dropdown_indicator = "cases";
var dropdown_count = "Normalized" // other dropdown option: "Raw count"
var dropdown_year = 2021;
var dropdown_week = 20;

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 140, left: 100},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([height, 0]);
          
// append a 'group' element to 'svg-bar-plot'
// moves the 'group' element to the top left margin
var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// get the data
d3.csv("datasets/cases_deaths/cases_deaths.csv").then(function(data) {

  preProcessedData = preProcessCovidData(data);
  preProcessedData = preProcessedData.get(dropdown_indicator).get(dropdown_year).get(dropdown_week);

  // filter data so that only rows that contain countries within dropdown_continent and that aren't totals are included
preProcessedData = preProcessedData.filter(d => d.continent===dropdown_continent && d.country.indexOf("(total)") === -1); // d.continent===selectedContinent; or ["Portugal","Spain"].includes(d.country) for debugging purposes

  // Scale the range of the data in the domains
  x.domain(preProcessedData.map(function(d) { return d.country; }));
  y.domain([0, d3.max(preProcessedData, function(d) { return dropdown_count == "Raw"? d.weekly_count : d.normalized; })])
    .nice();

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
        .attr("x", width / 2)
        .attr("y", margin * 3 / 4)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Number of " + titleIndicator + " in " + dropdown_continent.replace("(total continent)",""));

  // append the rectangles for the bar chart
  svg.selectAll(".bar")
    .data(preProcessedData)
    .join("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.country); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(dropdown_count == "Raw"? d.weekly_count : d.normalized); })
      .attr("height", function(d) { return height - y(dropdown_count == "Raw"? d.weekly_count : d.normalized); })
      .style("fill", function (d) { return "rgb(0, 0, " +  100 + ")"; });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        // .attr("text-anchor", "left")
        .style("text-anchor", "end")
        .style("font-size", "12px")
        .attr("dx", "-.8em")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-90)");
        // .attr("transform", "rotate(90 0 0)");

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

});

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
        group1 => group1.indicator,
        group2 => group2.year,
        group3 => group3.week);

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