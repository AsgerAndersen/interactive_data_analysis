d3.select(window).on('load', init);
var data, sim, svg, g, width, height, xStatScale, leftStatMargin, statWidth, link, node;

//var n_init_communities = 2;
var nodes = [], links = [], all_nodes = [];//, community_init = {};

var data_props = {
    "nodes": 589,
    "links": 0,
    "rows": 0,
    "current_bin": 0
};

var params = {
    "bin_size": 900,
    "offset": 0,
    "bins": 100,
    "threshold": -90,
    "source": "user",
    "target": "user2",
    "statistics": [
        {name: "Average Degree", method: function(links, nodes) { return averageDegree(links);}},
        {name: "Number of isolated nodes", method: function(links, nodes) { return (data_props.nodes - nodes.length); }},
        //{name: "Network Density", method: function(links, nodes) {return networkDensity(links);}},
        {name: "Number of links", method: function(links, nodes) { return links.length; }}
    ],
    "old_bin_size": null
};

function init() {

    svg = d3.select("#vis");
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, dat) {
            if (error) throw error;
         
            sim = simulation(width, height);
            data = dat;
            initGraph(g);

            all_nodes = uniqueNodes(dat);         
            //all_nodes.forEach(function(node) {
            //	community_init[String(node.id)]=getRandomInt(0,n_init_communities);
            //})            

            updatePars()
        }
    )
}

function updatePars() {

    var threshold = document.getElementById("threshold_slider").valueAsNumber;
    var binsize = document.getElementById("binsize_slider").valueAsNumber;
    var n_bins = document.getElementById("n_bins_slider").valueAsNumber;

    d3.select("#threshold_value")
      .html(threshold)
    d3.select("#binsize_value")
      .html(binsize)
    d3.select("#n_bins_value")
      .html(n_bins)

    params.old_bin_size = params.bin_size;
    params.threshold = threshold;
    params.bin_size = binsize;
    params.bins = n_bins;

    calculateGraphs();

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
    var i = 0;
    nodes = [];
    links = [];
    for (var n = 0; n < params.bins; n++) {
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
        //links[n] = simulateNodes()
        nodes[n] = graphdata["nodes"];
        if (n === data_props.current_bin && params.old_bin_size === params.bin_size ||
            n === 0 && params.old_bin_size !== params.bin_size){
            n_to_draw = n;
            drawGraph(g, nodes[n], links[n]);
        }

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

    for (var j = 0; j < params["statistics"].length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(links, nodes, params["statistics"][j].method);
        console.log(steps.length);
        drawStepChart(steps, canvas)

    }

    viewBin(n_to_draw, true, false);
}



//TODO: Add directed option, and options for minimum number of occurrences, etc.
function calculateLinksNodes(data, filter, count = false, directed = false) {
    var node1key = params["source"];
    var node2key = params["target"];

    var link_map = {};
    var node_map = {};

    for (var key in data) {
        var row = data[key];
        if (filter(row)) {
            var source = row[node1key];
            var target = row[node2key];
            node_map[source] = true;
            node_map[target] = true;
            if (!link_map[source]) {
                link_map[source] = {};
            }
            link_map[source][target] = true;

            if(link_map[target]) {
                delete link_map[target][source]; //Not good if target == source
            }
        }
    }

    var links = [];
    for (var source in link_map) {
        for (var target in link_map[source]) {
            links.push({"source": source, "target": target, "value": 0});
        }
    }

    var nodes = [];
    for (var key in node_map) {
        nodes.push(all_nodes[key]); //Uses references instead of new node objects
    }
    return {"links": links, "nodes": nodes};
}

function initGraph(canvas) {

    link = canvas
        .append("g")
        .selectAll(".link");

    node = canvas
        .append("g")
        .selectAll(".node");
}

//Draws the main visualisation
function drawGraph(canvas, nodes, links, shuffle = true) {

    //https://bl.ocks.org/mbostock/1095795

    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter()
        .append("line")
        .classed("link", true)
        .merge(link);


    node = node.data(nodes, function(d) { return d.id;});
    node.exit().remove();
    node = node.enter()
        .append("circle")
        .attr("fill", "darkred")
        .attr("r", 5)
        .attr("cx", width/2)
        .attr("cy", height/2)
        .classed("node", true)
        .merge(node);

    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(nodes);

    sim.force("link").links(links);

    sim.alpha(1).restart();

    drawNoLinksBar(data_props.nodes - nodes.length)

    detectCommunities(nodes, links)
}

function viewBin(n, abs = false, trans = true) {
    if (!abs) {
        n = data_props.current_bin + n;
    }
    if (n < 0 || n >= links.length) {return;}
    data_props.current_bin = n;
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
            .attr("x", x);

        drawGraph(g, nodes[n], links[n]);
    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000))
            .attr("x", x);
        drawGraph(g, nodes[n], links[n], false);
    }

}

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .on("tick", ticked);
}

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

//---------------------------------------------------------------------
//Draw bar with number of nodes without any links
function drawNoLinksBar(n) {

    d3.select("#n_nolinks")
      .html(n.toString())

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
    var statistics = [];
    for (var i=0; i<links.length; i++) {
        var value = statistic(links[i], nodes[i]);
        var t = i*params.bin_size;
        if (i === 0) {
            statistics.push({t: t,
                             value: value,
                             left: true})
        }
        else {
            var last_value = statistics[2*i-2].value;
            var jump = value - last_value;
            statistics.push({t: t,
                             value: last_value,
                             left: false});
            statistics.push({t: t,
                             value: value,
                             left: true,
                             jump: jump})
        }
    }
    //statistics.pop();
    return statistics
}

function averageDegree(links) {
    var n_nodes = data_props.nodes;
    return 2*links.length / n_nodes;
}

function networkDensity(links) {
    var n_nodes = data_props.nodes;
    return 2*(links.length - n_nodes + 1) / (n_nodes * (n_nodes - 3) + 2);
}
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, canvas) {

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
        .domain([params.offset, params.bins * params.bin_size])
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
                return d.value;
            }))
        .range([height,0]);

    var xAxis = d3.axisBottom(x)
        .tickValues(d3.range(params.offset, params.bin_size * params.bins, params.bin_size));

    var yAxis = d3.axisLeft(y);

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
     .attr("stroke", "grey")
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



    /*
    g.selectAll(".stepgraph-circle")
        .data(steps)
        .enter()
        .append("circle")
        .classed("stepgraph-circle", true)
        .attr("cx", function(d) {
            return x(d.t) + "px";
        })
        .attr("cy", function(d) {
            return y(d.value) + "px";
        })
        .attr("r", "3")
        .attr("fill", function(d) {
            if (d.left) {return "black";}
            else {return "white";}
        })
        .attr("stroke", "black")
    */
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
    var line = g.select(".vTimeLineGhost");

    if (x > 0 && x < statWidth - 1) {

        var bin_width = xStatScale(params.bin_size);
        var n = Math.floor(x / bin_width);
        line.attr("x", n * bin_width);

        g.select(".movingTickText")
            .attr("x", (n+0.5) * bin_width)
            .text(formatTime(n * params.bin_size * 1000) + " - " + formatTime((n+1) * params.bin_size * 1000));

    }
}

function getStatX(x) {
    return xStatScale.invert(x);
}

//----------------------------------------------------------------------
//Detect and visualize communities

function detectCommunities(nodes, links) {
	
    if (document.getElementById("communities_checkbox").checked) {
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
            node.community = community_assignment[node.id]
            max_community_number = max_community_number < community_assignment[node.id] ? community_assignment[node.id]: max_community_number;
        })
        
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));

        d3.selectAll('.node')
          .data(nodes)
          .style('fill', function(d){ return color(d.community);})

        d3.select("#n_communities")
          .html((max_community_number + 1))
    }
    else {
        d3.selectAll('.node')
          .data(nodes)
          .style('fill', 'darkred')
    }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
