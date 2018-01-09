d3.select(window).on('load', init);
var data, sim, svg, g;

var nodes = [], links = [];

var params = {
    "bin size": 300,
    "offset": 0,
    "bins": 10,
    "threshold": -300
};

function init() {


    svg = d3.select('svg');
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

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

/*
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
*/
