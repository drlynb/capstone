// https://bl.ocks.org/mbostock/b5935342c6d21928111928401e2c8608
// https://bl.ocks.org/mbostock/3885304
// https://stackoverflow.com/questions/42173318/d3v4-stacked-barchart-tooltip
function makeSlideBars2(data) {

    var margin = {
            top: 20,
            right: 60,
            bottom: 30,
            left: 30,
            height: 300,
            width: 600
        },
        svg = d3.select("#stacked-bars-age").append("svg")
        .attr("width", margin.width)
        .attr("height", margin.height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        width = margin.width - margin.left - margin.right,
        height = margin.height - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height - margin.bottom, margin.top]),
        colour = d3.scaleOrdinal(d3.schemeCategory20);

    var xAxis = d3.axisBottom().scale(x);

    var yAxis = d3.axisLeft().scale(y).ticks(10, "d");

    var ages = [];

    // stack cant accept nested objects, need to modify data
    // https://stackoverflow.com/questions/42039506/d3-stack-vs-nested-objects
    var newData = [];

    data.forEach(function(d) {
        //console.log(d);
        var tempObj = {};
        tempObj["age"] = d.key;
        tempObj["male"] = -d.value.male;
        tempObj["female"] = d.value.female;
        tempObj["total"] = d.value.total;
        newData.push(tempObj);
        ages.push(d.key);
    });


    var stack = d3.stack()
        .keys(["male", "female"])
        .offset(stackOffsetDiverging)
        (newData);
    //console.log(stack);

    y.domain([-d3.max(stack, stackMax), d3.max(stack, stackMax)]).clamp(true);

    x.domain(newData.map(function(d) {
        return d.age;
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
        .attr("class", "bar");

    rects.attr("x", function(d) {
            //console.log(d);
            return x(d.data.age);
        })
        .attr("y", function(d) {
            //console.log(d);
            return y(d[1]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth())
        .on("click", function(d, i) { // shift clicked bar to x axis
            //console.log(d);
            var bigbar = d3.selectAll(".bar");
            if (d[0] == 0) { // d[0] == 0 for top bars
                console.log(this);
                bigbar.each(function(d, i) {
                    var mybar = d3.select(this);
                    mybar.attr("transform", "translate(0," + d[1] + ")");
                });
                bigbar.attr("transform", "translate(0," + -d[1] + ")");
            }
            else {
                console.log(this);
                bigbar.attr("transform", "translate(0," + d[0] + ")");
                bigbar.each(function(d, i) {
                    var mybar = d3.select(this);
                    mybar.attr("transform", "translate(0," + d[0] + ")");
                });

            }

        });


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
            var horz = 2* legendRectSize;
            var vert = i*height + offset;
            return 'translate(' + (margin.width - 85) + ',' + (vert) + ')';
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
    makeSlideBars2.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeSlideBars2;
    };

    makeSlideBars2.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeSlideBars2;
    };

    return makeSlideBars2;
}
