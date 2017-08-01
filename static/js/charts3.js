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
