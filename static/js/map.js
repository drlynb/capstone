/* global google */
/* global d3 */
/* global MarkerClusterer */
// https://github.com/thesentinelproject/threatwiki_node/blob/master/public/javascript/visualization.js
// https://vast-journey-7849.herokuapp.com/burmavisualization
// https://developers.google.com/maps/documentation/javascript/marker-clustering
// https://github.com/bseth99/sandbox/blob/master/projects/google-maps/01-drawing-manager-selections.html
function makeMap(facts, renderAll) {
  var data = facts.cityDim.top(Infinity);
  // Create the Google Map…
  var map = new google.maps.Map(d3.select("#map").node(), {
    zoom: 9,
    center: new google.maps.LatLng(49.160, -122.502),
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  // https://stackoverflow.com/questions/6795414/creating-a-selectable-clickable-overlay-on-google-maps
  var areadata = [{
    "name": "Surrey",
    "coords": []
  }];
  // Add some markers to the map.
  // Note: The code uses the JavaScript Array.prototype.map() method to
  // create an array of markers based on a given "locations" array.
  // The map() method here has nothing to do with the Google Maps API.

  var markers = [];
  data.forEach(function (d, i) {
    markers.push(new google.maps.Marker({
      position: d.loc,
      //position: loc(d.City),
      optimized: false,
      title: d.City,
      icon: 'https://www.google.com/mapfiles/marker.png?i=' + (i)
    }));
  });

  markers.forEach(function (m) {
    google.maps.event.addListener(m, 'click', function () {
      var title = this.title;
      facts.selectedcities.push(title);
      facts.cityDim.filterFunction(function (d) {
        return facts.selectedcities.indexOf(d) > -1;
      });
      renderAll(facts);
      $('img[src="' + this.icon + '"]').stop().animate({
        opacity: 0
      });
    });
  });
  
  // Add a marker clusterer to manage the markers.
  var markerCluster = new MarkerClusterer(map, markers, {
    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    optimized: false
  });

  markerCluster.addListener("mouseover", function (c) {
    console.log(c);
  });

  ////////////////////////////////////////////////////
  /////// use the markers like d3 elements?
  /////// https://stackoverflow.com/questions/22047466/how-to-add-css-class-to-a-googlemaps-marker
  /////////////////////////////////////////////////
}
