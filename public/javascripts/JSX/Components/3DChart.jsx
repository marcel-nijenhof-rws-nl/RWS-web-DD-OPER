import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js-dist';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from "@material-ui/core/Typography";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import CustomSnackbar from './CustomSnackbar.jsx';

export default class Chart3D extends React.Component {

    constructor(props) {
        super(props);

        let quantities = [];
        if (this.props.hasWaveEnergy) quantities.push("waveenergy");
        if (this.props.hasWaterflowspeed) quantities.push("waterflowspeed");
        if (this.props.hasWaveDirection) quantities.push("wavedirection");

        this.state = {
            results: this.props.results,
            chartReady: false,
            noData: false,
            currentQuantity: quantities[0],
            availableQuantities: quantities,
        }

        this.draw3D = this.draw3D.bind(this);
        this.changeQuantity = this.changeQuantity.bind(this);

    }

    draw3D() {
        console.log(this.state.results);
        let dates = [];
        let sensors = [];
        let valuesMatrix = [];

        switch (this.state.currentQuantity) {
            case "waveenergy":
            case "wavedirection":

                this.state.results.events.forEach(event => {
                    dates.push(event.timeStamp);
                    event.aspects.forEach(aspect => {
                        if (!sensors.includes(aspect.name)) {
                            sensors.push(aspect.name);
                        }
                    });
                });

                for (let i = 0; i < sensors.length; i++) {
                    let values = [];
                    this.state.results.events.forEach(event => {
                        event.aspects.forEach(aspect => {
                            if (aspect.name === sensors[i]) {
                                if (aspect.value === 99999 || aspect.value === -99999) {
                                    aspect.value = null;
                                }
                                values.push(aspect.value);
                            }
                        });
                    });
                    valuesMatrix.push(values);
                }

                break;
        }

        let traces = [];

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

        let layout = {
            autosize: true,
            height: screen.height > 1080 ? (screen.height / 100) * 35 : (screen.height / 100) * 15,
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

        let config = {
            responsive: true
        }

        if (traces.length > 1) {
            this.setState({chartReady: true, noData: false}, () => {
                Plotly.react("chart3d", traces, layout, config);
            });
        } else {
            this.setState({noData: true});
        }
    }

    changeQuantity(e) {
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
                    });
                },
                error: () => {
                    ReactDOM.render(<CustomSnackbar
                            message={"Kwantiteit " + e + " kon niet worden geladen"}
                            severityStrength={"error"}/>,
                        document.querySelector("div.snackbar-holder"));
                }
            });
        });
    }

    componentDidMount() {
        this.draw3D();
    }

    render() {
        return <>
            <Paper elevation={0} className={"paper"}>
                <div>
                    <div className={"center"}>
                        <Typography
                            variant={"h6"}>
                            {this.state.results.location.properties.displayNameGlobal + " - " + this.state.currentQuantity}
                        </Typography>
                    </div>
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
                            </ButtonGroup>
                        </div>
                        :
                        <></>
                }
            </Paper>
        </>
    }
}

