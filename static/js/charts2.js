 "use strict";
 /*
  The queue() function makes sure that we have all the data transferred to the browser before drawing the graphs. 
 */
 queue()
     .defer(d3.json, "/data")
     .defer(d3.json, "/motor")
     .defer(d3.json, "/natural")
     .await(makeGraphs);

 function makeGraphs(error, data) {
     //get data from flask server
     d3.json("/data", function(error, data) {
         var formatMY = d3.timeFormat("%b %Y");
         data.forEach(function(d) {
             d.dd = new Date(d.Datetime);
             d.my = new Date(d.dd.getFullYear() + "-" + (d.dd.getMonth() + 1) + "-01");
             d.location = {
                 lat: d.EventLat,
                 lng: d.EventLng
             };
         });

         var ndx = crossfilter(data);

         var citycount = d3.selectAll("#cities").text("All Areas");

         // colour takes 1 array as domain (keys) 1 array as values (colours)
         // overdose death, motor death, died, lived, Male, Female
         var colours = ["DarkOrange", "#E85451", "GoldenRod", "SaddleBrown", "DarkKhaki", "Teal"];


         makeStolenYears(ndx, colours);

         makeSlideBars2(ndx, colours.slice(4, 6));

         makeSlideBars(ndx, colours.slice(2, 4));

         makeMap(ndx, colours);

         makeBrushLines(ndx, colours.slice(0, 2));

     });
 }

 function makeLegend(mylegend, colours) {
     //take selected legend and make it
     var colour = d3.scaleOrdinal(colour);
     var legendRectSize = 18;
     var legendSpacing = 4;
     var legend = mylegend.data(colour.domain())
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
         
    return legend;
 }

 function makeStolenYears(data, mycolours) {

     var stolenDim = data.dimension(function(d) {
         return d["Age"];
     });
     var stolenGroup = stolenDim.group().reduce(
         function(p, v) {
             if (v.Dead == true) {
                 if (v.Age > 80) {
                     return p;
                 }
                 if (v.Gender == 'M') {
                     p.male += 80 - v.Age;
                     p.total += 80 - v.Age;
                 }
                 else {
                     p.female += 84 - v.Age;
                     p.total += 84 - v.Age;
                 }
             }
             return p;
         },
         function(p, v) {
             if (v.Age > 80) {
                 return p;
             }
             if (v.Dead == true) {
                 if (v.Gender == 'M') {
                     p.male -= 80 - v.Age;
                     p.total -= 80 - v.Age;
                 }
                 else {
                     p.female -= 84 - v.Age;
                     p.total -= 84 - v.Age;
                 }
             }
             return p;
         },
         function() {
             return {
                 female: 0,
                 male: 0,
                 total: 0
             };
         });
     var facts = stolenGroup.all();

     var margin = {
             top: 20,
             right: 50,
             bottom: 50,
             left: 50
         },
         svg = d3.select("#stolen-years").append("svg")
         .attr("width", 1000 + margin.left + margin.right)
         .attr("height", 200 + margin.top + margin.bottom),
         width = +svg.attr("width") - margin.left - margin.right,
         height = +svg.attr("height") - margin.top - margin.bottom;

     var x = d3.scaleBand().rangeRound([0, width]),
         y = d3.scaleLinear().rangeRound([height, 0]),
         g = svg.append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

     x.domain(facts.map(function(d) {
         //console.log(d);
         return d.key;
     }));
     y.domain([0, d3.max(facts, function(d) {
         return d.value.total;
     })]).nice();

     // make a line "function"
     var lineGen = d3.line()
         .x(function(d) {
             //console.log(d);
             return x(d.key);
         })
         .y(function(d) {
             return y(d.value.total);
         });


     // make and append bars and tooltip. tooltips from: Interactive Data Visualization for the Web
     var bars = g.selectAll("rect")
         .data(facts, function(d) {
             return d.key;
         })
         .enter().append("rect")
         .attr("clip-path", "url(#stolen-area)") // clip the rectangle
         .attr("class", "bar bar-stolen")
         .attr("x", function(d) {
             return x(d.key);
         })
         .attr("width", x.bandwidth() / 1.25)
         .attr("y", function(d) {
             return y(d.value.total);
         })
         .attr("height", function(d) {
             return height - y(d.value.total);
         })
         .on("mouseover", function(d) {
             //console.log(d);
             //Get this bar's x/y values, then augment for the tooltip
             var xPosition = parseFloat(d3.select(this).attr("x")) + x.bandwidth() / 2;
             var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

             //Update the tooltip position and value
             d3.select("#tooltip")
                 .style("left", xPosition + "px")
                 .style("top", yPosition + "px")
                 //d3.select("#value")
                 .html("Age: " + d.key + "<br>Years Lost: " + d.value.total);

             //Show the tooltip
             d3.select("#tooltip").classed("hidden", false);

         })
         .on("mouseout", function() {

             //Hide the tooltip
             d3.select("#tooltip").classed("hidden", true);

         });

     // append line
     g.append("path")
         .attr("d", lineGen(facts))
         .attr("class", "line stolen-line")
         .attr('stroke', "black")
         .attr('stroke-width', 2)
         .attr("fill", "none");

     // append axes
     g.append("g")
         .attr("class", "axis axis--x")
         .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(x).tickValues([16, 26, 36, 46, 56, 66, 76, 86]));

     //append text and axes
     svg.append("text")
         .attr("transform",
             "translate(" + (width / 2) + " ," +
             (height + margin.top + 30) + ")")
         .style("text-anchor", "middle")
         .text("Age");

     g.append("g")
         .attr("class", "axis axis--y")
         .call(d3.axisLeft(y).ticks(10, "d"));

     svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", -3)
         .attr("x", 0 - (height / 2))
         .attr("dy", "1em")
         .style("text-anchor", "middle")
         .text("Lost Years");

     //append area
     var area = d3.area()
         .curve(d3.curveMonotoneX)
         .x(function(d) {
             return x(d.key);
         })
         .y1(function(d) {
             return y(d.value.total);
         })
         .y0(height);


     g.append("path")
         .datum(facts)
         .attr("class", "area stolen-area")
         .attr("id", "stolen-area")
         .attr("d", area)
         .attr("fill", "lightgrey");

 }

 function makeBrushLines(facts, mycolours) {
     var dateDim = facts.dimension(function(d) {
         return d.my;
     });
     var data = dateDim.top(Infinity);

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
         //colour = d3.scaleOrdinal(d3.schemeCategory20);
         colour = d3.scaleOrdinal(mycolours);



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
         var odGroup = dateDim.group().reduce(
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

         x.domain(d3.extent(data, function(d) {
             //console.log(d);
             return d.dd;
         }));
         //console.log(motorGroup.top(Infinity));
         y.domain([0, d3.max(motorGroup.top(Infinity), function(d) {
             //console.log(d);
             return d.value;
         })]).nice();

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
         var legend = makeLegend(svg.selectAll(".legend"), mycolours);

         legend.attr('transform', function(d, i) {
             var height = 18 + 4;
             var offset = height * colour.domain().length / 2;
             var horz = 2 * 18;
             var vert = i * height + offset;
             return 'translate(' + (width) + ',' + (vert - 4) + ')';
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
             dateDim.filterFunction(function(d) {
                 //console.log(d);
                 return d >= x.invert(s[0]) && d <= x.invert(s[1]);
             });

             makeMap(facts);
             d3.select(".chart-label").text(formatDate(x.invert(s[0])) + " -- " + formatDate(x.invert([s[1]])));
             handle.attr("display", null).attr("transform", function(d, i) {
                 return "translate(" + [s[i], -height / 4] + ")";
             });
         }
     }
 }

 // https://bl.ocks.org/mbostock/b5935342c6d21928111928401e2c8608
 // https://bl.ocks.org/mbostock/3885304
 // https://stackoverflow.com/questions/42173318/d3v4-stacked-barchart-tooltip
 function makeSlideBars(data, mycolours) {
     var cityDim = data.dimension(function(d) {
         return d["City"];
     });

     var facts = cityDim.top(Infinity);
     var cityDeadGroup = cityDim.group().reduce(
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
         colour = d3.scaleOrdinal(mycolours);

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
             makeMap(data);
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
     var legend = makeLegend(svg.selectAll(".legend"), mycolours)
     legend.attr('transform', function(d, i) {
         var height = 18 + 4;
         var offset = height * colour.domain().length / 2;
         var horz = 2 * 18;
         var vert = i * height + offset;
         return 'translate(' + (margin.width - 95) + ',' + (vert) + ')';
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
 }

 function makeSlideBars2(facts, mycolours) {
     var ageDim = facts.dimension(function(d) {
         return d["Agegroup"];
     });
     var ageGroup = ageDim.group().reduce(
         function(p, v) {
             ++p.total;

             if (v.Gender == "M") {
                 ++p.male;
             }
             else {
                 ++p.female;
             }
             if (v.Dead == true) {
                 ++p.dead;
             }
             else {
                 ++p.living;
             }

             return p;
         },
         function(p, v) {
             --p.total;

             if (v.Gender == "M") {
                 --p.male;
             }
             else {
                 --p.female;
             }
             if (v.Dead == true) {
                 --p.dead;
             }
             else {
                 --p.living;
             }

             return p;

         },
         function() {
             return {
                 total: 0,
                 male: 0,
                 female: 0,
                 living: 0,
                 dead: 0
             };
         }
     );
     var data = ageGroup.top(Infinity);
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
         colour = d3.scaleOrdinal(mycolours);


     var xAxis = d3.axisBottom().scale(x);

     var yAxis = d3.axisLeft().scale(y)
         .ticks(10, "d")
         .tickFormat(Math.abs);

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

     y.domain([-d3.max(stack, stackMax), d3.max(stack, stackMax)]).clamp(true).nice();

     x.domain(["<16",
         "16-25",
         "26-35",
         "36-45",
         "46-55",
         "56-65",
         "66-75",
         "76-85",
         "86+"
     ]);

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
         .attr("width", x.bandwidth());

     // add legend
     // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
     var legend = makeLegend(svg.selectAll(".legend"), mycolours)
     legend.attr('transform', function(d, i) {
         var height = 18 + 4;
         var offset = height * colour.domain().length / 2;
         var horz = 2 * 18;
         var vert = i * height + offset;
         return 'translate(' + (margin.width - 85) + ',' + (vert) + ')';
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
 }



 // https://github.com/thesentinelproject/threatwiki_node/blob/master/public/javascript/visualization.js
 // https://vast-journey-7849.herokuapp.com/burmavisualization
 // https://developers.google.com/maps/documentation/javascript/marker-clustering

 // https://github.com/bseth99/sandbox/blob/master/projects/google-maps/01-drawing-manager-selections.html
 function makeMap(facts) {
     var dateDim = facts.dimension(function(d) {
         return d.my;
     });
     var data = dateDim.top(Infinity);

     // Create the Google Map…
     var map = new google.maps.Map(d3.select("#map").node(), {
         zoom: 10,
         center: new google.maps.LatLng(49.160, -122.662),
         mapTypeId: google.maps.MapTypeId.TERRAIN
     });
     // https://stackoverflow.com/questions/6795414/creating-a-selectable-clickable-overlay-on-google-maps
     var areadata = [{
         "name": "Surrey",
         "coords": []
     }];
     var areas = [];

     // Add some markers to the map.
     // Note: The code uses the JavaScript Array.prototype.map() method to
     // create an array of markers based on a given "locations" array.
     // The map() method here has nothing to do with the Google Maps API.

     var markers = []
     data.forEach(function(d, i) {
         //console.log(d.location);
         markers.push(new google.maps.Marker({
             position: d.location,
             optimized: false,
             icon: 'https://www.google.com/mapfiles/marker.png?i=' + (i)
         }));
     });

     /*markers.forEach(function(m){
       
       google.maps.event.addListener(m, 'mouseover', function() {
       $('img[src="' + this.icon + '"]').stop().animate({
         opacity: 0
       });
     });
  
       google.maps.event.addListener(m, 'mouseout', function() {
       $('img[src="' + this.icon + '"]').stop().animate({
         opacity: .5
       });
     });
       
     });*/

     // Add a marker clusterer to manage the markers.
     var markerCluster = new MarkerClusterer(map, markers, {
         imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
         optimized: false
     });

     markerCluster.addListener("mouseover", function(c) {
         console.log(c);
     });

     ////////////////////////////////////////////////////
     /////// use the markers like d3 elements?
     /////// https://stackoverflow.com/questions/22047466/how-to-add-css-class-to-a-googlemaps-marker
     /////////////////////////////////////////////////
 }
 