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
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
  });

  markerCluster.addListener("mouseover", function(c){
      console.log(c);
  });

  ////////////////////////////////////////////////////
  /////// use the markers like d3 elements?
  /////// https://stackoverflow.com/questions/22047466/how-to-add-css-class-to-a-googlemaps-marker
  /////////////////////////////////////////////////


  // crossfilter stuff
  makeMap.dimension = function(_) {
    if (!arguments.length) return dimension;
    dimension = _;
    return makeMap;
  };

  // Bind our overlay to the map…
  //overlay.setMap(map); 
  return makeMap;

}
