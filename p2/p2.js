d3.select(window).on('load', init);
var raw_data;
var year_domain;
var temperature_domain;
var full_temperature_domain;

var n_columns;

var year2color;

var year2decade;

function init() {
    d3.csv(
        'data.csv',
        function(error, data) {
            if (error) throw error;
            var min=0, max=0;
            raw_data = data.map(function(row) {
                var new_row = {};
                for (var key in row) {
                    if (key == "YEAR")
                    {
                        new_row[key] = parseInt(row[key]);
                    }
                    else
                    {
                        var val = parseFloat(row[key]);
                        if (val > 900.0)
                        {
                            new_row[key] = NaN;
                        }
                        else
                        {
                            if (val < min){min = val}
                            else if (val > max){max = val}
                            new_row[key] = val;
                        }
                    }

                }
                return new_row;
            });

            full_temperature_domain = [min, max];

            year_domain = d3.extent(raw_data,
                function(d){
                    return d["YEAR"];});

            temperature_domain = d3.extent(raw_data,
                function(d){
                    return d["metANN"];});

            //Initialize year range sliders
            d3.select('#year_max_slider')
                .attr("min", (year_domain[0]+1))
                .attr("max", year_domain[1])
                .attr("value", year_domain[1]);

            d3.select('#year_min_slider')
                .attr("min", year_domain[0])
                .attr("max", year_domain[1]-1)
                .attr("value", year_domain[0]);


            //Initialize rest and produce visualisations
            updateGrouping();
            updateColumns();
            updateVisualisations();
        }
    );
}


function updateVisualisations(){

    //De valgte måneder udtrækkes fra data her
    var selected_data = selectData(raw_data)

    //Udtrukket data sendes til visualiseringsfunktionerne
    vis1(selected_data);
    vis2(selected_data, 2);
}

function vis1(data)
{
    var canvas = d3.select('#vis1');

    var margin = {top: 15, right: 5, bottom: 40, left: 50};


    var height = canvas.node().getBoundingClientRect().height;
    var width = canvas.node().getBoundingClientRect().width;

    var domain_padding = [(year_domain[1]-year_domain[0])*0.05,
        (full_temperature_domain[1]-full_temperature_domain[0])*0.05];

    var xScale = d3.scaleLinear()
        .domain([year_domain[0]-domain_padding[0], year_domain[1]+domain_padding[0]])
        .range([margin.left, width - margin.right]);

    var yScale = d3.scaleLinear()
        .domain([full_temperature_domain[0]-domain_padding[1], full_temperature_domain[1]+domain_padding[1]])
        .range([height - margin.bottom, margin.top]);



    //C/P - https://bl.ocks.org/HarryStevens/be559bed98d662f69e68fc8a7e0ad097

    var xAxis = d3.axisBottom(xScale);

    var yAxis = d3.axisLeft(yScale);
    //C/P - End

    canvas
        .selectAll("g")
        .remove();

    canvas
        .selectAll("text")
        .remove();

    canvas
        .selectAll("circle")
        .remove();

    canvas
        .selectAll("line")
        .remove();

    canvas
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", "2px")
        .attr("cx", function(d){
            return ""+xScale(d["YEAR"])+"px";
        })
        .attr("cy", function(d){
            return ""+yScale(d["VAL"])+"px";
        })

    var lreg = linearRegression(data);
    var x1 = year_domain[0];
    var x2 = year_domain[1]
    var y1 = lreg.f(x1);
    var y2 = lreg.f(x2);

    canvas.append("line")
        .attr("x1", xScale(x1))
        .attr("x2", xScale(x2))
        .attr("y1", yScale(y1))
        .attr("y2", yScale(y2))
        .style("stroke", "red")
        .style("stroke-width", "2")

    //C/P - https://bl.ocks.org/HarryStevens/be559bed98d662f69e68fc8a7e0ad097
    canvas.append("g")
        .attr("transform", "translate(0," + (height-margin.bottom) + ")")
        .call(xAxis)

    canvas.append("text")
        .attr("x", margin.left + (width - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom + 35)
        .style("stroke", "black")
        .html("Year");

    canvas.append("g")
        .attr("transform", "translate(" + (margin.left) + ",0)")
        .call(yAxis);

    canvas.append("text")
        .attr("x", margin.left - 45)
        .attr("y", margin.top + (height - margin.top - margin.bottom) / 2)
        .style("stroke", "black")
        .html("C&#176; ");

    canvas.append("text")
        .attr("x", margin.left - 45)
        .attr("y", height - margin.bottom + 35)
        .style("stroke", "black")
        .html("Slope = " + lreg.a);
    //C/P - End
}

//Visualisering 2
function vis2(data)
{
    data.sort(function(a, b){ return b["VAL"] - a["VAL"];});

    d3.select('#vis2')
        .selectAll("div")
        .remove();

    d3.select('#vis2')
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .html(function(d){return d["YEAR"];})
        .style("background-color", function(d){return year2color(d["YEAR"]);})
        //.style("background-color", "white")
        .attr("class", function(d, i){
            if ((i) % n_columns == 0){
                return "vis2row sol"
            } else {return "vis2row";}})
        .exit()
        .remove()
}

function updateGrouping()
{
    var groupsize = parseInt(document.getElementById("groupsizeslider").value);
    document.getElementById('groupsize').innerHTML = groupsize;

    var num_groups = Math.ceil((year_domain[1] - year_domain[0] + 1) / groupsize);

    var groups = d3.range(year_domain[0]+groupsize, year_domain[1]+groupsize, groupsize);
    console.log(groups)

    var unit_groups = [0];
    if (num_groups > 1){
        unit_groups = d3.range(0, 1, 1 / (num_groups - 1));
    }
    console.log(unit_groups)

    var colors = unit_groups.map(function(d){ return d3.interpolateYlGnBu(d)});
    colors.push(d3.interpolateYlGnBu(1))


    // var year2color = d3.scaleQuantize()
    //     .domain([groups[0], groups[groups.length-1]+10])
    //     .range(unit_groups.map(function(d){ return d3.interpolateYlGnBu(d)}));


    year2color = d3.scaleThreshold()
        .domain(groups)
        .range(colors);

    //Idea: Make table and use d3 to dynamically input one entry for each color group.
    d3.select("#groupcolor_table")
      .selectAll("tr")
      .remove()

    d3.select("#groupcolor_table")
      .append("tr")
      .selectAll("td")
      .data(groups)
      .enter()
      .append("td")
      .text(function(d) {return String(d - groupsize) + " -\n" + String(d-1);})
      .style("background-color", function(d){return year2color(d-1);})

    year2decade = d3.scaleQuantize()
        .domain(year_domain)
        .range(groups);
}

function updateColumns() {
    n_columns = document.getElementById("columnslider").value;
    document.getElementById('columns').innerHTML = n_columns;
}

//Funktion til at udtrække valgte måneder fra datasættet
function selectData(data)
{
    months = checkedMonths();
    if (months.length == 0 || months.length == 12)
    {
        months = ["metANN"]
    }

    var year_range = selectedRange();

    var selected_data = [];
    data.forEach(function(row){
        var mean = 0;
        months.forEach(function(key) {
            mean += row[key];
        });
        mean = mean / months.length;
        if (!isNaN(mean) && row["YEAR"] >= year_range[0] && row["YEAR"] <= year_range[1]) {
            selected_data.push({"YEAR": row["YEAR"], "VAL": mean});
        }
    });



    year_domain = d3.extent(selected_data,
        function(d){
            return d["YEAR"];});

    temperature_domain = d3.extent(selected_data,
        function(d){
            return d["VAL"];});

    updateGrouping();

    return selected_data;
}



//Returnerer hvilke måneder er valgt
function checkedMonths()
{
    var status = [];
    d3.select('#global_options_table').selectAll(".month_checkbox").each(
        function(d, i) {
            if (this.checked) {
                status.push(this.getAttribute("id"));
            }
        });
    return status;
}

function selectedRange()
{
    var max_slider = document.getElementById('year_max_slider');
    var min_slider = document.getElementById('year_min_slider');
    var max_span = document.getElementById('year_max');
    var min_span = document.getElementById('year_min');
    var max = parseInt(max_slider.value);
    min_slider.setAttribute("max", max-1);
    var min = parseInt(min_slider.value);
    max_slider.setAttribute("min", min+1);

    max_span.innerHTML = max;
    min_span.innerHTML = min;
    return [min, max];
}

//Stort første bogstav
function upperCaseFirst(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function linearRegression(data)
{
    var tmp1 = 0; //sum of all x * y
    var tmp2 = 0; //sum of all x
    var tmp3 = 0; //sum of all y
    var tmp4 = 0; //sum of squared x

    var n = data.length;

    data.forEach(function(d) {
        tmp1 += d["VAL"] * d["YEAR"];
        tmp2 += d["YEAR"];
        tmp3 += d["VAL"];
        tmp4 += d["YEAR"]*d["YEAR"]});

    var a = n * tmp1;

    var b = tmp2 * tmp3;

    var c = n * tmp4;

    var d = tmp2 * tmp2;

    var slope = (a - b) / (c - d);

    var f = slope * tmp2;

    var intercept = (tmp3 - f) / n;

    return {a: slope, b: intercept, f: function(x){return slope * x + intercept;}}
}


