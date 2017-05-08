/* global d3 */
/* global crossfilter */
function MakeTimeline(facts, mycolours, renderAll) {
    var parent = this;
    d3.json("/motor", function (error2, motordat) {
        var margin = {
            top: 60,
            right: 50,
            bottom: 60,
            left: 90
        };
        motordat.forEach(function (d) {
            d.dd = new Date(d.Date);
            d.my = new Date(d.dd.getFullYear() + "-" + (d.dd.getMonth() + 1) + "-01");
        });
        var motorndx = crossfilter(motordat);
        var motorDim = motorndx.dimension(function (d) {
            return d.my;
        });
        var motorGroup = motorDim.group();
        var dateDim = facts.dimension(function (d) {
            return d.my;
        });
        var odGroup = dateDim.group().reduce(
            function (p, v) {
                if (v.Dead === true) {
                    ++p.dead;
                }
                return p;
            },
            function (p, v) {
                if (v.Dead === true) {
                    --p.dead;
                }
                return p;
            },
            function () {
                return {
                    dead: 0
                };
            });

        var slidersvg = d3.select("#slider").append("svg")
            .attr("width", 900)
            .attr("height", 250);
        var sliderg = slidersvg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        slidersvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 30)
            .attr("x", 0 - (+slidersvg.attr("height") / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Deaths");

        var data = odGroup.all();
        var width = 960 - margin.left - margin.right,
            height = 250 - margin.bottom - margin.top;
        var formatDate = d3.timeFormat("%b %Y");

        // scale function
        var x = d3.scaleTime()
            .rangeRound([0, width])
            .clamp(true),
            y = d3.scaleLinear().rangeRound([height, 0]);

        //brush stuff
        var brush = d3.brushX()
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("start brush end", brushmoved);
        var gBrush = sliderg.append("g")
            .attr("class", "brush")
            .call(brush);

        // style brush resize handle
        // https://github.com/crossfilter/crossfilter/blob/gh-pages/index.html#L466
        var brushResizePath = function (d) {
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
        sliderg.append("text")
            .attr("class", "chart-label")
            .attr("transform", "translate(" + width / 2.5 + ",-10" + ")")
            .text("Click and drag on chart to filter a date range");

        // combine datasets on AgeGroup
        // https://stackoverflow.com/questions/23864180/counting-data-items-in-d3-js
        //group od data
        var odData = [];
        data.forEach(function (d, i) {
            var odObj = {};
            odObj["type"] = "overdose";
            odObj["date"] = d.key;
            odObj["death"] = d.value.dead;
            odData.push(odObj);
        });

        // add motor data to groups
        var motorData = [];
        motorGroup.all().forEach(function (d, i) {
            var motorObj = {};
            motorObj["type"] = "motor";
            motorObj["date"] = d.key;
            motorObj["death"] = d.value;
            motorData.push(motorObj);
        });

        //nest data
        var odNest = d3.nest()
            .key(function (d) {
                return d.type;
            })
            .entries(odData);
        var motorNest = d3.nest()
            .key(function (d) {
                return d.type;
            })
            .entries(motorData);
        odNest.push(motorNest[0]);
        x.domain(d3.extent(data, function (d) {
            return d.key;
        }));
        y.domain([0, d3.max(data, function (d) {
            //console.log(d);
            return d.value.dead;
        })]).nice();

        // make a line "function"
        var lineGen = d3.line()
            .x(function (d) {
                return x(d.date);
            })
            .y(function (d) {
                return y(d.death);
            });
        var odline = sliderg.selectAll(".odline").data([odNest[0].values]);
        odline.enter().append("path")
            .attr("d", lineGen(odNest[0].values))
            .attr("class", "line odline")
            .attr('stroke-width', 2)
            .attr("fill", "none");
        var motorline = sliderg.selectAll(".motorline").data([odNest[1].values]);
        motorline.enter().append("path")
            .attr("d", lineGen(odNest[1].values))
            .attr("class", "line motorline")
            .attr('stroke', mycolours[1])
            .attr('stroke-width', 2)
            .attr("fill", "none");

        // append axes
        sliderg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        sliderg.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5, "d"));

        // add legend
        // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
        var slidercolour = d3.scaleOrdinal(["#f92525", "#5d24f9"]);
        var legendRectSize = 18;
        var legendSpacing = 4;
        var legend = slidersvg.selectAll(".legend")
            .data(["Overdose", "Motor"])
            .enter().append('g')
            .attr("class", "legend")
            .attr('transform', function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * slidercolour.domain().length / 2;
                var vert = i * height + offset;
                return 'translate(' + (width) + ',' + (vert - 4) + ')';
            });
        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', slidercolour)
            .style('stroke', slidercolour);
        legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) {
                return d.toUpperCase();
            });

        parent.update = function () {
            var odData = [];
            odGroup.all().forEach(function (d, i) {
                var odObj = {};
                odObj["type"] = "overdose";
                odObj["date"] = d.key;
                odObj["death"] = d.value.dead;
                odData.push(odObj);
            });

            // add motor data to groups
            var motorData = [];
            motorGroup.all().forEach(function (d, i) {
                var motorObj = {};
                motorObj["type"] = "motor";
                motorObj["date"] = d.key;
                motorObj["death"] = d.value;
                motorData.push(motorObj);
            });

            //nest data
            var odNest = d3.nest()
                .key(function (d) {
                    return d.type;
                })
                .entries(odData);
            var motorNest = d3.nest()
                .key(function (d) {
                    return d.type;
                })
                .entries(motorData);
            odNest.push(motorNest[0]);
            sliderg.selectAll(".odline").remove();
            var odline = sliderg.selectAll(".odline").data([odNest[0].values]);
            odline.enter().append("path")
                .attr("d", lineGen(odNest[0].values))
                .attr("class", "line odline")
                .attr('stroke', mycolours[0])
                .attr('stroke-width', 2)
                .attr("fill", "none");
            motorline.data([odNest[1].values])
                .transition().duration(500)
                .attr("d", lineGen(odNest[1].values));
        };

        function brushmoved() {
            var s = d3.event.selection;
            //start and end dates
            if (s == null) {
                //no dates selected
                handle.attr("display", "none");
                d3.select(".chart-label").text("Click and drag on chart to filter a date range");
            }
            else {
                dateDim.filterFunction(function (d) {
                    return d >= x.invert(s[0]) && d <= x.invert(s[1]);
                });
                renderAll(facts);
                d3.select(".chart-label").text(formatDate(x.invert(s[0])) + " -- " + formatDate(x.invert([s[1]])));
                handle.attr("display", null).attr("transform", function (d, i) {
                    return "translate(" + [s[i], -height / 4] + ")";
                });
            }
        }
    });
    return parent;
}
