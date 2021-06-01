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
            selected: [],
            searchString: '',
        }

        this.selectQuantity = this.selectQuantity.bind(this);
        this.searchLocations = this.searchLocations.bind(this);
        this.updateSearchString = this.updateSearchString.bind(this);
        this.setQuantityStorage = this.setQuantityStorage.bind(this);
    }

    selectQuantity(e) {
        if (this.state.selected.includes(e)) {
            let newArr = this.state.selected.filter(item => item !== e)
            this.setState({selected: newArr}, () => {
                if (this.state.selected.length > 0) {
                    drawMarkers(this.state.selected, this.state.searchString);
                } else {
                    drawMarkers(null, this.state.searchString);
                }
                this.setQuantityStorage();
            });
        } else {
            this.setState({selected: this.state.selected.concat(e)}, () => {
                drawMarkers(this.state.selected, this.state.searchString);
                this.setQuantityStorage();
            });
        }
    }

    setQuantityStorage() {
        localStorage.setItem('quantities', this.state.selected);
    }

    searchLocations(e) {
        if (e === '') {
            e = null;
        }
        this.setState({searchString: e}, () => {
            drawMarkers(this.state.selected !== [] ? this.state.selected : null, this.state.searchString);
        });
    }

    updateSearchString(e) {
        this.setState({searchString: e});
    }

    componentDidMount() {
        localStorage.removeItem('quantities');
    }

    render() {
        return <>
            <Paper elevation={0} className={"paper"}>
                <div style={{
                    display: 'flex',
                }}>

                    <div className={"quantity-chips"}>
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
                                      backgroundColor: [...this.state.selected].includes(quantity) ? '#F9E11E' : '#e0e0e0'

                                  }}
                                  disabled={!this.state.selected.includes(quantity) && this.state.selected.length === 2}
                                  key={quantity}
                            />
                        ))}
                    </div>

                    <div>
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
                                    width: '400px',
                                }}
                            />
                        </FormControl>
                    </div>

                </div>
            </Paper>
        </>
    }
}
