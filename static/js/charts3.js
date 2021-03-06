"use strict";
/* global d3 */
/* global queue */
/* global location */
/* global crossfilter */
/* global MakeStolenYears */
/* global MakeTimeline */
/* global MakeAgeBars */
/* global MakeFilters */
/* global MakeCityBars */
/* global MakeMap */
/* global L */
/*
 The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
*/
queue()
 .defer(d3.json, "/data")
 .defer(d3.json, "/motor")
 .defer(d3.json, "/natural")
 .defer(d3.json, "/map")
 .await(makeGraphs);

function makeGraphs(error, data) {
 d3.json("/data", function (error, data) {
  var allfilters = new Set();
  data.forEach(function (d) {
   d.dd = new Date(d.Datetime);
   d.my = new Date(d.dd.getFullYear() + "-" + (d.dd.getMonth() + 1) + "-01");
   d.loc = new L.LatLng(d.EventLat, d.EventLng);
   allfilters.add(d.City);
   allfilters.add(d.agegroup);
  });

  function resetAll() {
   location.reload(); //refresh page
  }

  function checked() {
   stolenchart.updatecheck();
   citybarschart.updatecheck();
   mapchart.updatecheck();
   agebarschart.updatecheck();
  }

  var ndx = crossfilter(data);
  // colour takes 1 array as domain (keys) 1 array as values (colours)
  // overdose death, motor death, died, lived, Male, Female, stolen years
  var renderAll = function (_) {
   agebarschart.update();
   citybarschart.update();
   stolenchart.update();
   linechart.update();
   mapchart.update();
   var myfilters = agebarschart.selectedage.concat(citybarschart.selectedcities);
   if (myfilters.length > 0) {
    filterlist.update(myfilters);
   }
   else {
    filterlist.update(allfilters);
   }
  };

  function makeLegend() {
   // add legend
   // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
   var slidercolour = d3.scaleOrdinal(["#f92525", "#5d24f9", "#f92525", "#FDF2EE"]);
   var legendRectSize = 18;
   var legendSpacing = 4;
   var legend = d3.select("#legend").append("svg")
    .attr("width", 400)
    .attr("height", 20)
    .selectAll(".legend")
    .data(["Overdose", "Motor", "Lost Years", "Average Life Expectancy"])
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) {
     var height = legendRectSize + legendSpacing;
     var offset = height * slidercolour.domain().length / 2;
     var vert = i * height + offset;
     return "translate(" + 4*(vert) + "," + 0 + ")";
    });
   legend.append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", slidercolour)
    .style("stroke", slidercolour);
   legend.append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize - legendSpacing)
    .text(function (d) {
     return d.toUpperCase();
    });
  }
  makeLegend();
  //http://bl.ocks.org/jo/4068610

  var filterlist = new MakeFilters(allfilters);
  var stolenchart = new MakeStolenYears(ndx);
  var agebarschart = new MakeAgeBars(ndx, renderAll);
  var citybarschart = new MakeCityBars(ndx, renderAll);
  var mapchart = new MakeMap(citybarschart, renderAll);
  var linechart = new MakeTimeline(ndx, renderAll);
  d3.selectAll(".myCheckbox2").on("change", checked);
  d3.selectAll(".mybutton").on("click", resetAll);
 });
}
