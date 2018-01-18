d3.select(window).on('load', init);
var data, sim, svg, g, zooming, width, height, xStatScale, leftStatMargin, statWidth, link, node;

//var n_init_communities = 2;
var nodes = [], links = [], degrees_freq = [], all_nodes = [];//, community_init = {};

var data_props = {
    "nodes": 589,
    "links": 0,
    "rows": 0
};

var params = {
    "bin_size": 900,
    "old_bin_size": 900,
    "start_time": 0,
    "end_time": 60*60*24,
    "bins": 96,
    "threshold": -90,
    "n_scans": 1,
    "source": "user",
    "target": "user2",
    "coloring": false,
    "current_bin": 0,
    "statistics": [
        {name: "Average Degree", 
         method: function(links, nodes, i) { return 2*links[i].length / data_props.nodes;;},
         format: ".3f",
         tickFormat: ".1f",
         line: 0
        },
        /*{name: "Average Degree of connected nodes", 
         method: function(links, nodes, i) { return 2*links[i].length / nodes[i].length;},
         format: ".3f",
         tickFormat: ".1f",
         line: 0
        },*/
        {name: "Number of isolated nodes", 
         method: function(links, nodes, i) { return (data_props.nodes - nodes[i].length); },
         format: "",
         line: null
        },
        {name: "Link growth (absolute)", 
         method: function(links, nodes, i) { 
                    if (i==0) {return 0}
                    else {return links[i].length - links[i-1].length}
                 },
         line: 0
        },
        {name: "Link growth (relative)", 
         method: function(links, nodes, i) { 
                    if (i==0) {return 0}
                    else {return (((links[i].length / links[i-1].length) - 1))}
                 },
         line: 0,
         format: ".2%",
        tickFormat: ".0%"
        }
    ]
};

function init() {

    svg = d3.select("#vis");
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    d3.select("body")
        .on("keydown", function() {
            var sliderFocus = d3.select(document.activeElement).classed("parameterSlider");
            if (sliderFocus) {
                return;
            }
            if (d3.event.keyCode == 39) {
                viewBin(1)
            }
            else if (d3.event.keyCode == 37) {
                viewBin(-1)
            }
        });


    zooming = d3.zoom()
        .on("zoom", function(){
            scale = d3.event.transform.k;
            transX = d3.event.transform.x;
            transY = d3.event.transform.y;
            //scale = scale + zoomStep;
            sim.restart();
        });

    g = svg.append("g")
        .attr("transform",
            "translate(" + 0+ "," + 0 + ")");

    d3.select("#toggle_communities_div")
        .on("click", toggleColoring);

    d3.select("#reset_zoom_div")
        .on("click", resetZoom);

    d3.select("#reheat_div")
        .on("click", reheat);


    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, dat) {
            if (error) throw error;
         
            sim = simulation(width, height);
            data = dat;
            //console.log(data)
            initGraph(g);

            all_nodes = uniqueNodes(dat);         
            //all_nodes.forEach(function(node) {
            //	community_init[String(node.id)]=getRandomInt(0,n_init_communities);
            //})            

            calculateGraphs();

            svg.call(zooming);
            svg.call(zooming.transform, d3.zoomIdentity.translate(400, 400));
        }
    )
}

function updatePars() {

    //console.log(params.n_scans)
    params.old_bin_size = params.bin_size;
    params.threshold = $("#threshold_slider").slider("option","value")
    params.bin_size = ($("#binsize_slider").slider("option","value"))*60
    params.n_scans = $("#n_scans_slider").slider("option","value")
    //console.log(params.n_scans)
    //console.log("binsize", params.bin_size)

    var time_interval = $("#start_end_slider").slider("option","values")
    var n_bins = Math.floor( ( time_interval[1] - time_interval[0]) * 3600  / params.bin_size );
    
    //console.log("n bins", n_bins)
    params.bins = n_bins;
    params.start_time = time_interval[0]
    params.end_time = time_interval[1]

    calculateGraphs();
}

//Loops through data returns list of all unique node IDs
function uniqueNodes(data) {
    var node1key = params["source"];
    var node2key = params["target"];
    var nodes = [];
    for (var n = 0; n < data.length; n++) {
        var row = data[n];
        nodes[row[node1key]] = true;
        nodes[row[node2key]] = true;
    }
    for (var key in nodes) {
        nodes[key] = {id: key};
    }
    return nodes;
}


function calculateGraphs()
{
    defineTimeFormat()

    var n_to_draw = 0;
    if (params.old_bin_size === params.bin_size && params.bins > params.current_bin) {
        n_to_draw = params.current_bin;
    }
    else {
        var old_x = (params.current_bin + 0.5) * params.old_bin_size;
        var new_bin = Math.floor(old_x / params.bin_size);
        if (params.bins > new_bin) {
            n_to_draw = new_bin;
        }
    }
    //console.log("hi")
    var i = 0;
    nodes = [];
    links = [];
    for (var n = 0; n < params.bins; n++) {
        //console.log("hello")
        var bin = [];
        var looping = true;
        while (looping) {
            var row = data[i];
            if (row["ts"] < (n+1) * params["bin_size"]) {
                bin.push(row);
            } else {
                looping = false;
            }
            i++;
        }
        var graphdata = calculateLinksNodes(bin, function(row){
            return row["rssi"] > params['threshold'];
        });

        links[n] = graphdata["links"];
        nodes[n] = graphdata["nodes"];
        degrees_freq[n] = graphdata["degrees_freq"];
        //if (n === n_to_draw){
        //    drawGraph(g, nodes[n], links[n]);
        //}

        if (n === 0){
            d3.select("#stats")
                .selectAll("*")
                .remove();
            for (var k = 0; k < params["statistics"].length; k++) {
                var divs = d3.select("#stats")
                    .append("div")
                    .classed("statistic_div", true)
                    .attr("id", "stat_div" + k);

                divs.append("span")
                    .classed("statistic_span", true)
                    .text(params["statistics"][k].name);

                divs.append("br");

                divs.append("svg")
                    .classed("statistic_svg", true)
                    .attr("width", "800")
                    .attr("height", "200")
                    .attr("id", "stat" + k);
            }
        }
    }
    //console.log("link_count", link_count)
    //console.log("nodes", nodes)
    for (var j = 0; j < params["statistics"].length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(links, nodes, params["statistics"][j]);
        drawStepChart(steps, canvas, j, params["statistics"][j].line)

    }
    
    viewBin(n_to_draw, true, false);
}



//TODO: Add directed option, and options for minimum number of occurrences, etc.
function calculateLinksNodes(data, filter, count = false, directed = false) {
    //console.log("hi")
    var node1key = params["source"];
    var node2key = params["target"];

    var scan_counts = {};
    var degrees_map = {};
    var node_map = {};

    for (var key in data) {
        var row = data[key];
        if (filter(row)) {
            
            var user_id_1 = row[node1key];
            var user_id_2 = row[node2key];

            if (user_id_1 < user_id_2) {
                var source = user_id_1
                var target = user_id_2
            } 
            else {
                var source = user_id_2
                var target = user_id_1
            }

            if (!scan_counts[source]) {
                scan_counts[source] = {};
            }
            if (!scan_counts[source][target]) {
                scan_counts[source][target] = 1;
            }
            else {
                scan_counts[source][target] += 1;    
            }
        }
    }
    //console.log(scan_counts)

    var links = [];
    for (var source in scan_counts) {
        for (var target in scan_counts[source]) {
            if (scan_counts[source][target] >= params.n_scans) {
                
                node_map[source] = true;
                node_map[target] = true;

                if (!degrees_map[source]) {
                    degrees_map[source] = 1
                }
                else {
                    degrees_map[source] += 1    
                }
                if (!degrees_map[target]) {
                    degrees_map[target] = 1
                }
                else {
                    degrees_map[target] += 1    
                }

                links.push({"source": source, "target": target, "value": 0});
            }
        }
    }

    var nodes = [];
    for (var key in node_map) {
        nodes.push(all_nodes[key]); //Uses references instead of new node objects
    }

    var degrees_freq = {};
    for (var node in degrees_map) {
        if (!degrees_freq[degrees_map[node]]) {
            degrees_freq[degrees_map[node]] = 1
        }
        else {
            degrees_freq[degrees_map[node]] += 1
        }
    }

    for (var degree in degrees_freq) {
        degrees_freq[degree] = degrees_freq[degree] / nodes.length
    }
    
    var degrees_freq_list = []

    for (var degree in degrees_freq) {
        degrees_freq_list.push({degree: degree, frequency: degrees_freq[degree]})
    }

    return {"links": links, "nodes": nodes, "degrees_freq": degrees_freq_list};
}

function initGraph(canvas) {

    link = canvas
        .append("g")
        .selectAll(".link");

    node = canvas
        .append("g")
        .selectAll(".node");
}

function redrawGraph(restart = true) {
    //console.log("Hi");
    drawGraph(g, nodes[params.current_bin], links[params.current_bin], restart);
}

//Draws the main visualisation
function drawGraph(canvas, nodes, links, restart = true) {

    //https://bl.ocks.org/mbostock/1095795

    link = link.data(links);
    link.exit().remove();
    link = link.enter()
        .append("line")
        .classed("link", true)
        .merge(link);

    node = node.data(nodes);
    node.exit().remove();
    node = node.enter()
        .append("circle")
        .attr("r", 5)
        .classed("node", true)
        .merge(node);

    node.select("title")
        .remove();
    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(nodes);

    sim.force("link").links(links);
    //console.log(nodes)
    //console.log(links)

    if (restart) {
        sim.alpha(0.1).restart();
    } else {
        sim.restart();
    }

    drawNoLinksBar(data_props.nodes - nodes.length)

    detectCommunities(nodes, links)

}

function viewBin(n, abs = false, trans = true) {
    if (!abs) {
        n = params.current_bin + n;
    }
    if (n < 0 || n >= links.length) {return;}
    params.current_bin = n;

    /*nodes[n].forEach(function(d){
        delete d.x;
        delete d.y;
        return d;
    });
    links[n].forEach(function(d){
        delete d.x1;
        delete d.x2;
        delete d.y1;
        delete d.y2;
        return d;
    });*/
    var bin_width = xStatScale(params.bin_size);
    var x = xStatScale(n * params.bin_size);
    if (abs && trans) {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000))
            .transition()
            .attr("duration", 1000)
            .attr("x", x + bin_width / 2);

        d3.selectAll(".statistic_svg g .valueText")
            .text(function(d, i) {return d3.format(params.statistics[i].format)(params.statistics[i].values[n*2].value);})
            .transition()
            .attr("duration", 1000)
            .attr("x", x + bin_width / 2);

    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .attr("x", x + bin_width / 2)
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000));

        d3.selectAll(".statistic_svg g .valueText")
            .attr("x", x + bin_width / 2)
            .text(function(d, i) {return d3.format(params.statistics[i].format)(params.statistics[i].values[n*2].value);});

    }

    drawGraph(g, nodes[n], links[n]);
    //console.log(link_count[n])
    drawDegreeDist(degrees_freq[n])//link_count[n])

}

var scale = 1;
var transX = 0;
var transY = 0;
var zoomStep = 0.1;

function resetZoom() {
    svg.transition().duration(750).call(zooming.transform, d3.zoomIdentity.translate(400, 400));
}

function reheat() {
    sim.alpha(0.2).restart();
}

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        //.force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaMin(0.01)
        .alphaDecay(0.002)
        .on("tick", ticked);
}

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x * scale + transX; })
        .attr("y1", function(d) { return d.source.y * scale + transY; })
        .attr("x2", function(d) { return d.target.x * scale + transX; })
        .attr("y2", function(d) { return d.target.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});

    node
        .attr("cx", function(d) { return d.x * scale + transX; })
        .attr("cy", function(d) { return d.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});
}

//---------------------------------------------------------------------
//Draw bar with number of nodes without any links
function drawNoLinksBar(n) {

    d3.select("#isolated_count_div > span")
      .text(n.toString())

    /*
    var canvas = d3.select("#nolinksbar")

    canvas.selectAll("*").remove();

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0,data_props.nodes])
        .range([0,width]);

    g.append("rect")
     .attr("height", 25)
     .attr("width", x(n))
     .attr("fill", "brown")


    //Why is this not working?
    g.append("text")
     .attr("x", 0)
     .attr("y", 0)
     .text(n.toString())
     .attr("font-family", "sans-serif")
     .attr("font-size", "20px")
     .attr("fill", "black")
    */
}

//---------------------------------------------------------------------
//Calculate the descriptive graph statistics, which should be visualized in the step charts

function calcGraphStatistics(links, nodes, statistic) {
    var values = [];
    var method = statistic.method;
    for (var i=0; i<links.length; i++) {
        var value = method(links, nodes, i);
        var t = i*params.bin_size;
        if (i === 0) {
            values.push({t: t,
                             value: value,
                             left: true})
        }
        else {
            var last_value = values[2*i-2].value;
            var jump = value - last_value;
            values.push({t: t,
                             value: last_value,
                             left: false});
            values.push({t: t,
                             value: value,
                             left: true,
                             jump: jump})
        }
    }
    //values.pop();
    statistic.values = values;
    return values
}
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, canvas, index, line) {

    var margin = {top: 30, right: 100, bottom: 50, left: 100};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;
    if (!params.statistics[index].tickFormat) {
        if (!params.statistics[index].format) {
            params.statistics[index].format = "";
        }
        params.statistics[index].tickFormat = params.statistics[index].format;
    }

    canvas.selectAll("*")
        .remove();

    var g = canvas.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("name", index)
        .on("click", handleStatClick)
        .on("mousemove", handleStatHover);

    var x = d3.scaleLinear()
        .domain([params.start_time, params.bins * params.bin_size])
        .range([0,width]);

    g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    //Quick n' dirty. Used in function "getStatX"
    xStatScale = x;
    leftStatMargin = margin.left;
    statWidth = width;

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

    var xAxis = d3.axisBottom(x);

    var tickValues = d3.range(params.start_time, params.bin_size * params.bins, params.bin_size);
    if (tickValues.length <= 120) {
        xAxis.tickValues(tickValues);
    } else {
        xAxis.ticks(0);
    }

    var yAxis = d3.axisLeft(y).tickFormat(d3.format(params.statistics[index].tickFormat)).ticks(7);

    g.selectAll(".stepgraph-hline")
     .data(steps.filter(function(d){
            return (d.left)
         }))
     .enter()
     .append("line")
     .classed("stepgraph-hline", true)
     .style("stroke", "black")
     .attr("x1", function(d) {return x(d.t)})
     .attr("y1", function(d) {return y(d.value)})
     .attr("x2", function(d) {
           return (x(d.t + params.bin_size))
        })
     .attr("y2", function(d) {return y(d.value)});
    
    g.selectAll(".stepgraph-vline")
     .data(steps.filter(function(d, i){
            return (d.left && (i !== 0))
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

    var line_size = x(params.bin_size);

    g.append("rect")
        .classed("vTimeLineGhost", true)
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

    g.append("rect")
        .classed("vTimeLine", true)
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

    if (!(line == null)) {
        g.append("line")
         .attr("stroke", "red")
         .attr("stroke-dasharray", 3)
         .attr("x1", x(params.start_time))
         .attr("y1", y(line))
         .attr("x2", x(params.bins * params.bin_size))
         .attr("y2", y(line))
    }
} 
//---------------------------------------------------------------------


var formatTime;

function defineTimeFormat() {

    var orders = [" Day %e at ", " %H:%M", ":%S"];
    var maxCount = [365, 24, 60];
    var values = [24*60*60, 60*60, 1];

    for (var n = orders.length - 1; n >= 0; n--) {
        if (params.bin_size % (maxCount[n] * values[n]) === 0) {
            orders[n] = "";
        }
        else
        {
            break;
        }
    }

    for (n = 0; n < orders.length; n++) {
        if (Math.floor((params.bin_size * params.bins - 1) / values[n]) === 0) {
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

    var n = Math.floor(xStatScale.invert(x) / params.bin_size);

    viewBin(n, true);
}

function handleStatHover(d, i) {
    var x = d3.mouse(this)[0];

    var g = d3.select(this);
    var index = parseInt(g.attr("name"));
    //console.log(index)
    var line = g.select(".vTimeLineGhost");

    if (x > 0 && x < statWidth - 1) {

        var bin_width = xStatScale(params.bin_size);
        var n = Math.floor(x / bin_width);
        var statistic = params.statistics[index];
        line.attr("x", n * bin_width);

        g.select(".movingTickText")
            .attr("x", (n+0.5) * bin_width)
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000));

        g.select(".movingValueText")
            .attr("x", (n+0.5) * bin_width)
            .text(d3.format(statistic.format)(statistic.values[n*2].value));

    }
}

function getStatX(x) {
    return xStatScale.invert(x);
}

//----------------------------------------------------------------------
//Detect and visualize communities

function detectCommunities(nodes, links) {

    if (params.coloring) {
        var nodes_id_list = [], links_list = [], init_part = {};

        for (i=0; i<nodes.length; i++) {
            nodes_id_list.push(nodes[i].id)
            //init_part[nodes[i].id] = community_init[nodes[i].id]
        }

        for (i=0; i<links.length; i++) {
            links_list.push({source: links[i].source.id, target: links[i].target.id, weight: 1.})
        }

        var community = jLouvain().nodes(nodes_id_list)
            .edges(links_list)
        //.partition_init(init_part);

        var community_assignment = community();

        var max_community_number = 0;

        nodes.forEach(function(node) {
            node.community = community_assignment[node.id];
            max_community_number = max_community_number < community_assignment[node.id] ? community_assignment[node.id]: max_community_number;
        })

        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));

        d3.selectAll('.node')
            .data(nodes)
            .style('fill', function(d){ return color(d.community);});

        d3.select("#community_count_div > span")
            .text((max_community_number + 1));
    }
    else {
        d3.selectAll('.node')
            .data(nodes)
            .style('fill', 'black')
    }
}

function toggleColoring(d, i) {
    var button = d3.select(this);
    if (button.classed("off")) {
        button.classed("off", false);
        params.coloring = true;
        redrawGraph(false);
    } else {
        button.classed("off", true);
        params.coloring = false;
        redrawGraph(false);
    }
}

//-------------------------------------------------------------------------
//Degree distribution


function drawDegreeDist(data) {

    //https://bl.ocks.org/mbostock/3885304

    var div = d3.select("#degree_dist_div")

    div.selectAll("*").remove()

    div.append("span")
      .classed("statistic_span", true)
      .text("Distribution of node degrees");

    div.append("br")

    var svg = div.append("svg")
                 .attr("width", 800)
                 .attr("height", 300)

    var margin = {top: 30, right: 100, bottom: 50, left: 100},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    svg.selectAll("*").remove()

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.degree; }));
  y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.degree); })
      .attr("y", function(d) { 
        console.log("hello")
        return y(d.frequency); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.frequency); })
      .on("mouseover", function(d, i) {
        console.log("hi")
        d3.select("#barText"+i)
          .classed("showBarText", true)
      })
      .on("mouseout", function(d, i) {
        console.log("hello")
        d3.select("#barText"+i)
          .classed("showBarText", false)
      })

  g.selectAll(".barText")
     .data(data)
     .enter().append("text")
     .classed("barText", true)
     .attr("id", function(d, i) {return "barText" + i})
     .attr("y", function(d) {return y(d.frequency) - 7})
     .attr("x", function(d) { return x(d.degree); })
     .text(function(d) {return Math.round(d.frequency * 10000) / 100 + "%"})
  
  svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", margin.top + height + 35)
        .style("stroke", "black")
        .html("Degree");

}
