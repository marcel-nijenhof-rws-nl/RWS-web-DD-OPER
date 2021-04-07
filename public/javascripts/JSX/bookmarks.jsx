import {Checkbox} from "@material-ui/core";

var React = require('react');
var ReactDOM = require('react-dom');

const Button = require('@material-ui/core/Button').default;
const Card = require('@material-ui/core/Card').default;
const CardActions = require('@material-ui/core/CardActions').default;
const CardContent = require('@material-ui/core/CardContent').default;
const Typography = require('@material-ui/core/Typography').default;

const Table = require('@material-ui/core/Table').default;
const TableBody = require('@material-ui/core/TableBody').default;
const TableCell = require('@material-ui/core/TableCell').default;
const TableContainer = require('@material-ui/core/TableContainer').default;
const TableHead = require('@material-ui/core/TableHead').default;
const TableRow = require('@material-ui/core/TableRow').default;
const Paper = require('@material-ui/core/Paper').default;
const IconButton = require('@material-ui/core/IconButton').default;

// ICONS
const DeleteIcon = require('@material-ui/icons/Delete').default;
const EditIcon = require('@material-ui/icons/Edit').default;
const LaunchIcon = require('@material-ui/icons/Launch').default;


let emptyPlaceholder = document.querySelector("div img.placeholder");

function createRow(id, name, location, quantity, aspectSet, startTime, endTime) {
    return {id, name, location, quantity, aspectSet, startTime, endTime}
}
// TODO: Make all rows (de)selected
function selectAll(event) {
    console.log(event.target.checked);
}

export class BookmarkCard extends React.Component {

    render() {
        return <TableContainer component={Paper} style={{width: "80vw"}}>
            <Table style={{width: "700"}} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell><Checkbox color="primary" onChange={selectAll}/></TableCell>
                        <TableCell>Bladwijzer Naam</TableCell>
                        <TableCell align="left">Locatie</TableCell>
                        <TableCell align="left">Kwantiteit</TableCell>
                        <TableCell align="left">Aspect Set</TableCell>
                        <TableCell align="left">Start Tijd</TableCell>
                        <TableCell align="left">Eind Tijd</TableCell>
                        <TableCell align="center">Acties</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {this.props.rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell><Checkbox color="primary"/></TableCell>
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="left">{row.location}</TableCell>
                            <TableCell align="left">{row.quantity}</TableCell>
                            <TableCell align="left">{row.aspectSet}</TableCell>
                            <TableCell align="left">{row.startTime}</TableCell>
                            <TableCell align="left">{row.endTime}</TableCell>
                            <TableCell align="center">
                                <IconButton aria-label="edit">
                                    <EditIcon/>
                                </IconButton>
                                <IconButton aria-label="delete">
                                    <LaunchIcon/>
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>


        // return <div style={{width: "250px", margin: "5px"}}>
        //     <Card>
        //         <CardContent>
        //             <Typography>
        //                 {this.props.name}
        //             </Typography>
        //         </CardContent>
        //         <CardActions>
        //             <Button size="small">Open Bladwijzer</Button>
        //         </CardActions>
        //     </Card>
        // </div>
    }
}


$.ajax({
    type: "GET",
    url: "/bookmarks/" + localStorage.getItem('session-token'),
    contentType: "application/json; charset=utf-8",
    error: function (e) {
        console.log(e);
    },
    success: function (e) {
        console.log(e);
        if (e.length > 0) {
            emptyPlaceholder.parentElement.setAttribute('hidden', 'true');
            let rows = [];
            e.forEach(item => {
                rows.push(createRow(item.id, item.name, item.location, item.quantity, item.aspectSet, item.startTime, item.endTime))

            });
            ReactDOM.render(<BookmarkCard rows={rows}/>,
                document.querySelector("div.card-holder"));
            // let components = [];
            // e.forEach(item => {
            //     let btn = <BookmarkCard name={item.name} key={item.id}/>
            //     components.push(btn);
            // });
            // ReactDOM.render(<>{components}</>,
            //     document.querySelector("div.card-holder"));
        }
    }
});
