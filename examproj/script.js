d3.select(window).on('load', init);
var data, sim, svg, g;

var nodes = [], links = [];

var params = {
    "bin_size": 300,
    "offset": 0,
    "bins": 10,
    "threshold": -300
};

color = 'black'
radius = 3

//------------------------------------------------------------------------------
//Simulate data to use as input for the calculation of the graph statistics,
//which should be visualized as a step chart
n_nodes = 800
max_edges = 1000
n_bins = 20

function getRandomInt(max) {
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

input = simulateStepChartData(n_bins)
//------------------------------------------------------------------------------

function init() {

    svg = d3.select('svg');
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    steps = calcGraphStatistics(input, function(links){return averageDegree(links, n_nodes)})
    drawStepChart(steps, width, height)
    /*
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
*/
}

//---------------------------------------------------------------------
//Calculate the descriptive graph statistics, which should be visualized in the step charts

function calcGraphStatistics(links_sequence, statistic) {
    statistics = [];
    for (i=0; i<links_sequence.length; i++) {
        value = statistic(links_sequence[i])
        t = i*params.bin_size
        if (i == 0) {
            statistics.push({t: t,
                             value: value,
                             left: true})
        }
        else {
            last_value = statistics[2*i-2].value 
            jump = value - last_value
            statistics.push({t: t,
                             value: last_value,
                             left: false})
            statistics.push({t: t,
                             value: value,
                             left: true,
                             jump: jump})
        }
    }
    statistics.pop()
    return statistics
}

function averageDegree(links, n_nodes) {
    return 2*links.length / n_nodes
}
//---------------------------------------------------------------------

//---------------------------------------------------------------------
//Visualize the descriptive graph statistics in a step chart

function drawStepChart(steps, width, height) {

    var x = d3.scaleLinear()
        .domain(d3.extent(steps,
            function(d){
                return d.t;
            }))
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
     .style("stroke", color)
     .attr("x1", function(d) {return x(d.t)})
     .attr("y1", function(d) {return y(d.value)})
     .attr("x2", function(d) {
           return (x(d.t + params.bin_size))
        })
     .attr("y2", function(d) {return y(d.value)})
    
    g.selectAll(".stepgraph-vline")
     .data(steps.filter(function(d, i){
            return (d.left && (i != 0))
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
      })

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
        .attr("r", radius)
        .attr("fill", function(d) {
            if (d.left) {return color;}
            else {return "white";}
        })
        .attr("stroke", color)
} 
//---------------------------------------------------------------------


function calculateGraphs()
{
    var i = 0;
    for (var n = 0; n < 1; n++) {
        var bin = [];
        var looping = true;
        while (looping) {
            var row = data[i];
            if (row["ts"] < (n+1) * params["bin size"]) {
                bin.push(data[i]);
            } else {
                looping = false;
            }
            i++;

        }
        console.log(i);
        links[n] = calculateLinks(bin, "user", "user2", function(row){
            return row["rssi"] > params['threshold'];//&& row["ts"] > 0 && row["ts"] < 300;
        });
        nodes[n] = simulateNodes(bin);
        if (n == 0){
            drawGraph(g, nodes[n], links[n]);
        }
        n++;
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
    for (var key in data) {
        var row = data[key];
        //---- BUUUUUUGGGGG HERE ----
        if (nodes.indexOf(row["user"]) < 0) { nodes.push({"id": row["user"]})}
        if (nodes.indexOf(row["user1"]) < 0) { nodes.push({"id": row["user2"]})}
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

