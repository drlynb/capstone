function makeStolenYears(data) {
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
        colour = d3.scaleOrdinal(d3.schemeCategory20);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //console.log(data);//full record data

    /*x.domain(d3.extent(data, function(d) {
        return d.key;
    }));*/
    x.domain(data.map(function(d) {
        //console.log(d);
        return d.key;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.value.total;
    })]);

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
        .data(data, function(d) {
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
                .html("Age: "+d.key+"<br>Years Stolen: "+d.value.total);

            //Show the tooltip
            d3.select("#tooltip").classed("hidden", false);

        })
        .on("mouseout", function() {

            //Hide the tooltip
            d3.select("#tooltip").classed("hidden", true);

        });

    // append line
    g.append("path")
        .attr("d", lineGen(data))
        .attr("class", "line stolen-line")
        .attr('stroke', "black")
        .attr('stroke-width', 2)
        .attr("fill", "none");

    // append axes
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([16,26,36,46,56,66,76,86]));

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
        .text("Stolen Years");

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
        .datum(data)
        .attr("class", "area stolen-area")
        .attr("id", "stolen-area")
        .attr("d", area)
        .attr("fill", "lightgrey");

    // add legend
    // http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
    /*var legendRectSize = 18;
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
        });*/

    // crossfilter stuff
    makeStolenYears.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeStolenYears;
    };

    makeStolenYears.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeStolenYears;
    };

    return makeStolenYears;

}
