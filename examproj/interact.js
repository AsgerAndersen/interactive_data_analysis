/* FRA INIT
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

    var zooming = d3.zoom()
        .on("zoom", function(){
            scale = d3.event.transform.k;
            transX = d3.event.transform.x;
            transY = d3.event.transform.y;
            //scale = scale + zoomStep;
            sim.restart();
        });

    //svg.call(zooming); VISUAL
    //svg.call(zooming.transform, d3.zoomIdentity.translate(400, 400)); VISUAL


    //d3.zoom().transform(svg, d3.zoomIdentity);
    d3.zoom().scaleBy(svg, 0.1);
*/

var scale = 1;
var transX = 0;
var transY = 0;
var zoomStep = 0.1;

function zoom(n) {
    scale = n;
    drawGraph(g, graph_seq.nodes[visualisation_params.current_bin], graph_seq.links[visualisation_params.current_bin], false);
}

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
        n = visualisation_params.current_bin + n;
    }
    if (n < 0 || n >= graph_seq.links.length) {return;}
    visualisation_params.current_bin = n;
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

        drawGraph(g, graph_seq.nodes[n], graph_seq.links[n]);
    } else {
        d3.selectAll(".statistic_svg g .vTimeLine")
            .attr("x", x);

        d3.selectAll(".statistic_svg g .tickText")
            .text(formatTime(n * graph_seq_params.bin_size * 1000) + " - " + formatTime((n+1) * graph_seq_params.bin_size * 1000))
            .attr("x", x);
        drawGraph(g, graph_seq.nodes[n], graph_seq.links[n]);
    }

    drawCommunities();

}
