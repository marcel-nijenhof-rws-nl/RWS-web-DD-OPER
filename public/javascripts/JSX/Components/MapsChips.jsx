import React from 'react';
import Paper from "@material-ui/core/Paper";
import Chip from '@material-ui/core/Chip';
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import {drawMarkers} from "../maps.jsx";

export default class MapsChips extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: '',
            searchString: '',
        }

        this.selectQuantity = this.selectQuantity.bind(this);
        this.searchLocations = this.searchLocations.bind(this);
    }

    selectQuantity(e) {
        if (e === this.state.selected) {
            this.setState({selected: ''});
            localStorage.removeItem('quantity');
            drawMarkers(null, this.state.searchString);
        } else {
            this.setState({selected: e});
            localStorage.setItem('quantity', e);
            drawMarkers(e, this.state.searchString);
        }
    }

    searchLocations(e) {
        if (e === '') {
            e = null;
        }
        this.setState({searchString: e}, () => {
            drawMarkers(this.state.selected !== '' ? this.state.selected : null, e);
        });
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

                    <div className={"center"}
                         style={{marginBottom: '5px'}}
                    >
                        <TextField id="location-search"
                                   label="Zoek locatie"
                                   type="search"
                                   variant="outlined"
                                   onKeyPress={(e) => {
                                       if (e.code === "Enter") {
                                           this.searchLocations(e.target.value);
                                       }
                                   }}
                                   onChange={(e) => {
                                       if (e.target.value === '') {
                                           this.searchLocations(e.target.value);
                                       }
                                   }}
                                   InputProps={{
                                       style: {
                                           borderRadius: 50,
                                           width: '95%'
                                       }
                                   }}
                                   style={{
                                       width: '95%',
                                       marginLeft: 'auto'
                                   }}
                        />
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
