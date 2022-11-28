function enter(email, password, repeatPassword) {
    if (event.key === 'Enter') {
        submitInstance()
    }
}

function throwEmailExistsError() {
    Swal.fire({
        title: 'Error',
        text: 'Parece que el email ingresado ya existe',
        icon: 'error',
        confirmButtonColor: '#d33',
    }
    )
}

function signUp(email, password, repeatPassword) {
    const authDataCheck= checkAuthData(email, password, repeatPassword);
    if (authDataCheck.status === 0) {
        Swal.fire({
            title: 'Registrando',
            text: 'Porfavor espere mientras registramos su cuenta',
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            didOpen: () => {
                Swal.showLoading()
            },
        });
        
        firebase.auth().createUserWithEmailAndPassword(email, password).then((userCredential) => {
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
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/email-already-in-use') {
                throwEmailExistsError();
            }
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: authDataCheck.message,
            icon: 'error',
            confirmButtonColor: '#d33',
        })
    }
}

function checkAuthData(email, password, repeatPassword) {
    /*
        if email is empty, returns 1 in object
        if email is invalid, returns 2 in object
        if password is empty, returns 3 in object
        if password is invalid, returns 4 in object
        if passwords are not equal, returns 5 in object
        if all is ok, returns 0 in object
    */
    if (email.length === 0) {
        return {
            status: 1,
            message: 'El email no puede estar vacío'
        }
    } else if (!isEmailValid(email)) {
        return {
            status: 2,
            message: 'El email ingresado no es válido'
        }
    } else if (password.length === 0) {
        return {
            status: 3,
            message: 'La contraseña no puede estar vacía'
        }
    } else if (checkPasswordStrength(password) === 'weak') {
        return {
            status: 4,
            message: 'La contraseña debe tener al menos 8 caracteres alfanuméricos'
        }
    } else if (password !== repeatPassword) {
        return {
            status: 5,
            message: 'Las contraseñas no coinciden'
        }
    }
    return {
        status: 0,
        message: 'ok'
    }

}

function isEmailValid(email) {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

// function checkPasswordStrength
function equalPasswordsChecker(passwordCheck, repeatPasswordCheck) {
    var repeatPasswordCheckIcon = document.getElementById('password-repeat-check-icon');
    if (passwordCheck.length !== 0 || repeatPasswordCheck.length !== 0) {
        if (passwordCheck === repeatPasswordCheck) {
            repeatPasswordCheckIcon.style.opacity = '1';
        } else {
            repeatPasswordCheckIcon.style.opacity = '0';
        }
    }
}

function setPasswordsVisibility(actualEyePath) {
    var visibleEyePath = 'M1.679 7.932c.412-.621 1.242-1.75 2.366-2.717C5.175 4.242 6.527 3.5 8 3.5c1.473 0 2.824.742 3.955 1.715 1.124.967 1.954 2.096 2.366 2.717a.119.119 0 010 .136c-.412.621-1.242 1.75-2.366 2.717C10.825 11.758 9.473 12.5 8 12.5c-1.473 0-2.824-.742-3.955-1.715C2.92 9.818 2.09 8.69 1.679 8.068a.119.119 0 010-.136zM8 2c-1.981 0-3.67.992-4.933 2.078C1.797 5.169.88 6.423.43 7.1a1.619 1.619 0 000 1.798c.45.678 1.367 1.932 2.637 3.024C4.329 13.008 6.019 14 8 14c1.981 0 3.67-.992 4.933-2.078 1.27-1.091 2.187-2.345 2.637-3.023a1.619 1.619 0 000-1.798c-.45-.678-1.367-1.932-2.637-3.023C11.671 2.992 9.981 2 8 2zm0 8a2 2 0 100-4 2 2 0 000 4z';
    var noVisibleEyePath = 'M.143 2.31a.75.75 0 011.047-.167l14.5 10.5a.75.75 0 11-.88 1.214l-2.248-1.628C11.346 13.19 9.792 14 8 14c-1.981 0-3.67-.992-4.933-2.078C1.797 10.832.88 9.577.43 8.9a1.618 1.618 0 010-1.797c.353-.533.995-1.42 1.868-2.305L.31 3.357A.75.75 0 01.143 2.31zm3.386 3.378a14.21 14.21 0 00-1.85 2.244.12.12 0 00-.022.068c0 .021.006.045.022.068.412.621 1.242 1.75 2.366 2.717C5.175 11.758 6.527 12.5 8 12.5c1.195 0 2.31-.488 3.29-1.191L9.063 9.695A2 2 0 016.058 7.52l-2.53-1.832zM8 3.5c-.516 0-1.017.09-1.499.251a.75.75 0 11-.473-1.423A6.23 6.23 0 018 2c1.981 0 3.67.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.619 1.619 0 010 1.798c-.11.166-.248.365-.41.587a.75.75 0 11-1.21-.887c.148-.201.272-.382.371-.53a.119.119 0 000-.137c-.412-.621-1.242-1.75-2.366-2.717C10.825 4.242 9.473 3.5 8 3.5z';
    var eyePasswordObjectPath = document.getElementById('eye-password-path');

    if (actualEyePath === visibleEyePath) {
        eyePasswordObjectPath.setAttribute('d', noVisibleEyePath);

        document.getElementById('password').type = 'text';
        document.getElementById('password-repeat').type = 'text';
    } else {
        eyePasswordObjectPath.setAttribute('d', visibleEyePath);

        document.getElementById('password').type = 'password';
        document.getElementById('password-repeat').type = 'password';
    }
}
