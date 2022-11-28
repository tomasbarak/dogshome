const posiblePaths = {
    "/index.html":true,
    "index.html":true,
    "/":true,
    "perfil.html":true,
    "/perfil.html":true,
    "/dogshome.softvisiondevelop.com.ar/index.html":true,
    "dogshome.softvisiondevelop.com.ar/index.html":true,
    "/dogshome.softvisiondevelop.com.ar/perfil.html":true,
    "dogshome.softvisiondevelop.com.ar/perfil.html":true,
}

function addPublications(allPublications){
    if(posiblePaths[(window.location.pathname).toString()]) {
        console.log("Adding publications")
        for (let key in allPublications) {
            console.log(key, allPublications[key]);
            let publicationCreatedContainer = document.createElement('div');
            publicationCreatedContainer.className = 'publication';
            publicationCreatedContainer.onclick = function (){window.location = "dog.html" + '?publication=' + allPublications[key].Id};
            //publicationCreatedContainer.style.height = (Math.random() * (330 - 270 + 1) + 270) + "px";

            let publicationContainer = document.getElementById("content-show").appendChild(publicationCreatedContainer);

            let publicationCreatedImage = document.createElement('img');
            publicationCreatedImage.classList.add('publication-photo');
            publicationCreatedImage.loading = 'lazy';
            publicationCreatedImage.src = allPublications[key].Photo;
            publicationCreatedImage.addEventListener('load', lazyImageLoad, false);
            publicationCreatedImage.addEventListener('error', lazyImageError, false);
            let publicationImage = publicationContainer.appendChild(publicationCreatedImage);

            let publicationCreatedDescContainer = document.createElement('div');
            publicationCreatedDescContainer.className = 'publication-desc-cont';

            let publicationDescContainer = publicationContainer.appendChild(publicationCreatedDescContainer);

            let publicationCreatedName = document.createElement('h1');
            publicationCreatedName.className = 'publication-name';
            publicationCreatedName.innerText = allPublications[key].Name;

            let publicationName = publicationDescContainer.appendChild(publicationCreatedName);

            let publicationCreatedDesc = document.createElement('p');
            publicationCreatedDesc.className = 'publication-description';
            publicationCreatedDesc.innerText = allPublications[key].SDescription;

            let publicationDesc = publicationDescContainer.appendChild(publicationCreatedDesc);

            let publicationCreatedRefNameCont = document.createElement('div');
            publicationCreatedRefNameCont.className = 'ref-name-cont';

            let publicationRefNameCont = publicationContainer.appendChild(publicationCreatedRefNameCont);

            let publicationCreatedRefName = document.createElement('a');
            publicationCreatedRefName.innerText = allPublications[key].Refugio;

            let publicationRefName = publicationRefNameCont.appendChild(publicationCreatedRefName);

        }
        setLoading(false)
                
        function lazyImageLoad(e){
            e.currentTarget.parentNode.classList.remove('lazyImageWaiting');
            console.log("lazyLoading")
        }

        function lazyImageError(e){
            let parent = e.currentTarget.parentNode;
            parent.classList.remove("lazyImageWaiting");
            parent.classList.add("lazyImageError");
            setTimeout(() => {
                parent.classList.add("lazyImageErrorShow")
            }, 60);
            console.log("Error lazy")
        }
    }   
}