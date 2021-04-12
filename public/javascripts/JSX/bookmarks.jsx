import {Checkbox} from "@material-ui/core";

const React = require('react');
const ReactDOM = require('react-dom');

const snackbarHolder = document.querySelector("#snackbar-holder");

const Table = require('@material-ui/core/Table').default;
const TableBody = require('@material-ui/core/TableBody').default;
const TableCell = require('@material-ui/core/TableCell').default;
const TableContainer = require('@material-ui/core/TableContainer').default;
const TableHead = require('@material-ui/core/TableHead').default;
const TableRow = require('@material-ui/core/TableRow').default;
const Paper = require('@material-ui/core/Paper').default;
const IconButton = require('@material-ui/core/IconButton').default;
const Box = require('@material-ui/core/Box').default;
const Collapse = require('@material-ui/core/Collapse').default;
const Typography = require('@material-ui/core/Typography').default;
const TextField = require('@material-ui/core/TextField').default;
const Tooltip = require('@material-ui/core/Tooltip').default;

const CustomSnackbar = require('./Components/CustomSnackbar.jsx');

// ICONS
const DeleteIcon = require('@material-ui/icons/Delete').default;
const SaveIcon = require('@material-ui/icons/Save').default;
const EditIcon = require('@material-ui/icons/Edit').default;
const LaunchIcon = require('@material-ui/icons/Launch').default;
const KeyboardArrowDownIcon = require('@material-ui/icons/KeyboardArrowDown').default;
const KeyboardArrowUpIcon = require('@material-ui/icons/KeyboardArrowUp').default;

let emptyPlaceholder = document.querySelector("div img.placeholder");

function createBookmarkRow(location, quantity, id) {
    return {location, quantity, id}
}

function createRow(groupName, id, bookmark) {
    return {groupName, id, bookmark}
}

// TODO: Make all rows (de)selected
function selectAll(event) {
    console.log(event.target.checked);
}


function Row(props) {
    const {row} = props;
    const [open, setOpen] = React.useState(false);
    const [editName, enableEdit] = React.useState(false);

    const saveAndClose = (row) => {
        enableEdit(false);
        let newName = document.getElementById(row.groupName).value;

        if (newName === row.groupName) {
            ReactDOM.render(<CustomSnackbar message="Naam is niet veranderd, wijzingen zijn niet opgeslagen."
                                            severityStrength="info"/>, snackbarHolder);
            return;
        }

        let data = {
            "newName": newName,
            "rowId": row.id,
        };

        $.ajax({
            type: "PUT",
            url: "/bookmarks/save",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            error: function () {
                ReactDOM.render(<CustomSnackbar message="De wijzingen werden geweigerd door een foutieve verbinding."
                                                severityStrength="error"/>, snackbarHolder);
            },
            success: function () {
                ReactDOM.render(<CustomSnackbar message="Wijzigingen opgeslagen"
                                                severityStrength="success"/>, snackbarHolder);
                refreshTable();
            }
        });
    }

    const deleteRow = (row) => {
        $.ajax({
            type: "DELETE",
            url: "/bookmarks/delete/" + row.id,
            contentType: "application/json; charset=utf-8",
            error: function () {
                ReactDOM.render(<CustomSnackbar message="De bladwijzer kon niet worden verwijderd."
                                                severityStrength="error"/>, snackbarHolder);
            },
            success: function () {
                ReactDOM.render(<CustomSnackbar message="Bladwijzer verwijderd"
                                                severityStrength="success"/>, snackbarHolder);
                refreshTable();
            }

        });
    }

    return (<>
            <TableRow key={row.id}>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon/>}
                    </IconButton>
                </TableCell>
                <TableCell><Checkbox color="primary"/></TableCell>
                {!editName ?
                    <TableCell align="left">{row.groupName}</TableCell> :
                    <TableCell align="left">
                        <TextField id={row.groupName} label="Naam" variant="outlined" defaultValue={row.groupName}/>
                    </TableCell>
                }
                <TableCell align="center">
                    {!editName ?
                        <>
                            <Tooltip title="Naam Wijzigen">
                                <IconButton aria-label="edit" onClick={() => enableEdit(true)}>
                                    <EditIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Open">
                                <IconButton aria-label="launch">
                                    <LaunchIcon/>
                                </IconButton>
                            </Tooltip>
                        </> :
                        <>
                            <Tooltip title="Opslaan">
                                <IconButton aria-label="save" onClick={saveAndClose.bind(this, row)}>
                                    <SaveIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Verwijder">
                                <IconButton aria-label="delete" onClick={deleteRow.bind(this, row)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Tooltip>
                        </>
                    }
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom component="div">
                                Bladwijzers
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Locatie</TableCell>
                                        <TableCell>Kwantiteit</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.bookmark.map((bookmark) => (
                                        <TableRow key={bookmark.id}>
                                            <TableCell component="th" scope="row">
                                                {bookmark.location}
                                            </TableCell>
                                            <TableCell>{bookmark.quantity}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export class BookmarkTable extends React.Component {

    render() {
        return <TableContainer component={Paper} style={{width: "80vw"}}>
            <Table style={{width: "700"}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell/>
                        <TableCell><Checkbox color="primary" onChange={selectAll}/></TableCell>
                        <TableCell align="left">Naam</TableCell>
                        <TableCell align="center">Acties</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {this.props.rows.map((row) => (
                        <Row key={row.id} row={row}/>
                    ))}
                </TableBody>

            </Table>
        </TableContainer>
    }
}

function refreshTable() {
    $.ajax({
        type: "GET",
        url: "/bookmarks/" + localStorage.getItem('session-token'),
        contentType: "application/json; charset=utf-8",
        error: function () {
            ReactDOM.render(<CustomSnackbar message="De bladwijzers konden niet worden opgehaald."
                                            severityStrength="error"/>, snackbarHolder);
        },
        success: function (e) {
            if (e.length > 0) {
                emptyPlaceholder.parentElement.setAttribute('hidden', 'true');
                let rows = [];
                e.forEach(item => {
                    let bookmarks = [];
                    item.forEach(x => {
                        let bookmark = createBookmarkRow(x[0].location, x[0].quantity, x[0].id);
                        bookmarks.push(bookmark);
                    })

                    rows.push(createRow(item[0][1].name, item[0][1].id, bookmarks))

                });
                ReactDOM.render(<BookmarkTable rows={rows}/>,
                    document.querySelector("div.table-holder"));
            }
        }
    });
}

refreshTable();
