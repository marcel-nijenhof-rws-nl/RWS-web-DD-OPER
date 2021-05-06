import * as React from 'react';
import ReactDOM from 'react-dom';
import * as L from 'leaflet';
import * as L1 from 'leaflet.markercluster';

import CustomSnackbar from './Components/CustomSnackbar.jsx';
import LocationLegend from "./Components/LocationLegend.jsx";
import WaterLevelLegend from "./Components/WaterLevelLegend.jsx";

let worldMap;

function mouseover(marker) {
    ReactDOM.render(<LocationLegend data={marker}/>, document.querySelector("div.marker-info"));
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
            res.results.forEach(quantity => {
                if (quantity.includes("waterlevel")) {
                    $.ajax({
                        type: 'GET',
                        url: '/charts/waterlevel24h/' + e.displayName,
                        success: (f) => {
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
