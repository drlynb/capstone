// https://bl.ocks.org/mbostock/b5935342c6d21928111928401e2c8608
// https://bl.ocks.org/mbostock/3885304
// https://stackoverflow.com/questions/42173318/d3v4-stacked-barchart-tooltip
function makeSlideBars(data) {
    var facts = data.top(Infinity);
    var cityDeadGroup = data.group().reduce(
        function(p, v) {
            if (v.Dead == true) {
                ++p.deaths;
            }
            else {
                ++p.events;
            }
            ++p.total;
            return p;
        },
        function(p, v) {
            if (v.Dead == true) {
                --p.deaths;
            }
            else {
                --p.events;
            }
            --p.total;
            return p;
        },
        function() {
            return {
                deaths: 0,
                events: 0,
                total: 0
            };
        });

    var margin = {
            top: 20,
            right: 40,
            bottom: 30,
            left: 40,
            height: 300,
            width: 1200
        },
        svg = d3.select("#stacked-bar-chart").append("svg")
        .attr("width", margin.width)
        .attr("height", margin.height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        width = margin.width - margin.left - margin.right,
        height = margin.height - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]),
        //colour = d3.scaleOrdinal(d3.schemeCategory20); //colour
        colour = d3.scaleOrdinal(["GoldenRod", "SaddleBrown"]);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y)
        .ticks(10, "d")
        .tickFormat(Math.abs);

    var cities = [];

    // stack cant accept nested objects, need to modify data
    // https://stackoverflow.com/questions/42039506/d3-stack-vs-nested-objects
    var newData = [];

    cityDeadGroup.all().forEach(function(d) {
        //console.log(d);
        var tempObj = {};
        tempObj["cities"] = d.key;
        tempObj["deaths"] = d.value.deaths;
        tempObj["events"] = -d.value.events;
        tempObj["total"] = d.value.total;
        newData.push(tempObj);
        cities.push(d.key);
    });


    var stack = d3.stack()
        .keys(["deaths", "events"])
        .offset(stackOffsetDiverging)
        (newData);

    y.domain([-d3.max(stack, stackMax), d3.max(stack, stackMax)]).clamp(true).nice();

    x.domain(newData.map(function(d) {
        return d.cities;
    }));

    function stackMin(serie) {
        return d3.min(serie, function(d) {
            return d[0];
        });
    }

    function stackMax(serie) {
        return d3.max(serie, function(d) {
            return d[1];
        });
    }

    var serie = svg.selectAll(".serie")
        .data(stack)
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function(d) {
            return colour(d.key);
        });

    var rects = serie.selectAll("rect")
        .data(function(d) {
            return d;
        })
        .enter().append("rect")
        .attr("class", "bar city");

    //list of seleted cities
    var selected = [];


    rects.attr("x", function(d) {
            //console.log(d);
            return x(d.data.cities);
        })
        .attr("y", function(d) {
            return y(d[1]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .on("click", function(d, i) { // shift clicked bar to x axis
            //console.log(d);
            //add/remove city from list
            var temp = selected.indexOf(d.data.cities);
            if (temp == -1) {
                selected.push(d.data.cities);
            }
            else {
                selected.splice(temp, 1)
            } //remove city from list


            var bars = d3.selectAll(".city").each(function(d) {
                //console.log(d);
                if (selected.indexOf(d.data.cities) > -1) {
                    d3.select(this).attr("fill", "brown");
                }
                else {
                    d3.select(this).attr("fill", "grey");
                }
            });

            //data.filter(d.data.cities);
            data.filterFunction(function(d) {
                //console.log(d);
                return selected.indexOf(d) > -1;
            });
            makeMap(data.top(Infinity));
            //makeBrushLines(data);
            d3.selectAll("#count").text(data.top(Infinity).length);
            d3.selectAll("#cities").text(selected);
        });

    //midline
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(xAxis);

    //axes
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + y(-Infinity) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);


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
            return 'translate(' + (margin.width - 95) + ',' + (vert) + ')';
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

    function stackOffsetDiverging(series, order) {
        if (!((n = series.length) > 1)) return;
        for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
            for (yp = yn = 0, i = 0; i < n; ++i) {
                if ((dy = (d = series[order[i]][j])[1] - d[0]) >= 0) {
                    d[0] = yp, d[1] = yp += dy;
                }
                else if (dy < 0) {
                    d[1] = yn, d[0] = yn += dy;
                }
                else {
                    d[0] = yp;
                }
            }
        }
    }

    // crossfilter stuff
    makeSlideBars.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeSlideBars;
    };

    makeSlideBars.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeSlideBars;
    };

    return makeSlideBars;
}
