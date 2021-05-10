import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";


export default class LocationLegend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <>
            <Paper elevation={0} style={{
                backgroundColor: '#F3F3F3',
                width: '35vw',
                borderRadius: '10px'
            }}
            >
                <div style={{marginLeft: '5px'}}>
                    <Typography
                        variant={"subtitle1"}>{"Locatie naam: " + this.props.data.displayNameGlobal}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Sensor naam: " + this.props.data.displayName}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Breedtegraad: " + this.props.data.lat}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Lengtegraad: " + this.props.data.long}</Typography>
                </div>
            </Paper>
        </>
    }
}
