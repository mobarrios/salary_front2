import Swal from 'sweetalert2';

export const showSuccessAlert = (title, timer = 1500) => {
    Swal.fire({
        position: "bottom-end",
        icon: "success",
        title: title,
        showConfirmButton: false,
        timer: timer
    });
};

export const showErrorAlert = (title, timer = 1500) => {
    Swal.fire({
        position: "bottom-end",
        icon: "error",
        title: title,
        showConfirmButton: true,
        timer: timer
    });
};