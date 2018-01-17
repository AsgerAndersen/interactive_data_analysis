function updatePars() {

    var threshold = $("#threshold_slider").slider("option","value")
    var binsize = ($("#binsize_slider").slider("option","value"))*60
    var time_interval = $("#start_end_slider").slider("option","values")
    var n_bins = Math.floor( ( time_interval[1] - time_interval[0]) * 3600  / binsize );

    graph_seq_params.old_bin_size = graph_seq_params.bin_size;
    graph_seq_params.threshold = threshold;
    graph_seq_params.bin_size = binsize;
    graph_seq_params.bins = n_bins;
    graph_seq_params.start_time = time_interval[0]
    graph_seq_params.end_time = time_interval[1]

    if (graph_seq_params.old_bin_size === graph_seq_params.bin_size && graph_seq_params.bins > graph_seq_params.current_bin) {
        n_to_draw = graph_seq_params.current_bin;
    }
    else {
        var old_x = (graph_seq_params.current_bin + 0.5) * graph_seq_params.old_bin_size;
        var new_bin = Math.floor(old_x / graph_seq_params.bin_size);
        if (graph_seq_params.bins > new_bin) {
            n_to_draw = new_bin;
        }
    }

    calculateGraphs();
    calculateGraphFunctions();

    init_step_charts();
    draw_statistics();

    init_graph_vis();
    viewBin(n_to_draw, true, false)
}





//FRA calculateGraps()

        /* SÆT OVER I VISUALISERINGS FUNKTION 
        if (n === graph_seq_params.current_bin && graph_seq_params.old_bin_size === graph_seq_params.bin_size ||
            n === 0 && graph_seq_params.old_bin_size !== graph_seq_params.bin_size){
            n_to_draw = n;
            //drawGraph(g, graph_seq.nodes[n], links[n]);
        }
        */