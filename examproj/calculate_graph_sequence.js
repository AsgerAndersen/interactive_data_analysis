var graph_seq_params = {
    bin_size: 900,
    old_bin_size: null,
    start_time: 0,
    end_time: 60*60*24,
    bins: 60*60*24/900,
    threshold: -90,
    source: "user",
    target: "user2",
    current_bin: 0 //does not really belong hear.
};

var graph_seq = {
    all_nodes: [],
    nodes: [],
    links: []//,
    //nodes_vis: [],
    //links_vis: []
}

function calculateGraphs() {

    //defineTimeFormat() VISUALISERING

    //var n_to_draw = 0; VISUAL
    var i = 0;
    graph_seq.nodes = [];
    graph_seq.links = [];
    for (var n = 0; n < graph_seq_params.bins; n++) {
        var bin = [];
        var looping = true;
        while (looping) {
            var row = data[i];
            if (row.ts < (n+1) * graph_seq_params.bin_size) {
                bin.push(row);
            } else {
                looping = false;
            }
            i++;
        }
        var graphdata = calculateLinksNodes(bin, function(row){
                            return row.rssi > graph_seq_params.threshold;
                        });
        //console.log(n,graphdata)
        graph_seq.links[n] = graphdata.links;
        graph_seq.nodes[n] = graphdata.nodes;
        /* SÆT OVER I VISUALISERINGS FUNKTION 
        if (n === visualisation_params.current_bin && graph_seq_params.old_bin_size === graph_seq_params.bin_size ||
            n === 0 && graph_seq_params.old_bin_size !== graph_seq_params.bin_size){
            n_to_draw = n;
            //drawGraph(g, graph_seq.nodes[n], links[n]);
        }
        */
        /* VISUALISERINGS FUNKTION
        if (n === 0){
            d3.select("#stats")
                .selectAll("*")
                .remove();
            for (var k = 0; k < graph_functions_params.statistics.length; k++) {
                var divs = d3.select("#stats")
                    .append("div")
                    .classed("statistic_div", true)
                    .attr("id", "stat_div" + k);

                divs.append("span")
                    .classed("statistic_span", true)
                    .text(graph_functions_params.statistics[k].name);

                divs.append("br");

                divs.append("svg")
                    .classed("statistic_svg", true)
                    .attr("width", "800")
                    .attr("height", "200")
                    .attr("id", "stat" + k);
            }
        }
        */
    }
    //console.log(graph_seq)
    /*
    for (var j = 0; j < graph_functions_params.statistics.length; j++) {
        var canvas = d3.select("#stat" + j);
        var steps = calcGraphStatistics(graph_seq.links, graph_seq.nodes, graph_functions_params.statistics[j].method);
        drawStepChart(steps, canvas, graph_functions_params.statistics[j].line)

    }
    */
    //detectCommunities();
    //viewBin(n_to_draw, true, false);
    
    //graph_seq.nodes_vis = graph_seq.nodes.slice(0)
    //graph_seq.links_vis = graph_seq.links.slice(0)
}

//TODO: Add directed option, and options for minimum number of occurrences, etc.
function calculateLinksNodes(data, filter, count = false, directed = false) {
    var node1key = graph_seq_params.source;
    var node2key = graph_seq_params.target;

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
        nodes.push(graph_seq.all_nodes[key]); //Uses references instead of new node objects
    }
    return {"links": links, "nodes": nodes};
}