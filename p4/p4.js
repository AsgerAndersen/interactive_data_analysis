d3.select(window).on('load', init);
var hands = {};
var hands_pca = {};

function init() {
    updateVisualisations();
}

function updateVisualisations() {
    loadHands("hands.csv", hands, function(data) {plot(data, -1, '#hand1', false, true, true, true, 'x', 'y')});

    loadPCA("hands_pca.csv", hands_pca, function(data) {
        plot(data, -1, '#hand2', true, false, false, false, 'p1', 'p2');
        d3.selectAll("#hand2 circle")
            .on("mouseover", function(d, i) {
                plot(hands, i, '#hand1', false, true, true, true, 'x', 'y');
            });
    });
}

function loadHands(filename, storage, callback) {
    d3.text(
        filename,
        function(text) {
            var hand_data = [];
            var min_x = [], max_x = [], min_y = [], max_y = [];
            var data = d3.csvParseRows(text).map(function(row) {
                return row.map(function(value) {
                    return +value;
                });
            });
            data.forEach(function(d, i) {

                if (filename == "hands_pca.csv" && i < 1) {console.log(d)}
                var x = d.slice(0, 56);
                var y = d.slice(56);

                max_x = x.concat(max_x).reduce(function(a, b) {
                    return Math.max(a, b);
                });

                min_x = x.concat(min_x).reduce(function(a, b) {
                    return Math.min(a, b);
                });

                max_y = y.concat(max_y).reduce(function(a, b) {
                    return Math.max(a, b);
                });

                min_y = y.concat(min_y).reduce(function(a, b) {
                    return Math.min(a, b);
                });
                var coords = x.map(function (v, i) { return [v, y[i]]; });
                hand_data[i] = coords;
            });

            //storage = {"domainx": [min_x, max_x], "domainy":  [min_y, max_y], "data": hand_data};
            storage["data"] = hand_data;
            storage["domainx"] = [min_x, max_x];
            storage["domainy"] = [min_y, max_y];
            callback(storage);
        }
    );
}

function loadPCA(filename, storage, callback) {
    d3.text(
        filename,
        function(text) {
            var pca_data = [];
            var min_x = [], max_x = [], min_y = [], max_y = [];
            var data = d3.csvParseRows(text).map(function(row) {
                return row.map(function(value) {
                    return +value;
                });
            });
            data.forEach(function(d, i) {

                var x = d[0];
                var y = d[1];

                max_x = Math.max(x, max_x);

                min_x = Math.min(x, min_x);

                max_y = Math.max(y, max_y);

                min_y = Math.min(y, min_y);

                pca_data[i] = [x, y];
            });
            //storage = {"domainx": [min_x, max_x], "domainy":  [min_y, max_y], "data": pca_data};
            storage["data"] = pca_data;
            storage["domainx"] = [min_x, max_x];
            storage["domainy"] = [min_y, max_y];
            callback(storage);
        }
    );
}

loadPCA("hands_pca.csv", hands_pca, function(data) {
        plot(data, -1, '#hand2', false, false, false);
        d3.selectAll("#hand2 circle")
            .on("mouseover", function(d, i) {
                plot(hands, i, '#hand1', true, true, true);
            });
    });

function plot(data, i, target, pca, axis_equal, multiple, drawline, x_name, y_name)
{

    var domainx = data["domainx"];
    var domainy = data["domainy"];
    var data = data["data"];
    var canvas = d3.select(target);

    var margin = {top: 5, right: 5, bottom: 50, left: 50};


    var height = canvas.node().getBoundingClientRect().height;
    var width = canvas.node().getBoundingClientRect().width;

    ignore_p1 = document.getElementById("ignore_p1").checked
    ignore_p2 = document.getElementById("ignore_p2").checked


    if (axis_equal) {
        var domain = [Math.min(domainx[0], domainy[0]), Math.max(domainx[1], domainy[1])];
        domainx = domain;
        domainy = domain;
    }

    var pad_scale = 0.00;
    var domain_padding = [(domainx[1]-domainx[0])*pad_scale,
        (domainy[1]-domainy[0])*pad_scale];

    var xScale = d3.scaleLinear()
        .domain([domainx[0]-domain_padding[0], domainx[1]+domain_padding[0]])
        .range([margin.left, width - margin.right]);

    var yScale = d3.scaleLinear()
        .domain([domainy[0]-domain_padding[1], domainy[1]+domain_padding[1]])
        .range([height - margin.bottom, margin.top]);


    var xAxis = d3.axisBottom(xScale);

    var yAxis = d3.axisLeft(yScale);


    canvas
        .selectAll("*")
        .remove();


    if (i < 0 && multiple) {
        for (var n = 0; n < data.length; n++) {
            var hand = data[n];
            if (drawline) {
                outline(hand, canvas, xScale, yScale)
                    .attr("stroke", d3.interpolateSpectral(n / data.length));
            }
            else {
                scatter(hand, canvas, xScale, yScale, false, false)
                    .attr("fill", d3.interpolateSpectral(n / data.length));
            }
        }
    }
    else if (i >= 0 && multiple) {
        var hand = data[i];
        if (drawline) {
            outline(hand, canvas, xScale, yScale)
                .attr("stroke", "darkred");
        }
        else {
            scatter(hand, canvas, xScale, yScale, false, false)
                .attr("fill", "darkred");
        }
    }
    else {
        if (drawline) {
            outline(data, canvas, xScale, yScale)
                .attr("stroke", "darkred");
        }
        else {
            scatter(data, canvas, xScale, yScale, ignore_p1, ignore_p2)
                .attr("fill", "darkred");
        }
    }
    
    if (!ignore_p1 || !pca) {
        canvas.append("g")
            .attr("transform", "translate(0," + (height-margin.bottom) + ")")
            .call(xAxis);
        
        canvas.append("text")
            .attr("x", margin.left + (width - margin.left - margin.right) / 2)
            .attr("y", height - margin.bottom + 35)
            .style("stroke", "black")
            .html(x_name);
    }

    if (!ignore_p2 || !pca) {
        canvas.append("g")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .call(yAxis);

        canvas.append("text")
            .attr("x", margin.left - 45)
            .attr("y", margin.top + (height - margin.top - margin.bottom) / 2)
            .style("stroke", "black")
            .html(y_name);
    }
    //C/P - End
}


function outline(data, target, xScale, yScale) {
    var lineFunction = d3.line()
        .x(function (d) {
            return xScale(d[0]);
        })
        .y(function (d) {
            return yScale(d[1]);
        });

    return target
        .append("path")
        .data([data])
        .attr("d", lineFunction)
        .attr("stroke-width","2")
        .attr("fill", "none");
}

function scatter(data, target, xScale, yScale, no_x, no_y) {
    return target.selectAll("g")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", "3px")
        .attr("cx", function(d){
            if (no_x) {
                return xScale(0);
            } 
            else {
                return ""+xScale(d[0])+"px";
            }
        })
        .attr("cy", function(d){
            if (no_y) {
                return yScale(0);
            } else {
                return ""+yScale(d[1])+"px";
            }
        });
}