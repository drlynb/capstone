function makeSlider(data) {

    var begin = new Date('2007-01');
    var end = new Date('2016-12');
    var margin = {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
        },
        width = 960 - margin.left - margin.right,
        height = 300 - margin.bottom - margin.top;


    // scale function
    var timeScale = d3.scaleTime()
        .domain([begin, end])
        .range([0, width])
        .clamp(true);

    var formatDate = d3.timeFormat("%b %Y");

    var svg = d3.select("#slider").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        // classic transform to position g
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
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
        .call(d3.axisBottom(timeScale));


    /*var slider = svg.append("rect")
        .style("pointer-events", "all")
        .style("fill", "none")
        .attr("width", width)
        .attr("height", height)
        .style("cursor", "crosshair")
        .on("mousedown", function() {
            updatePos(this);
        })
        .on("mousemove", function() {
            if (d3.event.which === 1) {
                updatePos(this);
            }
        });*/


    svg.append("g")
        .attr("class", "x axis")
        // put in middle of screen
        .attr("transform", "translate(0," + height / 2 + ")")
        // inroduce axis
        .call(d3.axisBottom()
            .scale(timeScale)
            .tickFormat(function(d) {
                return formatDate(d);
            })
            .tickSize(0)
            .tickPadding(12)
            .tickValues([timeScale.domain()[0], timeScale.domain()[1]]))
        .select(".domain")
        .attr("class", "halo");


    function updatePos(elem) {
        var xPos = d3.mouse(elem)[0];
        handle.attr('transform', 'translate(' + xPos + ",0)");
        text.text(formatDate(timeScale.invert(xPos)));
    }

    var gBrush = g.append("g")
        .attr("class", "brush")
        .call(brush);
    /* var handle = svg.append("g")
         .attr("class", "brush")*/


    var handle = gBrush.selectAll(".handle--custom")
        .data([{
            type: "w"
        }, {
            type: "e"
        }])
        .enter().append("path")
        .attr("class", "handle--custom")
        .attr("fill", "#666")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .attr("cursor", "ew-resize")
        .attr("d", d3.arc()
            .innerRadius(0)
            .outerRadius(100 / 2)
            .startAngle(0)
            .endAngle(function(d, i) {
                return i ? Math.PI : -Math.PI;
            }));

    gBrush.call(brush.move, [0.3, 0.5].map(timeScale));

    function brushmoved() {
        var s = d3.event.selection;
        //console.log(s);
        if (s == null) {
            handle.attr("display", "visible");
            //circle.classed("active", false);
        }
        else {
            var sx = s.map(x.invert);
            /*circle.classed("active", function(d) {
                return sx[0] <= d && d <= sx[1];
            });*/
            handle.attr("display", null).attr("transform", function(d, i) {
                return "translate(" + s[i] + "," + height / 2 + ")";
            });
        }
    }

    handle.append("path")
        .attr("transform", "translate(0," + height / 2 + ")")
        .attr("d", "M 0 -20 V 20")

    var text = handle.append('text')
        .text(formatDate(timeScale.domain()[0]))
        .attr("transform", "translate(" + (-18) + " ," + (height / 2 - 25) + ")");


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
        brushDirty = _;
        return makeSlider;
    };

    makeSlider.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return makeSlider;
    };

    //console.log(makeSlider);
    return makeSlider; //.data(data);

}
