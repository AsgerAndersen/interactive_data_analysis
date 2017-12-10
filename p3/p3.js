d3.select(window).on('load', init)

function init() {
    d3.json(
        'data.json',
        function(error, data) {
            if (error) throw error;
            collectChildren(data)
            data["children"].forEach(collectChildren)
            delete data["partners"]
            data["children"].forEach(function(c) {delete c["partners"]})
            console.log(data)
            makeTree(data)
        }
    )
}

function getChildren(partner) {
    if (partner.hasOwnProperty("children")) {
        c = partner["children"]
        c.forEach(function(c) {c["other_parent"] = partner["name"]})
        return c 
    }
    else {
        return []
    }
}

function collectChildren(parent) {
    var c;
    if (parent.hasOwnProperty("partners")) {
        c = parent["partners"].map(p => getChildren(p))
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

