var graph_vis = {
	canvas: null,
	sim: null,
	link: null,
	node: null
}

var zoom_props = {
	scale: 1,
	transX: 0,
	transY: 0,
	zoomStep: 0.1
}

function init_graph_vis() {

    svg = d3.select("#vis");
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    
    graph_vis.sim = simulation(width, height);
    
    var zooming = d3.zoom()
        .on("zoom", function(){
            zoom_props.scale = d3.event.transform.k;
            zoom_props.transX = d3.event.transform.x;
            zoom_props.transY = d3.event.transform.y;
            //scale = scale + zoomStep;
            graph_vis.sim.restart();
        });


    graph_vis.canvas = svg.append("g").attr("transform","translate(" + 0+ "," + 0 + ")");
    graph_vis.link = graph_vis.canvas.append("g").selectAll(".link");
    graph_vis.node = graph_vis.canvas.append("g").selectAll(".node");

    svg.call(zooming); 
    svg.call(zooming.transform, d3.zoomIdentity.translate(400, 400));

    d3.select("#reset_zoom_div")
        .on("click", resetZoom);

    d3.select("#reheat_div")
        .on("click", reheat);
}

function drawGraph(restart = true) {
    
    //https://bl.ocks.org/mbostock/1095795

    nodes = graph_seq.nodes[graph_seq_params.current_bin]
    links = graph_seq.links[graph_seq_params.current_bin]
    //console.log(links)
    //console.log(nodes)
    link = graph_vis.link
    node = graph_vis.node
    sim = graph_vis.sim 

    link = link.data(links);
    link.exit().remove();
    link = link.enter()
        .append("line")
        .classed("link", true)
        .merge(link);
    
    node = node.data(nodes);
    node.exit().remove();
    node = node.enter()
        .append("circle")
        .attr("r", 5)
        .classed("node", true)
        .merge(node);

    node.select("title")
        .remove();
    node.append("title")
        .text(function(d) { return d.id; });
    
    sim.nodes(nodes);

    sim.force("link").links(links);
    
    if (restart) {
        sim.alpha(0.1).restart();
    } else {
        sim.restart();
    }
    
}

function simulation(width, height) {
    return d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-100))
        //.force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .alphaDecay(0.01)
        .on("tick", ticked);
}

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x * zoom_props.scale + zoom_props.transX; })
        .attr("y1", function(d) { return d.source.y * zoom_props.scale + zoom_props.transY; })
        .attr("x2", function(d) { return d.target.x * zoom_props.scale + zoom_props.transX; })
        .attr("y2", function(d) { return d.target.y * zoom_props.scale + zoom_props.transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});

    node
        .attr("cx", function(d) { return d.x * zoom_props.scale + zoom_props.transX; })
        .attr("cy", function(d) { return d.y * zoom_props.scale + zoom_props.transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});
}

function resetZoom() {
    svg.transition().duration(750).call(zooming.transform, d3.zoomIdentity.translate(400, 400));
}

function reheat() {
    sim.alpha(0.2).restart();
}