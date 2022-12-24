let provinces_geojson = {};
let departments_geojson = {};

const feature_style = {
    boundaries: {
        province: function(feature) {
            switch (feature.properties.boundary) {
                case 'administrative': return {color: "#079292", fillOpacity: 0.05};
            }
        }
    }
}

function focusProvince(province, map) {
    const province_name = province.nombre;
    
    deleteAllGeoJsonLayers(map);

    if(provinces_geojson[province_name]) {
        addGeoJsonLayer(map, provinces_geojson[province_name]);
        flyToBounds(map, provinces_geojson[province_name].getBounds());

    } else {
        getProvinceBoundaries(province_name).then(bounds => {
            const geojson_layer = addGeoJsonBounds(map, bounds, feature_style.boundaries.province);
            provinces_geojson[province_name] = geojson_layer;
            flyToBounds(map, geojson_layer.getBounds());

        }).catch(error => console.log(error));
    }
}

function focusDepartment(province_name, department, map) {
    const department_name = department.nombre;
    console.log(department_name);


    if(departments_geojson[department_name]) {
        deleteAllGeoJsonLayers(map);
        addGeoJsonLayer(map, departments_geojson[department_name]);
        flyToBounds(map, departments_geojson[department_name].getBounds());

    } else {
        getDepartmentBoundaries(province_name, department_name).then(bounds => {
            deleteAllGeoJsonLayers(map);
            const geojson_layer = addGeoJsonBounds(map, bounds, feature_style.boundaries.province);
            departments_geojson[department_name] = geojson_layer;
            flyToBounds(map, geojson_layer.getBounds());

        }).catch(error => console.log(error));
    }

}