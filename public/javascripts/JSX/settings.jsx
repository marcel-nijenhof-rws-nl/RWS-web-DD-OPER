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


export default class SettingsPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editable: false,
        };

        this.toggleEdit = this.toggleEdit.bind(this);
        this.saveEdit = this.saveEdit.bind(this);

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
