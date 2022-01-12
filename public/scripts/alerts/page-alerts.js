function showSignOutAlert(){
    Swal.fire({
        title: 'Atención',
        text: "¿Deseas cerrar sesión?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#079292',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Cerrar sesión'
    }).then((result) => {
        if (result.isConfirmed) {
            signOut()
        }
    })
}
function showPhoneVerificationSentMsg(message){
    Swal.fire({
        text: message,
        icon: 'info',
        confirmButtonColor: '#079292'
    })
}
function showPhoneVerificationSuccess(msg){
    Swal.fire({
        text: msg,
        icon: 'success',
        confirmButtonColor: '#079292'
    }).then(function (){
        window.location = 'index.html'
    })
}
function showPhoneVerificationWrong(msg){
    Swal.fire({
        text: msg,
        icon: 'error',
        confirmButtonColor: '#079292'
    })
}