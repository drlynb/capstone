// https://github.com/thesentinelproject/threatwiki_node/blob/master/public/javascript/visualization.js
// https://vast-journey-7849.herokuapp.com/burmavisualization
//https://developers.google.com/maps/documentation/javascript/marker-clustering
function makeMap(data){
  // Create the Google Map…
  var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 10,
  center: new google.maps.LatLng(49.159, -122.979),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

        
        // Add some markers to the map.
        // Note: The code uses the JavaScript Array.prototype.map() method to
        // create an array of markers based on a given "locations" array.
        // The map() method here has nothing to do with the Google Maps API.
        /*var markers = locations.map(function(location, i) {
          return new google.maps.Marker({
            position: location,
            label: labels[i % labels.length]
          });
        });*/
        var markers = []
        data.forEach(function(d){
          //console.log(d.location);
          markers.push(new google.maps.Marker({
            position: d.location
          }));
        });
        console.log(markers);
    // Add a marker clusterer to manage the markers.
        var markerCluster = new MarkerClusterer(map, markers,
            {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
      
// Load the station data. When the data comes back, create an overlay.
/*
  var overlay = new google.maps.OverlayView();

  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "events");

    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;
      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
          .enter().append("svg")
          .each(transform)
          .attr("class", "marker");

      // Add a circle.
      marker.append("circle")
          .attr("r", 4.5)
          .attr("cx", padding)
          .attr("cy", padding);

      // Add a label.
      marker.append("text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".31em")
          .text(function(d) { return d.key; });

      function transform(d) {
        //console.log(d.value.EventLat);
        d = new google.maps.LatLng(d.value.EventLat, d.value.EventLng);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
      

    };
  };*/
  
 
  
      makeMap.dimension = function(_) {
          if (!arguments.length) return dimension;
          dimension = _;
          return makeMap;
        };
        
        makeMap.group = function(_) {
          if (!arguments.length) return group;
          group = _;
          return makeMap;
        };

    // Bind our overlay to the map…
  //overlay.setMap(map); 
  return makeMap;

}