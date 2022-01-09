

function enter(email, password){
    if(event.key === 'Enter') {
        signIn(email, password);
    }
}

function signIn( email, password){
    console.log("iniciando sesion");
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;

            user.getIdToken().then(function (idToken) {
                // Send token to your backend via HTTPS
                axios.post("/sessionLogin", {idToken: idToken}).then(function (response) {
                    window.location.href = "/";
                })
              }).catch(function (error) {
                console.error(error);
              });
            console.log("Inicio de sesion exitoso");
            
            localStorage.setItem("userDataMail", email);
            console.log(email);
            authStateListener();
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("Error: " + errorMessage);
        });
}