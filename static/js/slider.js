// https://stackoverflow.com/questions/39081668/how-to-redraw-chart-d3-js-chaining-function-and-crossfilter-filtering
function makeSlider(data) {

    var begin = new Date('2007-01');
    var end = new Date('2016-12');
    var dimension;
    var group;
    var brushDirty;

    var margin = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 200 - margin.bottom - margin.top;


    // scale function
    var x = d3.scaleTime()
        .domain([begin, end])
        .range([0, width])
        .clamp(true);

    var formatDate = d3.timeFormat("%b %Y");

    var svg = d3.select("#slider").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("start brush end", brushmoved);


    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

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
    }

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
            data.filterFunction(function(d) {
                return d.date >= x.invert(s[0]) && d.date <= x.invert(s[1]);
            });
            var newdat = data.top(Infinity);
            makeMap(newdat);
            d3.selectAll("#count").text(newdat.length);
            d3.select(".chart-label").text(formatDate(x.invert(s[0])) + " -- " + formatDate(x.invert([s[1]])));
            handle.attr("display", null).attr("transform", function(d, i) {
                return "translate(" + [s[i], -height / 4] + ")";
            });
        }
    }


    // crossfilter stuff
    makeSlider.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return makeSlider;
    };

    makeSlider.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        //axis.scale(x);
        return makeSlider;
    };

    makeSlider.filter = function(_) {
        if (!_) dimension.filterAll();
        console.log("in filter")
        brushDirty = _;
        return makeSlider;
    };

    makeSlider.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeSlider;
    };

    //console.log(makeSlider);
    return makeSlider;
}
