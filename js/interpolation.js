// Discretizes the interpolation as rectangles equal to the number of divisions
function interpolationFill(container, w, h, divisions, start, end) {
  container.append('p').text(start + ' to ' + end);
  var svg = container.append('svg')
      .attr('width', w.toString() + 'px')
      .attr('height', h.toString() + 'px');

  var rectW = w/(divisions+1),
      lab = d3.scale.linear().domain([0, divisions-1])
          .interpolate(d3.interpolateLab)
          .range([d3.rgb(start), d3.rgb(end)]),
      rgb = d3.scale.linear().domain([0, divisions-1])
          .interpolate(d3.interpolateRgb)
          .range([d3.rgb(start), d3.rgb(end)]);

  for(var x = 0; x < divisions; x++) {
    svg.append('rect')
        .attr('x', x*rectW)
        .attr('y', 0)
        .attr('width', rectW+rectW/2)
        .attr('height', h/2)
        .style('fill', lab(x));
    svg.append('rect')
        .attr('x', x*rectW)
        .attr('y', h/2)
        .attr('width', rectW+rectW/2)
        .attr('height', h/2)
        .style('fill', rgb(x));
  }
}

(function() {
  // bg is an L*=50 gray for a neutral color
  var container = d3.select('body').append('div')
      .style('width', '600px')
      .style('padding', '15px')
      .style('background-color', d3.lab(50,0,0));

  interpolationFill(container, 400, 50, 400, 'white', 'blue');
  interpolationFill(container, 400, 50, 400, 'DeepSkyBlue', 'DarkOrange');
  interpolationFill(container, 400, 50, 400, 'red', 'blue');
  interpolationFill(container, 400, 50, 400, 'white', 'black');



  container.selectAll('svg').style('display', 'block');
})();
