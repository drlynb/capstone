var map = L.map('map');

//add new death marker
var deathMarkers = new L.FeatureGroup();

L.geoJSON('../../input/geojson/British_Columbia_AL4.GeoJson', {
  maxZoom: 16
} ).addTo(map);

.on('renderlet', function (table) {
  deathMarkers.clearLayers();
  _.each(allDim.top(Infinity), function (d) {
    var loc = d.brewery.location;
    var name = d.brewery.brewery_name;
    var marker = L.marker([loc.lat, loc.lng]);
    marker.bindPopup("<p>" + name + " " + loc.brewery_city + " " + loc.brewery_state + "</p>");
    breweryMarkers.addLayer(marker);
  });
  map.addLayer(breweryMarkers);
  map.fitBounds(breweryMarkers.getBounds());
});