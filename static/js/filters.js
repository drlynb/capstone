/* global d3 */
function MakeFilters(myset) {
  var allcount = d3.select("#allf").append("svg")
    .attr("width", 800)
    .attr("height", 25);

  var myx = function (d, i) {
    if (d.length === 5) {
      return i * (d.length - 2) * 7;
    }
    return i * (d.length + 35);
  };

  // function update(data) {
  this.update = function (data) {
    var t = d3.transition()
      .duration(750);

    // JOIN new data with old elements.
    var text = allcount.selectAll("text")
      .data(data, function (d) {
        return d;
      });

    // EXIT old elements not present in new data.
    text.exit()
      .transition(t)
      .attr("y", 60)
      .style("fill-opacity", 1e-6)
      .remove();

    // UPDATE old elements present in new data.
    text.attr("y", 20)
      .style("fill-opacity", 1)
      .transition(t)
      .attr("x", myx);

    // ENTER new elements present in new data.
    text.enter().append("text")
      .attr("dy", ".13em")
      .attr("y", -60)
      .attr("x", myx)
      .style("fill-opacity", 1e-6)
      .text(function (d) {
        return d;
      })
      .transition(t)
      .attr("y", 20)
      .style("fill-opacity", 1);
  };
  // The initial display.
  this.update(myset);
  return this;
}
