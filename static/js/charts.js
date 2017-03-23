 "use strict";
/*
 The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
*/
queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);
	

var sbc = dc.barChart("#stacked-bar-chart");
var brusher = dc.lineChart("#brush-chart");
var eventcount = dc.dataCount("#count");

function makeGraphs(error, data) {
	//get data from flask server
	d3.json("/data", function(error, data) {

	//datetime passed is a unix timestamp. convert to readable date
	data.forEach(function (d) {
        d.dd= new Date(d.Datetime);
		//console.log(d)
        d.month = d3.time.month(d.dd); // pre-calculate month for better performance
    });

	var ndx = crossfilter(data);
    var total = ndx.groupAll();
	
	//var totalDimension = ndx.dimension(function(d)){return }
	
	var yearDimension = ndx.dimension(function (d) {
		return d3.time.year(d.dd).getFullYear();
	});
	
	//group by date
	var totalEvents = yearDimension.group().reduce(
        // callback for when data is added to the current filter results 
        function (p, v) {
            ++p.total;
			if(v.Dead == true){ ++p.deaths;}

            return p;
        },
        // callback for when data is removed from the current filter results
        function (p, v) {
            --p.total;
			if(v.Dead == true){ --p.deaths;}
            return p;
        },
        // initialize p
        function () {
            return {
                total: 0,
				deaths: 0,
            };
        }
    );
	
	//full date
	var dateDimension = ndx.dimension(function (d) {
        return d.dd;
    });
	
	var eventMonths = ndx.dimension(function (d) {
        return d.month;
    });
	
	//group by living/dead
	var deathDimension = ndx.dimension(function(d){
		return d.Dead;
	});
	
	//group by city
	//var cityGroup = 
	
	function sel_stack(i) {
		return function(d) {
			return d.value[i];
		};
	}
	
	
	eventcount // dc.dataCount('.dc-data-count', 'chartGroup');
        .dimension(ndx)
        .group(total)
		.html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });
		
		
		
	brusher // dc.lineChart('#monthly-move-chart', 'chartGroup')
		.width(990)
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(dateDimension)
        .group(total)
        .x(d3.time.scale().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months);
	
	
	
	/*sbc // dc.barChart('#volume-month-chart', 'chartGroup')
        .width(768)
		.height(480)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(deathDimension)
        .group(totalEvents)
        .elasticY(true)
		.centerBar(true)
		.gap(1)
		.rangeChart(brusher)
		.x(d3.scale.linear().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
		.round(d3.time.month.round)
		.xUnits(d3.time.months)
		.filterPrinter(function (filters) {
			var filter = filters[0], s = '';
			s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
			return s;
        });
	sbc.xAxis().tickFormat(
        function (v) { return v + '%'; });
	sbc.yAxis().ticks(5);*/
	sbc
		.width(768)
		.height(480)
		.x(d3.scale.linear().domain([new Date(2016, 0, 1), new Date(2016, 11, 31)]))
		.round(d3.time.month.round)
		.xUnits(d3.time.months)
        .elasticY(true)
		.margins({left: 80, top: 20, right: 10, bottom: 20})
		.brushOn(false)
		.clipPadding(10)
		.title(function(d) {
			return d.key + '[' + this.layer + ']: ' + d.value[this.layer];
		})
		.dimension(deathDimension)
		.group(total, "1", sel_stack('1'))
		.renderLabel(true);
	sbc.legend(dc.legend());
	dc.override(sbc, 'legendables', function() {
		var items = sbc._legendables();
		return items.reverse();
	});
	for(var i = 2; i<6; ++i)
		sbc.stack(total, ''+i, sel_stack(i));

	dc.renderAll();
  });
};

/*
volumeChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); 
        .height(40)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(moveMonths)
        .group(volumeByMonthGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.months);*/