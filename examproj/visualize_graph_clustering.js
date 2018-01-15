//----------------------------------------------------------------------
//Detect and visualize communities

function drawCommunities() {

    bin_nodes = graph_seq.nodes[visualisation_params.current_bin]

    if (document.getElementById("communities_checkbox").checked) {

        //console.log(data_props.current_bin)
        //console.log(bin_nodes)

        community_assignment = visualisation_params.communities[visualisation_params.current_bin]

        var max_community_number = 0;

        bin_nodes.forEach(function(node) {        
            node.community = community_assignment[node.id]
            max_community_number = max_community_number < community_assignment[node.id] ? community_assignment[node.id]: max_community_number;
        })
        
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range([0, max_community_number]));

        d3.selectAll('.node')
          .data(bin_nodes)
          .style('fill', function(d){ return color(d.community);})

        //d3.select("#n_communities")
        //  .html((max_community_number + 1))
    }
    else {
        
        d3.selectAll('.node')
          .data(bin_nodes)
          .style('fill', 'black')

        document.getElementById("init_part_checkbox").checked = false;

    }
}