 "use strict";
/*
 The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
*/
queue()
    .defer(d3.json, "/data")
    //.defer(d3.json, "/geo")
    .await(makeGraphs);

//can use to toggle categories?
//https://dc-js.github.io/dc.js/examples/complex-reduce.html

//https://github.com/austinlyons/dcjs-leaflet-untappd
	
function makeGraphs(error, data) {
	//get data from flask server
	d3.json("/data", function(error, data) {
			//d3.json("/geo", function(error2, cityJson){
	//console.log(data[0].EventLat);
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
	var suspectedSubstanceDim = ndx.dimension(function(d) {return d["SuspectedSubstance"]});
	//...
	var allDim = ndx.dimension(function(d) {return d;});
	
	var numRecordsByDate = dateDim.group();
	var sexGroup = sexDim.group();
	var ageGroup = ageDim.group();
	var cityGroup = cityDim.group();
	var deadGroup = deadDim.group();
	var suspectedSubstanceGroup = suspectedSubstanceDim.group();
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
	//var barbrusher = dc.lineChart("#block-brush-chart");
	//console.log(data[0].Datetime);
	//makeBarbrush(data);
	var eventcount = dc.numberDisplay("#count");
	makeMap(data);
	makeSlider(data);
	
	
	//var mymap = dc.geoChoroplethChart("#map");
	var eventGroup = deadDim.group().reduceSum(function(d){ return d.Dead})

	//var projection = d3.geo.mercator().scale(120).translate([400,200]);

	/*var mapheight = 600;
	var mapwidth = 900;
	var mymap = d3.select("#map")
					.append("svg")
					.attr("width", mapwidth)
					.attr("height",mapheight);
	var places = mymap.append("g");
	var albersProjection = d3.geo.albers()
		 .scale( 120 )
		.rotate( [71.057,0] )
		 .center( [0, 42.313] )
		 .translate( [mapwidth/2,mapheight/2] );

	var geoPath = d3.geo.path()
		.projection( albersProjection );

	places.selectAll( "path" )
		 .data( cityJson.features )
		  .enter()
		  .append( "path" )
		  .attr( "fill", "#ccc" )
		  .attr( "d", geoPath );
	console.log(cityJson);
		/*mymap
			.width(900)
			.height(600)
			.dimension(deadDim)
			.projection(projection)
			.group(eventGroup)
			.colors(d3.scale.category10())
			.colorDomain([false,true])
			.colors(function(d){ return d ? map.colors()(d) : '#ccc'})
			.overlayGeoJson(cityJson.features, "", function(d){ return d.properties.name;});*/
  
  

		
	
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
	
	/*barbrusher
		.width(650)
		.height(100)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
		.elasticY(true)
		.renderDataPoints({radius: 2, fillOpacity: 0.8, strokeOpacity: 1.0});*/
	
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
	
		/*var places = [];
		places[0] = ["Surrey", -122.78, 49.12];
  
		 d3.select("#map").selectAll("circle")
    		.data(places)
    		.enter().append("circle")
    		.attr("cx",0)
        	.attr("cy",0)
        	.attr("r",15);*/
	});
//  });
};