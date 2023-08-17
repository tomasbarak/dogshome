function getProvinces() {
    return new Promise((resolve, reject) => {
        fetch('/other/alerts/provinces.json')
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => reject(error));
    });
}

function getDepartments(province_name){
    return new Promise((resolve, reject) => {
        province_name = province_name.replace(new RegExp(' ', 'g'), '_').toLowerCase();
        fetch(`/other/departments/${province_name}.json`)
        .then(response => response.json())
        .then(data => resolve(data["departamentos"]))
        .catch(error => reject(error));
    })
}

function getProvinceBoundaries(province_name) {
    return new Promise((resolve, reject) => {
        fetch(`./other/alerts/Arg_Boundaries/${province_name}/${province_name}.geojson`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
}

function getDepartmentBoundaries(province_name, department_name) {
    return new Promise((resolve, reject) => {
        fetch(`./other/alerts/Arg_Boundaries/${province_name}/${department_name}.geojson`)
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(error => reject(error));
    });
}