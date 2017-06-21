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
    //http://bl.ocks.org/awoodruff/728754e48c11a94b522b
    var features = topology.objects.fraserhealthmapdata.geometries.map(function (d) {
      return topojson.feature(topology, d);
    });

    function highlightFeature(e) {
      var layer = e.target;
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
      className: "tile",
      onEachFeature: onEachFeature
    }).addTo(map);
  });

  chart.update = function (choice = []) {
    var data = facts.cityDim.top(Infinity);
    // faster to clear all points and redraw than try to remove some
    // https://github.com/Leaflet/Leaflet.markercluster/issues/59#issuecomment-9320628
    clust.clearLayers();
    var temp = [];
    if (choice.length === 1) {
      data.forEach(function (d) {
        if (d.Gender === choice[0]) {
          temp.push(L.marker(d.loc));
        }
      });
    }
    else {
      data.forEach(function (d) {
        temp.push(L.marker(d.loc));
      });
    }

    clust.addLayers(temp);
    map.addLayer(clust);
  };

  chart.updatecheck = function () {
    var choices = [];
    d3.selectAll(".myCheckbox2").each(function (d) {
      var cb = d3.select(this);
      if (cb.property("checked")) {
        choices.push(cb.property("value"));
      }
    });
    chart.update(choices);
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
