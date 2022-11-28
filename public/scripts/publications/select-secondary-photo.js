function getAllSecondaryPhotos(){
   var secondaryImagesCont = document.getElementById("post-images-selector");

   var secondaryImagesArray = secondaryImagesCont.getElementsByTagName('div');

   //console.log(secondaryImagesArray);
       secondaryImagesArray[0].className = "secondary-image-cont-selected";
}

function onSecondaryImageClick(id){
    document.getElementById(id).className = 'secondary-image-cont-selected';

    var secondaryImagesCont = document.getElementById("post-images-selector");

    var secondaryImagesArray = secondaryImagesCont.getElementsByTagName('div');

    unselectOthersOnClick(id, secondaryImagesArray);

    document.getElementById("post-image").src = document.getElementById(id).getElementsByTagName("img")[0].src;
}

function unselectOthersOnClick(exception_id, all_secondary_photos){
    for(let key in all_secondary_photos){
        console.log(all_secondary_photos[key])

        if(all_secondary_photos[key].id !== exception_id){
            all_secondary_photos[key].className = "secondary-image-cont-unselected";
        }
    }
}