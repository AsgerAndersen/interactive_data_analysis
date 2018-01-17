var data;

var data_props = {
    nodes: 589
};

function init() {

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

    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, dat) {
            if (error) throw error;
            data = dat;
            graph_seq.all_nodes = uniqueNodes(data)                  

            calculateGraphs();
        	calculateGraphFunctions();
            
            init_graph_vis();
            init_communities_vis();
            init_step_charts();

            $('.checkbox').checkboxradio({
                icon: false
            })

            drawStats();
            viewBin(0)

            
        }
    )
}

//Loops through data returns list of all unique node IDs
function uniqueNodes(data) {
    var node1key = graph_seq_params.source;
    var node2key = graph_seq_params.target;
    var all_nodes = [];
    for (var n = 0; n < data.length; n++) {
        var row = data[n];
        all_nodes[row[node1key]] = true;
        all_nodes[row[node2key]] = true;
    }
    for (var key in all_nodes) {
        all_nodes[key] = {id: key};
    }
    return all_nodes;
}
