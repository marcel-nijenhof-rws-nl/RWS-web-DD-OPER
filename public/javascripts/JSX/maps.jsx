import * as L from 'leaflet';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CustomSnackbar from './Components/CustomSnackbar.jsx';
import * as L1 from 'leaflet.markercluster';

import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";
import LiquidChart from 'react-liquidchart';

let worldMap;

class MapLegend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <>
            <Paper elevation={0} style={{
                backgroundColor: '#F3F3F3',
                width: '35vw',
                borderRadius: '10px'
            }}
            >
                <div style={{marginLeft: '5px'}}>
                    <Typography
                        variant={"subtitle1"}>{"Locatie naam: " + this.props.data.displayNameGlobal}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Sensor naam: " + this.props.data.displayName}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Breedtegraad: " + this.props.data.lat}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Lengtegraad: " + this.props.data.long}</Typography>
                </div>
            </Paper>
        </>
    }


}

class WaterLevelLegend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const stops = [
            <stop key={1} stopColor={'rgba(0,136,255,0.8)'} offset="0%"/>,
        ];

        return <>
            <Paper elevation={0} style={{
                backgroundColor: '#F3F3F3',
                width: '35vw',
                borderRadius: '10px',
                paddingBottom: '20px'
            }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '10px',
                }}
                >
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"h4"}>{"Waterhoogte afgelopen 24 uur"}</Typography>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                        }}>
                            <Typography variant={"h6"}>{this.props.location}</Typography>
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        height: '150px',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        marginBottom: '10px'
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography variant={"subtitle1"}>{"Gemiddeld"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.averageLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography variant={"subtitle1"}>{"Laagst"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.minLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography variant={"subtitle1"}>{"Hoogst"}</Typography>
                        </div>
                        <LiquidChart
                            responsive
                            value={this.props.maxLevel}
                            maxValue={this.props.maxLevel}
                            showDecimal
                            amplitude={4}
                            frequency={2}
                            animationTime={2000}
                            animationWavesTime={2250}
                            gradient={{
                                type: 1,
                                x1: 0,
                                x2: 0,
                                y1: 100,
                                y2: 0,
                                stops,
                            }}
                            postfix="cm"
                        />
                    </div>

                </div>
            </Paper>
        </>
    }

}

function mouseover(marker) {
    ReactDOM.render(<MapLegend data={marker}/>, document.querySelector("div.marker.marker-info"));
}

function drawChart(d, i) {
    console.log(d); // event
    console.log(i); // data

    $.ajax({
        type: "GET",
        url: "/charts/locations/quantities/" + i.displayName,
        success: (e) => {
            console.log(e);
        },
        error: () => {
            ReactDOM.render(<CustomSnackbar
                    message={"Locatie info kon niet worden opgehaald"}
                    severityStrength={"error"}/>,
                document.querySelector("div.snackbar-holder"));
        }
    })

}

function drawMap() {
    let map = L
        .map('map')
        .setView([52.3727598, 4.8936041], 8);   // Amsterdam as center

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            minZoom: 6,
        }).addTo(map);

    L.svg().addTo(map);

    worldMap = map;
}

function showMarkerInfo(e) {
    $.ajax({
        type: 'GET',
        url: '/charts/locations/quantities/' + e.displayName,
        success: (res) => {
            console.log(res);
            res.results.forEach(quantity => {
                if (quantity.includes("waterlevel")) {
                    $.ajax({
                        type: 'GET',
                        url: '/charts/waterlevel24h/' + e.displayName,
                        success: (f) => {
                            console.log(f.results[0]);
                            let values = [];
                            let sum = 0;
                            f.results[0].events.forEach(item => {
                                values.push(item.value);
                                sum += item.value;
                            });

                            let minlevel = Math.min(...values);
                            let maxlevel = Math.max(...values);
                            let average = (sum / f.results[0].events.length);

                            if (
                                minlevel != null
                                && maxlevel != null
                                && average != null
                                && !isNaN(minlevel)
                                && !isNaN(maxlevel)
                                && !isNaN(average)
                                && minlevel !== Infinity
                                && maxlevel !== Infinity
                                && average !== Infinity
                                && minlevel !== -Infinity
                                && maxlevel !== -Infinity
                                && average !== -Infinity
                            ) {
                                ReactDOM.render(<WaterLevelLegend
                                        minLevel={minlevel}
                                        maxLevel={maxlevel}
                                        averageLevel={average}
                                        location={f.results[0].location.properties.displayNameGlobal}/>,
                                    document.querySelector("div.marker-waterlevel"));
                            }
                        },
                        error: () => {
                            ReactDOM.render(<CustomSnackbar
                                    message={"Data kon niet worden geladen"}
                                    severityStrength={"error"}/>,
                                document.querySelector("div.snackbar-holder"));
                        }
                    });
                }
            });
        }
    });
}

function drawMarkers() {
    $.ajax({
        type: 'GET',
        url: 'charts/locations',
        success: (response) => {
            ReactDOM.render(<CustomSnackbar
                    message={"Locaties zijn succesvol geladen"}
                    severityStrength={"success"}/>,
                document.querySelector("div.snackbar-holder"));

            console.log(response.results[0]);

            let markers = new L1.MarkerClusterGroup({
                showCoverageOnHover: false,
            });

            response.results.forEach(location => {
                if (location.geometry != null) {
                    let coordinate = {
                        lat: location.geometry?.coordinates[1],
                        long: location.geometry?.coordinates[0],
                        displayNameGlobal: location.properties.displayNameGlobal,
                        displayName: location.properties.locationName,
                    };
                    let marker = L.marker([coordinate.lat, coordinate.long])
                        .on('click', () => showMarkerInfo(coordinate))
                        .on('mouseover', () => mouseover(coordinate));

                    markers.addLayer(marker);
                }

                worldMap.addLayer(markers);
            });
        },
        error: () => {
            ReactDOM.render(<CustomSnackbar
                    message={"Locaties konden niet worden geplaatst op de kaart"}
                    severityStrength={"error"}/>,
                document.querySelector("div.snackbar-holder"));
        }
    });

}

drawMap();
drawMarkers();


