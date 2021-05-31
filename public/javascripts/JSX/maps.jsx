import * as React from 'react';
import ReactDOM from 'react-dom';
import * as L from 'leaflet';
import * as L1 from 'leaflet.markercluster';

import CustomSnackbar from './Components/CustomSnackbar.jsx';
import MapsChips from "./Components/MapsChips.jsx";
import SwapHorizRoundedIcon from '@material-ui/icons/SwapHorizRounded';
import IconButton from "@material-ui/core/IconButton";
import Chart3D from "./Components/3DChart2Q.jsx";

let worldMap;

const promise1 = new Promise((resolve, reject) => {
    resolve("SUCCESS");
});

function drawsSwitchButton() {

    const mapGrid = document.querySelector("div.grid-map");
    const chartGrid = document.querySelector("div.grid-chart");

    function swapGrid() {
        if (mapGrid.classList.contains("full-row")) {
            mapGrid.classList.remove("full-row");
            chartGrid.classList.add("full-row");
            worldMap.setView([50.3727598, 9.8936041], 7);
        } else {
            mapGrid.classList.add("full-row");
            chartGrid.classList.remove("full-row");
            worldMap.setView([52.3727598, 4.8936041], 8);
        }
    }

    let button = <>
        <IconButton
            onClick={swapGrid}
            style={{
                borderRadius: '5px',
                height: '100%',
                backgroundColor: '#cccccc'
            }}
        >
            <SwapHorizRoundedIcon/>
        </IconButton>
    </>

    ReactDOM.render(button, document.querySelector("div.grid-button-switch"));
}

function drawMap() {
    let map = L
        .map('grid-map')
        .setView([52.3727598, 4.8936041], 8);   // Amsterdam as center and Netherlands as zoom level

    L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
            minZoom: 6,
        }).addTo(map);

    L.svg().addTo(map);

    worldMap = map;
}

function showQuantities() {
    $.ajax({
        type: 'GET',
        url: '/charts/quantities',
        success: (e) => {
            ReactDOM.render(<MapsChips quantities={e.results}/>, document.querySelector("div.marker-chips"));
        },
        error: (e) => {
            console.log(e);
            ReactDOM.render(<CustomSnackbar
                    message={"Kwantiteiten paneel kon niet worden geladen"}
                    severityStrength={"error"}/>,
                document.querySelector("div.snackbar-holder"));
        }
    });
}

function showMarkerInfo(e) {
    let chartElement = document.querySelector("div.grid-chart");
    ReactDOM.unmountComponentAtNode(chartElement);

    let quantities = localStorage.getItem('quantities');

    if (quantities != null && !quantities.includes("waterchlorosity")) {

        let newArr = [];
        newArr.push(quantities.split(',')[0]);
        newArr.push(quantities.split(',')[1]);

        ReactDOM.render(<Chart3D marker={e} quantities={newArr}/>, chartElement);
    }

    // $.ajax({
    //     type: 'GET',
    //     url: '/charts/locations/quantities/' + e.displayName,
    //     success: (res) => {
    //         if (res.results.includes("waveenergy") || res.results.includes("waterflowspeed") || res.results.includes("wavedirection")) {
    //             let quantity;
    //             if (res.results.includes("waveenergy")) {
    //                 quantity = "waveenergy";
    //             } else if (res.results.includes("waterflowspeed")) {
    //                 quantity = "waterflowspeed";
    //             } else if (res.results.includes("wavedirection")) {
    //                 quantity = "wavedirection";
    //             }
    //
    //             $.ajax({
    //                 type: 'GET',
    //                 url: '/charts/24hr/' + e.displayName + '/' + quantity,
    //                 success: (f) => {
    //                     ReactDOM.unmountComponentAtNode(document.querySelector("div.marker-3dchart"));
    //                     ReactDOM.render(<Chart3D
    //                             provider={f.provider}
    //                             results={f.results[0]}
    //                             hasWaveEnergy={res.results.includes("waveenergy")}
    //                             hasWaveDirection={res.results.includes("wavedirection")}
    //                             hasWaterflowspeed={res.results.includes("waterflowspeed")}
    //                         />,
    //                         document.querySelector("div.marker-3dchart"));
    //                 },
    //                 error: () => {
    //                     ReactDOM.render(<CustomSnackbar
    //                             message={"Data kon niet worden geladen"}
    //                             severityStrength={"error"}/>,
    //                         document.querySelector("div.snackbar-holder"));
    //                     ReactDOM.unmountComponentAtNode(document.querySelector("div.marker-3dchart"));
    //                 }
    //             });
    //         } else {
    //             ReactDOM.unmountComponentAtNode(document.querySelector("div.marker-3dchart"));
    //         }
    //         if (res.results.includes("waterlevel")) {
    //             $.ajax({
    //                 type: 'GET',
    //                 url: '/charts/24hr/' + e.displayName + '/waterlevel',
    //                 success: (f) => {
    //                     let values = [];
    //                     let sum = 0;
    //                     f.results[0].events.forEach(item => {
    //                         values.push(item.value);
    //                         sum += item.value;
    //                     });
    //
    //                     let minlevel = Math.min(...values);
    //                     let maxlevel = Math.max(...values);
    //                     let average = (sum / f.results[0].events.length);
    //
    //                     let valuesSorted = values.sort((a, b) => a - b);
    //                     let middleIndex = Math.ceil(valuesSorted.length / 2);
    //                     let median = valuesSorted % 2 === 0
    //                         ? ((valuesSorted[middleIndex] + valuesSorted[middleIndex - 1]) / 2)
    //                         : valuesSorted[middleIndex - 1];
    //
    //
    //                     if (
    //                         minlevel != null
    //                         && maxlevel != null
    //                         && average != null
    //                         && median != null
    //                         && !isNaN(minlevel)
    //                         && !isNaN(maxlevel)
    //                         && !isNaN(average)
    //                         && !isNaN(median)
    //                         && minlevel !== Infinity
    //                         && maxlevel !== Infinity
    //                         && average !== Infinity
    //                         && median !== Infinity
    //                         && minlevel !== -Infinity
    //                         && maxlevel !== -Infinity
    //                         && average !== -Infinity
    //                         && median !== -Infinity
    //                     ) {
    //                         ReactDOM.render(<WaterLevelLegend
    //                                 minLevel={minlevel}
    //                                 maxLevel={maxlevel}
    //                                 averageLevel={average}
    //                                 median={median}
    //                                 location={f.results[0].location.properties.displayNameGlobal}/>,
    //                             document.querySelector("div.marker-waterlevel"));
    //                     }
    //                 },
    //                 error: () => {
    //                     ReactDOM.render(<CustomSnackbar
    //                             message={"Data kon niet worden geladen"}
    //                             severityStrength={"error"}/>,
    //                         document.querySelector("div.snackbar-holder"));
    //                     ReactDOM.unmountComponentAtNode(document.querySelector("div.marker-waterlevel"));
    //                 }
    //             });
    //         } else {
    //             ReactDOM.unmountComponentAtNode(document.querySelector("div.marker-waterlevel"));
    //         }
    //     }
    // });
}

function clearMarkers() {
    if (worldMap) {
        worldMap.eachLayer((layer) => {
            if (layer._leaflet_id !== 26) {
                worldMap.removeLayer(layer);
            }
        });
    }
}

export function drawMarkers(quantities = null, searchString = null) {
    if (quantities != null) {
        quantities = [].concat(quantities);
    }

    clearMarkers();

    let markers = new L1.MarkerClusterGroup({
        showCoverageOnHover: true,
        iconCreateFunction: (cluster) => {
            return L.divIcon({
                html: '<div class="center cluster"><b style="margin: auto">' + cluster.getChildCount() + '</b></div>'
            });
        }
    });

    if (quantities != null && (quantities !== [] && quantities.length > 0)) {
        function retrieveLocations() {
            let locations = [];
            for (let i = 0; i < quantities.length; i++) {
                $.ajax({
                    type: 'GET',
                    url: '/charts/quantities/' + quantities[i],
                    async: false,
                    success: (e) => {
                        e.results.forEach(location => {
                            if (!locations.some(entry => location === entry)) {
                                locations.push(location);
                            }
                        });
                    },
                    error: () => {
                        console.log("ERROR")
                    }
                });
            }

            return locations;
        }

        function getData(locations) {
            let coordinates = [];
            locations.forEach(location => {
                if (location.geometry != null) {
                    if (searchString != null) {
                        if (location.properties.locationName.includes(searchString)) {
                            let c = {
                                lat: location.geometry.coordinates[1],
                                long: location.geometry.coordinates[0],
                                displayNameGlobal: location.properties.displayNameGlobal,
                                displayName: location.properties.locationName,
                            };
                            if (!coordinates.includes(c)) {
                                coordinates.push(c);
                            }
                        }
                    } else {
                        let c = {
                            lat: location.geometry.coordinates[1],
                            long: location.geometry.coordinates[0],
                            displayNameGlobal: location.properties.displayNameGlobal,
                            displayName: location.properties.locationName,
                        };
                        if (!coordinates.includes) {
                            coordinates.push(c);
                        }
                    }
                }
            });

            return coordinates;
        }

        function addMarkers(coordinates) {
            coordinates.forEach(coordinate => {
                let marker = L.marker([coordinate.lat, coordinate.long])
                    .bindTooltip('<p>' +
                        coordinate.displayNameGlobal + '<br>' +
                        coordinate.displayName + '<br>' +
                        coordinate.lat + ', ' + coordinate.long
                        + '</p>',
                        {
                            direction: 'auto',
                            className: 'tooltip'
                        })
                    .openTooltip()
                    .on('click', () => showMarkerInfo(coordinate));

                markers.addLayer(marker);
            });
            return markers;
        }

        function redrawMap(markers) {
            worldMap.addLayer(markers);
        }


        promise1
            .then(retrieveLocations)
            .then((locations) => getData(locations))
            .then((coordinates) => addMarkers(coordinates))
            .then((markers) => redrawMap(markers));

    } else {
        $.ajax({
            type: 'GET',
            url: 'charts/locations',
            success: (response) => {
                ReactDOM.render(<CustomSnackbar
                        message={"Locaties zijn succesvol geladen"}
                        severityStrength={"success"}/>,
                    document.querySelector("div.snackbar-holder"));

                response.results.forEach(location => {
                    let coordinate;
                    if (location.geometry != null) {
                        if (searchString != null) {
                            if (location.properties.locationName.includes(searchString)) {
                                coordinate = {
                                    lat: location.geometry.coordinates[1],
                                    long: location.geometry.coordinates[0],
                                    displayNameGlobal: location.properties.displayNameGlobal,
                                    displayName: location.properties.locationName,
                                };
                            }
                        } else {
                            coordinate = {
                                lat: location.geometry.coordinates[1],
                                long: location.geometry.coordinates[0],
                                displayNameGlobal: location.properties.displayNameGlobal,
                                displayName: location.properties.locationName,
                            };
                        }
                    }

                    if (coordinate) {
                        let marker = L.marker([coordinate.lat, coordinate.long])
                            .bindTooltip('<p>' +
                                coordinate.displayNameGlobal + '<br>' +
                                coordinate.displayName + '<br>' +
                                coordinate.lat + ', ' + coordinate.long
                                + '</p>',
                                {
                                    direction: 'auto',
                                    className: 'tooltip'
                                })
                            .openTooltip()
                            .on('click', () => showMarkerInfo(coordinate));

                        markers.addLayer(marker);
                    }
                });

                worldMap.addLayer(markers);
            },
            error: () => {
                ReactDOM.render(<CustomSnackbar
                        message={"Locaties konden niet worden geplaatst op de kaart"}
                        severityStrength={"error"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        });
    }
}

promise1
    .then(drawMap)
    .then(drawMarkers)
    .then(showQuantities)
    .then(drawsSwitchButton)
