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
 		var formatDate = d3.timeParse("%b %d %Y");
 		var formatMonth = d3.timeParse("%b");
 		data.forEach(function(d) {
 			d.dd = new Date(d.Datetime);
 			d.month = formatMonth(d.dd); // pre-calculate month for better performance
 			d.location = {
 				lat: d.EventLat,
 				lng: d.EventLng
 			};
 		});

 		var ndx = crossfilter(data);

 		//define dimensions
 		var dateDim = ndx.dimension(function(d) {
 			return d["Datetime"];
 		});
 		/*var sexDim = ndx.dimension(function(d) {
 			return d["Gender"];
 		});*/
 		var stolenDim = ndx.dimension(function(d) {
 			return d["Age"];
 		});
 		var ageDim = ndx.dimension(function(d) {
 			return d["Age"];
 		});
 		var cityDim = ndx.dimension(function(d) {
 			return d["City"];
 		});

 		var mapDim = ndx.dimension(function(d) {
 			return {
 				date: d.dd,
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
 		//var sexGroup = sexDim.group();
 		//var cityGroup = cityDim.group();
 		//var mapGroup = mapDim.group();
 		//var deadGroup = deadDim.group();
 		//var suspectedSubstanceGroup = suspectedSubstanceDim.group();
 		//var locGroup = locDim.group();
 		//...
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

 		var cityDeadGroup = cityDim.group().reduce(
 			function(p, v) {
 				if (v.Dead == true) {
 					++p.fatalities;
 				}
 				else {
 					++p.living;
 				}
 				++p.total;
 				return p;
 			},
 			function(p, v) {
 				if (v.Dead == true) {
 					--p.fatalities;
 				}
 				else {
 					--p.living;
 				}
 				--p.total;
 				return p;
 			},
 			function() {
 				return {
 					fatalities: 0,
 					living: 0,
 					total: 0
 				};
 			});

 		function determineAge(agegroup, gender) {
 			switch (agegroup) {
 				case "<16":
 					return gender == 'M' ? 80 - 15 : 84 - 15;
 				case "16-25":
 					return gender == 'M' ? 80 - 20 : 84 - 20;
 				case "26-35":
 					return gender == 'M' ? 80 - 30 : 84 - 30;
 				case "36-45":
 					return gender == 'M' ? 80 - 40 : 84 - 40;
 				case "46-55":
 					return gender == 'M' ? 80 - 50 : 84 - 50;
 				case "56-65":
 					return gender == 'M' ? 80 - 60 : 84 - 60;
 				case "66-75":
 					return gender == 'M' ? 80 - 70 : 84 - 70;
 				case "76-85":
 					return gender == 'M' ? 80 - 80 : 84 - 80;
 				case "86+":
 					return 0;
 			}
 		}


 		var stolenGroup = stolenDim.group().reduce(
 			function(p, v) {
 				if (v.Dead == true) {
 					var years = determineAge(v.Age, v.Gender);

 					if (v.Gender == 'M') {
 						p.male += years;
 					}
 					else {
 						p.female += years;
 					}

 					p.total += years;
 				}
 				return p;
 			},
 			function(p, v) {
 				if (v.Dead == true) {
 					var years = determineAge(v.Age, v.Gender);

 					if (v.Gender == 'M') {
 						p.male += years;
 					}
 					else {
 						p.female += years;
 					}

 					p.total += years;
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

 		var eventcount = d3.selectAll("#count").text(all.reduceCount().value());

 		//console.log(ageGroup.top(Infinity));
 		makeLines(ageGroup.top(Infinity))
 			.dimension(ageDim)
 			.group(ageGroup);

 		makeStolenYears(stolenGroup.top(Infinity));

 		makeSlideBars2(ageGroup.top(Infinity))
 			.dimension(cityDim)
 			.group(cityDeadGroup);


 		//console.log(cityGroup.top(Infinity));
 		makeSlideBars(cityDeadGroup.top(Infinity))
 			.dimension(cityDim)
 			.group(cityDeadGroup);

 		var mymap = makeMap(mapDim.top(Infinity))
 			.dimension(mapDim);

 		makeSlider(mapDim)
 			.dimension(dateDim)
 			.group(numRecordsByDate)


 		//console.log(mymap.dimension.filter());
 		// slider and linking?
 		/*var charts = [
 			makeSlider(data, mymap)
 			.dimension(dateDim)
 			.group(numRecordsByDate)
 			.x(d3.scaleTime()
 				.domain([new Date(2007, 0), new Date(2016, 11)])
 				.rangeRound([0, 10 * 90]))
 			.filter([new Date(2010, 1, 1), new Date(2011, 2, 1)])
 		];

 		var chart = d3.selectAll("#slider")
 			.data(charts)
 			.each(function(chart) {
 				chart
 					.on("brush", function() {
 						renderAll();
 					})
 					.on("brushend", function() {
 						renderAll();
 					});
 			});*/


 		// Renders the specified chart or list.
 		function render(method) {
 			d3.select(this).call(method);
 		}

 		function renderAll() {
 			chart.each(render);
 			d3.select("#count").text((all.value()));
 		}

 		/*makeSlider(data, charts)
 			.dimension(dateDim)
 			.group(numRecordsByDate)
 			.x(d3.scaleTime()
 				.domain([new Date(2007, 0), new Date(2016, 11)])
 				.rangeRound([0, 10 * 90]))
 			.filter([new Date(2010, 1, 1), new Date(2011, 2, 1)]);*/


 		/*
 		var hide = false;
		var clicktoshow = false;
		//configure bootstrap popovers (for stage and hate crimes terms)
		$('#popover').popover({ trigger: 'manual' }).hover(function(e){
			if (!$("#popover").next('div.popover:visible').length && hide ===false){
				$(this).popover('show');
				e.preventDefault();
			} else if (hide){
				hide = false;
			}
		}).click(function(e){
			if ($("#popover").next('div.popover:visible').length){
				hide = true;
			} else {
				clicktoshow=true;
				$('#popover').popover('show');
			}
		});
		$('#popovertitle').popover({ trigger: 'manual' }).hover(function(e){
			if (!$("#popovertitle").next('div.popover:visible').length && hide ===false){
				$(this).popover('show');
				e.preventDefault();
			} else if (hide){
				hide = false;
			}
		}).click(function(e){
			if ($("#popovertitle").next('div.popover:visible').length){
				hide = true;
			} else {
				clicktoshow=true;
				$('#popovertitle').popover('show');
			}
		});
		$('#popovergeneral').popover({ trigger: 'manual' }).hover(function(e){
			if (!$("#popovergeneral").next('div.popover:visible').length && hide ===false){
				$(this).popover('show');
				e.preventDefault();
			} else if (hide){
				hide = false;
			}
		}).click(function(e){
			if ($("#popovergeneral").next('div.popover:visible').length){
				hide = true;
			} else {
				clicktoshow=true;
				$('#popovergeneral').popover('show');
			}
		});
		
		//hide on click somewhere on the screen
		$(document).click(function(e) {
			if (($("#popover").next('div.popover:visible').length || $("#popovertitle").next('div.popover:visible').length || $("#popovergeneral").next('div.popover:visible').length) && clicktoshow===false){
				$('#popover').popover('hide');
				$('#popovergeneral').popover('hide');
				$('#popovertitle').popover('hide');
			} else if (clicktoshow){
				clicktoshow=false;
			}
		});
 		*/
 	});
 };
 