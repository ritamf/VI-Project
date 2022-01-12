var selectedContinent = "Europe";


// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 100},
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

  // format the data
  data.forEach(function(d) {
    d.population = +d.population;
    d.weekly_count = +d.weekly_count;
    d.rate_14_day = +d.rate_14_day;
    d.cumulative_count = +d.cumulative_count;
  });

  // filter data so that only rows that contain countries within selectedContinent are included
  data = data.filter(d => d.continent===selectedContinent); // d.continent===selectedContinent; or ["Portugal","Spain"].includes(d.country) for debugging purposes

  // Scale the range of the data in the domains
  x.domain(data.map(function(d) { return d.country; }));
  y.domain([0, d3.max(data, function(d) { return d.population; })]);


  // append the rectangles for the bar chart
  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.country); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.population); })
      .attr("height", function(d) { return height - y(d.population); })
      .style("fill", function (d) { return "rgb(0, 0, " +  100 + ")"; });

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

});