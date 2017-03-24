 "use strict";
/*
 The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
*/
queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

//can use to toggle categories?
//https://dc-js.github.io/dc.js/examples/complex-reduce.html
	
function makeGraphs(error, data) {
	//get data from flask server
	d3.json("/data", function(error, data) {

	//datetime passed is a unix timestamp. convert to readable date
	data.forEach(function (d) {
        d.dd= new Date(d.Datetime);
        d.month = d3.time.month(d.dd); // pre-calculate month for better performance
    });

	var ndx = crossfilter(data);
	
	//define dimensions
	var dateDim = ndx.dimension(function(d) {return d["Datetime"]; });
	var sexDim = ndx.dimension(function(d) {return d["Gender"]; });
	var ageDim = ndx.dimension(function(d) {return d["Age"]; });
	var cityDim = ndx.dimension(function(d) {return d["City"]; });
	var deadDim = ndx.dimension(function(d) {return d["Dead"]; });
	//...
	var allDim = ndx.dimension(function(d) {return d;});
	
	var numRecordsByDate = dateDim.group();
	var sexGroup = sexDim.group();
	var ageGroup = ageDim.group();
	var cityGroup = cityDim.group();
	var deadGroup = deadDim.group();
	//...
	var all = ndx.groupAll();
	

	var cityDeadGroup = cityDim.group().reduce(
		function(p, v) {
			if(v.Dead == true){++p.fatalities;}
			else {++p.living;}
			++p.total;
			return p;
		}, function(p, v) {
			if(v.Dead == true){--p.fatalities;}
			else {--p.living;}
			--p.total;
			return p;
		}, function() {
			return {
				fatalities: 0,
				living: 0,
				total: 0
			};
		});
	
	//define charts
	var sbc = dc.barChart("#stacked-bar-chart");
	var brusher = dc.lineChart("#brush-chart");
	var eventcount = dc.numberDisplay("#count");

	
	//highlights bar segment?
	function sel_stack(i) {
		return function(d) {
			return d.value[i];
		};
	}

	
	// define chart parameters
	eventcount
        .formatNumber(d3.format("d"))
		.valueAccessor(function(d) {return d;})
        .group(all);
	
	brusher
		.width(650)
		.height(140)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
		.elasticY(true);
	
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



	dc.renderAll();
  });
};