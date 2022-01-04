function checkProfile(user){
    let uid = user.uid;
    var getData = firebase.database().ref('Users/'+ uid + '/PublicRead/');

    getData.on('value', (snapshot) => {
        const data = snapshot.val();
        //console.log(data);
        if(data !== null ){
            if(data.Finished === true){
                console.log(data);
                readUserData(user);
            }else{
                window.location = 'crear-perfil.html';
            }

        }else{
            window.location = 'crear-perfil.html';
        }

    });
}

function readUserData(){
    firebase.auth().currentUser.getIdToken(true).then(function (idToken) {
    const uid = firebase.auth().currentUser.uid;
    let baseUrl = 'https://api.softvisiondevelop.com.ar'
    async function getDisplayName(){
        let route = '/user/' + uid + '/displayName';
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.responseType = 'json';
        xmlHttp.open( "GET", baseUrl + route, true ); // false for synchronous request
        xmlHttp.setRequestHeader('authToken', idToken);
        xmlHttp.send( null );
        xmlHttp.onload = function(){
            console.log("Got displayname", xmlHttp.response)
            let displayNameJSON = xmlHttp.response;
            setProfileName(displayNameJSON);
        }
    }
    async function getPhotoURL(){
        let route = '/user/' + uid + '/photourl';
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.responseType = 'text';
        xmlHttp.open( "GET", baseUrl + route, true ); // false for synchronous request
        xmlHttp.setRequestHeader('authToken', idToken);
        xmlHttp.send( null );
        xmlHttp.onload = function(){
            let photoURL = xmlHttp.responseText;
            console.log(photoURL);
            setProfileImage(photoURL);
        }
    }
    getPhotoURL();
    getDisplayName();
}).catch(function (error) {
    console.log(error);
});
}

function setProfileImage(photo){
    let profilePic = document.getElementById("profile-pic")
    let profilePicExp = document.getElementById("profile-pic-exp-menu")
    let profilePicMob = document.getElementById("profile-image-mobile")
    if(photo){
        if(profilePic) profilePic.src = photo;
        if(profilePicExp) profilePicExp.src = photo;
        if(profilePicMob) profilePicMob.src = photo;
    }else{
       if(profilePic) profilePic.src = "/images/default-user-image.png";
       if(profilePicExp) profilePicExp.src = "/images/default-user-image.png";
       if(profilePicMob) profilePicMob.src = "/images/default-user-image.png";
    }
    getPublications();
}

function setProfileName(name){
    //document.getElementById("profile-name").innerText = name + ' ' + surname;
    document.getElementById("exp-menu-name").innerText = name.nameAndSurname.displayName;
}