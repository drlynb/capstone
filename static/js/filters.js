/* global d3 */
function MakeFilters(myset) {
 var allcount = d3.select("#allf").append("div")
    .attr("width", 800);

  // function update(data) {
  this.update = function (data) {
    var t = d3.transition()
      .duration(750);

    // JOIN new data with old elements.
    var text = allcount.selectAll(".txt")
      .data(data, function (d) {
        return d;
      });

    // EXIT old elements not present in new data.
    text.exit()
      .transition(t)
      .tween("entering", function(){
        var y = d3.interpolate(-100, 100);
        var o = d3.interpolate(1, 0);
        var node = this;
        return function(t){
          node.y = y(t);
          node.style.opacity = o(t);
        };
      })
      .remove();

    // UPDATE old elements present in new data.
    /*text.attr("y", 20)
      .transition(t)
      .attr("color", "blue");*/

    // ENTER new elements present in new data.
    text.enter().append("span")
      .attr("dy", ".13em")
      .classed("txt", true)
      .text(function (d) {
        return d;
      })
      .transition(t)
      .tween("entering", function(){
        var y = d3.interpolate(-100, 100);
        var o = d3.interpolate(0, 1);
        var node = this;
        return function(t){
          node.y = y(t);
          node.style.opacity = o(t);
        };
      });
  };
  // The initial display.
  this.update(myset);
  return this;
}
