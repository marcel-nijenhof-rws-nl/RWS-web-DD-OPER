import {IconButton} from "@material-ui/core";

const Button = require('@material-ui/core/Button').default;
const Dialog = require('@material-ui/core/Dialog').default;
const DialogActions = require('@material-ui/core/DialogActions').default;
const DialogContent = require('@material-ui/core/DialogContent').default;
const DialogContentText = require('@material-ui/core/DialogContentText').default;
const DialogTitle = require('@material-ui/core/DialogTitle').default;
const TextField = require('@material-ui/core/TextField').default;

const CloseIcon = require('@material-ui/icons/Close').default;

const React = require('react');
const ReactDOM = require('react-dom');
const jws = require('jws');
const ChartComponent = require('./Components/Chart.jsx');
const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

let dialog = document.querySelector('dialog');
let showModalButton = document.querySelector('.show-modal');
let showDialogModalButton = document.querySelector('#add-bookmark');

ReactDOM.render(<ChartComponent/>, document.querySelector('section div.chart-holder'));

date.setDate(date.getDate() - 1);
endDate.setDate(endDate.getDate());

startTimePicker.value = date.toISOString().slice(0, 16);
endTimePicker.value = endDate.toISOString().slice(0, 16);

reloadMenu();

document.querySelector("div.reload button").addEventListener('click', () => {
    reloadMenu();
});

if (localStorage.getItem('bookmark') != null) {
    let node = JSON.parse(localStorage.getItem('bookmark'));
    console.log(Object.keys(node.bookmarks).length);
    localStorage.removeItem('bookmark');

    node.bookmarks.forEach(bookmark => {
        addNewDataset(bookmark);
    });
}

if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
}

showModalButton.addEventListener('click', function () {
    dialog.showModal();
});

dialog.querySelector('.close').addEventListener('click', function () {
    dialog.close();
});

if (!bookmarkDialog.showModal) {
    dialogPolyfill.registerDialog(bookmarkDialog);
}
showDialogModalButton.addEventListener('click', function () {
    setValues();
    document.querySelector(".bookmark-location").innerHTML = latestDataSettings.location;
    document.querySelector(".bookmark-quantity").innerHTML = latestDataSettings.quantity;
    document.querySelector(".bookmark-aspect").innerHTML = latestDataSettings.aspectSet;
    document.querySelector(".bookmark-startTime").innerHTML = latestDataSettings.startTime;
    document.querySelector(".bookmark-endTime").innerHTML = latestDataSettings.endTime;
    document.querySelector(".bookmark-interval").innerHTML = latestDataSettings.interval;
    bookmarkDialog.showModal();
});

bookmarkDialog.querySelector('.close').addEventListener('click', function () {
    bookmarkDialog.close();
});

bookmarkDialog.querySelector('.submit').addEventListener('click', function () {
    addBookmark();
});

document.querySelector("#share-chart").addEventListener('click', () => {
    encodeChart();
});

document.querySelector("#generate").addEventListener('click', () => {
    addNewDataset();
    drawBtn.parentElement.setAttribute('hidden', 'true');
    addSetBtn.parentElement.removeAttribute('hidden');
});

document.querySelector("#generate-from-token").addEventListener('click', () => {

    const handleClick = () => {
        let token = document.querySelector("#token-field").value;

        $.ajax({
            type: "GET",
            url: "/charts/load/" + token,
            contentType: "application/json; charset=utf-8",
            error: function (e) {
                ReactDOM.render(<CustomSnackbar message={"Er is iets mis gegaan, STATUS: " + e.status}
                                                severityStrength="error"/>, document.querySelector("div.snackbar-holder"));
            },
            success: (e) => {
                for (let i = 0; i < Object.keys(e).length; i++) {
                    addNewDataset(e[i]);
                }
            }
        });
    }

    const handleClose = () => {
        ReactDOM.unmountComponentAtNode(document.querySelector("#dialog-holder"));
    }

    let dialog =
        <Dialog open={true}>
            <DialogTitle onClose={handleClose.bind(this)} id="form-dialog-title">
                <span>Grafiek inladen</span>
                <IconButton onClick={handleClose.bind(this)} style={{right: 8, top: 8, position: "absolute"}}>
                    <CloseIcon/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Plak hier de token om de grafiek in te laden.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="token-field"
                    label="Token"
                    type="text"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClick.bind(this)} color="primary">
                    Laad Grafiek
                </Button>
            </DialogActions>
        </Dialog>

    ReactDOM.render(dialog, document.querySelector("#dialog-holder"));
});

document.querySelector("#bookmark-name").addEventListener('input', function () {
    if (document.querySelector("#bookmark-name").value !== "") {
        bookmarkDialog.querySelector(".submit").removeAttribute('disabled');
    } else {
        bookmarkDialog.querySelector(".submit").setAttribute('disabled', 'true');
    }
});

function reloadMenu() {
    $.ajax({
        type: "GET",
        url: "/charts/locations",
        contentType: "application/json; charset=utf-8",
        error: function () {
            document.querySelector("div.reload").removeAttribute('hidden');
            ReactDOM.render(<CustomSnackbar message="Locaties kunnen niet worden opgehaald"
                                            severityStrength="error"/>, document.querySelector("div.snackbar-holder"));
        },
        success: function (e) {
            locationDropdown.remove(0);
            document.querySelector("div.reload").setAttribute('hidden', 'true');
            let placeholder = new Option("Kies locatie", "");
            placeholder.classList.add("mdl-textfield__label");
            placeholder.setAttribute("selected", "true");
            placeholder.setAttribute("disabled", "true");
            locationDropdown.append(placeholder);
            e.results.forEach(o => {
                let option = new Option(o.properties?.locationName, o.properties?.locationName);
                option.classList.add("mdl-textfield__label");
                locationDropdown.append(option);
            })
        }
    });
}

function addBookmark() {

    let data = graphs;
    data[0].bookmarkName = document.querySelector("#bookmark-name").value;


    $.ajax({
        type: "POST",
        url: "/bookmarks/add",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        error: function () {
            ReactDOM.render(<CustomSnackbar message="Bladwijzer kon niet worden toegevoegd"
                                            severityStrength="error"/>, document.querySelector("div.snackbar-holder"));
        },
        success: function () {
            ReactDOM.render(<CustomSnackbar message="Bladwijzer toegevoegd"
                                            severityStrength="success"/>, document.querySelector("div.snackbar-holder"));
            bookmarkDialog.close();
        }
    });
}

function encodeChart() {

    jws.createSign({
        header: {alg: 'HS256'},
        payload: {
            "token": graphs
        },
        secret: "_kW6zt0tgHJKmOVxcJRAGLo7A3c5BewP8v5drKA2JBU",
    }).on('done', function (signature) {
        let payload = signature.split(".")[1];

        const handleClick = () => {
            let item = document.querySelector("#share-link-field");
            item.select();
            document.execCommand("copy");
        }

        const handleClose = () => {
            ReactDOM.unmountComponentAtNode(document.querySelector("#dialog-holder"));
        }

        let dialog =
            <Dialog open={true} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <span>Deel Grafiek</span>
                    <IconButton onClick={handleClose.bind(this)} style={{right: 8, top: 8, position: "absolute"}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Kopieer de onderstaande token om het te delen.
                        Laat de andere gebruiker de grafiek inladen door op het laad knop te klikken op de grafieken
                        pagina.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="share-link-field"
                        label="Token"
                        type="text"
                        fullWidth
                        defaultValue={payload}
                        inputProps={{readOnly: true}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClick.bind(this)} color="primary">
                        Kopieer
                    </Button>
                </DialogActions>
            </Dialog>

        ReactDOM.render(dialog, document.querySelector("#dialog-holder"));
    });
}

