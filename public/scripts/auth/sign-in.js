

function enter(email, password){
    if(event.key === 'Enter') {
        signIn(email, password);
    }
}

function signIn(email, password) {

    const getPushSubscription = async () => {
        //check if service worker is supported
        if (!('serviceWorker' in navigator)) {
            throw new Error('No Service Worker support!');
        }
        if (!('PushManager' in window)) {
            throw new Error('No Push API Support!');
        }
        //check if permission is granted
        const permission = window.Notification.permission;
        if (permission !== 'granted') {
            throw new Error('Permission not granted for Notification');
        }
    
        //register service worker
        const registrations = await navigator.serviceWorker.getRegistrations() ;
        //Check if there is any registration
        if (registrations.length === 0) {
            throw new Error('No Service Worker is registered!');
        }
        const registration = registrations[0];
        //get subscription
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            return subscription;
        } else {
            return null;
        }
    }
    
    if (email.length > 0 && password.length > 0) {
        Swal.fire({
            title: 'Espere por favor',
            text: 'Estamos iniciando su sesión',
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false,
            allowEscapeKey: false,
            heightAuto: false,
            allowEnterKey: false,
        });
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                let user = userCredential.user;

                user.getIdToken(true).then(async function (idToken) {
                    try {
                        const subscription = await getPushSubscription();
                        axios.post("/sessionLogin", { idToken: idToken, subscription: subscription }, {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }).then(function (response) {
                            window.location.href = "/";
                        })
                    } catch (error) {
                        axios.post("/sessionLogin", { idToken: idToken, subscription: null }).then(function (response) {
                            window.location.href = "/";
                        })
                    }
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
                        heightAuto: false,
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                } else if (errorCode == 'auth/invalid-email') {
                    Swal.fire({
                        title: 'Error',
                        text: 'El correo no es válido',
                        heightAuto: false,
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                }else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Ha ocurrido un error',
                        heightAuto: false,
                        icon: 'error',
                        confirmButtonText: 'Reintentar',
                        confirmButtonColor: '#079292'
                    });
                }
            });
    }

}