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
        this.changeQuantity = this.changeQuantity.bind(this);
        this.switchDimension = this.switchDimension.bind(this);
        this.interpolateCubic = this.interpolateCubic.bind(this);
    }

    interpolateCubic(values) {
        for (let j = 0; j < values.length; j++) {
            let p0, p1, p2, p3, a, b, c, d;
            if (j > 1 && j < values.length - 1 && values[j] === 99999) {
                p0 = values[j - 1];
                p1 = values[j - 2];

                if (p0 === 99999 && p1 !== 99999) {
                    p0 = p1;
                } else if ((p0 === 99999 && p1 === 99999) || (p1 === 99999 && p0 !== 99999)) {
                    continue;
                }

                for (let k = j; k < values.length; k++) {
                    if (k < values.length - 2 && values[k] === 99999) {
                        p2 = values[k + 1];
                        p3 = values[k + 2];
                    }

                    if (p3 === 99999 && p2 !== 99999) {
                        p3 = p2;
                    } else if ((p2 === 99999 && p3 === 99999) || (p3 !== 99999 && p2 === 99999)) {
                        continue;
                    }

                    if (p0 && p1 && p2 && p3) {
                        a = (-0.5 * p0) + (1.5 * p1) + (-1.5 * p2) + (0.5 * p3);
                        b = p0 - (2.5 * p1) + (2 * p2) - (0.5 * p3);
                        c = (-0.5 * p0) + (0.5 * p2);
                        d = p1;

                        values[j] = (a * Math.pow(j, 3)) + (b * Math.pow(j, 2)) + (c * j) + d;

                        break;
                    }
                }
            }
        }

        return values;
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

            if (values.some(value => value === 99999)) {
                values = this.interpolateCubic(values);
            }
            valuesMatrix.push(values);
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
        </>
    }
}

