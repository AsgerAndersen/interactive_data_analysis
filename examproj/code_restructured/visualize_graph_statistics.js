var xStatScale, leftStatMargin, statWidth, formatTime, k_stats;

function init_step_charts() {


    d3.select("#stats_on_off_div")
      .selectAll("input")
      .data(graph_functions.statistics)
      .enter()
      .append("input")
      .classed("checkbox", true)
      .attr("type", "checkbox")
      .attr("onchange","drawStats()")
      .attr("id", function(d, i) {
        return ("checkbox_stat"+i)
      })

    d3.select("#stats_on_off_div")
      .selectAll("label")
      .data(graph_functions.statistics)
      .enter()
      .append("label")
      .attr("for", function(d, i) {
        return ("checkbox_stat"+i)
      })
      .html(function(d) {return d.name})

    for (var j = 0; j < graph_functions.statistics.length; j++) {
        stat = graph_functions.statistics[j]
        if (!stat.tickFormat) {
            if (!stat.format) {
                stat.format = "";
            }
            stat.tickFormat = stat.format;
        }
        if (stat.start_on) {
            document.getElementById("checkbox_stat"+j).checked = true
        }
    }
    //console.log("hi2")
    for (var j = 0; j < graph_functions.clustering.length; j++) {
        if (!(graph_functions.clustering[j].statistic == null)) {
            stat = graph_functions.clustering[j].statistic
            if (!stat.tickFormat) {
                if (!stat.format) {
                    stat.format = "";
                }
                stat.tickFormat = stat.format;
            }
            //console.log(stat)
        }
    }
    defineTimeFormat();

}

function drawStats() {

    d3.select("#stats")
      .selectAll("*")
      .remove()
    //console.log("hi4")
    for (var k = 0; k < graph_functions.statistics.length; k++) {
        
        if (document.getElementById("checkbox_stat"+k).checked) {
            appendStatCanvas(k, "stat")
            drawStat(k, "stat")
        }
    }
    //console.log("hi5")
    for (var k = 0; k < graph_functions.clustering.length; k++) {
        if (document.getElementById("n_communities_checkbox").checked) { //"cluster_stat_on" + k
            console.log("TRYING")
            appendStatCanvas(k, "cluster_stat")
            drawStat(k, "cluster_stat")
        }
    }
    //console.log("hi6")
}

function appendStatCanvas(k, type) {
        var divs = d3.select("#stats")
            .append("div")
            .classed("statistic_div", true)
            .attr("id", type + "_div" + k);

        if (type=="stat") {
            divs.append("span")
                .classed("statistic_span", true)
                .text(graph_functions.statistics[k].name);
            }

        if (type=="cluster_stat") {
            divs.append("span")
                .classed("statistic_span", true)
                .text(graph_functions.clustering[k].statistic.name);
            }

        divs.append("br");

        divs.append("svg")
            .classed("statistic_svg", true)
            .attr("width", "800")
            .attr("height", "200")
            .attr("id", type + k);
}

function drawStat(k, type) {
    var canvas = d3.select("#" + type + k);
    if (type=="stat") {
        var steps = calcSteps(graph_functions.statistics[k].values)
        drawStepChart(steps, canvas, k, graph_functions.statistics[k].line)
    }
    if (type=="cluster_stat") {
        var steps = calcSteps(graph_functions.clustering[k].statistic.values);
        //console.log(steps)
        drawStepChart(steps, canvas, k, graph_functions.clustering[k].statistic.line)
    }
}

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, canvas, index, line) {

    //****************************************************
    //Setting the tools for the drawing up

    //--------------------------------------------------
    //Set the canvas up 
    canvas.selectAll("*")
        .remove();
    
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("name", index)
        .on("click", handleStatClick)
        .on("mousemove", handleStatHover);

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    leftStatMargin = margin.left;
    statWidth = width;

    //--------------------------------------------------------
    //Set the scales up
    var x = d3.scaleLinear()
        .domain([graph_seq_params.start_time, graph_seq_params.bins * graph_seq_params.bin_size])
        .range([0,width]);

    xStatScale = x; //Quick n' dirty. Used in function "getStatX"

    var scalePadding = 10;
    var yDomain = d3.extent(steps,
        function(d){
            return d.value;
        });

    var maxY = Math.max(Math.abs(yDomain[0]), Math.abs(yDomain[1]));
    yDomain[0] = yDomain[0] - 0.1 * maxY;
    yDomain[1] = yDomain[1] + 0.1 * maxY;

    var y = d3.scaleLinear()
        .domain(yDomain)
        .range([height,0]);

    //-----------------------------------------------------------
    //Set the axis up

    var xAxis = d3.axisBottom(x)
        .tickValues(d3.range(graph_seq_params.start_time, graph_seq_params.bin_size * graph_seq_params.bins, graph_seq_params.bin_size));

    var tickValues = d3.range(graph_seq_params.start_time, graph_seq_params.bin_size * graph_seq_params.bins, graph_seq_params.bin_size);
    if (tickValues.length <= 120) {
        xAxis.tickValues(tickValues);
    } else {
        xAxis.ticks(0);
    }

    var yAxis = d3.axisLeft(y).tickFormat(d3.format(graph_functions.statistics[index].tickFormat)).ticks(7);

    //***************************************************************
    //Begin the drawing
    
    //---------------------------------------------------------------
    //Draw the step graph
    
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

    //------------------------------------------------------------
    //Draw the optional, red dashed constant line

    if (!(line == null)) {
        g.append("line")
         .attr("stroke", "red")
         .attr("stroke-dasharray", 3)
         .attr("x1", x(graph_seq_params.start_time))
         .attr("y1", y(line))
         .attr("x2", x(graph_seq_params.bins * graph_seq_params.bin_size))
         .attr("y2", y(line))
    }

    //-------------------------------------------------------------
    //Draw the two axis
    
    canvas.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height+margin.top) + ")")
        .call(xAxis)
        .selectAll("text")
        .classed("xTick", true);

    canvas.append("text") //Add text under the x-axis
        .attr("x", margin.left + width / 2)
        .attr("y", margin.top + height + 35)
        .style("stroke", "black")
        .html("Time");

    canvas.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
        .call(yAxis);

    //-------------------------------------------------------------
    //Draw the red marker of the currently selected timebin

    var line_size = x(graph_seq_params.bin_size);

    g.append("rect")
        .classed("vTimeLine", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", Math.max(line_size, 2));

    g.append("text")
        .classed("movingTickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);

    g.append("text")
        .classed("movingValueText", true)
        .attr("text-anchor", "middle")
        .attr("y", -10)
        .attr("x", 0);

    //-------------------------------------------------------------
    //Draw the dashed selector that can used to select another timebin

    g.append("rect")
        .classed("vTimeLineGhost", true)
        .attr("y", 0)
        .attr("x", 0)
        .attr("height", height)
        .attr("width", Math.max(line_size, 2));

    g.append("text")
        .classed("tickText", true)
        .attr("text-anchor", "middle")
        .attr("y", height+20)
        .attr("x", 0);

    g.append("text")
        .classed("valueText", true)
        .attr("text-anchor", "middle")
        .attr("y", -10)
        .attr("x", 0);

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

function handleStatClick(d, i) {
    var x = d3.mouse(this)[0];

    var n = Math.floor(xStatScale.invert(x) / graph_seq_params.bin_size);

    viewBin(n, true);
}

function handleStatHover(d, i) {
    var x = d3.mouse(this)[0];

    var g = d3.select(this);
    var index = parseInt(g.attr("name"));
    
    var line = g.select(".vTimeLineGhost");

    if (x > 0 && x < statWidth - 1) {

        var bin_width = xStatScale(graph_seq_params.bin_size);
        var n = Math.floor(x / bin_width);
        var statistic = graph_functions.statistics[index];
        line.attr("x", n * bin_width);

        g.select(".movingTickText")
            .attr("x", (n+0.5) * bin_width)
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000));

        g.select(".movingValueText")
            .attr("x", (n+0.5) * bin_width)
            .text(d3.format(statistic.format)(statistic.values[n]));
    }
}

function getStatX(x) {
    return xStatScale.invert(x);
}
