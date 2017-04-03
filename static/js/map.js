// https://github.com/thesentinelproject/threatwiki_node/blob/master/public/javascript/visualization.js
// https://vast-journey-7849.herokuapp.com/burmavisualization
// https://developers.google.com/maps/documentation/javascript/marker-clustering

// https://github.com/bseth99/sandbox/blob/master/projects/google-maps/01-drawing-manager-selections.html
function makeMap(data) {

  var dimension;
  var group;
  var filter;
  // Create the Google Map…
  var map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 10,
    center: new google.maps.LatLng(49.159, -122.979),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });

  // https://stackoverflow.com/questions/6795414/creating-a-selectable-clickable-overlay-on-google-maps
  var areadata = [
    {
      "name": "Surrey",
      "coords": []
    }];
    var areas= [];

  // Add some markers to the map.
  // Note: The code uses the JavaScript Array.prototype.map() method to
  // create an array of markers based on a given "locations" array.
  // The map() method here has nothing to do with the Google Maps API.

  var markers = []
  data.forEach(function(d) {
    //console.log(d.location);
    markers.push(new google.maps.Marker({
      position: d.location
    }));
  });

  // Add a marker clusterer to manage the markers.
  var markerCluster = new MarkerClusterer(map, markers, {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
  });




  // crossfilter stuff
  /*
    //filter dimension if set and update the brush range or reset filter on the dimension
    makeMap.filter = function(value) {
      if (value) {
        brush.extent(value);
        dimension.filterRange(value);
      }
      else {
        brush.clear();
        dimension.filterAll();
      }
      brushDirty = true;
      return makeMap;
    };*/
  makeMap.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    return makeMap;
  };

  // Bind our overlay to the map…
  //overlay.setMap(map); 
  return makeMap;

}
