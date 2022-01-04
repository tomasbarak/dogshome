function requestLatitude(){
    let coordenadas = [1, 1];

    var latitude = 0.0;

    navigator.geolocation.getCurrentPosition(function(position) {
        loadMap(position.coords.latitude, position.coords.longitude);
    });
}
function loadMap(lat, lon){
    var mymap = L.map('map').setView([lat, lon], 15);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYmFyYWsyMDA1IiwiYSI6ImNrcWoxZHo2dTBvOXYycG1sODd0emJxeDMifQ.ZaKvMp-SM86jlLY6G44b2w', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'your.mapbox.access.token'
    }).addTo(mymap);

    get_all_alerts(mymap);
}