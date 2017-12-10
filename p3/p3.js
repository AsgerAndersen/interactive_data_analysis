d3.select(window).on('load', init)

function init() {
    d3.json(
        'data.json',
        function(error, data) {
            if (error) throw error;
            // collectChildren(data)
            // data["children"].forEach(collectChildren)
            // delete data["partners"]
            // data["children"].forEach(function(c) {delete c["partners"]})
            // console.log(data)
            makeTreeWithPartners(data);
        }
    )
}

function getChildren(partner) {
    if (partner.hasOwnProperty("children")) {
        c = partner["children"]
        c.forEach(function(c) {c["other_parent"] = partner["name"]});
        return c 
    }
    else {
        return []
    }
}

function collectChildren(parent) {
    var c;
    if (parent.hasOwnProperty("partners")) {
        c = parent["partners"].map(p => getChildren(p));
        c = c.reduce(function(a, b){return a.concat(b)})
    }
    else {
        c = []
    }
    parent["children"] = c
    return
}

function makeTree(data) {

    var canvas = d3.select("#trump_tree")

    var margin = {top: 20, right: 20, bottom: 30, left: 40};
    var width = +canvas.node().getBoundingClientRect().width - margin.left - margin.right;
    var height = +canvas.node().getBoundingClientRect().height - margin.top - margin.bottom;

    var root = d3.hierarchy(data)

    var treeLayout = d3.tree()
    treeLayout.size([width,height])
    
    treeLayout(root)
    console.log(root)
    console.log(root.descendants())

    d3.select('svg g.nodes')
      .selectAll('circle.node')
      .data(root.descendants())
      .enter()
      .append('circle')
      .classed('node', true)
      .attr('cx', function(d) {return d.x;})
      .attr('cy', function(d) {return d.y;})
      .attr('r', 4);

    d3.select('svg g.nodes')
      .selectAll('text.node')
      .data(root.descendants())
      .enter()
      .append('text')
      .classed('node', true)
      .attr('x', function(d) {return d.x;})
      .attr('y', function(d) {return d.y + 22;})
      .text(function(d) {return d.data["name"]})

    d3.select('svg g.links')
      .selectAll('line.link')
      .data(root.links())
      .enter()
      .append('line')
      .classed('link', true)
      .attr('x1', function(d) {return d.source.x;})
      .attr('y1', function(d) {return d.source.y;})
      .attr('x2', function(d) {return d.target.x;})
      .attr('y2', function(d) {return d.target.y;});   
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

    var treeLayout = d3.tree();
    treeLayout.separation(function(a, b){
        return a.parent == b.parent ? 1 : 1.5;
    });

    treeLayout.size([width,height]);

    treeLayout(root);
    console.log(root);
    console.log(root.descendants());


    var nodes = d3.select('svg g.nodes')
        .selectAll('g')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('transform', function(d) {return "translate(" + d.x + "," + d.y + ")";})


    nodes.append('circle')
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

