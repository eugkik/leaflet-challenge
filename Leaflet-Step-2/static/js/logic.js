
//
// API_KEY needed in config.js
//

var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });
  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

function circleSize(mag) {
    return mag * 50000;
}

function depthColor(depth) {
    if (depth < 10) {
        return "#a3f600";
    }
    else if (depth >= 10 && depth <30) {
        return "#dcf400"
    }
    else if (depth >= 30 && depth <50) {
        return "#f7db11"
    }
    else if (depth >= 50 && depth <70) {
        return "#fdb72a"
    }
    else if (depth >= 70 && depth <90) {
        return "#fca35d"
    }
    else {
        return "#ff5f65";
    }
    
}

var quakes = [];

d3.json(queryUrl).then(function(response) {

  response.features.forEach(
      function(earthquake) {
          var lat = earthquake.geometry.coordinates[1];
          var lon = earthquake.geometry.coordinates[0];
          var location = [lat,lon];
          var depth = earthquake.geometry.coordinates[2];
          var magnitude = earthquake.properties.mag;

          quakes.push(L.circle(location, {
            fillOpacity: 0.75,
            weight: 0.75,
            color: "black",
            fillColor: depthColor(depth),
            radius: circleSize(magnitude)
          })
          .bindPopup("<h3>"+earthquake.properties.place+
                    "<hr>Magnitude: "+earthquake.properties.mag+
                    "<br>Depth: "+depth)
          );
      }
  );

var quakeLayer = L.layerGroup(quakes);

var link = "static/js/plate_data.json"

var plateLayer = L.layerGroup();

d3.json(link).then(function(data) {
    L.geoJSON(data, {fillOpacity: 0, weight: 1, color: 'yellow'}).addTo(plateLayer);
 });

var baseMaps = {
    Satellite: satellite,
    Grayscale: grayscale,
    Outdoors: outdoors
};

var overlayMaps = {
    'Tectonic Plates': plateLayer,
    Earthquakes: quakeLayer    
};


var myMap = L.map("map", {
    center: [15.5994, -28.6731],
    zoom: 3,
    layers: [satellite]
  });

L.control.layers(baseMaps, overlayMaps).addTo(myMap);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    var depth = [-10, 10, 30, 50, 70, 90];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depth.length; i++) {
        div.innerHTML +=
            '<i style="background:' + depthColor(depth[i] + 1) + '"></i> ' +
            depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

});
