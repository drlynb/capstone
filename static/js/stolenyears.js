/* global d3 */
/* global crossfilter */
function MakeStolenYears(facts) {
    var parent = this;
    var margin = {
        top: 60,
        right: 50,
        bottom: 60,
        left: 90
    };
    var ta = function (obj, area) {
        obj.transition().duration(500)
            .attr("d", area);
        return obj;
    };
    var tb = function (obj, val) {
        obj.transition().duration(500);
        return obj;
    };
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

    var data = stolenGroup.all();
    var stolensvg = d3.select("#stolen-years").append("svg")
        .attr("width", 900 + margin.left + margin.right)
        .attr("height", 150 + margin.top + margin.bottom);
    var stoleng = stolensvg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    stolensvg.append("text")
        .attr("transform",
            "translate(" + (+stolensvg.attr("width") / 2) + " ," +
            (+stolensvg.attr("height") - 80) + ")")
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
    //http://www.jstips.co/en/javascript/create-range-0...n-easily-using-one-line/
    x.domain(Array.apply(null, {
        length: 81
    }).map(function (value, index) {
        return index + 9;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value.total;
    })]).nice();

    function makebars(bars, dat, classname) {
        bars = bars.data(dat, function (d) {
                return d.key;
            }).enter().append("rect")
            .attr("class", "bar " + classname)
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
            .on("mouseout", function () {
                //Hide the tooltip 
                d3.select("#tooltip").classed("hidden", true);
            });
        return bars;
    }

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


    d3.json("/natural", function (error2, naturaldata) {
        var natcross = crossfilter(naturaldata);
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

        var natdata = natGroup.all();
        // make and append bars and tooltip. tooltips from: Interactive Data Visualization for the Web 
        var lostbars = stoleng.selectAll(".lost");
        lostbars = makebars(lostbars, data, "bar-lost");
        lostbars = lostbars.on("mouseenter", function (d) {
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
        });

        var natbars = stoleng.selectAll(".nat");
        natbars = makebars(natbars, natdata, "bar-pot");
        natbars = natbars.on("mouseenter", function (d) {
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
        });

        // append axes 
        stoleng.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([10, 20, 30, 40, 50, 60, 70, 80]))
            .exit().remove();
        stoleng.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(5, "d"));

        //append lost area 
        var lost = stoleng.selectAll(".lost-area")
            .data([data]).enter().append("path")
            .attr("class", "area lost-area")
            .attr("d", area);

        //append natural area 
        var natural = stoleng.selectAll(".nat-area")
            .data([natdata]).enter().append("path")
            .attr("class", "area nat-area")
            .attr("d", area);

        //append filtered natural area 
        var filterednat = stoleng.selectAll(".fillnat-area")
            .data([natdata]).enter().append("path")
            .attr("class", "area fillnat-area")
            .attr("d", area)
            .attr("visibility", "hidden");

        //append filtered lost area 
        var filtered = stoleng.selectAll(".filllost-area")
            .data([data]).enter().append("path")
            .attr("class", "area filllost-area")
            .attr("d", area)
            .attr("visibility", "hidden");

        // add legend 
        // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend 
        var slidercolour = d3.scaleOrdinal(["#f92525", "#FDF2EE"]);
        var legendRectSize = 18;
        var legendSpacing = 4;
        var legend = stolensvg.selectAll(".legend")
            .data(["Lost Years", "Average Life Expectancy"])
            .enter().append("g")
            .attr("class", "legend")
            .attr("opacity", "0.5")
            .attr("transform", function (d, i) {
                var height = legendRectSize + legendSpacing;
                var offset = height * slidercolour.domain().length / 2;
                var vert = i * height + offset;
                return "translate(" + (width) + "," + (vert - 4) + ")";
            });
        legend.append("rect")
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .style("fill", slidercolour)
            .style("stroke", slidercolour);
        legend.append("text")
            .attr("x", legendRectSize + legendSpacing)
            .attr("y", legendRectSize - legendSpacing)
            .text(function (d) {
                return d.toUpperCase();
            });

        parent.update = function () {
            lost.data([data])
                .transition(ta(lost, area));
            natural.data([natdata])
                .transition(ta(natural, area));
            filterednat.data([natdata])
                .transition(ta(filterednat, area));
            filtered.data([data])
                .transition(ta(filtered, area));
        };

        function resizearea(obj, y, h) {

        }

        function resizebar(obj, y, h) {

        }

        parent.updatecheck = function () {
            var choices = [];
            d3.selectAll(".myCheckbox2").each(function (d) {
                var cb = d3.select(this);
                if (cb.property("checked")) {
                    choices.push(cb.property("value"));
                }
            });
            //if 1 box checked 
            if (choices.length === 1) {
                if (choices[0] === "M") {
                    lost.transition(ta(lost, area.y1(function (d) {
                        return y(d.value.male);
                    })));
                    lostbars.transition(tb(lostbars))
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filtered.transition(ta(filtered, area.y1(function (d) {
                            return y(-d.value.female);
                        })))
                    .attr("visibility", "visible");
                    natural.transition(ta(natural, area.y1(function (d) {
                        return y(d.value.male);
                    })));
                    natbars.transition(tb)
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filterednat.transition(ta(filterednat, area.y1(function (d) {
                            return y(-d.value.female);
                        })))
                    .attr("visibility", "visible");
                }
                else { // f checked 
                    lost.transition(ta(lost, area.y1(function (d) {
                        return y(d.value.female);
                    })));
                    lostbars.transition(tb)
                        .attr("y", function (d) {
                            return y(d.value.female);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.female);
                        });
                    filtered.transition(ta(filtered, area.y1(function (d) {
                            return y(-d.value.male);
                        })))
                    .attr("visibility", "visible");
                    natural.transition(ta(natural, area.y1(function (d) {
                        return y(d.value.female);
                    })));
                    natbars.transition(tb)
                        .attr("y", function (d) {
                            return y(d.value.male);
                        })
                        .attr("height", function (d) {
                            return height - y(d.value.male);
                        });
                    filterednat.transition(ta(filterednat, area.y1(function (d) {
                            return y(-d.value.female);
                        })))
                    .attr("visibility", "visible");
                }
            }
            else { // both or neither checked 
                lost.transition(ta(lost, area.y1(function (d) {
                    return y(d.value.total);
                })));
                lostbars.transition(tb)
                    .attr("y", function (d) {
                        return y(d.value.total);
                    })
                    .attr("height", function (d) {
                        return height - y(d.value.total);
                    });
                filtered.transition(ta(filtered, area.y1(function (d) {
                        return y(d.value.total);
                    })))
                .attr("visibility", "hidden");
                natural.transition(ta(natural, area.y1(function (d) {
                    return y(d.value.total);
                })));
                natbars.transition(tb)
                    .attr("y", function (d) {
                        return y(d.value.total);
                    })
                    .attr("height", function (d) {
                        return height - y(d.value.total);
                    });
                filterednat.transition(ta(filterednat, area.y1(function (d) {
                        return y(d.value.total);
                    })))
                .attr("visibility", "hidden");
            }
        };
    });
    return parent;
}