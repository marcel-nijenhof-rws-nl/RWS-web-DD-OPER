import React from 'react';
import Plotly from 'plotly.js-dist';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from "@material-ui/core/Typography";

export default class Chart3D extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            chartReady: false,
            showProgress: true,
        }

        this.draw3D = this.draw3D.bind(this);

    }

    draw3D() {
        console.log(this.props.results);
        let dates = [];
        let sensors = [];
        let valuesMatrix = [];

        switch (this.props.results.observationType.quantityName) {
            case "waveenergy":
            case "wavedirection":

                this.props.results.events.forEach(event => {
                    dates.push(event.timeStamp);
                    event.aspects.forEach(aspect => {
                        if (!sensors.includes(aspect.name)) {
                            sensors.push(aspect.name);
                        }
                    });
                });

                for (let i = 0; i < sensors.length; i++) {
                    let values = [];
                    this.props.results.events.forEach(event => {
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

                console.log(dates, sensors, valuesMatrix);
                break;
        }

        let traces = [];

        for (let i = 0; i < sensors.length; i++) {
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

        let layout = {
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
                },
                yaxis: {
                    title: {
                        text: "Sensor",
                    },
                },
                zaxis: {
                    title: {
                        text: this.props.results.observationType.aspectSet.aspects[0].unit,
                    },
                },
            },
            legend: {}
        };

        let config = {
            responsive: true
        }

        this.setState({chartReady: true, showProgress: false}, () => {
            Plotly.react("chart3d", traces, layout, config);
        });
    }

    componentDidMount() {
        this.draw3D();
    }

    render() {
        return <>
            <Paper elevation={0} className={"paper"}>
                <div hidden={!this.state.showProgress} className={"center"}>
                    <CircularProgress/>
                </div>
                <div>
                    <div className={"center"}>
                        <Typography
                            variant={"h6"}>{this.props.results.location.properties.displayNameGlobal + " - " + this.props.results.observationType.quantityName}</Typography>
                    </div>
                    <div hidden={!this.state.chartReady} id={"chart3d"}/>
                </div>
            </Paper>
        </>
    }
}

