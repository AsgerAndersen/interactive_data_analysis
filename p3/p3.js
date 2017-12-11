d3.select(window).on('load', init)

function init() {
    d3.json(
        'data.json',
        function(error, data) {
            if (error) throw error;
            d3.json(
                'links.json',
                function(error, links) {
                    addLinks(data, links)
                    makeTreeWithPartners(data);
                }
                )
        }
    )
}

function addLinks(node, links) {
    addLink(node, links)
    if (node.hasOwnProperty("partners")) {
        node["partners"].forEach(function(p) {addLinks(p, links)})
    }
    else if (node.hasOwnProperty("children")) {
        node["children"].forEach(function(p) {addLinks(p, links)})
    }
    else {return}
}

function addLink(node, links) {
    for (i = 0; i < links.length; i++) {
        //console.log("-----------------")
        //console.log(links[i]["name"])
        if (links[i]["name"] == node["name"]) {
            //console.log(links[i]["name"])
            //console.log(links[i]["link"])
            //console.log(node["name"])
            node["link"] = links[i]["link"]
        }
    }
}

function makeTreeWithPartners(data) {

    var canvas = d3.select("#trump_tree")

    var margin = {top: 30, right: 20, bottom: 30, left: 40};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var root = d3.hierarchy(data, function(d){
        if (d.partners)
        {
            return d.partners.map(function (c){
                if (c.partners){
                    c.p = 1;
                } else {
                    c.p = 0;
                }
                c.TrumpBlood = 0;
                return c;
            });
        }
        else if (d.children)
        {
            return d.children.map(function (c){
                if (c.partners){
                    c.p = 1;
                } else {
                    c.p = 0;
                }
                c.TrumpBlood = 1;
                return c;
            });
        }
        else
        {
            return [];
        }

    });
    console.log(root)
    var treeLayout = d3.tree();
    treeLayout.separation(function(a, b){
        return a.parent == b.parent ? 1 : 1.5;
    });

    treeLayout.size([width,height]);

    treeLayout(root);
    //console.log(root);
    //console.log(root.descendants());


    var nodes = d3.select('svg g.nodes')
        .selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', function(d) {return "translate(" + d.x + "," + d.y + ")";})

    nodes.append("a")
        .attr("href", function(d) {return d.data["link"]})
        .attr("target", "_blank")
        .append('circle')
        .classed('node', true)
        .style("stroke", "steelblue")
        .style("fill", function(d) {return (d.data.TrumpBlood == 0 ? "white" : "steelblue");})
        .attr('r', 8);

    nodes.append("text")
        .text(function(d) {return d.data["name"]})
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, -20)")
        .classed('node', true);


    d3.select('svg g.links')
        .selectAll('line.link')
        .data(root.links())
        .enter()
        .append('line')
        .classed('link', true)
        .attr('x1', function(d) {return d.source.x;})
        .attr('y1', function(d) {return d.source.y;})
        .attr('x2', function(d) {return d.target.x;})
        .attr('y2', function(d) {return d.target.y;})
        .attr('stroke-dasharray', function (d) {
            return (d.source.data.p == 0 ? "" : "5,5");
        });
}

