//----------------------------------------------------------------------
//Detect and visualize communities

//

function init_communities_vis() {
    
    d3.select("#toggle_communities_div")
      .on("click", toggleColoring);

}

function drawCommunities() {

    var bin_nodes = graph_seq.nodes[graph_seq_params.current_bin]
    console.log("Draw comm current_bin", graph_seq_params.current_bin)
    console.log("Is nodes to me", data_props.nodes - bin_nodes.length)
    if (document.getElementById("communities_checkbox").checked) {
        console.log("I am IN!")

        var max_community_number = graph_functions.clustering[0].statistic.values[graph_seq_params.current_bin]

        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));

        d3.selectAll('.node')
          .data(bin_nodes)
          .style('fill', function(d){ return color(d.community);})
    }
    else {
        d3.selectAll('.node')
          .data(bin_nodes)
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