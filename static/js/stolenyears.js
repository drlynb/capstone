/* global d3 */
/* global crossfilter */
function MakeStolenYears(facts, mycolours) {
    var parent = this;
    d3.json("/natural", function (error2, naturaldata) {
        var margin = {
            top: 60,
            right: 50,
            bottom: 60,
            left: 90
        };
        var natcross = crossfilter(naturaldata);
        var stolenDim = facts.dimension(function (d) {
            return d["Age"];
        });

        var stolenGroup = stolenDim.group().reduce(
            function (p, v) {
                if (v.Dead === true) {
                    if (v.Age > 80) {
                        return p;
                    }
                    if (v.Gender === "M") {
                        ++p.male;
                        ++p.total;
                    }
                    else {
                        ++p.female;
                        ++p.total;
                    }
                }
                return p;
            },
            function (p, v) {
                if (v.Age > 80) {
                    return p;
                }
                if (v.Dead === true) {
                    if (v.Gender === "M") {
                        --p.male;
                        --p.total;
                    }
                    else {
                        --p.female;
                        --p.total;
                    }
                }
                return p;
            },
            function () {
                return {
                    female: 0,
                    male: 0,
                    total: 0
                };
            });

        var natDim = natcross.dimension(function (d) {
            return d["Age"];
        });
        var natGroup = natDim.group().reduce(
            function (p, v) {
                if (v.Gender === "M") {
                    ++p.male;
                    ++p.total;
                }
                else {
                    ++p.female;
                    ++p.total;
                }
                return p;
            },
            function (p, v) {
                if (v.Gender === "M") {
                    --p.male;
                    --p.total;
                }
                else {
                    --p.female;
                    --p.total;
                }
                return p;
            },
            function () {
                return {
                    female: 0,
                    male: 0,
                    total: 0
                };
            });
        
        var data = stolenGroup.all();
        var stolensvg = d3.select("#stolen-years").append("svg")
            .attr("width", 900 + margin.left + margin.right)
            .attr("height", 150 + margin.top + margin.bottom);
        var stoleng = stolensvg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        stolensvg.append("text")
            .attr("transform",
                "translate(" + (+stolensvg.attr("width") / 2) + " ," +
                (+stolensvg.attr("height") - 50) + ")")
            .style("text-anchor", "middle")
            .text("Age");
        stolensvg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 25)
            .attr("x", 0 - (+stolensvg.attr("height") / 2) + 30)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Lost Years");
        var width = +stolensvg.attr("width") - margin.left - margin.right,
            height = +stolensvg.attr("height") - margin.top - margin.bottom * 2;
        var x = d3.scaleBand().rangeRound([0, width]),
            y = d3.scaleLinear().rangeRound([height, 0]);
        var natdata = natGroup.all();
        x.domain(natdata.map(function (d) {
            return d.key;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.value.total;
        })]).nice();

        // make and append bars and tooltip. tooltips from: Interactive Data Visualization for the Web
        var lostbars = stoleng.selectAll(".lost")
            .data(data, function (d) {
                return d.key;
            })
            .enter().append("rect")
            .attr("class", "bar bar-lost")
            .attr("x", function (d) {
                return x(d.key);
            })
            .attr("width", x.bandwidth() / 1.25)
            .attr("y", function (d) {
                return y(d.value.total);
            })
            .attr("height", function (d) {
                return height - y(d.value.total);
            })
            .on("mouseover", function (d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
                var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .html("Age: " + d.key + "<br>Years Lost: " + (84 - d.key));
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function () {
                //Hide the tooltip
                d3.select("#tooltip").classed("hidden", true);
            });

        var natbars = stoleng.selectAll(".nat")
            .data(natdata, function (d) {
                return d.key;
            })
            .enter().append("rect")
            .attr("class", "bar bar-pot")
            .attr("x", function (d) {
                return x(d.key);
            })
            .attr("width", x.bandwidth() / 1.25)
            .attr("y", function (d) {
                return y(d.value.total);
            })
            .attr("height", function (d) {
                return height - y(d.value.total);
            })
            .on("mouseover", function (d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
                var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .html("Age: " + d.key + "<br>Average Expected Deaths: " + d.value.total);
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function () {
                //Hide the tooltip
                d3.select("#tooltip").classed("hidden", true);
            });

        // append axes
        stoleng.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([16, 26, 36, 46, 56, 66, 76, 86, 96]))
            .exit().remove();
        stoleng.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5, "d"));

        //generate areas
        var area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return x(d.key);
            })
            .y1(function (d) {
                return y(d.value.total);
            })
            .y0(height);

        //append lost area
        var lost = stoleng.selectAll(".lost-area")
            .data([data]).enter().append("path")
            .attr("class", "area lost-area")
            .attr("d", area)
            .attr("fill", mycolours[0]);

        //append natural area
        var natural = stoleng.selectAll(".nat-area")
            .data([natdata]).enter().append("path")
            .attr("class", "area nat-area")
            .attr("d", area)
            .attr("fill", mycolours[6]);

        //append filtered natural area
        var filterednat = stoleng.selectAll(".filnat-area")
            .data([natdata]).enter().append("path")
            .attr("class", "area filnat-area")
            .attr("d", area)
            //.attr("fill", mycolours[6])
            .attr("visibility", "hidden");

        //append filtered lost area
        var filtered = stoleng.selectAll(".filllost-area")
            .data([data]).enter().append("path")
            .attr("class", "area filllost-area")
            .attr("d", area)
            .attr("fill", mycolours[7])
            .attr("visibility", "hidden");

        parent.update = function() {
            lost.data([data])
                .transition()
                .duration(500)
                .attr("d", area);
            natural.data([natdata])
                .transition()
                .duration(500)
                .attr("d", area);
            filterednat.data([natdata])
                .transition()
                .duration(500)
                .attr("d", area);
            filtered.data([data])
                .transition()
                .duration(500)
                .attr("d", area);
        };

        parent.updatecheck = function() {
            var choices = [];
            d3.selectAll(".myCheckbox").each(function (d) {
                var cb = d3.select(this);
                if (cb.property("checked")) {
                    choices.push(cb.property("value"));
                }
            });
            //if 1 box checked
            if (choices.length === 1) {
                if (choices[0] === "m") {
                    lost.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(d.value.male);
                        }));
                    lostbars.transition()
                        .duration(500)
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filtered.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(-d.value.female);
                        })).attr("visibility", "visible");
                    natural.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(d.value.male);
                        }));
                    natbars.transition()
                        .duration(500)
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filterednat.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(-d.value.female);
                        })).attr("visibility", "visible");
                }
                else { // f checked
                    lost.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(d.value.female);
                        }));
                    lostbars.transition()
                        .duration(500)
                        .attr("y", function (d) {
                            return y(d.value.female);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.female);
                        });
                    filtered.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(-d.value.male);
                        })).attr("visibility", "visible");
                    natural.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(d.value.female);
                        }));
                    natbars.transition()
                        .duration(500)
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filterednat.transition()
                        .duration(500)
                        .attr("d", area.y1(function (d) {
                            return y(-d.value.female);
                        })).attr("visibility", "visible");
                }
            }
            else { // both or neither checked
                lost.transition()
                    .duration(500)
                    .attr("d", area.y1(function (d) {
                        return y(d.value.total);
                    }));
                lostbars.transition()
                    .duration(500)
                    .attr("y", function (d) {
                        return y(d.value.total);
                    })
                    .attr("height", function (d) {
                        return height - y(d.value.total);
                    });
                filtered.transition()
                    .duration(500)
                    .attr("d", area.y1(function (d) {
                        return y(d.value.total);
                    }))
                    .attr("visibility", "hidden");
                natural.transition()
                    .duration(500)
                    .attr("d", area.y1(function (d) {
                        return y(d.value.total);
                    }));
                natbars.transition()
                    .duration(500)
                    .attr("y", function (d) {
                        return y(d.value.total);
                    })
                    .attr("height", function (d) {
                        return height - y(d.value.total);
                    });
                filterednat.transition()
                    .duration(500)
                    .attr("d", area.y1(function (d) {
                        return y(d.value.total);
                    }))
                    .attr("visibility", "hidden");
            }
        };
    });
    return parent;
}
