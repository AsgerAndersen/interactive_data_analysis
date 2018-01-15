var data;

var data_props = {
    nodes: 589
};

function init() {

    /* VISUALISERING

	*/

    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, dat) {
            if (error) throw error;
         
            //sim = simulation(width, height); VISUALISERING
            //initGraph(g); VISUALISERING
            data = dat;
            graph_seq.all_nodes = uniqueNodes(data)                  
            
            //svg.call(zooming); VISUAL
            //svg.call(zooming.transform, d3.zoomIdentity.translate(400, 400)); VISUAL
        	
        	calculateGraphs();
        	calculateGraphFunctions();
        	init_graph_vis();
        	drawGraph();
        }
    )
    //beregn graf funktioner
    //initialiser visualisering;
    //visualiser;

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
