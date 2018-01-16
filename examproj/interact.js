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

    calculateGraphs();
}


function viewBin(n, abs = false, trans = true) {
    
    if (!abs) {
        n = graph_seq_params.current_bin + n;
    }
    if (n < 0 || n >= graph_seq.links.length) {return;}
    
    graph_seq_params.current_bin = n;
    
    /*nodes[n].forEach(function(d){
        delete d.x;
        delete d.y;
        return d;
    });
    links[n].forEach(function(d){
        delete d.x1;
        delete d.x2;
        delete d.y1;
        delete d.y2;
        return d;
    });*/
    
    var x = xStatScale(n * graph_seq_params.bin_size);
    
    if (abs && trans) {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000))
            .transition()
            .attr("duration", 1000)
            .attr("x", x);

        drawGraph();

    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000))
            .attr("x", x);
        //console.log("hi")
        drawGraph();
    }

    //drawCommunities();

}





//FRA calculateGraps()

        /* SÆT OVER I VISUALISERINGS FUNKTION 
        if (n === graph_seq_params.current_bin && graph_seq_params.old_bin_size === graph_seq_params.bin_size ||
            n === 0 && graph_seq_params.old_bin_size !== graph_seq_params.bin_size){
            n_to_draw = n;
            //drawGraph(g, graph_seq.nodes[n], links[n]);
        }
        */