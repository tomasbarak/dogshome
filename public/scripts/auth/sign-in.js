

function enter(email, password){
    if(event.key === 'Enter') {
        signIn(email, password);
    }
}

function signIn(email, password) {
    if (email.length > 0 && password.length > 0) {
        Swal.fire({
            title: 'Espere por favor',
            text: 'Estamos iniciando su sesión',
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
        });
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user;

                user.getIdToken().then(function (idToken) {
                    // Send token to your backend via HTTPS
                    axios.post("/sessionLogin", { idToken: idToken }).then(function (response) {
                        window.location.href = "/";
                    })
                }).catch(function (error) {
                    console.error(error);
                });
                console.log("Inicio de sesion exitoso");

                localStorage.setItem("userDataMail", email);
                console.log(email);
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log("Error: " + errorMessage, errorCode);
                if (errorCode == 'auth/wrong-password' || errorCode == 'auth/user-not-found') {
                    Swal.fire({
                        title: 'Error',
                        text: 'El correo o la contraseña son incorrectos',
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                } else if (errorCode == 'auth/invalid-email') {
                    Swal.fire({
                        title: 'Error',
                        text: 'El correo no es válido',
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                }else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Ha ocurrido un error',
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                }
            });
    }

}