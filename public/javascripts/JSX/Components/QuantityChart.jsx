import React from 'react';
import ReactDOM from 'react-dom';
import CustomSnackbar from './CustomSnackbar.jsx';
import Chart from 'chart.js';
import Chart3D2Q from "./3DChart2Q.jsx";

export default class QuantityChart extends React.Component {
    constructor(props) {
        super(props);

        let chartID = "chart2d-" + this.props.quantity + "-" + this.props.marker.displayName.replace('.', '-');

        this.state = {
            chartReady: false,
            chartID: chartID
        }

        this.getData = this.getData.bind(this);
    }

    getData() {
        $.ajax({
            type: 'get',
            url: '/charts/24hr/' + this.props.marker.displayName + '/' + this.props.quantity,
            success: (response) => {
                let xValues = [];
                let dataPoints = [];
                if (response.results[0].events.length === 0) {
                    ReactDOM.render(<CustomSnackbar message={"Geen data beschikbaar"}
                                                    severityStrength={"error"}/>,
                        document.querySelector("div.snackbar-holder"));
                    return;
                }

                if (response.results[0].events[0].hasOwnProperty("value")) {
                    response.results[0].events.forEach(event => {
                        let date = new Date(event.timeStamp);
                        xValues.push(date.toUTCString());
                        dataPoints.push({
                            "x": event.timeStamp,
                            "y": event.value,
                            "unit": response.results[0].observationType.aspectSet.aspects[0].unit
                        })
                    });
                } else {
                    switch (this.props.quantity) {
                        case "waveenergy":
                        case "wavedirection":
                            debugger;
                            let id = "#" + this.props.windowID;
                            ReactDOM.render(<Chart3D2Q quantities={[this.props.quantity, null]} marker={this.props.marker}/>,
                                document.querySelector(id));
                            break;
                        default:
                            ReactDOM.render(<CustomSnackbar message={"Niet genoeg data voor 3D render"}
                                                            severityStrength={"warning"}/>,
                                document.querySelector("div.snackbar-holder"));
                            break;
                    }
                }

                let data = {
                    labels: xValues,
                    datasets: [{
                        label: this.props.marker.displayNameGlobal + " - " + this.props.quantity,
                        data: dataPoints,
                        borderColor: 'rgba(0,100,156, 1)',
                        backgroundColor: 'rgba(0,100,156, .2)',
                        pointBackgroundColor: 'rgba(0,100,156, .5)',
                        borderWidth: 1,
                        tension: 0.1
                    }]
                }

                this.setState({chartReady: true}, () => {
                    let chartID = "#" + this.state.chartID;
                    new Chart(document.querySelector(chartID), {
                        type: 'line',
                        data: data,
                        options: {
                            tooltips: {
                                mode: 'index',
                                intersect: false,
                                position: 'nearest',
                                callbacks: {
                                    label: function (x, y) {
                                        return y.datasets[x.datasetIndex].data[x.index].y
                                            + " " + y.datasets[x.datasetIndex].data[x.index].unit;

                                    }
                                }
                            },
                            hover: {
                                mode: 'nearest',
                                intersect: true
                            },
                            responsiveAnimationDuration: 150,
                            onResize: function (chart, newSize) {
                                chart.update();
                            },
                            maintainAspectRatio: false,
                            legend: {
                                display: false,
                            },
                            scales: {
                                xAxes: [{
                                    stacked: false,
                                    type: 'time',
                                    distribution: 'linear',
                                    time: {
                                        tooltipFormat: "DD MMM YYYY HH:mm",
                                        stepSize: 10,
                                        unit: 'minute',
                                        displayFormats: {
                                            minute: 'HH:mm'
                                        },
                                        parser: function (utc) {
                                            let stamp = new Date(utc);
                                            stamp.setHours(stamp.getHours() + (stamp.getTimezoneOffset() / 60))
                                            return stamp;
                                        }
                                    }
                                }]
                            }
                        }
                    });
                });
            },
            error: () => {
                ReactDOM.render(<CustomSnackbar message={"Geen data beschikbaar"}
                                                severityStrength={"error"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        })

    }

    componentDidMount() {
        this.getData();
    }

    render() {
        return <>
            <div style={{height: '100%'}}>
                <canvas id={this.state.chartID}/>
            </div>
        </>
    }
}
