function getQuery(link){
    if(link.indexOf("=") > -1 && link.indexOf("?") > -1){
        var queryType = link.substring(link.indexOf("?")+1, link.indexOf("="));
        queryType = queryType.toLowerCase();
        if(queryType === "publication" || queryType === "publicacion"){

            var query = link.substring(link.indexOf("=")+1, link.length);
            //var id = Math.random().toString(16).slice(2);
            //console.log(id);
            document.getElementById("post-image").src = "animations/image-loading.gif";
            document.getElementById("primary-image-min").src = "animations/image-loading.gif";
            getPublication(query);
            console.log(query);
        }else{
            window.location = "index.html";
        }
    }else{
        window.location = "index.html";
    }
}