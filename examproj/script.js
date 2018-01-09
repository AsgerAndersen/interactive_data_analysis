d3.select(window).on('load', init);
var data, sim, svg, g;

var nodes = [], links = [];

var params = {
    "bin_size": 300,
    "offset": 0,
    "bins": 10,
    "threshold": -300,
    "statistics": [
        {name: "Average Degree", method: function(links, nodes) { return averageDegree(links, nodes);}},
        {name: "Number of links", method: function(links, nodes) { return links.length; }},
        {name: "Number of nodes", method: function(links, nodes) { return nodes.length; }}
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
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    

    d3.csv(
        'data/sodas_data.csv',
        function (error, dat) {
            if (error) throw error;


            sim = simulation(width, height);
            data = dat;
            calculateGraphs()

            // // Temp
            // var x = d3.scaleLinear()
            //     .domain(d3.extent(data,
            //         function(d){
            //             return d['user'];
            //         }))
            //     .range([0,width]);
            // var y = d3.scaleLinear()
            //     .domain(d3.extent(data,
            //         function(d){
            //             return d['user2'];
            //         }))
            //     .range([0,height]);
            //
            //
            // g.selectAll("circle")
            //     .data(data)
            //     .enter()
            //     .append("circle")
            //     .attr("cx", function(d) {
            //         return x(d['user']) + "px";
            //     })
            //     .attr("cy", function(d) {
            //         return y(d['user2']) + "px";
            //     })
            //     .attr("r", "3")
            //     .attr("fill", "#ccc")
            //     .attr("stroke", "#aaa")

        }
    )
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

function averageDegree(links, nodes) {
    return 2*links.length / nodes.length;
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
        /*.domain(d3.extent(steps,
            function(d){
                return d.t;
            }))*/
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
     .attr("stroke-dasharray", 4)
     .attr("x1", function(d) {return x(d.t)})
     .attr("y1", function(d) {return y(d.value)})
     .attr("x2", function(d) {return x(d.t)})
     .attr("y2", function(d) {
        return (y(d.value - d.jump))
      });

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
} 
//---------------------------------------------------------------------


function calculateGraphs()
{
    var i = 0;
    for (var n = 0; n < params.bins; n++) {
        var bin = [];
        var looping = true;
        while (looping) {
            var row = data[i];
            if (row["ts"] < (n+1) * params["bin_size"]) {
                bin.push(row);
            } else {
                console.log("Loop done at:" + i);
                looping = false;
            }
            i++;
        }
        links[n] = calculateLinks(bin, "user", "user2", function(row){
            return row["rssi"] > params['threshold'];//&& row["ts"] > 0 && row["ts"] < 300;
        });
        nodes[n] = simulateNodes(bin);
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

        //Update stats progressively
        for (var j = 0; j < params["statistics"].length; j++) {
            var canvas = d3.select("#stat" + j);
            var steps = calcGraphStatistics(links, nodes, params["statistics"][j].method);
            drawStepChart(steps, canvas)
        }
    }



}

function calculateLinks(data, node1key, node2key, filter) {
    var links = [];
    for (var key in data) {
        var row = data[key];
        if (filter(row)) {
            links.push({"source": row[node1key], "target": row[node2key], "value": 0});
        }
    }

    return links;
}

function simulateNodes(data) {
    var nodes = [];
    var users = [];
    for (var key in data) {
        var row = data[key];
        //---- BUUUUUUGGGGG HERE ----
        console.log(nodes.indexOf(row["user"]));
        if (users.indexOf(row["user"]) < 0) {
            nodes.push({"id": row["user"]});
            users.push(row["user"]);
        }
        if (users.indexOf(row["user2"]) < 0) {
            nodes.push({"id": row["user2"]});
            users.push(row["user2"]);
        }
        //---- BUUUUUUGGGGG HERE ----
    }
    return nodes;
}

function drawGraph(canvas, nodes, links) {

    //COPY PASTE FROM https://bl.ocks.org/mbostock/4062045
    var link = canvas.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter().append("line")
        .style("stroke-width", "2")
        .style("stroke", "#888");

    var node = canvas.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 5)
        .attr("fill", "darkred");

    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(nodes)
        .on("tick", ticked);

    sim.force("link").links(links);

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

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-5))
        .force("center", d3.forceCenter(width / 2, height / 2));
}

