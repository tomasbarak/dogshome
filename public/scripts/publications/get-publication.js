function getPublication(id){
    let baseUrl = 'https://api.softvisiondevelop.com.ar'
    let route = `/publications/${id}`;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.responseType = 'json';
    xmlHttp.open( "GET", baseUrl + route, true ); // false for synchronous request
    xmlHttp.send( null );

    xmlHttp.onload = function(){
        let data = xmlHttp.response;
        if(data){
            console.log(data);
            document.getElementById("post-image").src = data.Photo;
            document.getElementById("primary-image-min").src = data.Photo;
            document.querySelector('meta[property="og:title"]').setAttribute("content", data.Name);
            document.querySelector('meta[property="og:image"]').setAttribute("content", data.Photo);
            $('meta[property=og\\:image]').attr('content', 'http://myweb.com/image.jpg');
            document.getElementById("post-image").alt = data.Name;
            document.getElementById("post-name").innerText = data.Name;
            document.getElementById("post-desc").innerText = data.SDescription;
            document.title = "DogsHome | " + data.Name;
            console.log("Cant images " + data.Images.length);

            document.getElementById("image-count-number").innerText = "1/" + (data.Images.length + 1);
            addSecondaryPhotos(data.Images);
            createSlider(data.Images, data.Photo);
            document.getElementById("error-container").className = "error-container-invisible";
        }else{
            throwDontMatchError();
        }
    }
}

