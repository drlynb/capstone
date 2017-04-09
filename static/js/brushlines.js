function makeBrushLines(data) {

    var facts = data.top(Infinity);
    var dimension;
    var group;
    var brushDirty;

    var margin = {
            top: 30,
            right: 50,
            bottom: 10,
            left: 50,
        },
        width = 960 - margin.left - margin.right,
        height = 250 - margin.bottom - margin.top,
        svg = d3.select("#slider").append("svg")
        .attr("width", 960)
        .attr("height", 300);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    var formatDate = d3.timeFormat("%b %Y");

    // scale function
    var x = d3.scaleTime()
        .rangeRound([0, width])
        .clamp(true),
        y = d3.scaleLinear().rangeRound([height, 0]),
        colour = d3.scaleOrdinal(d3.schemeCategory20);



    //brush stuff
    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("start brush end", brushmoved);

    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush);


    // style brush resize handle
    // https://github.com/crossfilter/crossfilter/blob/gh-pages/index.html#L466
    var brushResizePath = function(d) {
        var e = +(d.type == "e"),
            x = e ? 1 : -1,
            y = height / 2;
        return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    };

    var handle = gBrush.selectAll(".handle--custom")
        .data([{
            type: "w"
        }, {
            type: "e"
        }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("stroke", "#000")
        .attr("cursor", "ew-resize")
        .attr("d", brushResizePath);

    gBrush.call(brush.move, [0.3, 0.5].map(x));

    g.append("text")
        .attr("class", "chart-label")
        .attr("transform", "translate(" + width / 2.5 + ",-10" + ")")
        .text("Click and drag on chart to filter a date range");


    //linechart stuff
    d3.json("/motor", function(error2, motordat) {
        //console.log(motordat);

        motordat.forEach(function(d) {
            d.dd = new Date(d.Date);
            //d.my = new Date(d.Date);
            //console.log(d.dd.getMonth());
            d.my = new Date(d.dd.getFullYear() + "-" + (d.dd.getMonth() + 1) + "-01");
            //d.my = formatDate(d.dd);
        });
        //console.log(motordat);

        var motorndx = crossfilter(motordat);
        var motorDim = motorndx.dimension(function(d) {
            return d.my;
        });

        var motorGroup = motorDim.group();
        var odGroup = data.group();
        var odGroup = data.group().reduce(
            function(p, v) {
                if (v.Dead == true) {
                    ++p.dead;
                }
                return p;
            },
            function(p, v) {
                if (v.Dead == true) {
                    --p.dead;
                }
                return p;
            },
            function() {
                return {
                    dead: 0
                };
            });


        // combine datasets on AgeGroup
        // https://stackoverflow.com/questions/23864180/counting-data-items-in-d3-js
        //group od data
        var odData = [];
        odGroup.all().forEach(function(d, i) {
            //console.log(d);
            var odObj = {};
            odObj["type"] = "overdose";
            odObj["date"] = d.key;
            odObj["death"] = d.value.dead;
            odData.push(odObj);
        });

        // add motor data to groups
        var motorData = [];
        motorGroup.all().forEach(function(d, i) {
            //console.log(d);
            var motorObj = {};
            motorObj["type"] = "motor";
            motorObj["date"] = d.key;
            motorObj["death"] = d.value;
            motorData.push(motorObj);
        });
        //console.log(newData);

        //nest data
        var odNest = d3.nest()
            .key(function(d) {
                return d.type;
            })
            .entries(odData);

        var motorNest = d3.nest()
            .key(function(d) {
                return d.type;
            })
            .entries(motorData);

        odNest.push(motorNest[0]);

        x.domain(d3.extent(facts, function(d) {
            //console.log(d);
            return d.dd;
        }));
        //console.log(motorGroup.top(Infinity));
        y.domain([0, d3.max(motorGroup.top(Infinity), function(d) {
            //console.log(d);
            return d.value;
        })]);

        // make a line "function"
        var lineGen = d3.line()
            .x(function(d) {
                //console.log(d);
                return x(d.date);
            })
            .y(function(d) {
                //console.log(d.death);
                return y(d.death);
            });

        odNest.forEach(function(d, i) {
            //console.log(d);
            g.append("path")
                .attr("d", lineGen(d.values))
                .attr("class", "line")
                .attr('stroke', colour(d.key))
                .attr('stroke-width', 2)
                .attr("fill", "none");
        });

        // append axes
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        svg.append("text")
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + margin.top + 30) + ")")
            .style("text-anchor", "middle");

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "d"));

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -3)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Deaths");

        // add legend
        // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
        var legendRectSize = 18;
        var legendSpacing = 4;
        var legend = svg.selectAll(".legend")
            .data(colour.domain())
            .enter().append('g')
            .attr("class", "legend")
            .attr('transform', function(d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * colour.domain().length / 2;
                var horz = 2 * legendRectSize;
                var vert = i * height + offset;
                return 'translate(' + (horz + width / 2) + ',' + (vert - 4) + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', colour)
            .style('stroke', colour);

        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) {
                return d.toUpperCase();
            });

    });

    function brushmoved() {
        var s = d3.event.selection;
        //start and end dates
        //console.log(x.invert(s[0]));
        //console.log(x.invert(s[1]));
        if (s == null) {
            //no dates selected
            handle.attr("display", "none");
            d3.select(".chart-label").text("Click and drag on chart to filter a date range");
        }
        else {
            //console.log(data.top(Infinity));
            data.filterFunction(function(d) {
                //console.log(d);
                return d >= x.invert(s[0]) && d <= x.invert(s[1]);
            });
            makeMap(data.top(Infinity));
            d3.selectAll("#count").text(data.top(Infinity).length);
            d3.select(".chart-label").text(formatDate(x.invert(s[0])) + " -- " + formatDate(x.invert([s[1]])));
            handle.attr("display", null).attr("transform", function(d, i) {
                return "translate(" + [s[i], -height / 4] + ")";
            });
        }
    }


    // crossfilter stuff
    makeBrushLines.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeBrushLines;
    };

    makeBrushLines.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        //axis.scale(x);
        return makeBrushLines;
    };

    makeBrushLines.filter = function(_) {
        if (!_) dimension.filterAll();
        console.log("in filter")
        brushDirty = _;
        return makeBrushLines;
    };

    makeBrushLines.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeBrushLines;
    };

    return makeBrushLines;

}
