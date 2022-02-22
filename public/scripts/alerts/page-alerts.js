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