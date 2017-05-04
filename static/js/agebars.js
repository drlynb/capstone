/* global d3 */
function makeAgeBars(facts, mycolours, renderAll) {
    var chart = this;
    var margin = {
        top: 60,
        right: 50,
        bottom: 60,
        left: 90
    };
    var ageDim = facts.dimension(function (d) {
        return d["Agegroup"];
    });
    var ageGroup = ageDim.group().reduce(
        function (p, v) {
            ++p.total;
            if (v.Dead == true) {
                if (v.Gender == "M") {
                    ++p.deadmale;
                }
                else {
                    ++p.deadfemale;
                }
                ++p.dead;
            }
            else {
                ++p.living;
                if (v.Gender == "M") {
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
            if (v.Dead == true) {
                if (v.Gender == "M") {
                    --p.deadmale;
                }
                else {
                    --p.deadfemale;
                }
                --p.dead;
            }
            else {
                --p.living;
                if (v.Gender == "M") {
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
                living: 0,
                dead: 0
            };
        }
    );

    var stackgendersvg = d3.select("#stacked-bars-age").append("svg")
        .attr("width", 400)
        .attr("height", 250);
    var stackgenderg = stackgendersvg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    stackgendersvg.append("text")
        .attr("transform",
            "translate(" + (+stackgendersvg.attr("width") / 4) + " ," + 20 + ")")
        .style("text-anchor", "middle")
        .text("Lived");
    stackgendersvg.append("text")
        .attr("transform",
            "translate(" + (+stackgendersvg.attr("width") / 8) + " ," + 20 + ")")
        .style("text-anchor", "middle")
        .text("Died");
    stackgendersvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 25)
        .attr("x", 0 - (+stackgendersvg.attr("height") / 2) + 30)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Age");

    var width = +stackgendersvg.attr("width") - margin.left - margin.right,
        height = +stackgendersvg.attr("height") - margin.top - margin.bottom;
    var y = d3.scaleBand().rangeRound([0, height]).padding(0.1),
        x = d3.scaleLinear().rangeRound([0, width]),
        colour = d3.scaleOrdinal(mycolours);

    var xAxis = d3.axisTop().scale(x)
        .ticks(7, "d")
        .tickFormat(Math.abs);

    var yAxis = d3.axisLeft().scale(y);

    var ages = [];

    // stack cant accept nested objects, need to modify data
    // https://stackoverflow.com/questions/42039506/d3-stack-vs-nested-objects
    var newData = [];

    ageGroup.top(Infinity).forEach(function (d) {
        var tempObj = {};
        tempObj["age"] = d.key;
        tempObj["lived"] = -d.value.living;
        tempObj["livmale"] = -d.value.livmale;
        tempObj["livfemale"] = -d.value.livfemale;
        tempObj["died"] = d.value.dead;
        tempObj["deadmale"] = d.value.deadmale;
        tempObj["deadfemale"] = d.value.deadfemale;
        tempObj["total"] = d.value.total;
        newData.push(tempObj);
        ages.push(d.key);
    });

    var stack = d3.stack()
        .keys(["lived", "died"])
        .offset(stackOffsetDiverging)
        (newData);

    x.domain([-d3.max(stack, stackMax), d3.max(stack, stackMax)]).clamp(true).nice();
    y.domain(["<16",
        "16-25",
        "26-35",
        "36-45",
        "46-55",
        "56-65",
        "66-75",
        "76-85",
        "86+"
    ].reverse());

    function stackMax(serie) {
        return d3.max(serie, function (d) {
            return d.data.total;
        });
    }

    var serie = stackgenderg.selectAll(".serie")
        .data(stack)
        .enter().append("g")
        .attr("class", "serie")
        .attr("fill", function (d) {
            return colour(d.key);
        });

    var rects = serie.selectAll("rect")
        .data(function (d) {
            return d;
        })
        .enter().append("rect")
        .attr("class", "bar agegroup");
    rects.attr("y", function (d) {
            return y(d.data.age);
        })
        .attr("x", function (d) {
            return x(d[0]);
        })
        .attr("width", function (d) {
            return x(d[1]) - x(d[0]);
        })
        .attr("height", y.bandwidth());

    chart.selectedage = [];
    rects.on("click", function (d, i) {
        //add/remove agegroup from list
        var temp = chart.selectedage.indexOf(d.data.age);
        if (temp == -1) {
            chart.selectedage.push(d.data.age);
        }
        else {
            chart.selectedage.splice(temp, 1);
        } //remove agegroup from list
        d3.selectAll(".agegroup").each(function (d) {
            if (chart.selectedage.indexOf(d.data.age) > -1) {
                //d3.select(this).attr("fill", "brown");
            }
            else {
                d3.select(this).attr("fill", "brown");
            }
        });
        ageDim.filterFunction(function (d) {
            return chart.selectedage.indexOf(d) > -1;
        });
        renderAll(facts);
    });

    //axes
    stackgenderg.append("g")
        .attr("class", "axis axis--x")
        .call(xAxis);
    stackgenderg.append("g")
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

    chart.update = function () {
        var newData = [];
        ageGroup.top(Infinity).forEach(function (d) {
            var tempObj = {};
            tempObj["age"] = d.key;
            tempObj["lived"] = -d.value.living;
            tempObj["livmale"] = -d.value.livmale;
            tempObj["livfemale"] = -d.value.livfemale;
            tempObj["died"] = d.value.dead;
            tempObj["deadmale"] = d.value.deadmale;
            tempObj["deadfemale"] = d.value.deadfemale;
            tempObj["total"] = d.value.total;
            newData.push(tempObj);
            ages.push(d.key);
        });
        serie.data(stack);
        rects.data(function (d) {
                return d;
            })
            .attr("class", function (d) {
                return (chart.selectedage.indexOf(d.data.age) > -1) ? "bar agegroup selected" : "bar agegroup";
            })
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("width", function (d) {
                return x(d[1]) - x(d[0]);
            });
    };

    chart.updatecheck = function () {
        var choices = [];
        d3.selectAll(".myCheckbox2").each(function (d) {
            var cb = d3.select(this);
            if (cb.property("checked")) {
                choices.push(cb.property("value"));
            }
        });
        //if 1 box checked
        if (choices.length == 1) {
            if (choices[0] == 'm') {
                rects.transition()
                    .duration(500)
                    .attr("width", function (d) {
                        return x(d.data.died) - x(d.data.deadmale);
                    });
            }
            else { // f checked
                rects.transition()
                    .duration(500)
                    .attr("width", function (d) {
                        return x(d.data.died) - x(d.data.deadfemale);
                    });
            }
        }
        else { // both or neither checked
            rects.transition()
                .duration(500)
                .attr("width", function (d) {
                    return x(d[1]) - x(d[0]);
                });
        }
    };
    return chart;
}
