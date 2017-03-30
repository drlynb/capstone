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
 			d.location = { lat: d.EventLat, lng: d.EventLng };
 		});

 		var ndx = crossfilter(data);

 		//define dimensions
 		var dateDim = ndx.dimension(function(d) {
 			return d["Datetime"];
 		});
 		var sexDim = ndx.dimension(function(d) {
 			return d["Gender"];
 		});
 		var ageDim = ndx.dimension(function(d) {
 			return d["Age"];
 		});
 		var cityDim = ndx.dimension(function(d) {
 			return d["City"];
 		});
 		var deadDim = ndx.dimension(function(d) {
 			return d["Dead"];
 		});
 		var suspectedSubstanceDim = ndx.dimension(function(d) {
 			return d["SuspectedSubstance"]
 		});
 		var locDim = ndx.dimension(function(d) {
 			return [d["EventLat"], d["EventLng"]];
 		});
 		var allDim = ndx.dimension(function(d) {
 			return d;
 		});


 		//define groups
 		var numRecordsByDate = dateDim.group();
 		var sexGroup = sexDim.group();
 		var ageGroup = ageDim.group();
 		var cityGroup = cityDim.group();
 		var deadGroup = deadDim.group();
 		var suspectedSubstanceGroup = suspectedSubstanceDim.group();
 		var locGroup = locDim.group();
 		//...
 		var all = ndx.groupAll();


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
 			
 		var eventGroup = deadDim.group().reduceSum(function(d) {
 			return d.Dead
 		})


 		//define charts
 		var eventcount = d3.selectAll("#count").text(all.reduceCount().value());
 		//var sbc = dc.barChart("#stacked-bar-chart");
 		//var brusher = dc.lineChart("#brush-chart");
 		//var barbrusher = dc.lineChart("#block-brush-chart");
 		//makeBarbrush(data);
 		//var eventcount = dc.numberDisplay("#count");
 		//makeLines(data);
 		makeSlider(data)
 			.dimension(dateDim)
 			.group(numRecordsByDate)
 			.x(d3.scaleTime().domain([new Date(2016, 0), new Date(2016, 11)]));

 		makeMap(data)
 			.dimension(cityDim)
 			.group(cityDeadGroup);




 		/*barbrusher
 			.width(650)
 			.height(100)
 			.margins({top: 10, right: 50, bottom: 20, left: 20})
 			.dimension(dateDim)
 			.group(numRecordsByDate)
 			.transitionDuration(500)
 			.x(d3.time.scale().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
 			.elasticY(true)
 			.renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 1.0});
	
 		sbc
 			.width(1050)
 			.height(140)
 			.margins({top: 10, right: 50, bottom: 20, left: 20})
 			.dimension(cityDim)
 			.group(cityDeadGroup, "Living", sel_stack('1'))
 			.valueAccessor(function(d) {
 				return d.value.living;
 			})
 			.stack(cityDeadGroup, "Dead", function(d){return d.value.fatalities;})
 			.renderLabel(true)
 			//.rangeChart(brusher)
 			.transitionDuration(500)
 			.x(d3.scale.ordinal())
 			.xUnits(dc.units.ordinal)
 			//.elasticX(true)
 			.elasticY(true);
 		sbc.legend(dc.legend());



 		dc.renderAll();*/
 		
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
 