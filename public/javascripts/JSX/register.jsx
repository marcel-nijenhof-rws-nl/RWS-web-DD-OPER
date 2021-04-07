const inputEmail = document.querySelector('#input_email');
const inputEmail2 = document.querySelector('#input_email2');
const inputPassword = document.querySelector('#input_password');
const inputFname = document.querySelector('#input_fname');
const inputLname = document.querySelector('#input_lname');

const spinner = document.querySelector('#spinner');
const registerBtn = document.querySelector('#register-button');

// Messages
const errFields = document.querySelector('#err_fields');
const errEmail = document.querySelector('#err_email');
const errEmailComp = document.querySelector('#err_email_comp');
const errEmailPattern = document.querySelector('#err_email_pattern');
const errReg = document.querySelector('#err_reg');

const successfulRegister = document.querySelector('#suc_reg');

registerBtn.addEventListener('click', () => {
   register();
});

function register() {
    let email = inputEmail.value;
    let email2 = inputEmail2.value;
    let password = inputPassword.value;
    let firstname = inputFname.value;
    let lastname = inputLname.value;

    successfulRegister.setAttribute('hidden', 'true');
    errFields.setAttribute('hidden', 'true');
    errEmail.setAttribute('hidden', 'true');
    errEmailComp.setAttribute('hidden', 'true');
    errEmailPattern.setAttribute('hidden', 'true');
    errReg.setAttribute('hidden', 'true');

    if (email !== ""
        && email2 !== ""
        && password !== ""
        && firstname !== ""
        && lastname !== "") {

        if (email.includes('@') && email.includes('.')) {
            if (email === email2) {

                spinner.classList.add('is-active');

                let credentials = {
                    "email": email,
                    "password": password,
                    "firstname": firstname,
                    "lastname": lastname
                }

                $.ajax({
                    type: "POST",
                    url: "/register",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(credentials),
                    error: function (e) {
                        spinner.classList.remove('is-active');
                        if (e.status === 400) {
                            errEmail.removeAttribute('hidden');
                        }
                        if (e.status === 500) {
                            errReg.removeAttribute('hidden');
                        }
                    },
                    success: () => {
                        spinner.classList.remove('is-active');
                        successfulRegister.removeAttribute('hidden');
                        setTimeout(function () {
                            window.location.href = '/';
                        }, 2000);
                    }
                });
            } else {
                errEmailComp.removeAttribute('hidden');
            }
        } else {
            errEmailPattern.removeAttribute('hidden');
        }
    } else {
        errFields.removeAttribute('hidden');
    }
}
