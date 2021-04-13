const React = require('react');
const ReactDOM = require('react-dom');
const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

const inputEmail = document.querySelector('#input_email');
const inputEmail2 = document.querySelector('#input_email2');
const inputPassword = document.querySelector('#input_password');
const inputFname = document.querySelector('#input_fname');
const inputLname = document.querySelector('#input_lname');

const spinner = document.querySelector('#spinner');
const registerBtn = document.querySelector('#register-button');

registerBtn.addEventListener('click', () => {
   register();
});

function register() {
    let email = inputEmail.value;
    let email2 = inputEmail2.value;
    let password = inputPassword.value;
    let firstname = inputFname.value;
    let lastname = inputLname.value;

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
                            ReactDOM.render(<CustomSnackbar message="Email is al in gebruik." severityStrength="error"/>,
                                document.querySelector("#snackbar-holder"));
                        }
                        if (e.status === 500) {
                            ReactDOM.render(<CustomSnackbar message="Er is iets fout gegaan bij het registreren." severityStrength="error"/>,
                                document.querySelector("#snackbar-holder"));
                        }
                    },
                    success: () => {
                        spinner.classList.remove('is-active');
                        ReactDOM.render(<CustomSnackbar message="U bent geregistreerd. U wordt terug gebracht." severityStrength="success"/>,
                            document.querySelector("#snackbar-holder"));
                        setTimeout(function () {
                            window.location.href = '/';
                        }, 2000);
                    }
                });
            } else {
                ReactDOM.render(<CustomSnackbar message="Emails komen niet overeen." severityStrength="warning"/>,
                    document.querySelector("#snackbar-holder"));
            }
        } else {
            ReactDOM.render(<CustomSnackbar message="Voer een geldig email adres in." severityStrength="warning"/>,
                document.querySelector("#snackbar-holder"));
        }
    } else {
        ReactDOM.render(<CustomSnackbar message="Voer alle velden in." severityStrength="warning"/>,
            document.querySelector("#snackbar-holder"));
    }
}
