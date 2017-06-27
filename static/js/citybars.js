/* global d3 */
// https://bl.ocks.org/mbostock/b5935342c6d21928111928401e2c8608
// https://bl.ocks.org/mbostock/3885304
// https://stackoverflow.com/questions/42173318/d3v4-stacked-barchart-tooltip
function MakeCityBars(facts, renderAll) {
    var chart = this;
    var cities = [];
    var margin = {
        top: 60,
        right: 50,
        bottom: 60,
        left: 90
    };
    chart.cityDim = facts.dimension(function (d) {
        if (cities.indexOf(d["City"]) === -1) {
            cities.push(d["City"]);
        }
        return d["City"];
    });

    var cityDeadGroup = chart.cityDim.group().reduce(
        function (p, v) {
            if (v.Dead === true) {
                ++p.deaths;
                if (v.Gender === "M") {
                    ++p.deadmale;
                }
                else {
                    ++p.deadfemale;
                }
            }
            else {
                ++p.events;
                if (v.Gender === "M") {
                    ++p.livmale;
                }
                else {
                    ++p.livfemale;
                }
            }
            ++p.total;
            return p;
        },
        function (p, v) {
            if (v.Dead === true) {
                --p.deaths;
                if (v.Gender === "M") {
                    --p.deadmale;
                }
                else {
                    --p.deadfemale;
                }
            }
            else {
                --p.events;
                if (v.Gender === "M") {
                    --p.livmale;
                }
                else {
                    --p.livfemale;
                }
            }
            --p.total;
            return p;
        },
        function () {
            return {
                deaths: 0,
                livmale: 0,
                livfemale: 0,
                deadmale: 0,
                deadfemale: 0,
                events: 0,
                total: 0
            };
        });

    function stackOffsetDiverging(series, order) {
        if (!((n = series.length) > 1)) {
            return;
        }
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

    function stackMax(serie) {
        return d3.max(serie, function (d) {
            return Math.abs(d.data.lived);
        });
    }

    function makeStack(dat) {
        var newData = [];
        dat.forEach(function (d) {
            var tempObj = {};
            tempObj["cities"] = d.key;
            tempObj["lived"] = -d.value.events;
            tempObj["livmale"] = -d.value.livmale;
            tempObj["livfemale"] = -d.value.livfemale;
            tempObj["died"] = d.value.deaths;
            tempObj["deadmale"] = d.value.deadmale;
            tempObj["deadfemale"] = d.value.deadfemale;
            tempObj["total"] = d.value.total;
            newData.push(tempObj);
        });
        var tmpstack = d3.stack()
            .keys(["lived", "died"])
            .offset(stackOffsetDiverging)
            (newData);
        return tmpstack;
    }

    var stackedbarsvg = d3.select("#stacked-bar-chart").append("svg")
        .attr("width", 400)
        .attr("height", 250);
    var stackedbarg = stackedbarsvg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    stackedbarsvg.append("text")
        .attr("transform",
            "translate(" + (+stackedbarsvg.attr("width") / 1.25) + " ," + 20 + ")")
        .style("text-anchor", "middle")
        .text("Lived");
    stackedbarsvg.append("text")
        .attr("transform",
            "translate(" + (+stackedbarsvg.attr("width") / 3) + " ," + 20 + ")")
        .style("text-anchor", "middle")
        .text("Died");
    var width = +stackedbarsvg.attr("width") - margin.left - margin.right,
        height = +stackedbarsvg.attr("height") - margin.top - margin.bottom;
    var y = d3.scaleBand().rangeRound([0, height]).padding(0.1),
        x = d3.scaleLinear().rangeRound([0, width]);
    var xAxis = d3.axisTop().scale(x).ticks(7, "d")
        .tickFormat(Math.abs);
    var yAxis = d3.axisLeft().scale(y);
    var stack = makeStack(cityDeadGroup.all());
    x.domain([-d3.max(stack, stackMax), d3.max(stack, stackMax)]).clamp(true).nice();
    y.domain(cities.map(function (d) {
        return d;
    }));

    var serie = stackedbarg.selectAll(".serie")
        .data(stack)
        .enter().append("g")
        .attr("class", function (d) {
            return "serie " + d.key;
        });

    chart.colourbars = function () {
        var bars = d3.selectAll(".city");
        bars.each(function (d) {
            var tmp = d3.select(this);
            if (chart.selectedcities.indexOf(d.data.cities) > -1) {
                tmp.classed("selected", true)
                    .classed("notselected", false);
            }
            else {
                tmp.classed("selected", false)
                    .classed("notselected", true);
            }
        });
        if (chart.selectedcities.length !== 0) {
            chart.cityDim.filterFunction(function (d) {
                return chart.selectedcities.indexOf(d) > -1;
            });
        }
        else {
            bars.each(function (d) {
                d3.select(this)
                    .classed("selected", false)
                    .classed("notselected", false);
            });
            chart.cityDim.filter(null);
        }
    };

    //list of seleted cities
    chart.selectedcities = [];
    var rects = serie.selectAll(".city")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("class", "bar city")
        .on("click", function (d, i) {
            //add/remove city from list
            var temp = chart.selectedcities.indexOf(d.data.cities);
            if (temp === -1) {
                chart.selectedcities.push(d.data.cities);
            }
            else {
                chart.selectedcities.splice(temp, 1);
            } //remove city from list
            // inside onclick function
            chart.colourbars();
            renderAll(facts);
        });

    rects.attr("y", function (d) {
            return y(d.data.cities);
        })
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            return x(d[1]) - x(d[0]);
        })
        .attr("height", y.bandwidth());

    //axes
    stackedbarg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);
    stackedbarg.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis);

    function mfresize(d, choice) {
        if (choice[0] === "M" && choice.length === 1) {
            return (x(d.data.died) - x(d.data.deadmale));
        }
        else if (choice[0] === "F" && choice.length === 1) {
            return (x(d.data.died) - x(d.data.deadfemale));
        }
    }

    var t = function (obj, choice) {
        obj.transition().duration(500)
            .attr("x", function (d) {
                if (d[0] === 0) {
                    return x(d[0]);
                }
                if (choice.length === 1) {
                    return 130 - mfresize(d, choice);
                }
                return 130 - (x(d[1]) - x(d[0]));
            })
            .attr("width", function (d) {
                if (choice.length === 1) {
                    return mfresize(d, choice);
                }
                return x(d[1]) - x(d[0]);
            });
        return obj;
    };

    chart.update = function () {
        var stack = makeStack(cityDeadGroup.all());
        serie.data(stack);
        rects.data(function (d) {
                return d;
            })
            .transition(t(rects, null));
    };

    chart.updatecheck = function () {
        var choices = [];
        d3.selectAll(".myCheckbox2").each(function (d) {
            var cb = d3.select(this);
            if (cb.property("checked")) {
                choices.push(cb.property("value"));
            }
        });
        rects.transition(t(rects, choices));
    };
    return chart;
}
