const jws = require('jws');
const React = require('react');
const ReactDOM = require('react-dom');

const spinner = document.querySelector('#spinner');
const inputEmail = document.querySelector('#input_email');
const inputPassword = document.querySelector('#input_password');

const loginBtn = document.querySelector('button.mdl-button');
const token = localStorage.getItem("session-token");

const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

if (token) {
    $.ajax({
        type: "POST",
        url: "/login/" + token,
        contentType: "application/json; charset=utf-8",
        success: () => {
            window.location.href = "/start";
        }
    });
}


inputPassword.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        login();
    }
});

inputEmail.addEventListener('keydown', (e) => {
    if (e.keyCode === 13) {
        login();
    }
});

loginBtn.addEventListener('click', () => {
    login();
});


function loading() {
    spinner.classList.add('is-active');
}

function login() {
    let email = inputEmail.value;
    let password = inputPassword.value;

    if (email !== "" && password !== "") {
        loginBtn.setAttribute("disabled", "true");

        if (email.includes('@') && email.includes('.')) {
            loading();

            jws.createSign({
                header: {alg: 'HS256'},
                payload: {
                    "email": inputEmail.value
                },
                secret: "_kW6zt0tgHJKmOVxcJRAGLo7A3c5BewP8v5drKA2JBU",
            }).on('done', function (signature) {

                let credentials = {
                    "email": email,
                    "password": password,
                    "token": signature
                };

                $.ajax({
                    type: "POST",
                    url: "/login",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(credentials),
                    error: function (e) {
                        if (e.status === 422) {
                            ReactDOM.render(<CustomSnackbar message="Email of wachtwoord bestaat niet."
                                                            severityStrength="error"/>,
                                document.querySelector("#snackbar-holder"));
                            loginBtn.removeAttribute("disabled");
                            spinner.classList.remove('is-active');
                        } else {
                            window.location.reload();
                        }
                    },
                    success: () => {
                        localStorage.setItem('session-token', signature);
                        window.location.href = "/start";
                    }
                });
            });

        } else {
            ReactDOM.render(<CustomSnackbar message="Voer een geldig email adres in." severityStrength="warning"/>,
                document.querySelector("#snackbar-holder"));
            loginBtn.removeAttribute("disabled");
        }
    }
}



