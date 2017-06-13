/* global d3 */
/* global topojson */
/* global L */
// https://maptimeboston.github.io/leaflet-intro/
function MakeMap(facts, renderAll) {
  var chart = this;
  // leaflet http://bl.ocks.org/pbogden/16417ea36900f44710b2
  var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib
  });
  var map = L.map('map').setView([49.2, -122.3], 9).addLayer(osm);
  //var data = facts.cityDim.top(Infinity);
  var clust = L.markerClusterGroup();

  //http://bl.ocks.org/mpmckenna8/af23032b41f0ea1212563b523e859228
  d3.json("/map", function (error, topology) {
    var co = d3.scaleOrdinal(d3.schemeCategory20b);
    //http://bl.ocks.org/awoodruff/728754e48c11a94b522b
    var features = topology.objects.fraserhealthmapdata.geometries.map(function (d) {
      return topojson.feature(topology, d);
    });

    function style(feat) {
      var coco = co(feat.color = d3.max(+(feat.properties["@id"].slice(-1)), function (n) {
        return features[n].color;
      }) + 1 | 0);
      return {
        fillColor: coco,
        fillOpacity: .8,
        weight: .8
      };
    }

    function highlightFeature(e) {
      var layer = e.target;
      layer.setStyle({
        weight: 5,
        color: '#665',
        dashArray: '',
        fillOpacity: .7
      });
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
      info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }
    var info = L.control();
    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };

    info.update = function (props) {
      this._div.innerHTML = "<h4>Cities Within Fraser Health</h4>" +
        (props ? '</br>' + props.name + '</br>' : "Hover " +
          "over a city");
    };
    info.addTo(map);

    var geojson = L.geoJson(features, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);
    // http://bl.ocks.org/d3noob/9267535
    /* We simply pick up the SVG from the map object */
    var svg = d3.select("#map").select("svg");
    var g = svg.append("g");
  });
  
  chart.update = function(){
    var data = facts.cityDim.top(Infinity);
      // faster to clear all points and redraw than try to remove some
      // https://github.com/Leaflet/Leaflet.markercluster/issues/59#issuecomment-9320628
      clust.clearLayers();
      var temp = [];
      data.forEach(function(d){
        temp.push(L.marker(d.loc));
        //clust.addLayer(L.marker(d.loc));
      });
      clust.addLayers(temp);
      map.addLayer(clust);
    };
    
  map.on("viewreset", chart.update);
  chart.update();
  return chart;
  /*
    data.forEach(function (d, i) {
      markers.push(new google.maps.Marker({
        position: d.loc,
        //position: loc(d.City),
        optimized: false,
        title: d.City,
        icon: "https://www.google.com/mapfiles/marker.png?i=" + (i)
      }));
    });
    
    markers.forEach(function (m) {
      google.maps.event.addListener(m, "click", function () {
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
  */
}
