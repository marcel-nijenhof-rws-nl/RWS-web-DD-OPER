const React = require('react');
const ReactDOM = require('react-dom');
const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

import {yellow} from '@material-ui/core/colors';
import  {createMuiTheme} from '@material-ui/core/styles';

const ThemeProvider = require("@material-ui/core/styles").ThemeProvider;
const TextField = require('@material-ui/core/TextField').default;
const Button = require('@material-ui/core/Button').default;
const CircularProgress = require('@material-ui/core/CircularProgress').default;

function returnToLogin() {
    window.location.href = "/";
}

function register() {
    let email = document.querySelector('#email').value;
    let email2 = document.querySelector('#email2').value;
    let password = document.querySelector('#password').value;
    let password2 = document.querySelector('#password2').value;
    let firstname = document.querySelector('#firstName').value;
    let lastname = document.querySelector('#lastName').value;
    let spinner = document.querySelector('#progress');

    if (email !== ""
        && email2 !== ""
        && password !== ""
        && firstname !== ""
        && lastname !== "") {

        if (email.includes('@') && email.includes('.')) {
            if (email === email2) {
                if (password === password2) {
                    spinner.removeAttribute('hidden');

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
                            spinner.setAttribute('hidden', 'true');
                            if (e.status === 400) {
                                ReactDOM.render(<CustomSnackbar message="Email is al in gebruik."
                                                                severityStrength="error"/>,
                                    document.querySelector("#snackbar-holder"));
                            }
                            if (e.status === 500) {
                                ReactDOM.render(<CustomSnackbar message="Er is iets fout gegaan bij het registreren."
                                                                severityStrength="error"/>,
                                    document.querySelector("#snackbar-holder"));
                            }
                        },
                        success: () => {
                            spinner.setAttribute('hidden', 'true');
                            ReactDOM.render(<CustomSnackbar message="U bent geregistreerd. U wordt terug gebracht."
                                                            severityStrength="success"/>,
                                document.querySelector("#snackbar-holder"));
                            setTimeout(function () {
                                window.location.href = '/';
                            }, 2000);
                        }
                    });

                } else {
                    ReactDOM.render(<CustomSnackbar message="Wachtwoorden komen niet overeen."
                                                    severityStrength="warning"/>,
                        document.querySelector("#snackbar-holder"));
                }
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

export default class RegisterForm extends React.Component {
    render() {
        return <>
            <div className="input">
                <TextField fullWidth required label={"Voornaam"} type={"text"} id="firstName"/>
            </div>
            <div className="input">
                <TextField fullWidth required label={"Achternaam"} type={"text"} id="lastName"/>
            </div>
            <div className="input">
                <TextField fullWidth required label={"Email"} type={"email"} id="email"/>
            </div>
            <div className="input">
                <TextField fullWidth required label={"Herhaal Email"} type={"email"} id="email2"/>
            </div>
            <div className="input">
                <TextField fullWidth required label={"Wachtwoord"} type={"password"} id="password"/>
            </div>
            <div className="input">
                <TextField fullWidth required label={"Herhaal Wachtwoord"} type={"password"}
                           id="password2"/>
            </div>
            <div className="buttons">
                <Button onClick={returnToLogin.bind(this)} id="back-button">Terug</Button>
                <ThemeProvider
                    theme={createMuiTheme({
                        palette: {
                            primary: yellow,
                        },
                    })}>
                    <Button variant="contained" color="primary" onClick={register.bind(this)}
                            id="register-button">Registreer</Button>
                </ThemeProvider>
            </div>
            <div hidden className="center" id="progress">
                <CircularProgress/>
            </div>
        </>
    }
}

ReactDOM.render(<RegisterForm/>, document.querySelector("#root"));
