function deleteAllGeoJsonLayers(map) {
    //Remove all feature layer from map
    map.eachLayer(function (layer) {
        if (layer instanceof L.GeoJSON) {
            map.removeLayer(layer);
        }
    });
}

function addGeoJsonBounds(map, bounds, style) {
    let provinceGeojson = L.geoJSON(bounds, {
        style: style
    });

    provinceGeojson.addTo(map);

    return provinceGeojson;
}


function addGeoJsonLayer(map, layer) {
    layer.addTo(map);
}

function flyToBounds(map, bounds) {
    map.flyToBounds(bounds, {
        duration: 1
    });
}