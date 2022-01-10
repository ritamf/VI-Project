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

function preProcessData(data) {

    let preProcessedData = data.map(d => {
        year = +d.year_week.split("-")[0];
        week = +d.year_week.split("-")[1];
        startDayNr = 1 + (week - 1) * 7;
        startDate = new Date(year, 0, startDayNr);
        d.year_week = startDate;
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

    // TODO: update plot after filtering info
    data2020 = data.filter(d => d.country == selectedCountry && d.indicator == selectedIndicator && d.year_week.getFullYear() == 2020);
    data2021 = data.filter(d => d.country == selectedCountry && d.indicator == selectedIndicator && d.year_week.getFullYear() == 2021);

    var x_linear_scale = d3.scaleLinear()
        .range([margin, width - margin])
        .domain([0, data2020.length - 1])
        .clamp(true);

    var x_extent = data2020.map((d, i) => i);
    var x_scale = d3.scalePoint()
        .range([margin, width - margin])
        .domain(x_extent);

    let y_max = d3.max([d3.max(data2020, d => d.weekly_count),
                        d3.max(data2021, d => d.weekly_count)]);
    var y_scale = d3.scaleLinear()
        .range([height - margin, margin])
        .domain([0, y_max])
        .nice();

    svg.selectAll("circle.series2020")
        .data(data2020)
        .join("circle")
        .attr("cx", (d, i) => x_scale(i))
        .attr("cy", d => y_scale(d.weekly_count))
        .attr("r", 3)
        .attr("class", "series2020");

    svg.selectAll("circle.series2021")
        .data(data2021)
        .join("circle")
        .attr("cx", (d, i) => x_scale(i))
        .attr("cy", d => y_scale(d.weekly_count))
        .attr("r", 3)
        .attr("class", "series2021");

    var x_axis = d3.axisBottom(x_scale);

    let tick_labels = [""];
    for (let i = 1; i < data2020.length; i++) {
        if (data2020[i - 1].year_week.getMonth() == data2020[i].year_week.getMonth()) {
            tick_labels.push("");
        } else {
            if (data2020[i - 1].year_week.getFullYear() == data2020[i].year_week.getFullYear()) {
                tick_labels.push(d3.timeFormat('%b')(data2020[i].year_week));
            } else {
                tick_labels.push(d3.timeFormat('%Y')(data2020[i].year_week));
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
        .x((d, i) => x_scale(i))
        .y(d => y_scale(d.weekly_count));

    svg.append("path")
        .attr("d", line2020(data2020))
        .attr("class", "line series2020");

    var line2021 = d3.line()
        .x((d, i) => x_scale(i))
        .y(d => y_scale(d.weekly_count));

    svg.append("path")
        .attr("d", line2021(data2021))
        .attr("class", "line series2021");

    let datapointlabel_width = 150,
        datapointlabel_height = 55,
        datapointlabel_margin = 4,
        datapointlabel_x_origin = x_linear_scale(0)
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

    function handleMouseOverEvent(e) {

        let mouse = d3.pointer(e),
            data_index = Math.round(x_linear_scale.invert(mouse[0])), 
            draw_area_width = width - margin * 2,
            increment_size = draw_area_width / (data2020.length - 1),
            relative_x = mouse[0] - margin,
            relative_y = mouse[1] - margin,
            x = data_index * increment_size,
            y2020 = y_scale(data2020[data_index].weekly_count),
            y2021 = y_scale(data2021[data_index].weekly_count),
            min_y = d3.min([y2020, y2021]),
            date_string;
    
        if (relative_x >= 0 && relative_x <= width - margin * 2 &&
            relative_y >= 0 && relative_y <= height - margin * 2 ) {
            
            // create week string
            startDate = data2020[data_index].year_week;
            endDate = new Date(startDate.getFullYear(), 
                               startDate.getMonth(),
                               startDate.getDate() + 6)
            if (startDate.getFullYear() != endDate.getFullYear()) {
                endDate = new Date(startDate.getYear(), 
                                   startDate.getMonth(),
                                   31)
            }
            const dateFormat = { month: 'short', day: 'numeric' };
            date_string = String(startDate.getDate()).padStart(2,"0") + "/" + String(startDate.getMonth() + 1).padStart(2,"0") + " - " + String(endDate.getDate()).padStart(2,"0") + "/" + String(endDate.getMonth() + 1).padStart(2,"0");

            // fill datapoint label values, make it visible and move it to the right position
            datapoint_label
                .attr("visibility", "visible")
                .attr("transform","translate(" + x + "," + min_y + ")");
            datapoint_label.select("tspan.week")
                .text(date_string);
            datapoint_label.select("tspan.count2020")
                .text(data2020[data_index].weekly_count);
            datapoint_label.select("tspan.count2021")
                .text(data2021[data_index].weekly_count);
            
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
