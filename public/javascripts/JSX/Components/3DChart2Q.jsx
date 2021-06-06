import React from 'react';
import ReactDOM from 'react-dom';
import Plotly from 'plotly.js-dist';
import Chart3D from "./3DChart.jsx";

export default class Chart3D2Q extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            chartReady: false,
        }

        this.getDataset = this.getDataset.bind(this);
    }

    getDataset(quantity) {
        let result;

        $.ajax({
            type: 'GET',
            url: '/charts/24hr/' + this.props.marker.displayName + '/' + quantity,
            async: false,
            success: (response) => {
                result = response;
            },
            error: () => {
                ReactDOM.unmountComponentAtNode(document.querySelector("div.grid-chart"));
            }
        });

        return result;

    }

    componentDidMount() {
        if (this.props.quantities.toString().includes(",")) {
            let dataset1 = this.getDataset(this.props.quantities[0]);
            let dataset2 = this.getDataset(this.props.quantities[1]);
            if (dataset1 != null && dataset2 != null) {
                let xValues = [];
                let yValues = [];
                let zValues = [];

                let yScale = dataset1.results[0].observationType.quantityName;
                let zScale = dataset2.results[0].observationType.quantityName;


                dataset1.results[0].events.forEach(event => {
                    xValues.push(event.timeStamp);
                    if (event.hasOwnProperty("value")) {
                        yValues.push(event.value);
                    }
                });

                dataset2.results[0].events.forEach(event => {
                    zValues.push(event.value);
                });

                let realZvalues = [];
                for (let i = 0; i < yValues.length; i++) {
                    realZvalues.push(zValues);
                }

                let trace = [{
                    x: xValues,
                    y: yValues,
                    z: realZvalues,
                    type: 'surface',
                    colorscale: "YIGnBu",
                    showscale: false
                }]

                let layout = {
                    autosize: true,
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
                                text: yScale,
                            },
                            showgrid: false,
                            spikecolor: "#ff3c00",
                        },
                        zaxis: {
                            title: {
                                text: zScale,
                            },
                            spikecolor: "#ff3c00",
                        },
                        borderradius: 15,
                    },
                    legend: {}
                };

                this.setState({chartReady: true}, () => {
                    Plotly.react("chart2q", trace, layout);
                });
            }

        } else if (this.props.quantities.includes("waveenergy") || this.props.quantities.includes("wavedirection")) {
            let dataset = this.getDataset(this.props.quantities);
            ReactDOM.render(<Chart3D results={dataset.results[0]} quantity={this.props.quantities}
                                     marker={this.props.marker} windowID={this.props.windowID}/>,
                document.querySelector("#" + this.props.windowID.toString()));
        }
    }


    render() {
        return <>
            <div id={"chart2q"}/>
        </>
    }

}


