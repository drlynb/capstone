/* global d3 */
function MakeAgeBars(facts, renderAll) {
    var chart = this;
    var ages = [];
    var margin = {
        top: 110,
        right: 00,
        bottom: 30,
        left: 90
    };
    chart.ageDim = facts.dimension(function (d) {
        if (ages.indexOf(d["AgeGroup"]) === -1) {
            ages.push(d["AgeGroup"]);
        }
        return d["Agegroup"];
    });
    var ageGroup = chart.ageDim.group().reduce(
        function (p, v) {
            ++p.total;
            if (v.Dead === true) {
                if (v.Gender === "M") {
                    ++p.deadmale;
                }
                else {
                    ++p.deadfemale;
                }
                ++p.died;
            }
            else {
                ++p.lived;
                if (v.Gender === "M") {
                    ++p.livmale;
                }
                else {
                    ++p.livfemale;
                }
            }
            return p;
        },
        function (p, v) {
            --p.total;
            if (v.Dead === true) {
                if (v.Gender === "M") {
                    --p.deadmale;
                }
                else {
                    --p.deadfemale;
                }
                --p.died;
            }
            else {
                --p.lived;
                if (v.Gender === "M") {
                    --p.livmale;
                }
                else {
                    --p.livfemale;
                }
            }
            return p;
        },
        function () {
            return {
                total: 0,
                livmale: 0,
                livfemale: 0,
                deadmale: 0,
                deadfemale: 0,
                lived: 0,
                died: 0
            };
        }
    );

    function stackMax(serie) {
        return d3.max(serie, function (d) {
            return d.data.total;
        });
    }

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

    function makeStack(dat) {
        var newData = [];
        dat.forEach(function (d) {
            var tempObj = {};
            tempObj["age"] = d.key;
            tempObj["lived"] = -d.value.lived;
            tempObj["livmale"] = -d.value.livmale;
            tempObj["livfemale"] = -d.value.livfemale;
            tempObj["died"] = d.value.died;
            tempObj["deadmale"] = d.value.deadmale;
            tempObj["deadfemale"] = d.value.deadfemale;
            tempObj["total"] = d.value.total;
            newData.push(tempObj);
            ages.push(d.key);
        });
        var tmpstack = d3.stack()
            .keys(["lived", "died"])
            .offset(stackOffsetDiverging)
            (newData);
        return tmpstack;
    }

    var stackgendersvg = d3.select("#stacked-bars-age").append("svg")
        .attr("width", 267)
        .attr("height", 300);
    var stackgenderg = stackgendersvg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    /*stackgendersvg.append("text")
        .attr("transform",
            "translate(" + 50 + " ," + ((+stackgendersvg.attr("width")) ) + ") rotate(-90)")
        .text("Lived");
    stackgendersvg.append("text")
        .attr("transform",
            "translate(" + 50 + " ," + (+stackgendersvg.attr("width") / 2.5) + ") rotate(-90)")
        .text("Died");*/
    stackgendersvg.append("text")
        .attr("y", 25)
        .attr("x", 0 - (+stackgendersvg.attr("width") / 2) + 20)
        .attr("dy", "1em")
        .text("Age");

    var width = +stackgendersvg.attr("width") - margin.left - margin.right,
        height = +stackgendersvg.attr("height") - margin.top - margin.bottom;
    var x = d3.scaleBand().rangeRound([0, height]).padding(0.1),
        y = d3.scaleLinear().rangeRound([0, width]);
    //var yAxis = d3.axisTop().scale(y);
    //.ticks(7, "d")
    //.tickFormat(Math.abs);
    var xAxis = d3.axisTop().scale(x);

    // stack cant accept nested objects, need to modify data
    // https://stackoverflow.com/questions/42039506/d3-stack-vs-nested-objects
    var stack = makeStack(ageGroup.top(Infinity));
    y.domain([d3.max(stack, stackMax), -d3.max(stack, stackMax)]).clamp(true).nice();
    x.domain(["10-18",
        "19-29",
        "30-39",
        "40-49",
        "50-59",
        "60-69",
        "70-79"
    ].reverse());

    var serie = stackgenderg.selectAll(".serie")
        .data(stack)
        .enter().append("g")
        .attr("class", function (d) {
            return "serie " + d.key;
        });

    var rects = serie.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("class", "bar agegroup");
    rects.attr("x", function (d) {
            return x(d.data.age);
        })
        .attr("y", function (d) {
            return y(d[1]);
        })
        .attr("height", function (d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", x.bandwidth());

    chart.colourbars = function () {
        var bars = d3.selectAll(".agegroup");
        bars.each(function (d) {
            var tmp = d3.select(this);
            if (chart.selectedage.indexOf(d.data.age) > -1) {
                tmp.classed("selected", true)
                    .classed("notselected", false);
            }
            else {
                tmp.classed("selected", false)
                    .classed("notselected", true);
            }
        });
        if (chart.selectedage.length !== 0) {
            chart.ageDim.filterFunction(function (d) {
                return chart.selectedage.indexOf(d) > -1;
            });
        }
        else {
            bars.each(function (d) {
                d3.select(this)
                    .classed("selected", false)
                    .classed("notselected", false);
            });
            chart.ageDim.filter(null);
        }
        renderAll(facts);
    };

    chart.selectedage = [];
    rects.on("click", function (d, i) {
        if (d3.event.ctrlKey) {
            //add/remove city from list
            var temp = chart.selectedage.indexOf(d.data.age);
            if (temp === -1) {
                chart.selectedage.push(d.data.age);
            }
            else {
                chart.selectedage.splice(temp, 1);
            } //remove city from list
        }
        else {
            chart.selectedage = (_.contains(chart.selectedage, d.data.age) ? [] : [d.data.age]);
        }

        // inside onclick function
        chart.colourbars();
        renderAll(facts);
    });

    /*    rects.on("click", function (d, i) {
            //add/remove agegroup from list
            var temp = chart.selectedage.indexOf(d.data.age);
            if (temp === -1) {
                chart.selectedage.push(d.data.age);
            }
            else {
                chart.selectedage.splice(temp, 1);
            } //remove agegroup from list
            var bars = d3.selectAll(".agegroup");
            bars.each(function (d) {
                var tmp = d3.select(this);
                if (chart.selectedage.indexOf(d.data.age) > -1) {
                    tmp.classed("selected", true)
                        .classed("notselected", false);
                }
                else {
                    tmp.classed("selected", false)
                        .classed("notselected", true);
                }
            });
            if (chart.selectedage.length !== 0) {
                chart.ageDim.filterFunction(function (d) {
                    return chart.selectedage.indexOf(d) > -1;
                });
            }
            else {
                bars.each(function (d) {
                    d3.select(this)
                        .classed("selected", false)
                        .classed("notselected", false);
                });
                chart.ageDim.filter(null);
            }
            renderAll(facts);
        });*/

    //axes
    /*stackgenderg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);*/
    stackgenderg.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", "1em")
        .attr("transform", "rotate(90)");

    function mfresize(d, choice) {
        if (d[0] === 0) {
            return y(0) - y((d.data.deadmale * (!_.contains(choice, "M")) + d.data.deadfemale * (!_.contains(choice, "F"))) * !_.contains(choice, "D"));
        }
        else {
            return y((d.data.livmale * (!_.contains(choice, "M")) + d.data.livfemale * (!_.contains(choice, "F"))) * !_.contains(choice, "L")) - y(0);
        }
    }
    var PAD = 89;
    var t = function (obj, choice = null) {
        obj.transition().duration(500)
            .attr("y", function (d) {
                if (d[1] === 0) {
                    return y(d[1]);
                }
                if (choice !== null && choice.length <= 4) {
                    return PAD - mfresize(d, choice);
                }
                return PAD - (y(d[0]) - y(d[1]));
            })
            .attr("height", function (d) {
                if (choice !== null && choice.length <= 4) {
                    return mfresize(d, choice);
                }
                return y(d[0]) - y(d[1]);
            });
        return obj;
    };

    chart.update = function () {
        var stack = makeStack(ageGroup.top(Infinity));
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
