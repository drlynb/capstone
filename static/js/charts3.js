"use strict";
/* global d3 */
/* global queue */
/* global location */
/* global crossfilter */
/* global makeStolenYears */
/* global makeTimeline */
/* global makeAgeBars */
/* global makeFilters */
/* global makeCityBars */
/* global makeMap */
/*
 The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
*/
queue()
 .defer(d3.json, "/data")
 .defer(d3.json, "/motor")
 .defer(d3.json, "/natural")
 .await(makeGraphs);

function makeGraphs(error, data) {
 d3.json("/data", function (error, data) {
  var myfilters = new Set();
  data.forEach(function (d) {
   d.dd = new Date(d.Datetime);
   d.my = new Date(d.dd.getFullYear() + "-" + (d.dd.getMonth() + 1) + "-01");
   d.loc = {
    lat: d.EventLat,
    lng: d.EventLng
   };
   myfilters.add(d.City);
   myfilters.add(d.agegroup);
  });

  // overdose death, motor death, died, lived, Male, Female, stolen years
  //var colour = ["DarkOrange", "#E85451", "GoldenRod", "SaddleBrown", "DarkKhaki", "Teal", "LightGrey", "DarkRed"];
  var margin = {
   top: 60,
   right: 50,
   bottom: 60,
   left: 90
  };
  var ndx = crossfilter(data);

  /****************************
   * Step6: Render the Charts  *
   ****************************/
  // colour takes 1 array as domain (keys) 1 array as values (colours)
  // overdose death, motor death, died, lived, Male, Female, stolen years
  var colours = ["#f92525", "#E85451", "#f92525", "SaddleBrown", "DarkKhaki", "Teal", "LightGrey", "DarkRed"];
  /*************************************************************************************
   * because the functions are nested they're "undefined" when trying to refer to them.
   * need to create new objects of the charts to assign them the update function.
   * ***********************************************************************************/
  //function renderAll(data) {
  var renderAll = function (data) {
   agebarschart.update();
   citybarschart.update();
   stolenchart.update();
   linechart.update();
   makeMap(citybarschart, renderAll);
   //mapchart.update();
   filterlist.update(agebarschart.selectedage.concat(citybarschart.selectedcities));
  };

  var filterlist = new makeFilters(myfilters);
  var stolenchart = new makeStolenYears(ndx, colours);
  var agebarschart = new makeAgeBars(ndx, colours.slice(2, 4), renderAll);
  var citybarschart = new makeCityBars(ndx, colours.slice(2, 4), renderAll);
  makeMap(citybarschart, renderAll);
  var linechart = new makeTimeline(ndx, colours.slice(0, 2), renderAll);
  d3.selectAll(".myCheckbox2").on("change.sb2", agebarschart.updatecheck);
  d3.selectAll(".myCheckbox2").on("change.sb1", citybarschart.updatecheck);
  d3.selectAll(".myCheckbox").on("change", stolencheck);
  d3.selectAll(".mybutton").on("click", resetAll);

  function stolencheck() {
   stolenchart.updatecheck();
  }
  function resetAll() {
   location.reload(); //refresh page
  }
 });
}