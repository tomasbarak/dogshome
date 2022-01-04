function signOut(){
    firebase.auth().signOut().then(() => {
        deleteAllFlags();
        sessionStorage.clear();
        localStorage.clear()
        window.location.href = "signin.html";
    }).catch((error) => {
        // An error happened.
    });
}

function deleteAllFlags(){
    localStorage.clear()
}