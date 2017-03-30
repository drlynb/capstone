function makeLines(data) {
    var svg = d3.select("#line-chart").append("svg"),
        margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    var x = d3.scaleLinear().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        
    d3.json("/motor", function(d) {
        d.frequency = +d.frequency;
        return d;
    }, function(error, motordat) {
        if (error) throw error;

        var line = d3.line()
            .x(function(d) {
                return x(d.letter);
            })
            .y(function(d) {
                return y(d.frequency);
            })

        x.domain(data.map(function(d) {
            return d.letter;
        }));

        y.domain([0, d3.max(data, function(d) {
            return d.frequency;
        })]);
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10, "%"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text("Frequency");

        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);

    });

}
