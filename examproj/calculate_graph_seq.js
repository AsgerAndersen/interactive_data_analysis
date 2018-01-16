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

        graph_seq.links[n] = graphdata.links;
        graph_seq.nodes[n] = graphdata.nodes;
    }

    //console.log(graph_seq.nodes)
    //console.log(graph_seq.links)
    
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