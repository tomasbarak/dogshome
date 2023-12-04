import Swal from 'sweetalert2'

export default function useSwal() {
    const swalAuthError = (error: string) => {
        Swal.fire({
            title: 'Error',
            text: error,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#079292'
        })
    }

    return {
        swalAuthError
    }
} 