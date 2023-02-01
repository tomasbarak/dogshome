

function enter(email, password) {
    if (event.key === 'Enter') {
        signIn(email, password);
    }
}

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
    const registrations = await navigator.serviceWorker.getRegistrations();
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

function signIn(email, password) {
    return new Promise((resolve, reject) => {
        if (email.length > 0 && password.length > 0) {
            firebase.auth().signInWithEmailAndPassword(email, password).then((userCredential) => {
                // Signed in
                let user = userCredential.user;

                user.getIdToken(true).then(async function (idToken) {
                    try {
                        const subscription = await getPushSubscription();
                        axios.post(`https://api.${window.location.hostname}/auth/login`, {
                            idToken: idToken,
                            subscription: subscription
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            withCredentials: true
                        }).then(function (response) {
                            if (response.status == 200) {
                                resolve();
                            } else {
                                reject("Ha ocurrido un error");
                            }
                        }).catch(function (error) {
                            console.log(error);
                        });
                    } catch (error) {
                        axios.post(`https://api.${window.location.hostname}/auth/login`, {
                            idToken: idToken,
                            subscription: null
                        }, {
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            withCredentials: true
                        }).then(function (response) {
                            if (response.status == 200) {
                                resolve();
                            } else {
                                reject("Ha ocurrido un error");
                            }
                        }).catch(function (error) {
                            reject(error);
                        });
                    }
                }).catch(function (error) {
                    reject(error);
                });
                localStorage.setItem("userDataMail", email);
            }).catch((error) => {
                let errorCode = error.code;
                let errorMessage = error.message;
                console.log("Error: " + errorMessage, errorCode);
                if (errorCode == 'auth/wrong-password' || errorCode == 'auth/user-not-found') {
                    reject("El correo o la contraseña son incorrectos");
                } else if (errorCode == 'auth/invalid-email') {
                    reject("El correo no es válido");
                } else {
                    reject("Ha ocurrido un error");
                }
            });
        } else {
            reject("Debes llenar todos los campos");
        }
    });

}

function signInWithIdToken(idToken) {
    return new Promise(async (resolve, reject) => {
        try {
            const subscription = await getPushSubscription();
            axios.post(`https://api.${window.location.hostname}/auth/login`, {
                idToken: idToken,
                subscription: subscription
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }).then(function (response) {
                if (response.status == 200) {
                    resolve();
                } else {
                    reject("Ha ocurrido un error");
                }
            }).catch(function (error) {
                console.log(error);
            });
        } catch (error) {
            axios.post(`https://api.${window.location.hostname}/auth/login`, {
                idToken: idToken,
                subscription: null
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }).then(function (response) {
                if (response.status == 200) {
                    resolve();
                } else {
                    reject("Ha ocurrido un error");
                }
            }).catch(function (error) {
                reject(error);
            });
        }
    });
}