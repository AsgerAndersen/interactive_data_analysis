d3.select(window).on('load', init);

function init() {

    var svg = d3.select('svg')
    var margin = {top: 50, right: 50, bottom: 200, left: 50};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Choose projection
    var projection = d3.geoKavrayskiy7()
        .scale(width/5)
        .translate([width / 2, height / 2]);

    // Setup path generator
    var path = d3.geoPath()
        .projection(projection);

    d3.json("https://raw.githubusercontent.com/d3/d3-geo/master/test/data/world-50m.json",
        function(error, data) {

            if (error) throw error;

            g.append("g")
                .attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(data, data.objects.countries).features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", "#ccc")
                .attr("stroke", "#aaa")
        })
}