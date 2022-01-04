function getPublications(){
    let baseUrl = 'https://api.softvisiondevelop.com.ar'
    let route = '/publications/all';
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType = 'json';
    xmlHttp.open( "GET", baseUrl + route, true ); // false for synchronous request
    xmlHttp.send( null );

    xmlHttp.onload = function(){
        let data = xmlHttp.response;
        if(data){
            console.log("nashe", data);
            deleteAllPublications(data);
            setLoading(false);
        }else{
            console.log("No data available");

        }
    }
}

function deleteAllPublications(data){
    const myNode = document.getElementById("content-show");
    console.log("cleaning");
    if(myNode !== null){
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
        addPublications(data);
        console.log("addedpubs")

    }
}
