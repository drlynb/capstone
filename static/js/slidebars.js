// https://bl.ocks.org/mbostock/b5935342c6d21928111928401e2c8608
function makeSlideBars(data) {

    var data = [{
        month: "Q1-2016",
        apples: 3840,
        bananas: 1920,
        cherries: -1960,
        dates: -400
    }, {
        month: "Q2-2016",
        apples: 1600,
        bananas: 1440,
        cherries: -960,
        dates: -400
    }, {
        month: "Q3-2016",
        apples: 640,
        bananas: 960,
        cherries: -640,
        dates: -600
    }, {
        month: "Q4-2016",
        apples: 320,
        bananas: 480,
        cherries: -640,
        dates: -400
    }];

    var series = d3.stack()
        .keys(["apples", "bananas", "cherries", "dates"])
        .offset(stackOffsetDiverging)
        (data);

    var svg = d3.select("svg"),
        margin = {
            top: 20,
            right: 30,
            bottom: 30,
            left: 60
        },
        width = +svg.attr("width"),
        height = +svg.attr("height");

    var x = d3.scaleBand()
        .domain(data.map(function(d) {
            return d.month;
        }))
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    var y = d3.scaleLinear()
        .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
        .rangeRound([height - margin.bottom, margin.top]);

    var z = d3.scaleOrdinal(d3.schemeCategory10);

    svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
        .attr("fill", function(d) {
            return z(d.key);
        })
        .selectAll("rect")
        .data(function(d) {
            return d;
        })
        .enter().append("rect")
        .attr("width", x.bandwidth)
        .attr("x", function(d) {
            return x(d.data.month);
        })
        .attr("y", function(d) {
            return y(d[1]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })

    svg.append("g")
        .attr("transform", "translate(0," + y(0) + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(y));

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
