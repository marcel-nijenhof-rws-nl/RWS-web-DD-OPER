import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js-dist';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from "@material-ui/core/Typography";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import CustomSnackbar from './CustomSnackbar.jsx';

const config = {
    responsive: true
}

export default class Chart3D extends React.Component {

    constructor(props) {
        super(props);

        let quantities = [];
        $.ajax({
            type: 'get',
            url: '/charts/locations/quantities/' + this.props.marker.displayName,
            async: false,
            success: (response) => {
                response.results.forEach(quantity => {
                    if (!quantities.includes(quantity) && (quantity === "waveenergy" || quantity === "wavedirection")) {
                        quantities.push(quantity);
                    }
                });
            }
        });

        this.state = {
            results: this.props.results,
            chartReady: false,
            noData: false,
            currentQuantity: this.props.quantity,
            availableQuantities: quantities,
            twoDimensional: true,
        }

        this.draw3D = this.draw3D.bind(this);
        // this.draw2D = this.draw2D.bind(this);
        this.changeQuantity = this.changeQuantity.bind(this);
        this.switchDimension = this.switchDimension.bind(this);
        this.interpolateCubic = this.interpolateCubic.bind(this);
    }

    interpolateCubic(t) {

    }

    draw3D() {
        let dates = [];
        let sensors = [];
        let valuesMatrix = [];
        let traces = [];

        let layout = {
            autosize: false,
            width: '700',
            height: '350',
            font: {
                family: "Roboto",
                size: 11,
                color: '#000'
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
            },
            scene: {
                aspectratio: {
                    x: 2,
                    y: 2.25,
                    z: 0.8,
                },
                xaxis: {
                    title: {
                        text: "Tijd",
                    },
                    showgrid: false,
                    spikecolor: "#ff3c00",
                },
                yaxis: {
                    title: {
                        text: "Sensor",
                    },
                    showgrid: false,
                    spikecolor: "#ff3c00",
                },
                zaxis: {
                    title: {
                        text: this.state.results.observationType.aspectSet.aspects[0].unit,
                    },
                    spikecolor: "#ff3c00",
                },
                borderradius: 15,
            },
            legend: {}
        };

        this.state.results.events.forEach(event => {
            dates.push(event.timeStamp);
            event.aspects.forEach(aspect => {
                if (!sensors.includes(aspect.name)) {
                    sensors.push(aspect.name);
                }
            });
        });

        for (let l = 0; l < sensors.length; l++) {
            let values = [];
            this.state.results.events.forEach(event => {
                for (let i = 0; i < event.aspects.length; i++) {
                    if (event.aspects[i].name === sensors[l]) {
                        values.push(event.aspects[i].value !== 99999 ? event.aspects[i].value : null);
                    }
                }
            });

            if (values.every(value => value === 99999)) {
                for (let i = 0; i < values.length; i++) {
                    values[i] = null;
                }

                valuesMatrix.push(values);

                continue;
            }

            for (let i = 0; i < values.length; i++) {
                if (values[i] === 99999) {
                    console.log("Faulty Data Detected!")
                }
            }

            valuesMatrix.push(values);

            // debugger;
            // for (let j = 0; j < values.length; j++) {
            //     let lastValidValue;
            //     let nextValidValue;
            //     if (j > 0 && j < values.length && values[j] === 99999) {
            //         lastValidValue = values[j - 1];
            //         for (let k = j; k < values.length; k++) {
            //             if (values[k] !== 99999) {
            //                 nextValidValue = values[k];
            //
            //                 let steps = k - j;
            //                 let stepValue = Math.floor((lastValidValue - nextValidValue) / steps);
            //                 for (let l = j; l < steps; l++) {
            //                     values[l] = lastValidValue + (stepValue * l);
            //                 }
            //
            //                 break;
            //             }
            //         }
            //
            //     }
            // }
            // debugger;
            //
            // valuesMatrix.push(values);
            //

        }



        for (let i = 0; i < sensors.length; i++) {
            if (valuesMatrix[i].every(value => value != null)) {
                let trace = {
                    x: dates,
                    y: sensors,
                    z: valuesMatrix,
                    type: 'surface',
                    colorscale: "YIGnBu",
                    showscale: false,
                    name: ''
                }
                traces.push(trace);
            }
        }

        if (traces.length > 1) {
            this.setState({chartReady: true, noData: false}, () => {
                Plotly.react("chart3d", traces, layout, config);
            });
        } else {
            this.setState({noData: true});
        }
    }

    // draw2D() {
    //     let traces = [];
    //     let sensors = [];
    //     let values = [];
    //     let valuesMatrix = [];
    //
    //     let layout = {
    //         autosize: false,
    //         width: '700',
    //         height: '350',
    //         font: {
    //             family: "Roboto",
    //             size: 11,
    //             color: '#000'
    //         },
    //         plot_bgcolor: 'rgba(0,0,0,0)',
    //         paper_bgcolor: 'rgba(0,0,0,0)',
    //         margin: {
    //             l: 0,
    //             r: 0,
    //             b: 0,
    //             t: 0,
    //         },
    //         scene: {
    //             aspectratio: {
    //                 x: 2,
    //                 y: 2.25,
    //                 z: 0.8,
    //             },
    //             xaxis: {
    //                 title: {
    //                     text: "Tijd",
    //                 },
    //                 showgrid: false,
    //                 spikecolor: "#ff3c00",
    //             },
    //             yaxis: {
    //                 title: {
    //                     text: "Sensor",
    //                 },
    //                 showgrid: false,
    //                 spikecolor: "#ff3c00",
    //             },
    //             zaxis: {
    //                 title: {
    //                     text: this.state.results.observationType.aspectSet.aspects[0].unit,
    //                 },
    //                 spikecolor: "#ff3c00",
    //             },
    //             borderradius: 15,
    //         },
    //         legend: {}
    //     };
    //
    //     // Add all sensors
    //     this.state.results.events[0].aspects.forEach(aspect => {
    //         sensors.push(aspect.name);
    //     });
    //
    //     // Add all values per sensor
    //     this.state.results.events.forEach(event => {
    //         for (let i = 0; i < sensors.length; i++) {
    //             if (event.aspects[i].name === sensors[i]) {
    //                 values.push(event.aspects[i].value);
    //             }
    //         }
    //         // let length = event.aspects.length;
    //         // let noValidValues = false;
    //         // for (let i = 0; i < length; i++) {
    //         //     if (noValidValues) break;
    //         //     if (i > 0 && i < length && event.aspects[i].value === 99999) {
    //         //         let previousValidAspectValue = event.aspects[i - 1].value;
    //         //         let nextValidAspectValue;
    //         //         for (let j = i; j < length; j++) {
    //         //             if (event.aspects[j].value !== 99999) {
    //         //                 nextValidAspectValue = event.aspects[j].value;
    //         //                 let steps = j - i;
    //         //                 let stepValue = Math.floor((nextValidAspectValue - previousValidAspectValue) / steps);
    //         //                 for (let k = i; k < j; k++) {
    //         //                     event.aspects[k].value = (previousValidAspectValue + (stepValue * k));
    //         //                 }
    //         //                 break;
    //         //             } else {
    //         //                 noValidValues = true;
    //         //                 break;
    //         //             }
    //         //         }
    //         //     }
    //         //
    //         //     values.push({sensor: event.aspects[i].name, value: event.aspects[i].value});
    //         // }
    //     });
    //
    //
    //     for (let i = 0; i < sensors.length; i++) {
    //         let data = [];
    //         values.forEach(item => {
    //             if (item.sensor === sensors[i]) {
    //                 data.push(item.value);
    //             }
    //         });
    //         if (data.every(value => value != null)) {
    //             traces.push({
    //                 y: data,
    //                 type: 'box',
    //                 name: sensors[i]
    //             });
    //         }
    //     }
    //
    //     this.setState({chartReady: true, noData: false}, () => {
    //         Plotly.react("chart3d", traces, layout, config);
    //     });
    // }

    switchDimension() {
        this.setState({twoDimensional: !this.state.twoDimensional, chartReady: false}, () => {
            this.draw3D();
        });
    }

    changeQuantity(e) {
        let prevQuantity = this.state.currentQuantity;
        this.setState({chartReady: false}, () => {
            $.ajax({
                type: 'GET',
                url: '/charts/24hr/' + this.state.results.location.properties.locationName + '/' + e,
                success: (response) => {
                    this.setState({
                        currentQuantity: e,
                        results: response.results[0]
                    }, () => {
                        this.draw3D();
                        // switch (this.state.currentQuantity) {
                        //     case "waveenergy":
                        //     case "wavedirection":
                        //         this.state.twoDimensional ? this.draw2D() : this.draw3D();
                        //         break;
                        //     default:
                        //         this.draw2D();
                        //         break;
                        // }
                    });
                },
                error: () => {
                    ReactDOM.render(<CustomSnackbar
                            message={"Kwantiteit " + e + " kon niet worden geladen"}
                            severityStrength={"error"}/>,
                        document.querySelector("div.snackbar-holder"));

                    // $.ajax({
                    //     type: 'GET',
                    //     url: '/charts/24hr/' + this.state.results.location.properties.locationName + '/' + prevQuantity,
                    //     success: (response) => {
                    //         this.setState({
                    //             currentQuantity: prevQuantity,
                    //             results: response.results[0]
                    //         }, () => {
                    //             this.draw3D();
                    //             // switch (this.state.currentQuantity) {
                    //             //     case "waveenergy":
                    //             //     case "wavedirection":
                    //             //         this.state.twoDimensional ? this.draw2D() : this.draw3D();
                    //             //         break;
                    //             //     default:
                    //             //         this.draw2D();
                    //             //         break;
                    //             // }
                    //         });
                    //     },
                    //
                    // });
                }
            });
        });
    }

    componentDidMount() {
        this.draw3D();
    }

    render() {
        return <>
            <div>
                {
                    this.state.chartReady
                        ?
                        <div>
                            <div id={"chart3d"}/>
                        </div>
                        :
                        (
                            this.state.noData
                                ?
                                <div className={"center"}>
                                    <Typography variant={"subtitle1"}>{"Geen data beschikbaar"}</Typography>
                                </div>
                                :
                                <div className={"center"}>
                                    <CircularProgress/>
                                </div>

                        )
                }
            </div>
            {
                this.state.availableQuantities.length > 1
                    ?
                    <div className={"center"}
                         style={{
                             marginTop: '10px',
                             paddingBottom: 'auto',
                         }}
                    >
                        <ButtonGroup>
                            {this.state.availableQuantities.map(quantity => (
                                <Button key={quantity}
                                        variant={'contained'}
                                        color={"primary"}
                                        disabled={this.state.currentQuantity === quantity}
                                        disableElevation
                                        onClick={() => this.changeQuantity(quantity)}>
                                    {quantity}
                                </Button>
                            ))}
                            <Button color={"primary"} onClick={this.switchDimension}>
                                {this.state.twoDimensional ? "3D" : "2D"}
                            </Button>
                        </ButtonGroup>
                    </div>
                    :
                    <div className={"center"}
                         style={{
                             marginTop: '10px',
                             paddingBottom: 'auto',
                         }}
                    >
                        <ButtonGroup>
                            <Button color={"primary"} onClick={this.switchDimension}>
                                {this.state.twoDimensional ? "3D" : "2D"}
                            </Button>
                        </ButtonGroup>
                    </div>
            }
        </>
    }
}

