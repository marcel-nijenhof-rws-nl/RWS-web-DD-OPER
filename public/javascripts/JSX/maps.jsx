import * as React from 'react';
import ReactDOM from 'react-dom';
import * as L from 'leaflet';
import * as L1 from 'leaflet.markercluster';

import CustomSnackbar from './Components/CustomSnackbar.jsx';
import MapsChips from "./Components/MapsChips.jsx";
import WindowContainer from "./Components/WindowContainer.jsx";

let worldMap;
let clusterId;
let activeWindows = [];

const promise1 = new Promise((resolve, reject) => {
    resolve("SUCCESS");
});

// function drawsSwitchButton() {
//
//     const mapGrid = document.querySelector("div.grid-map");
//     const chartGrid = document.querySelector("div.grid-chart");
//
//     function swapGrid() {
//         if (mapGrid.classList.contains("full-row")) {
//             mapGrid.classList.remove("full-row");
//             chartGrid.classList.add("full-row");
//             worldMap.setView([50.3727598, 9.8936041], 7);
//         } else {
//             mapGrid.classList.add("full-row");
//             chartGrid.classList.remove("full-row");
//             worldMap.setView([52.3727598, 4.8936041], 8);
//         }
//     }
//
//     let button = <>
//         <IconButton
//             onClick={swapGrid}
//             style={{
//                 borderRadius: '5px',
//                 height: '100%',
//                 backgroundColor: '#cccccc'
//             }}
//         >
//             <SwapHorizRoundedIcon/>
//         </IconButton>
//     </>
//
//     ReactDOM.render(button, document.querySelector("div.grid-button-switch"));
// }

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

export function updateWindows(windows) {
    activeWindows = windows;
}

function showMarkerInfo(e) {

    // let chartElement = document.querySelector("div.grid-chart");
    // let chartElement2 = document.querySelector("div.grid-waterlevel");
    // ReactDOM.unmountComponentAtNode(chartElement);
    // ReactDOM.unmountComponentAtNode(chartElement2);

    let quantities = localStorage.getItem('quantities');

    if (quantities != null && !quantities.includes("waterchlorosity")) {
        let newArr = [];
        newArr.push(quantities.split(',')[0]);
        newArr.push(quantities.split(',')[1]);

        if (newArr[0] !== undefined
            && newArr[0] !== null
            && newArr[1] !== undefined
            && newArr[1] !== null) {
            if (activeWindows.find(window => window.marker === e && window.quantity[0] === newArr[0] && window.quantity[1] === newArr[1]) == null) {
                activeWindows.push({marker: e, quantity: newArr});
                ReactDOM.render(<WindowContainer children={activeWindows}/>,
                    document.querySelector("div.window-container"));
            } else {
                ReactDOM.render(<CustomSnackbar message={"Venster staat al open"}
                                                severityStrength={"info"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        } else {
            if (activeWindows.find(window => window.marker === e && window.quantity[0] === newArr[0]) == null) {
                activeWindows.push({marker: e, quantity: newArr});
                ReactDOM.render(<WindowContainer children={activeWindows}/>,
                    document.querySelector("div.window-container"));
            } else {
                ReactDOM.render(<CustomSnackbar message={"Venster staat al open"}
                                                severityStrength={"info"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        }
    } else {
        ReactDOM.render(<CustomSnackbar message={"Kies eerst een kwantiteit"}
                                        severityStrength={"info"}/>,
            document.querySelector("div.snackbar-holder"));
    }
}

function clearMarkers() {
    if (clusterId != null) {
        worldMap.eachLayer((layer) => {
            if (layer._leaflet_id === clusterId) {
                worldMap.removeLayer(layer);
            }
        });
        clusterId = null;
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

    clusterId = markers._leaflet_id;

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
                        ReactDOM.render(<CustomSnackbar
                                message={"Locaties konden niet worden geladen"}
                                severityStrength={"error"}/>,
                            document.querySelector("div.snackbar-holder"));
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
            let checked = [];
            coordinates.forEach(coordinate => {
                if (!checked.includes(coordinate.displayName)) {
                    checked.push(coordinate.displayName);
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
// .then(drawsSwitchButton)
