function refreshUser(idToken) {
    return new Promise((resolve, reject) => {
        signInWithIdToken(idToken).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
        
}

function sendEmailVerification() {
    return new Promise((resolve, reject) => {
        axios.post('/verify/email').then(function(response) {
            if(response.status == 200) {
                resolve();
            } else {
                reject("Ha ocurrido un error");
            }
        }).catch(function(error) {
            reject(error.response);
        })
    });
}