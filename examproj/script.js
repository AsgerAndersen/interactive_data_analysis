d3.select(window).on('load', init);
var data, sim, svg, g, width, height;

var nodes = [], links = [], all_node_names = [];

var data_props = {
    "nodes": 0,
    "links": 0,
    "rows": 0,
    "current_bin": 0
};

var params = {
    "bin_size": 900,
    "offset": 0,
    "bins": 96,
    "threshold": -95,
    "source": "user",
    "target": "user2",
    "statistics": [
        {name: "Average Degree", method: function(links, nodes) { return averageDegree(links);}}/*,
        {name: "Network Density", method: function(links, nodes) {return networkDensity(links);}},
        {name: "Number of links", method: function(links, nodes) { return links.length; }},
        {name: "Number of nodes", method: function(links, nodes) { return nodes.length; }}*/
    ]
};

/*function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function simulateStepChartData(N) {
    data = []
    for (j=0; j<N; j++) {
        this_round = []
        m = getRandomInt(max_edges)
        for (i=0; i<m; i++) {
            //Note that this simulation is slightly wrong, 
            //since the real data should be an unweighted 
            //graph, meaning that each {source, target} map 
            //in the list should be unique, and that the 
            //corresponding {target, source} should not be
            //able to be part of the list.
            this_round.push({source: getRandomInt(n_nodes),
                             target: getRandomInt(n_nodes)})
        }
        data.push(this_round)
    }
    return data
}

var input = simulateStepChartData(n_bins)*/
//------------------------------------------------------------------------------

function init() {

    svg = d3.select("#vis");
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(
        'data/sodas_data.csv',
        function (error, dat) {
            if (error) throw error;

            //all_node_names = uniqueNodes(dat);
            data_props.nodes = 811;//Object.keys(all_node_names).length;
            sim = simulation(width, height);
            data = dat;
            calculateGraphs()

            d3.select("body")
                .on("keydown", function() {
                    if (d3.event.keyCode == 39) {
                        viewBin(1)
                    }
                    else if (d3.event.keyCode == 37) {
                        viewBin(-1)
                    }
                });
        }
    )
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
    return nodes;
}


function calculateGraphs()
{
    var i = 0;
    for (var n = 0; n < params.bins; n++) {
        console.log("Bin: " + n);
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
        links[n] = graphdata["links"]
        //links[n] = simulateNodes()
        nodes[n] = graphdata["nodes"]
        if (n === 0){
            drawGraph(g, nodes[n], links[n]);
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

        /*
        //Update stats progressively --- Use if it is a slow process
        for (var j = 0; j < params["statistics"].length; j++) {
            var canvas = d3.select("#stat" + j);
            var steps = calcGraphStatistics(links, nodes, params["statistics"][j].method);
            drawStepChart(steps, canvas)
        }
        */
    }

    for (var j = 0; j < params["statistics"].length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(links, nodes, params["statistics"][j].method);
        drawStepChart(steps, canvas)
    }
}



//TODO: Add directed option, and options for minimum number of occurrences, etc.
function calculateLinksNodes(data, filter, count = false, directed = false) {
    var node1key = params["source"];
    var node2key = params["target"];

    var link_map = {};
    var node_map = {}

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
        nodes.push({"id": key});
    }

    return {"links": links, "nodes": nodes};
}

//Draws the main visualisation
function drawGraph(canvas, nodes, links) {

    //COPY PASTE FROM https://bl.ocks.org/mbostock/4062045

    canvas.selectAll("*")
        .remove();

    var cx = width / 2;
    var cy = height / 2;

    var link = canvas.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .style("stroke-width", "2")
        .style("stroke", "#888")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", cy)
        .attr("y2", cy);

    var node = canvas.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "darkred")
        .attr("x", cx)
        .attr("y", cy);

    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(nodes)
        .on("tick", ticked);

    sim.force("link").links(links);

    sim.alpha(1).restart();

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

}

function viewBin(n, abs = false) {
    if (!abs) {
        n = data_props.current_bin + n;
    }
    if (n < 0 || n > links.length) {return;}
    data_props.current_bin = n;
    nodes[n].forEach(function(d){
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
    });
    drawGraph(g, nodes[n], links[n]);
}

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-5))
        .force("center", d3.forceCenter(width / 2, height / 2));
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
    statistics.pop();
    return statistics
}

function averageDegree(links) {
    var n_nodes = data_props.nodes;
    console.log(n_nodes);
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
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([params.offset, (params.bins - 1) * params.bin_size])
        .range([0,width]);

    var y = d3.scaleLinear()
        .domain(d3.extent(steps,
            function(d){
                return d.value;
            }))
        .range([height,0]);

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

