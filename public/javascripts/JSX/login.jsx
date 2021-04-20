import {createMuiTheme} from "@material-ui/core/styles";
import {yellow} from "@material-ui/core/colors";
import {CircularProgress} from "@material-ui/core";

const jws = require('jws');
const React = require('react');
const ReactDOM = require('react-dom');

const token = localStorage.getItem("session-token");

const ThemeProvider = require("@material-ui/core/styles").ThemeProvider;
const TextField = require('@material-ui/core/TextField').default;
const Button = require('@material-ui/core/Button').default;

const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

export default class Login extends React.Component {

    handleEnter(event) {
        if (event.key === "Enter") {
            login();
        }
    }

    render() {
        return <>
            <div className="input">
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="email"
                    label="Email"
                    type="email"
                    fullWidth
                    onKeyDown={this.handleEnter}
                />
            </div>
            <div className="input">
                <TextField
                    required
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                    onKeyDown={this.handleEnter}
                />
            </div>
            <div className="buttons">
                <ThemeProvider
                    theme={createMuiTheme({
                        palette: {
                            primary: yellow,
                        },
                    })}>
                    <Button variant="contained" color="primary" onClick={login.bind(this)}
                            id="login-button">Aanmelden</Button>
                </ThemeProvider>
            </div>
            <div className="center">
                <p>Nog geen account? <a className="link" href="/register">Registreer hier</a></p>
            </div>
            <div className="center spinner" hidden>
                <CircularProgress/>
            </div>
        </>
    }
}

if (token) {
    let dialog = <>
        <div className="center">{"Automatisch aanmelden..."}</div>
        <div className="center"><CircularProgress/></div>
    </>
    ReactDOM.render(dialog, document.querySelector("div.container"));

    $.ajax({
        type: "POST",
        url: "/login/" + token,
        contentType: "application/json; charset=utf-8",
        success: () => {
            window.location.href = "/start";
        },
        error: () => {
            ReactDOM.render(<CustomSnackbar message="Kon niet automatisch inloggen"
                                            severityStrength="error"/>,
                document.querySelector("div.snackbar-holder"));
            ReactDOM.render(<Login/>, document.querySelector("#snackbar-holder"));
        }
    });
} else {
    ReactDOM.render(<Login/>, document.querySelector("div.container"));
}

function login() {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let spinner = document.querySelector("div.spinner");
    let loginBtn = document.querySelector("#login-button");

    if (email !== "" && password !== "") {
        loginBtn.setAttribute("disabled", "true");

        if (email.includes('@') && email.includes('.')) {
            spinner.removeAttribute('hidden');

            jws.createSign({
                header: {alg: 'HS256'},
                payload: {
                    "email": email
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
                            spinner.setAttribute('hidden', 'true');
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
    } else {
        ReactDOM.render(<CustomSnackbar message="Voer beide velden in." severityStrength="warning"/>,
            document.querySelector("#snackbar-holder"));
    }
}
