import React from 'react';
import Paper from "@material-ui/core/Paper";
import Chip from '@material-ui/core/Chip';
import Typography from "@material-ui/core/Typography";
import {drawMarkers} from "../maps.jsx";

export default class MapsChips extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: '',
        }

        this.selectQuantity = this.selectQuantity.bind(this);
    }

    selectQuantity(e) {

        if (e === this.state.selected) {
            this.setState({selected: ''});
            localStorage.removeItem('quantity');
            drawMarkers();
        } else {
            this.setState({selected: e});
            localStorage.setItem('quantity', e);
            drawMarkers(e);
        }


        // localStorage.setItem('location', this.props.marker.displayName);
        // ReactDOM.render(<>
        //         <Paper elevation={0} style={{
        //             backgroundColor: '#F3F3F3',
        //             width: '35vw',
        //             borderRadius: '10px'
        //         }}>
        //             <div style={{display: 'flex'}}>
        //                 <Typography
        //                     style={{
        //                         margin: 'auto auto auto 10px'
        //                     }}
        //                     variant={'subtitle1'}>{"Open grafiek: " + this.props.marker.displayNameGlobal + " - " + e}
        //                 </Typography>
        //                 <IconButton onClick={() => window.open("/charts", "_blank")}>
        //                     <LaunchRounded/>
        //                 </IconButton>
        //             </div>
        //         </Paper>
        //     </>,
        //     document.querySelector("div.marker-launch-chart"))
    }


    render() {
        return <>
            <Paper elevation={0} className={"paper"}>
                <div>
                    <div style={{marginBottom: '10px'}}>
                        <div className={"center"}>
                            <Typography variant={'h5'}>{"Kwantiteiten"}</Typography>
                        </div>
                    </div>

                    <div style={{
                        display: 'block'
                    }}>
                        <div className={"center"}
                             style={{
                                 flexWrap: 'wrap'
                             }}>
                            {this.props.quantities.map(quantity => (
                                <Chip clickable
                                      onClick={() => {
                                          this.selectQuantity(quantity);
                                      }}
                                      label={
                                          <Typography variant={"subtitle1"} style={{whiteSpace: 'normal'}}>
                                              {quantity}
                                          </Typography>
                                      }
                                      style={{
                                          margin: '5px 10px',
                                          backgroundColor: this.state.selected === quantity ? '#F9E11E' : '#e0e0e0'
                                      }}
                                      key={quantity}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </Paper>
        </>
    }
}
