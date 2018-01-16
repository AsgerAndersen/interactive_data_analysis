var xStatScale, leftStatMargin, statWidth, formatTime;

function init_step_charts() {

    d3.select("#stats")
                .selectAll("*")
                .remove();

    for (var k = 0; k < graph_functions.statistics.length; k++) {
        var divs = d3.select("#stats")
            .append("div")
            .classed("statistic_div", true)
            .attr("id", "stat_div" + k);

        divs.append("span")
            .classed("statistic_span", true)
            .text(graph_functions.statistics[k].name);

        divs.append("br");

        divs.append("svg")
            .classed("statistic_svg", true)
            .attr("width", "800")
            .attr("height", "200")
            .attr("id", "stat" + k);
    }

    defineTimeFormat();
}

function draw_statistics() {
    for (var j = 0; j < graph_functions.statistics.length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcSteps(graph_functions.statistics[j].values);
        drawStepChart(steps, canvas, graph_functions.statistics[j].line)

    }
}

function calcSteps(values) {
    //console.log(values)
    steps = []

    for (var i=0; i<values.length; i++) {

        var t = i*graph_seq_params.bin_size;
        if (i === 0) {
            //console.log(values[i])
            steps.push({t: t,
                        value: values[i],
                        left: true})
        }
        else {
            var value = values[i]
            //console.log(value)
            var last_value = steps[2*i-2].value 
            var jump = value - last_value;
            steps.push({t: t,
                        value: last_value,
                        left: false});
            steps.push({t: t,
                        value: value,
                        left: true,
                        jump: jump})
        }
    }

    return steps
}

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, canvas, line) {

    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;

    canvas.selectAll("*")
        .remove();

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .on("click", handleStatClick)
        .on("mousemove", handleStatHover);

    var x = d3.scaleLinear()
        .domain([graph_seq_params.start_time, graph_seq_params.bins * graph_seq_params.bin_size])
        .range([0,width]);

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    //Quick n' dirty. Used in function "getStatX"
    xStatScale = x;
    leftStatMargin = margin.left;
    statWidth = width;

    var y = d3.scaleLinear()
        .domain(d3.extent(steps,
            function(d){
                //if (!isNaN(d.value) && isFinite(d.value)) {
                if (jQuery.isNumeric(d.value)) {
                    return d.value;
                }
            }))
        .range([height,0]);

    var xAxis = d3.axisBottom(x)
        .tickValues(d3.range(graph_seq_params.start_time, graph_seq_params.bin_size * graph_seq_params.bins, graph_seq_params.bin_size));

    var yAxis = d3.axisLeft(y);

    g.selectAll(".stepgraph-hline")
     .data(steps.filter(function(d, i){
            return (d.left && jQuery.isNumeric(d.value) && (jQuery.isNumeric(d.jump) || i===0))
         }))
     .enter()
     .append("line")
     .classed("stepgraph-hline", true)
     .style("stroke", "black")
     .attr("x1", function(d) {return x(d.t)})
     .attr("y1", function(d) {return y(d.value)})
     .attr("x2", function(d) {
           return (x(d.t + graph_seq_params.bin_size))
        })
     .attr("y2", function(d) {return y(d.value)});
    
    g.selectAll(".stepgraph-vline")
     .data(steps.filter(function(d, i){
            return (d.left && (i !== 0) && jQuery.isNumeric(d.value) && jQuery.isNumeric(d.jump))
         }))
     .enter()
     .append("line")
     .classed("stepgraph-vline", true)
     .attr("stroke", "black")
     //.attr("stroke-dasharray", 4)
     .attr("x1", function(d) {return x(d.t)})
     .attr("y1", function(d) {return y(d.value)})
     .attr("x2", function(d) {return x(d.t)})
     .attr("y2", function(d) {
        return (y(d.value - d.jump))
      });

    canvas.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height+margin.top) + ")")
        .call(xAxis)
        .selectAll("text")
        .classed("xTick", true);

    canvas.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", margin.top + height + 35)
        .style("stroke", "black")
        .html("Time");

    canvas.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .call(yAxis);

    /*canvas.append("text")
        .attr("x", margin.left - 50)
        .attr("y", margin.top + height / 2)
        .style("stroke", "black")
        .html("f(x)");*/

    var line_size = x(graph_seq_params.bin_size);

    g.append("rect")
        .classed("vTimeLineGhost", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", line_size);

    g.append("text")
        .classed("movingTickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);

    g.append("rect")
        .classed("vTimeLine", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", line_size);

    g.append("text")
        .classed("tickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);

    if (!(line == null)) {
        g.append("line")
         .attr("stroke", "red")
         .attr("stroke-dasharray", 3)
         .attr("x1", x(graph_seq_params.start_time))
         .attr("y1", y(line))
         .attr("x2", x(graph_seq_params.bins * graph_seq_params.bin_size))
         .attr("y2", y(line))
    }
}

function defineTimeFormat() {

    var orders = [" Day %e at ", " %H:%M", ":%S"];
    var maxCount = [365, 24, 60];
    var values = [24*60*60, 60*60, 1];

    for (var n = orders.length - 1; n >= 0; n--) {
        if (graph_seq_params.bin_size % (maxCount[n] * values[n]) === 0) {
            orders[n] = "";
        }
        else
        {
            break;
        }
    }

    for (n = 0; n < orders.length; n++) {
        if (Math.floor((graph_seq_params.bin_size * graph_seq_params.bins - 1) / values[n]) === 0) {
            orders[n] = "";
        }
        else
        {
            break;
        }
    }
    var formatString = orders.join("").substr(1);
    formatTime = d3.utcFormat(formatString);
}

function handleStatClick(d, i) {
    var x = d3.mouse(this)[0];

    var n = Math.floor(xStatScale.invert(x) / graph_seq_params.bin_size);

    //document.getElementById("init_part_checkbox").checked = false;
    viewBin(n, true);
}

function handleStatHover(d, i) {
    var x = d3.mouse(this)[0];

    var g = d3.select(this);
    var line = g.select(".vTimeLineGhost");

    if (x > 0 && x < statWidth - 1) {

        var bin_width = xStatScale(graph_seq_params.bin_size);
        var n = Math.floor(x / bin_width);
        line.attr("x", n * bin_width);

        g.select(".movingTickText")
            .attr("x", (n+0.5) * bin_width)
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000));

    }
}

function getStatX(x) {
    return xStatScale.invert(x);
}
