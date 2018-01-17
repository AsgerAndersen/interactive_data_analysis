var link, node;

function init_vis() {

    svg = d3.select("#vis");
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;
    g = svg.append("g")
        .attr("transform",
              "translate(" + 0+ "," + 0 + ")");
}


function initGraph(canvas) {

    link = canvas
        .append("g")
        .selectAll(".link");

    node = canvas
        .append("g")
        .selectAll(".node");
}