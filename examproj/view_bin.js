function viewBin(n, abs = false, trans = true) {
    
    if (!abs) {
        n = graph_seq_params.current_bin + n;
    }
    if (n < 0 || n >= graph_seq.links.length) {return;}
    
    graph_seq_params.current_bin = n;
    
    var bin_width = xStatScale(graph_seq_params.bin_size);
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

        d3.selectAll(".statistic_svg g .valueText")
            .text(function(d, i) {return d3.format(graph_functions.statistics[i].format)(graph_functions.statistics[i].values[n]);})
            .transition()
            .attr("duration", 1000)
            .attr("x", x + bin_width / 2);

        drawGraph();

    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000))
            .attr("x", x);

        d3.selectAll(".statistic_svg g .valueText")
            .attr("x", x + bin_width / 2)
            .text(function(d, i) {
                //console.log(graph_functions.statistics[i])
                return d3.format(graph_functions.statistics[i].format)(graph_functions.statistics[i].values[n]);});

        drawGraph();
    }

    drawCommunities();
}