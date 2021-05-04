import * as L from 'leaflet';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CustomSnackbar from './Components/CustomSnackbar.jsx';
import * as L1 from 'leaflet.markercluster';

import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";

let worldMap;

class MapLegend extends React.Component {
    constructor(props) {
        super(props);

        // this.state = {
        //     displayName: props.data.displayName,
        //     displayNameGlobal: props.data.displayNameGlobal,
        //     lat: props.data.lat,
        //     long: props.data.long,
        // }

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
                        variant={"subtitle1"}>{"Display naam: " + this.props.data.displayNameGlobal}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Locatie naam: " + this.props.data.displayName}</Typography>
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
        return <>
            <Paper elevation={0} style={{
                backgroundColor: '#F3F3F3',
                width: '35vw',
                borderRadius: '10px'
            }}
            >
                <div style={{marginLeft: '5px'}}>
                    <Typography
                        variant={"h6"}>{"Waterhoogte"}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography
                        variant={"subtitle1"}>{"Gemiddelde waterhoogte: " + this.props.averageLevel + "cm"}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Minimale hoogte: " + this.props.minLevel + "cm"}</Typography>
                </div>
                <div style={{marginLeft: '5px'}}>
                    <Typography variant={"subtitle1"}>{"Maximale hoogte: " + this.props.maxLevel + "cm"}</Typography>
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

                            ReactDOM.render(<WaterLevelLegend
                                    minLevel={Math.min(...values)}
                                    maxLevel={Math.max(...values)}
                                    averageLevel={(sum / f.results[0].events.length)}/>,
                                document.querySelector("div.marker-waterlevel"));
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

// function drawMarkers2() {
//     $.ajax({
//         type: 'GET',
//         url: 'charts/locations',
//         success: (response) => {
//             ReactDOM.render(<CustomSnackbar
//                     message={"Locaties zijn succesvol geladen"}
//                     severityStrength={"success"}/>,
//                 document.querySelector("div.snackbar-holder"));
//
//             let markers = [];
//             console.log(response.results[0]);
//             response.results.forEach(location => {
//                 if (location.geometry != null) {
//                     let coordinate = {
//                         lat: location.geometry?.coordinates[1],
//                         long: location.geometry?.coordinates[0],
//                         displayNameGlobal: location.properties.displayNameGlobal,
//                         displayName: location.properties.locationName,
//                     };
//
//                     markers.push(coordinate);
//                 }
//             });
//
//             let map = L
//                 .map('map')
//                 .setView([52.3727598, 4.8936041], 8);   // Amsterdam as center
//
//             L.tileLayer(
//                 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//                     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
//                     minZoom: 6,
//                 }).addTo(map);
//
//             L.svg().addTo(map);
//
//             d3.select("#map")
//                 .select("svg")
//                 .selectAll("myCircles")
//                 .data(markers)
//                 .enter()
//                 .append("circle")
//                 .attr("cx", function (d) {
//                     return map.latLngToLayerPoint([d.lat, d.long]).x
//                 })
//                 .attr("cy", function (d) {
//                     return map.latLngToLayerPoint([d.lat, d.long]).y
//                 })
//                 .attr("r", 14)
//                 .style("fill", "red")
//                 .attr("stroke", "red")
//                 .attr("stroke-width", 2)
//                 .attr("fill-opacity", .2)
//                 .style("pointer-events", "all")
//                 .on('mouseover', mouseover)
//                 .on('click', drawChart)
//
//
//             function update() {
//                 d3.selectAll("circle")
//                     .attr("cx", function (d) {
//                         return map.latLngToLayerPoint([d.lat, d.long]).x
//                     })
//                     .attr("cy", function (d) {
//                         return map.latLngToLayerPoint([d.lat, d.long]).y
//                     })
//             }
//
//
//             map.on("moveend", update);
//
//
//         },
//         error: () => {
//             ReactDOM.render(<CustomSnackbar
//                     message={"Kaart kon niet worden geladen"}
//                     severityStrength={"error"}/>,
//                 document.querySelector("div.snackbar-holder"));
//         }
//
//     })
// }


drawMap();
drawMarkers();


