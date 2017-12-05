d3.select(window).on('load', init);

function init() {
  d3.csv(
    'data.csv',
    function(d) {
      d.frequency *= 100.0;
      return d;
    },
    function(error, data) {
      if (error) throw error;

      d3.select('body')
        .append('ul')
        .selectAll('li')
        .data(data)
        .enter()
        .append('li')
        .text(function(d){
          return d.letter+':'+
            d.frequency;
        });
    });
}