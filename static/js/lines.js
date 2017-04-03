// http://stackoverflow.com/questions/19125559/multi-line-ordinal-d3-chart
function makeLines(data) {
    var margin = {
            top: 20,
            right: 50,
            bottom: 50,
            left: 50
        },
        svg = d3.select("#line-chart").append("svg")
        .attr("width", 500 + margin.left + margin.right)
        .attr("height", 200 + margin.top + margin.bottom),
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]),
        colour = d3.scaleOrdinal(d3.schemeCategory20);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("/motor", function(error2, motordat) {
        //console.log(motordat);
        // group car accident data by agegroup
        var groups = {
            "<16": 0,
            "16-25": 0,
            "26-35": 0,
            "36-45": 0,
            "46-55": 0,
            "56-65": 0,
            "66-75": 0,
            "76-85": 0,
            "86+": 0
        };
        motordat.forEach(function(d) {
            //console.log(d);
            d.dd = new Date(d.Date);
            //console.log(d.AgeGroup);
            groups[d.AgeGroup]++;
        });

        //console.log(groups);

        // combine datasets on AgeGroup
        // https://stackoverflow.com/questions/23864180/counting-data-items-in-d3-js
        var newData = [];
        data.forEach(function(d, i) {
            //console.log(d);
            var odObj = {},
                motorObj = {},
                totalObj = {};
            odObj["type"] = "overdose";
            odObj["ageGroup"] = d.key;
            odObj["death"] = d.value.dead;
            newData.push(odObj);
            motorObj["type"] = "motor";
            motorObj["ageGroup"] = d.key;
            motorObj["death"] = groups[d.key];
            newData.push(motorObj);
            totalObj["type"] = "total";
            totalObj["ageGroup"] = d.key;
            totalObj["death"] = groups[d.key] + d.value.dead;
            newData.push(totalObj);
        });
        //console.log(newData);
        var dataGroup = d3.nest()
            .key(function(d) {
                return d.type;
            })
            .entries(newData);
        //console.log(dataGroup);

        x.domain(newData.map(function(d) {
            return d.ageGroup;
        }));

        y.domain([0, d3.max(newData, function(d) {
            return d.death;
        })]);

        // make a line "function"
        var lineGen = d3.line()
            .x(function(d) {
                //console.log(d);
                return x(d.ageGroup);
            })
            .y(function(d) {
                return y(d.death);
            });

        dataGroup.forEach(function(d, i) {
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
            .style("text-anchor", "middle")
            .text("Age Group");

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
                return 'translate(' + (horz+width/2) + ',' + (vert-4) + ')';
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

    });


    // crossfilter stuff
    makeLines.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeLines;
    };

    makeLines.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeLines;
    };

    return makeLines;

}
