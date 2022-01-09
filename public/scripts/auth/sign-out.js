function signOut(){
    //Make an xml http request to the server to sign out
    //Make an xml http request to the server to sign out
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
    }
    xmlhttp.open("POST", "https://api.softvisiondevelop.com.ar/signout", true);
}

function deleteAllFlags(){
    localStorage.clear()
}