var visualisation_params = {
    
}



function ticked() {
    link
        .attr("x1", function(d) { return d.source.x * scale + transX; })
        .attr("y1", function(d) { return d.source.y * scale + transY; })
        .attr("x2", function(d) { return d.target.x * scale + transX; })
        .attr("y2", function(d) { return d.target.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});

    node
        .attr("cx", function(d) { return d.x * scale + transX; })
        .attr("cy", function(d) { return d.y * scale + transY; });
        // .each(function(d, i){
        //     var op = parseFloat(d3.select(this).style("opacity"));
        //     d3.select(this).style("opacity", op < 1 ? op + 0.01 : 1)});
}

 
//---------------------------------------------------------------------




/*
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
*/