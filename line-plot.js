// ADD COUNTRIES DROPDOWN

let dropdown = document.getElementById('country-dropdown');

let defaultSelectedText = "Portugal";

const url = 'datasets/cases_deaths/cases_deaths.json';

fetch(url)
    .then(
        function (response) {
            if (response.status !== 200) {
                console.warn('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }

            // Examine the text in the response  
            response.json().then(function (data) {

                let countries = [];

                for (let i = 0; i < data.length; i++) {
                    countries.push(data[i].country);
                }

                let setCountries = Array.from(new Set(countries));

                let option;

                for (let i = 0; i < setCountries.length; i++) {
                    if (!setCountries[i].includes("(total)")) { // countries
                        option = document.createElement('option');
                        option.text = setCountries[i]
                        option.value = setCountries[i]

                        if (defaultSelectedText === setCountries[i]) option.selected = "selected";

                        dropdown.add(option);

                    } else { // continents
                        option = document.createElement('option');
                        option.text = setCountries[i].replace("total", "total continent");
                        option.value = option.text;

                        if (defaultSelectedText === setCountries[i]) option.selected = "selected";

                        dropdown.add(option);
                    }
                }

            });
        }
    )
    .catch(function (err) {
        console.error('Fetch Error -', err);
    });

// ADD INDICATOR DROPDOWN

let dropdownIndicator = document.getElementById('country-dropdownIndicator');
dropdownIndicator.length = 0;

const urlIndicator = 'datasets/cases_deaths/cases_deaths.json';

fetch(urlIndicator)
    .then(
        function (response) {
            if (response.status !== 200) {
                console.warn('Looks like there was a problem. Status Code: ' +
                    response.status);
                return;
            }

            // Examine the text in the response  
            response.json().then(function (data) {

                let indicators = [];

                for (let i = 0; i < data.length; i++) {
                    indicators.push(data[i].indicator);
                }

                let setIndicators = Array.from(new Set(indicators));

                let option;

                for (let i = 0; i < setIndicators.length; i++) {
                    option = document.createElement('option');
                    option.text = setIndicators[i];
                    option.value = setIndicators[i];
                    dropdownIndicator.add(option);

                }

            });
        }
    )
    .catch(function (err) {
        console.error('Fetch Error -', err);
    });


// INTERACTION

var selectedCountry = "Portugal";
var selectedIndicator = "cases";
var selectedCount = "Raw"; // second dropdown option: "Normalized"

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
        group1 => group1.country.replace("total", "total continent"),
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

function setSelectedCountry(dropdown) {
    selectedCountry = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    drawGraph();
    console.log("set " + selectedCountry);
}

function setSelectedIndicator(dropdown) {
    selectedIndicator = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    drawGraph();
    console.log("set " + selectedIndicator);
}

function setSelectedCount(dropdown) {
    selectedCount = dropdown.options[dropdown.selectedIndex].text;
    document.getElementsByTagName("svg")[0].innerHTML = "";
    drawGraph();
    console.log("set " + selectedCount);
}

// VISUALIZATION LINE PLOT

var width = 1300;
var height = 400;
var margin = 90;

var svg = d3.select('.div-line-plot').append('svg')
    .attr('width', width)
    .attr('height', height);

drawGraph();

function drawGraph() {
    d3.json("datasets/cases_deaths/cases_deaths.json")
        .then(data => {
            draw(preProcessCovidData(data));
        })
        .catch(function (err) { console.log(err) });
}

function draw(data) {
    
    let titleIndicator;
    if (selectedIndicator == "cases") {
        titleIndicator = "cases"
        if (selectedCount == "Normalized") {
            titleIndicator = titleIndicator + " per 100,000 inhabitants";
        }
    } else {
        titleIndicator = "deaths";
        if (selectedCount == "Normalized") {
            titleIndicator = titleIndicator + " per million inhabitants";
        }
    }

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin * 3 / 4)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Number of " + titleIndicator + " in " + selectedCountry.replace("(total continent)",""));

    data2020 = data.get(selectedCountry).get(selectedIndicator).get(2020);
    data2021 = data.get(selectedCountry).get(selectedIndicator).get(2021);

    if (data2020 == undefined) {
        data2020 = [];
    }
    if (data2021 == undefined) {
        data2021 = [];
    }
    
    var x_linear_scale = d3.scaleLinear()
        .range([margin, width - margin])
        .domain([1, 53])
        .clamp(true);

    week_nrs = d3.range(1, 54);
    var x_scale = d3.scalePoint()
        .range([margin, width - margin])
        .domain(week_nrs);

    let y_max = d3.max([d3.max(data2020, d => selectedCount == "Raw"? d.weekly_count : d.normalized),
                        d3.max(data2021, d => selectedCount == "Raw"? d.weekly_count : d.normalized)]);
    var y_scale = d3.scaleLinear()
        .range([height - margin, margin])
        .domain([0, y_max])
        .nice();

    svg.selectAll("circle.series2020")
        .data(data2020)
        .join("circle")
        .attr("cx", d => x_scale(d.week))
        .attr("cy", d => y_scale(selectedCount == "Raw"? d.weekly_count : d.normalized))
        .attr("r", 3)
        .attr("class", "series2020");

    svg.selectAll("circle.series2021")
        .data(data2021)
        .join("circle")
        .attr("cx", d => x_scale(d.week))
        .attr("cy", d => y_scale(selectedCount == "Raw"? d.weekly_count : d.normalized))
        .attr("r", 3)
        .attr("class", "series2021");

    var x_axis = d3.axisBottom(x_scale);

    let tick_labels = [""];
    for (let i = 1; i < 53; i++) {
        previousDateDayNr = 1 + (i - 1) * 7;
        previousDate = new Date(year, 0, previousDateDayNr);
        currentDateDayNr = 1 + (i) * 7;
        currentDate = new Date(year, 0, currentDateDayNr);
        if (previousDate.getMonth() == currentDate.getMonth()) {
            tick_labels.push("");
        } else {
            if (previousDate.getFullYear() == currentDate.getFullYear()) {
                tick_labels.push(d3.timeFormat('%b')(currentDate));
            } else {
                tick_labels.push(d3.timeFormat('%Y')(currentDate));
            }
        }
    }
    

    x_axis.tickFormat((date, i) => tick_labels[i]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - margin) + ")")
        .call(x_axis);

    var y_axis = d3.axisLeft(y_scale);
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (margin) + ", 0" + ")")
        .call(y_axis);

    var line2020 = d3.line()
        .x((d, i) => x_scale(d.week))
        .y(d => y_scale(selectedCount == "Raw"? d.weekly_count : d.normalized));

    svg.append("path")
        .attr("d", line2020(data2020))
        .attr("class", "line series2020");

    var line2021 = d3.line()
        .x((d, i) => x_scale(d.week))
        .y(d => y_scale(selectedCount == "Raw"? d.weekly_count : d.normalized));

    svg.append("path")
        .attr("d", line2021(data2021))
        .attr("class", "line series2021");

    let legend_width = 70,
        legend_height = 45,
        legend_margin = 4,
        legend_x_position = width - margin;
        legend_y_position = height / 2 - legend_height / 2,
        legend_text_offset = 10,
        legend_line_length = 20,
        text_line_height = 16,
        text_x = legend_x_position + legend_line_length + legend_margin * 2
        text_y = legend_y_position + legend_margin + legend_text_offset;
    
    let legend = svg.append("g")
        .attr("class", "legend");
    legend.append("rect")
        .attr("width", legend_width)
        .attr("height", legend_height)
        .attr("x", legend_x_position)
        .attr("y", legend_y_position)
        .attr("fill", "white")
        .attr("stroke", "black");
    let legend_text = legend.append("text")
        .attr("class", "legend")
        .attr("style", "text-anchor:left;dominant-baseline:middle;");
    legend_text.append("tspan")
        .attr("class", "week")
        .attr("style", "font-weight: normal;")
        .attr("x", text_x)
        .attr("y", text_y + 1)
        .text("2020");
    legend_text.append("tspan")
        .text("2020: ")
        .attr("x", text_x)
        .attr("dy", text_line_height)
        .text("2021");
    legend.append("path")
        .attr("d", "M" + (legend_x_position + legend_margin) + "," + text_y + "L" + (text_x - legend_margin) + "," + text_y )
        .attr("class", "line series2020");
        legend.append("path")
        .attr("d", "M" + (legend_x_position + legend_margin) + "," + (text_y + text_line_height) + "L" + (text_x - legend_margin) + "," + (text_y + text_line_height) )
        .attr("class", "line series2021");
    legend.append("circle")
        .attr("cx", legend_x_position + legend_margin + legend_line_length / 2)
        .attr("cy", text_y)
        .attr("r", 3)
        .attr("class", "series2020");
    legend.append("circle")
        .attr("cx", legend_x_position + legend_margin + legend_line_length / 2)
        .attr("cy", text_y + text_line_height)
        .attr("r", 3)
        .attr("class", "series2021");

    let datapointlabel_width = 150,
        datapointlabel_height = 55,
        datapointlabel_margin = 4,
        datapointlabel_x_origin = x_linear_scale(1)
        datapointlabel_y_origin = y_scale(0) - (height - margin),
        datapoint_label_offset = 4,
        vertical_line_path = d3.path(),
        triangle_path = d3.path(),
        triangle_size = 2;

    let datapoint_label = svg.append("g")
        .attr("class", "datapointlabel")
        .attr("visibility", "hidden");

    svg.append("circle")
        .attr("class", "datapointlabel series2020")
        .attr("cx", datapointlabel_x_origin)
        .attr("cy", datapointlabel_y_origin)
        .attr("r", 3)
        .attr("style", "opacity:0.7;fill:black;");
    
    svg.append("circle")
        .attr("class", "datapointlabel series2021")
        .attr("cx", datapointlabel_x_origin)
        .attr("cy", datapointlabel_y_origin)
        .attr("r", 3)
        .attr("style", "opacity:0.7;fill:black;");
    
    vertical_line_path.moveTo(datapointlabel_x_origin, y_scale.range()[0]);
    vertical_line_path.lineTo(datapointlabel_x_origin, y_scale.range()[1]);
    vertical_line = svg.append("path")
        .attr("d", vertical_line_path.toString())
        .attr("style", "opacity:0.4;")
        .attr("visibility", "hidden");

    triangle_path.moveTo(datapointlabel_x_origin, datapointlabel_y_origin - datapoint_label_offset);
    triangle_path.lineTo(datapointlabel_x_origin - triangle_size,
                         datapointlabel_y_origin - triangle_size - datapoint_label_offset);
    triangle_path.lineTo(datapointlabel_x_origin + triangle_size,
                         datapointlabel_y_origin - triangle_size - datapoint_label_offset);
    triangle_path.closePath();
    datapoint_label.append("path")
        .attr("d", triangle_path.toString())
        .attr("fill", "black");

    datapoint_label.append("rect")
            .attr("width", datapointlabel_width)
            .attr("height", datapointlabel_height)
            .attr("x", datapointlabel_x_origin - datapointlabel_width / 2)
            .attr("y", datapointlabel_y_origin - datapointlabel_height - datapoint_label_offset - triangle_size)
            .attr("rx", 2)
            .attr("fill", "white")
            .attr("stroke", "black");
    
    let datapointlabel_text = datapoint_label.append("text")
        .attr("x", datapointlabel_x_origin + datapointlabel_margin - datapointlabel_width / 2)
        .attr("y", datapointlabel_y_origin + datapointlabel_margin - datapoint_label_offset - triangle_size - datapointlabel_height)
        .attr("class", "datapointlabel")
        .attr("style", "text-anchor:left;dominant-baseline:hanging;")
        
    datapointlabel_text.append("tspan")
        .text("Week: ")
        .attr("style", "font-weight: bold;");
    datapointlabel_text.append("tspan")
        .attr("class", "week")
        .attr("style", "font-weight: normal;");
    datapointlabel_text.append("tspan")
        .text("2020: ")
        .attr("dy", "1.4em")
        .attr("x", datapointlabel_x_origin + datapointlabel_margin - datapointlabel_width / 2 - datapoint_label_offset + datapointlabel_margin)
        .attr("style", "font-weight: bold;");
    datapointlabel_text.append("tspan")
        .attr("class", "count2020")
        .attr("style", "font-weight: normal;");
    datapointlabel_text.append("tspan")
        .text("2021: ")
        .attr("dy", "1.4em")
        .attr("x", datapointlabel_x_origin + datapointlabel_margin - datapointlabel_width / 2 - datapoint_label_offset + datapointlabel_margin)
        .attr("style", "font-weight: bold;");
    datapointlabel_text.append("tspan")
        .attr("class", "count2021")
        .attr("style", "font-weight: normal;");

    svg.on("mouseover", e => handleMouseOverEvent(e))
        .on("mousemove", e => handleMouseOverEvent(e))
        .on("mouseout", e => handleMouseOverEvent(e));

    function handleMouseOverEvent(e) {

        let mouse = d3.pointer(e),
            week_nr = Math.round(x_linear_scale.invert(mouse[0])), 
            draw_area_width = width - margin * 2,
            increment_size = draw_area_width / (53 - 1),
            relative_x = mouse[0] - margin,
            relative_y = mouse[1] - margin,
            x = (week_nr - 1) * increment_size,
            y2020 = data2020.filter(d => d.week == week_nr),
            y2021 = data2021.filter(d => d.week == week_nr),
            min_y,
            weekly_count2020, weekly_count2021, week_string;

    week_string = weekToString(week_nr);
    if (y2020.length != 0) {
        weekly_count2020 = selectedCount == "Raw"? y2020[0].weekly_count : y2020[0].normalized;
        y2020 = y_scale(weekly_count2020);
    } else {
        weekly_count2020 = "-";
        y2020 = y_scale(0);
    }
    if (y2021.length != 0) {
        weekly_count2021 = selectedCount == "Raw"? y2021[0].weekly_count : y2021[0].normalized;
        y2021 = y_scale(weekly_count2021);
    } else {
        weekly_count2021 = "-";
        y2021 = y_scale(0);
    }
    if (y2020.length != 0 && y2021.length != 0) {
        min_y = d3.min([y2020, y2021])
    } else {
        if (y2020.length != 0) {
            min_y = y2021;
        } else {
            min_y = y2020;
        }
    }

        if (relative_x >= 0 && relative_x <= width - margin * 2 &&
            relative_y >= 0 && relative_y <= height - margin * 2 ) {

            if (selectedCount == "Normalized") {
                if (weekly_count2020 != "-") {
                    weekly_count2020 = weekly_count2020.toExponential(3);
                }
                if (weekly_count2021 != "-") {
                    weekly_count2021 = weekly_count2021.toExponential(3);
                }
            }

            // fill datapoint label values, make it visible and move it to the right position
            datapoint_label
                .attr("visibility", "visible")
                .attr("transform","translate(" + x + "," + min_y + ")");
            datapoint_label.select("tspan.week")
                .text(week_string);
            datapoint_label.select("tspan.count2020")
                .text(weekly_count2020);
            datapoint_label.select("tspan.count2021")
                .text(weekly_count2021);
            
            // repeat for the vertical line and data circles
            vertical_line_d = vertical_line.attr("d");
            vertical_line
                .attr("visibility", "visible")
                .attr("d", vertical_line_d.slice(0, vertical_line_d.lastIndexOf(",")) + "," + min_y)
                .attr("transform","translate(" + x + ",0)");
            svg.select("circle.datapointlabel.series2020")
                .attr("visibility", "visible")
                .attr("transform","translate(" + x + "," + y2020 + ")");
            svg.select("circle.datapointlabel.series2021")
                .attr("visibility", "visible")
                .attr("transform","translate(" + x + "," + y2021 + ")");
        } else {
            // hide datapoint label
            svg.select("g.datapointlabel")
                .attr("visibility", "hidden");
            
            // repeat for the vertical line and data circles
            vertical_line
                .attr("visibility", "hidden");
            svg.selectAll("circle.datapointlabel")
                .attr("visibility", "hidden");
        }
    }
}
