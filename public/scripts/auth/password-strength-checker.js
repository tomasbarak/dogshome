let timeout;

let password = document.getElementById('password')
let strengthBadge = document.getElementById('password-strength')
let strengthBadgeLabel = document.getElementById('password-strength-label')


let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))')

function StrengthChecker(PasswordParameter){
    if(strongPassword.test(PasswordParameter)) {
        strengthBadge.className = "strong-pass";
        strengthBadgeLabel.innerText = "Fuerte";
        document.getElementById('password-check-icon').style.opacity = '1';
    } else if(mediumPassword.test(PasswordParameter)){
        strengthBadge.className = "medium-pass";
        strengthBadgeLabel.innerText = "Media";
        document.getElementById('password-check-icon').style.opacity = '0';
    } else if (password.value.length > 0){
        strengthBadge.className = "weak-pass";
        strengthBadgeLabel.innerText = "Débil";
        document.getElementById('password-check-icon').style.opacity = '0';
    }else{
        document.getElementById('password-check-icon').style.opacity = '0';
    }
}
password.addEventListener("input", () => {
    strengthBadge.style.display= 'flex'
    strengthBadgeLabel.style.display= 'flex'

    clearTimeout(timeout);
    timeout = setTimeout(() => StrengthChecker(password.value), 0);

    if(password.value.length !== 0){
        strengthBadge.style.display = 'flex';
        strengthBadgeLabel.style.display = 'flex';
    } else{
        strengthBadge.className = "no-pass";
        strengthBadgeLabel.innerText = "None";
        strengthBadgeLabel.style.display = 'none'

    }
});