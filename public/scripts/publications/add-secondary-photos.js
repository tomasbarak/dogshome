function addSecondaryPhotos (secondaryPhotos){
    for (let key in secondaryPhotos) {
        console.log(key, secondaryPhotos[key]);
        var secondaryPhotoContainerCreated = document.createElement('div');
        secondaryPhotoContainerCreated.className = 'secondary-image-cont-unselected';
        secondaryPhotoContainerCreated.id = 'secondary-image' + key;
        secondaryPhotoContainerCreated.onclick = function onclick(){onSecondaryImageClick(this.id)};

        var secondaryPhotoContainer = document.getElementById("post-images-selector").appendChild(secondaryPhotoContainerCreated);

        var secondaryPhotoCreated = document.createElement('img');
        secondaryPhotoCreated.className = 'secondary-image';
        secondaryPhotoCreated.src = secondaryPhotos[key];

        var secondaryPhoto = document.getElementById('secondary-image' + key).appendChild(secondaryPhotoCreated);
    }
    getAllSecondaryPhotos();
}