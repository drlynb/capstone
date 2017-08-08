/* global d3 */
/* global topojson */
/* global L */
// https://maptimeboston.github.io/leaflet-intro/
function MakeMap(facts, renderAll) {
  var chart = this;
  // leaflet http://bl.ocks.org/pbogden/16417ea36900f44710b2
  var osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  var osmAttrib = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var osm = L.tileLayer(osmUrl, {
    maxZoom: 18,
    attribution: osmAttrib
  });
  var map = L.map("map").setView([49.2, -122.3], 8).addLayer(osm);

  var clust = L.markerClusterGroup({
    iconCreateFunction: function (cluster) {
      return L.divIcon({ className: "circle", html: cluster.getChildCount(), iconSize: [30, 30] });
    },
    maxClusterRadius: 50
  });
  //var info = L.control();

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function clicked(e) {
    zoomToFeature(e);
    var city = e.target.feature.properties.name;
    facts.cityDim.filter(city);
    facts.selectedcities = [];
    facts.selectedcities.push(city);
    facts.colourbars();
    renderAll(null);
  }

  //http://bl.ocks.org/mpmckenna8/af23032b41f0ea1212563b523e859228
  d3.json("/map", function (error, topology) {
    //http://bl.ocks.org/awoodruff/728754e48c11a94b522b
    var features = topology.objects.fraserhealthmapdata.geometries.map(function (d) {
      return topojson.feature(topology, d);
    });
    var geojson = L.geoJson(features, {
      className: "tile",
      onEachFeature: onEachFeature
    }).addTo(map);

    function highlightFeature(e) {
      var layer = e.target;
      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
      //info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      //info.update();
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clicked
      });
    }

    /*info.onAdd = function (map) {
      this._div = L.DomUtil.create("div", "info");
      this.update();
      return this._div;
    };
    info.update = function (props) {
      this._div.outerHTML = "<h4>Cities Within Fraser Health</h4>" +
        (props ? "</br>" + props.name + "</br>" : "Hover " +
          "over a city");
    };

    info.addTo(map);*/
  });

  chart.update = function (choice = []) {
    var data = facts.cityDim.top(Infinity);
    // faster to clear all points and redraw than try to remove some
    // https://github.com/Leaflet/Leaflet.markercluster/issues/59#issuecomment-9320628
    clust.clearLayers();
    var temp = [];
    data.forEach(function (d) {
      var living = -1;
      var dead = -1;
      var tmp = ["M", "F"];
      if (_.contains(choice, "L")) {
        living = true;
      }
      if (_.contains(choice, "D")) {
        dead = false;
      }
      if (_.contains(choice, "M") || _.contains(choice, "F")) {
        tmp = choice;
      }
      if (_.contains(tmp, d.Gender) && living === -1 && dead === -1) {
        temp.push(L.marker(d.loc));
      }
      else if (_.contains(tmp, d.Gender) && living === d.Dead && dead === -1) {
        temp.push(L.marker(d.loc));
      }
      else if (_.contains(tmp, d.Gender) && dead === d.Dead && living === -1) {
        temp.push(L.marker(d.loc));
      }
    });

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
}
