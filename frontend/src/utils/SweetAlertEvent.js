import Swal from "sweetalert2";

export const errorMessage = (string) => {
    Swal.fire({
      title: "알림",
      icon:'error',
      html: string,
      showCancelButton: false,
      confirmButtonText: "확인",
    }).then(() => {});
}
export const successMessage = (string) => {
    Swal.fire({
      title: "알림",
      icon:'success',
      html: string,
      showCancelButton: false,
      confirmButtonText: "확인",
    }).then(() => {});
}