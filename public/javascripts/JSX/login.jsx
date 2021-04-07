var jws = require('jws');

const spinner = document.querySelector('#spinner');
const inputEmail = document.querySelector('#input_email');
const inputPassword = document.querySelector('#input_password');

const errEmail = document.querySelector('#err_email_pattern');
const errCred = document.querySelector('#err_cred');

const loginBtn = document.querySelector('button.mdl-button');
const token = localStorage.getItem("session-token");

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


inputPassword.addEventListener('keydown', function (e) {
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

    errEmail.setAttribute('hidden', 'true');
    errCred.setAttribute('hidden', 'true');

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
                            loginBtn.removeAttribute("disabled");
                            errCred.removeAttribute('hidden');
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
            errEmail.removeAttribute('hidden');
            loginBtn.removeAttribute("disabled");
        }
    }
}



