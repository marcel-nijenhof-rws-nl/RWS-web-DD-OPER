import * as d3 from 'd3';
import * as L from 'leaflet';
import * as React from 'react';
import ReactDOM from 'react-dom';
import CustomSnackbar from './Components/CustomSnackbar.jsx';

import Paper from '@material-ui/core/Paper';
import Typography from "@material-ui/core/Typography";


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

function drawMap() {
    $.ajax({
        type: 'GET',
        url: 'charts/locations',
        success: (response) => {
            ReactDOM.render(<CustomSnackbar
                    message={"Locaties zijn succesvol geladen"}
                    severityStrength={"success"}/>,
                document.querySelector("div.snackbar-holder"));

            let markers = [];
            console.log(response.results[0]);
            response.results.forEach(location => {
                if (location.geometry != null) {
                    let coordinate = {
                        lat: location.geometry?.coordinates[1],
                        long: location.geometry?.coordinates[0],
                        displayNameGlobal: location.properties.displayNameGlobal,
                        displayName: location.properties.locationName,
                    };

                    markers.push(coordinate);
                }
            });

            let map = L
                .map('map')
                .setView([52.3727598, 4.8936041], 8);   // Amsterdam as center

            L.tileLayer(
                'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                    minZoom: 8,
                }).addTo(map);

            L.svg().addTo(map);

            let mouseover = function (d, i) {
                ReactDOM.render(<MapLegend data={i}/>, document.querySelector("div.marker.marker-info"));
            }

            let drawChart = function (d, i) {
                console.log(d); // event
                console.log(i); // data
            }

            d3.select("#map")
                .select("svg")
                .selectAll("myCircles")
                .data(markers)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return map.latLngToLayerPoint([d.lat, d.long]).x
                })
                .attr("cy", function (d) {
                    return map.latLngToLayerPoint([d.lat, d.long]).y
                })
                .attr("r", 14)
                .style("fill", "red")
                .attr("stroke", "red")
                .attr("stroke-width", 3)
                .attr("fill-opacity", .4)
                .style("pointer-events", "all")
                .on('mouseover', mouseover)
                .on('click', drawChart)


            function update() {
                d3.selectAll("circle")
                    .attr("cx", function (d) {
                        return map.latLngToLayerPoint([d.lat, d.long]).x
                    })
                    .attr("cy", function (d) {
                        return map.latLngToLayerPoint([d.lat, d.long]).y
                    })
            }


            map.on("moveend", update);


        },
        error: () => {
            ReactDOM.render(<CustomSnackbar
                    message={"Kaart kon niet worden geladen"}
                    severityStrength={"error"}/>,
                document.querySelector("div.snackbar-holder"));
        }

    })
}


drawMap();



