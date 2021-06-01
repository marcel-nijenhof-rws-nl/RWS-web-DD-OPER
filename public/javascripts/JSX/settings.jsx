import React from 'react';
import ReactDOM from 'react-dom';
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Edit from "@material-ui/icons/Edit";
import Save from "@material-ui/icons/Save";
import CustomSnackbar from "./Components/CustomSnackbar.jsx";
import Input from "@material-ui/core/Input";
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from "@material-ui/core/FormControl";
import Select from '@material-ui/core/Select';
import MenuItem from "@material-ui/core/MenuItem";


export default class SettingsPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editable: false,
            databaseUrl: "",
        };

        this.toggleEdit = this.toggleEdit.bind(this);
        this.saveEdit = this.saveEdit.bind(this);
        this.setDatabaseUrl = this.setDatabaseUrl.bind(this);
        this.getDatabaseUrl = this.getDatabaseUrl.bind(this);

    }

    toggleEdit() {
        this.setState({editable: !this.state.editable});
    }

    saveEdit() {
        let data = {
            "id": this.props.user.id,
            "firstName": document.querySelector("#firstName-label").value,
            "lastName": document.querySelector("#lastName-label").value,
            "oldPassword": document.querySelector("#old-password-label").value,
            "newPassword": document.querySelector("#new-password-label").value,
            "newPasswordRepeat": document.querySelector("#new-password-repeat-label").value,
        };

        if (data.newPassword !== data.newPasswordRepeat) {
            ReactDOM.render(<CustomSnackbar
                    message={"Wachtwoorden komen niet overeen"}
                    severityStrength={"warning"}/>,
                document.querySelector("div.snackbar-holder"));
            return;
        }

        if (data.firstName === this.props.user.firstName
            && data.lastName === this.props.user.lastName
            && data.oldPassword === ""
            && (data.newPasswordRepeat === "" || data.newPassword === "")) {

            ReactDOM.render(<CustomSnackbar
                    message={"Geen wijzigingen gedetecteerd"}
                    severityStrength={"info"}/>,
                document.querySelector("div.snackbar-holder"));

            this.toggleEdit();
            return;
        }

        $.ajax({
            type: 'PUT',
            url: 'settings/user',
            data: JSON.stringify(data),
            contentType: 'application/json; charset=utf-8',
            success: (e) => {
                this.toggleEdit();

                ReactDOM.render(<CustomSnackbar
                        message={e}
                        severityStrength={"success"}/>,
                    document.querySelector("div.snackbar-holder"));

                loadProfile();
            },
            error: (e) => {
                ReactDOM.render(<CustomSnackbar
                        message={e.responseText}
                        severityStrength={"error"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        });
    }

    getDatabaseUrl() {
        let token = localStorage.getItem("session-token");
        if (token) {
            $.ajax({
                type: "GET",
                url: "settings/user/db/" + token,
                success: (response) => {
                    this.setState({databaseUrl: response});
                },
                error: () => {
                    ReactDOM.render(<CustomSnackbar
                            message={"Database voorkeur kon niet worden opgehaald."}
                            severityStrength={"error"}/>,
                        document.querySelector("div.snackbar-holder"));
                }
            });
        }
    }


    setDatabaseUrl(value) {
        let body = {
            databaseUrl: value,
            token: localStorage.getItem("session-token")
        }

        $.ajax({
            type: "POST",
            url: "settings/user/db",
            data: JSON.stringify(body),
            contentType: 'application/json; charset=utf-8',
            success: () => {
                this.setState({databaseUrl: value}, () => {
                    ReactDOM.render(<CustomSnackbar
                            message={"Database voorkeur opgeslagen."}
                            severityStrength={"success"}/>,
                        document.querySelector("div.snackbar-holder"));
                });
            },
            error: () => {
                ReactDOM.render(<CustomSnackbar
                        message={"Database voorkeur kon niet worden opgeslagen."}
                        severityStrength={"error"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        });
    }

    componentDidMount() {
        this.getDatabaseUrl();
    }

    render() {
        return <>
            <Paper elevation={0} variant={"outlined"} className={"paper"}>
            <span>
                <Typography variant={"h4"} className={"label-text"}>Profiel</Typography>
                {!this.state.editable
                    ?
                    <IconButton className={"button button--edit"} onClick={this.toggleEdit}><Edit/></IconButton>
                    :
                    <IconButton className={"button button--edit"} onClick={this.saveEdit}><Save/></IconButton>

                }
            </span>
                {this.state.editable
                    ?
                    <>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"firstName-label"}>Voornaam</InputLabel>
                                <Input id={"firstName-label"}
                                       variant={"outlined"}
                                       type={"text"}
                                       defaultValue={this.props.user.firstName}/>
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"lastName-label"}>Achternaam</InputLabel>
                                <Input id={"lastName-label"}
                                       variant={"outlined"}
                                       type={"text"}
                                       defaultValue={this.props.user.lastName}/>
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"email-label"}>Email Adres</InputLabel>
                                <Input id={"email-label"}
                                       variant={"outlined"}
                                       type={"email"}
                                       defaultValue={this.props.user.email}
                                       disabled
                                />
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"old-password-label"}>Wachtwoord</InputLabel>
                                <Input id={"old-password-label"}
                                       variant={"outlined"}
                                       type={"password"}
                                       defaultValue={""}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"new-password-label"}>Nieuw wachtwoord</InputLabel>
                                <Input
                                    id={"new-password-label"}
                                    variant={"outlined"}
                                    type={"password"}
                                    defaultValue={""}
                                />
                            </FormControl>
                        </div>
                        <div>
                            <FormControl className={"textfield--edit"}>
                                <InputLabel htmlFor={"new-password-repeat-label"}>Herhaal nieuw wachtwoord</InputLabel>
                                <Input
                                    id={"new-password-repeat-label"}
                                    variant={"outlined"}
                                    type={"password"}
                                    defaultValue={""}
                                />
                            </FormControl>
                        </div>
                    </>
                    :
                    <>
                        <div>
                            <Typography
                                className={"label-text"}
                                variant={"subtitle1"}
                            >
                                {this.props.user.firstName}
                            </Typography>
                        </div>
                        <div>
                            <Typography
                                className={"label-text"}
                                variant={"subtitle1"}
                            >
                                {this.props.user.lastName}
                            </Typography>
                        </div>
                        <div>
                            <Typography
                                className={"label-text"}
                                variant={"subtitle1"}
                            >
                                {this.props.user.email}
                            </Typography>
                        </div>
                    </>

                }
            </Paper>

            <Paper elevation={0} variant={"outlined"} className={"paper"}>
            <span>
                <Typography variant={"h4"} className={"label-text"}>{"Database Voorkeur"}</Typography>
            </span>
                <FormControl className={"textfield--edit"} variant={"outlined"}>
                    <InputLabel id={"quantity-select-label"} className={"label-white"}>{"Database URL"}</InputLabel>
                    <Select id={"url-select"}
                            labelId={"quantity-select-label"}
                            value={this.state.databaseUrl}
                            label={"Database URL"}
                            onChange={(e) => this.setDatabaseUrl(e.target.value)}
                            style={{
                                width: '25vw'
                            }}
                    >
                        <MenuItem key={"https://ddapi-test.intranet.rws.nl"}
                                  value={"https://ddapi-test.intranet.rws.nl"}>{"https://ddapi-test.intranet.rws.nl"}</MenuItem>
                        <MenuItem key={"https://ddapi-acceptance.intranet.rws.nl"}
                                  value={"https://ddapi-acceptance.intranet.rws.nl"}>{"https://ddapi-acceptance.intranet.rws.nl"}</MenuItem>
                        <MenuItem key={"https://ddapi.intranet.rws.nl"}
                                  value={"https://ddapi.intranet.rws.nl"}>{"https://ddapi.intranet.rws.nl"}</MenuItem>
                        <MenuItem key={"https://ddapi-p1.intranet.rws.nl"}
                                  value={"https://ddapi-p1.intranet.rws.nl"}>{"https://ddapi-p1.intranet.rws.nl"}</MenuItem>
                        <MenuItem key={"https://ddapi-p2.intranet.rws.nl"}
                                  value={"https://ddapi-p2.intranet.rws.nl"}>{"https://ddapi-p2.intranet.rws.nl"}</MenuItem>
                        <MenuItem key={"https://ddapi.rws.nl"}
                                  value={"https://ddapi.rws.nl"}>{"https://ddapi.rws.nl"}</MenuItem>

                    </Select>
                </FormControl>
            </Paper>
        </>
    }
}

function loadProfile() {
    $.ajax({
        type: 'GET',
        url: 'settings/user/' + localStorage.getItem('session-token'),
        success: (node) => {
            ReactDOM.render(<SettingsPanel user={node}/>, document.getElementById("root"));

        },
        error: () => {
            ReactDOM.render(<CustomSnackbar
                    message={"Gebruikers gegevens kon niet worden geladen"}
                    severityStrength={"error"}/>,
                document.querySelector("div.snackbar-holder"));
        }
    });
}

loadProfile();
