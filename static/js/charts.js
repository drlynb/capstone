 "use strict";
 /*
  The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
 */
 queue()
 	.defer(d3.json, "/data")
 	.defer(d3.json, "/motor")
 	.await(makeGraphs);

 function makeGraphs(error, data) {
 	//get data from flask server
 	d3.json("/data", function(error, data) {
 		//d3.json("/geo", function(error2, cityJson){
 		//console.log(data[0].EventLat);
 		//datetime passed is a unix timestamp. convert to readable date
 		//var formatDate = d3.timeParse("%b %d %Y");
 		var formatMY = d3.timeFormat("%b %Y");
 		data.forEach(function(d) {
 			d.dd = new Date(d.Datetime);
 			//d.my = formatMY(d.dd); // pre-calculate month for better performance
 			d.my = new Date(d.dd.getFullYear() +"-"+ (d.dd.getMonth()+1)+"-01")
 			d.location = {
 				lat: d.EventLat,
 				lng: d.EventLng
 			};
 		});

 		var ndx = crossfilter(data);

 		//define dimensions
 		var dateDim = ndx.dimension(function(d) {
 			return d.my;
 		});
 		var stolenDim = ndx.dimension(function(d) {
 			return d["Age"];
 		});
 		var ageDim = ndx.dimension(function(d) {
 			return d["Agegroup"];
 		});
 		var cityDim = ndx.dimension(function(d) {
 			return d["City"];
 		});

 		var mapDim = ndx.dimension(function(d) {
 			return {
 				date: d.my,
 				lat: d["EventLat"],
 				lng: d["EventLng"]
 			};
 		});
 		/*var locDim = ndx.dimension(function(d) {
 			return [d["EventLat"], d["EventLng"]];
 		});*/
 		var allDim = ndx.dimension(function(d) {
 			return d;
 		});


 		//define groups
 		var numRecordsByDate = dateDim.group();
 		var all = ndx.groupAll();

 		var ageGroup = ageDim.group().reduce(
 			function(p, v) {
 				++p.total;

 				if (v.Gender == "M") {
 					++p.male;
 				}
 				else {
 					++p.female;
 				}
 				if (v.Dead == true) {
 					++p.dead;
 				}
 				else {
 					++p.living;
 				}

 				return p;
 			},
 			function(p, v) {
 				--p.total;

 				if (v.Gender == "M") {
 					--p.male;
 				}
 				else {
 					--p.female;
 				}
 				if (v.Dead == true) {
 					--p.dead;
 				}
 				else {
 					--p.living;
 				}

 				return p;

 			},
 			function() {
 				return {
 					total: 0,
 					male: 0,
 					female: 0,
 					living: 0,
 					dead: 0
 				};
 			}
 		);

 		var stolenGroup = stolenDim.group().reduce(
 			function(p, v) {
 				if (v.Dead == true) {
 					if(v.Age > 80){
 							return p;
 						}
 					if (v.Gender == 'M') {
 						p.male += 80 - v.Age;
 						p.total += 80 - v.Age;
 					}
 					else {
 						p.female += 84 - v.Age;
 						p.total += 84 - v.Age;
 					}
 				}
 				return p;
 			},
 			function(p, v) {
 				if(v.Age > 80){
 							return p;
 						}
 				if (v.Dead == true) {
 					if (v.Gender == 'M') {
 						p.male -= 80 - v.Age;
 						p.total -= 80 - v.Age;
 					}
 					else {
 						p.female -= 84 - v.Age;
 						p.total -= 84 - v.Age;
 					}
 				}
 				return p;
 			},
 			function() {
 				return {
 					female: 0,
 					male: 0,
 					total: 0
 				};
 			});


 		//define charts
 		//colours:
 		// stolen years - grey
 		// living - GoldenRod
 		// dead - SaddleBrown
 		// male - DarkKhaki
 		// female - AntiqueWhite
 		// overdose - DarkOrange
 		// motor - FireBrick 

 		var eventcount = d3.selectAll("#count").text(all.reduceCount().value());
 		var citycount = d3.selectAll("#cities").text("All Areas");
 		
 		// colour takes 1 array as domain (keys) 1 array as values (colours)
 		makeStolenYears(stolenGroup.all());

 		makeSlideBars2(ageGroup.top(Infinity))
 			.dimension(cityDim);
 			//.group(cityDeadGroup);


 		//console.log(cityGroup.top(Infinity));
 		//makeSlideBars(cityDeadGroup.top(Infinity))
 		makeSlideBars(cityDim)
 			.dimension(cityDim);
 			//.group(cityDeadGroup);

 		var mymap = makeMap(dateDim.top(Infinity))
 			.dimension(dateDim);
 			
 		makeBrushLines(dateDim)
 			.dimension(dateDim)
 			.group(numRecordsByDate);


 		// Renders the specified chart or list.
 		function render(method) {
 			d3.select(this).call(method);
 		}

 		function renderAll() {
 			chart.each(render);
 			d3.select("#count").text((all.value()));
 		}

 	});
 };
 