d3.select(window).on('load', init);

function init() {

    var svg = d3.select('svg')
    var margin = {top: 50, right: 50, bottom: 50, left: 50};
    var width = +svg.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv(
        'data/sodas_data.csv',
        function (error, data) {

            var part = [];
            for (var n = 0; n < 10; n++) {
                part[n] = data[n];
            }

            data = part;

            var x = d3.scaleLinear()
                .domain(d3.extent(data,
                    function(d){
                        return d['user'];
                    }))
                .range([0,width]);
            var y = d3.scaleLinear()
                .domain(d3.extent(data,
                    function(d){
                        return d['user2'];
                    }))
                .range([0,height]);

            if (error) throw error;
            g.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) {
                    return x(d['user']) + "px";
                })
                .attr("cy", function(d) {
                    return y(d['user2']) + "px";
                })
                .attr("r", "3")
                .attr("fill", "#ccc")
                .attr("stroke", "#aaa")
        }
    )
}