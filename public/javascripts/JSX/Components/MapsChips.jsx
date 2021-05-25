import React from 'react';
import Paper from "@material-ui/core/Paper";
import Chip from '@material-ui/core/Chip';
import Typography from "@material-ui/core/Typography";
import {drawMarkers} from "../maps.jsx";
import FormControl from "@material-ui/core/FormControl";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import SearchRounded from "@material-ui/icons/SearchRounded";
import IconButton from "@material-ui/core/IconButton";
import OutlinedInput from '@material-ui/core/OutlinedInput';

export default class MapsChips extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: '',
            searchString: '',
        }

        this.selectQuantity = this.selectQuantity.bind(this);
        this.searchLocations = this.searchLocations.bind(this);
        this.updateSearchString = this.updateSearchString.bind(this);
    }

    selectQuantity(e) {
        if (e === this.state.selected) {
            this.setState({selected: ''});
            drawMarkers(null, this.state.searchString);
        } else {
            this.setState({selected: e});
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

    updateSearchString(e) {
        this.setState({searchString: e});
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
                        <FormControl variant={"outlined"}>
                            <InputLabel htmlFor={"location-search"}>{"Locatie zoeken"}</InputLabel>
                            <OutlinedInput
                                label={"Locatie zoeken"}
                                id={"location-search"}
                                type={"text"}
                                onChange={(e) => {
                                    if (e.target.value === '') {
                                        this.searchLocations(e.target.value);
                                    } else {
                                        this.updateSearchString(e.target.value);
                                    }
                                }}
                                onKeyPress={(e) => {
                                    if (e.code === "Enter" && this.state.searchString !== '') {
                                        this.searchLocations(this.state.searchString);
                                    }
                                }}
                                endAdornment={
                                    <InputAdornment position={"end"}>
                                        <IconButton onClick={() => this.searchLocations(this.state.searchString)}>
                                            <SearchRounded/>
                                        </IconButton>
                                    </InputAdornment>
                                }
                                style={{
                                    borderRadius: '25px',
                                    width: 'auto',
                                }}
                            />
                        </FormControl>
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
                                          backgroundColor: this.state.selected === quantity ? '#4caf50' : '#e0e0e0'
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
