import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/TypoGraphy";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';
import ReactDOM from 'react-dom';
import jws from 'jws';
import ChartComponent from './Components/Chart.jsx';
import CustomSnackbar from './Components/CustomSnackbar.jsx';
import SunburstZoomable from "./Components/SunburstZoomable.jsx";
import Chart from 'chart.js';

let colors = {
    backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(21, 84, 255, 0.2)',
        'rgba(153, 0, 255, 0.2)',
        'rgba(0, 90, 0, 0.2)',
    ],
    pointBackgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(21, 84, 255, 0.5)',
        'rgba(153, 0, 255, 0.5)',
        'rgba(0, 90, 0, 0.5)',
    ],
    borderColor: [
        'rgb(255,99,132)',
        'rgb(21,84,255)',
        'rgb(153,0,255)',
        'rgb(0,90,0)',
    ],

}

let myChart;
let latestDataSettings = {};
let graphs = [];
let latestResults;

export function updateAxis() {
    if (myChart) {
        let firstSet = false;

        myChart.options.scales.yAxes.forEach(scale => {
            scale.display = false;
        });

        myChart.data.datasets.forEach(set => {
            switch (set.yAxisID) {
                case "level":
                    myChart.options.scales.yAxes[0].display = true;
                    break;
                case "sqcms":
                    myChart.options.scales.yAxes[1].display = true;
                    break;
                case "speed":
                    myChart.options.scales.yAxes[2].display = true;
                    break;
                case "temperature":
                    myChart.options.scales.yAxes[3].display = true;
                    break;
                case "pressure":
                    myChart.options.scales.yAxes[4].display = true;
                    break;
                case "angle":
                    myChart.options.scales.yAxes[5].display = true;
                    break;
                case "m3s":
                    myChart.options.scales.yAxes[6].display = true;
                    break;
                case "mgl":
                    myChart.options.scales.yAxes[7].display = true;
                    break;
                case "gkg":
                    myChart.options.scales.yAxes[8].display = true;
                    break;
                case "kgm3":
                    myChart.options.scales.yAxes[9].display = true;
                    break;
                case "siemens":
                    myChart.options.scales.yAxes[10].display = true;
                    break;
            }
        });

        myChart.options.scales.yAxes.forEach(scale => {
            if (scale.display && !firstSet) {
                firstSet = true;
                scale.position = 'left';
            } else {
                if (scale.display && firstSet) {
                    scale.position = 'right';
                }
            }
        });

        myChart.update();
    }
}

export function getYaxisType(observationType) {
    switch (observationType) {
        case "cm":
            return 'level'
        case "cm^2s":
            return 'sqcms'
        case "m/s":
            return "speed"
        case "Cel":
            return "temperature"
        case "hPa":
            return "pressure"
        case "angle_degree":
            return "angle"
        case "m^3/s":
            return "m3s"
        case "mg/l":
            return "mgl"
        case "g/kg":
            return "gkg"
        case "kg/m^3":
            return "kgm3"
        case "S/m":
            return "siemens"
    }
}

function encodeChart() {

    jws.createSign({
        header: {alg: 'HS256'},
        payload: {
            "token": graphs
        },
        secret: "_kW6zt0tgHJKmOVxcJRAGLo7A3c5BewP8v5drKA2JBU",
    }).on('done', function (signature) {
        let payload = signature.split(".")[1];

        const handleClick = () => {
            let item = document.querySelector("#share-link-field");
            item.select();
            document.execCommand("copy");
        }

        const handleClose = () => {
            ReactDOM.unmountComponentAtNode(document.querySelector("div.dialog-holder"));
        }

        let dialog =
            <Dialog open={true} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <span>Deel Grafiek</span>
                    <IconButton onClick={handleClose.bind(this)} style={{right: 8, top: 8, position: "absolute"}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Kopieer de onderstaande token om het te delen.
                        Laat de andere gebruiker de grafiek inladen door op het laad knop te klikken op de grafieken
                        pagina.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="share-link-field"
                        label="Token"
                        type="text"
                        fullWidth
                        defaultValue={payload}
                        inputProps={{readOnly: true}}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClick.bind(this)} color="primary">
                        Kopieer
                    </Button>
                </DialogActions>
            </Dialog>

        ReactDOM.render(dialog, document.querySelector("div.dialog-holder"));
    });
}

export default class ChartMenu extends React.Component {
    constructor(props) {
        super(props)
        {
            let date = new Date();
            date.setDate(date.getDate() - 1);

            this.state = {
                colorIndex: 0,
                aspectSet: "standard",
                location: "",
                quantity: "",
                quantities: [""],
                interval: "10min",
                chlorosity: "",
                startTime: date.toISOString().slice(0, 16),
                endTime: new Date().toISOString().slice(0, 16),
                extraOption: false,
                depthOption: false,
                options: [""],
                option: "",
                type: "measurement",
                graphs: [],
                bookmarks: [],
                bookmark: ""
            }

            this.setLocation = this.setLocation.bind(this);
            this.setQuantity = this.setQuantity.bind(this);
            this.setDataType = this.setDataType.bind(this);
            this.setAspectSet = this.setAspectSet.bind(this);
            this.setInterval = this.setInterval.bind(this);
            this.setChlorosity = this.setChlorosity.bind(this);
            this.setStartTime = this.setStartTime.bind(this);
            this.setEndTime = this.setEndTime.bind(this);
            this.setValues = this.setValues.bind(this);
            this.setOption = this.setOption.bind(this);
            this.addNewDataset = this.addNewDataset.bind(this);
            this.getResultsData = this.getResultsData.bind(this);
            this.generateNewChart = this.generateNewChart.bind(this);
            this.showExtraOptions = this.showExtraOptions.bind(this);
            this.setDepthOption = this.setDepthOption.bind(this);
            this.addPreloadedData = this.addPreloadedData.bind(this);
            this.removeDataset = this.removeDataset.bind(this);
            this.openChartWithToken = this.openChartWithToken.bind(this);
            this.showDatasetInfo = this.showDatasetInfo.bind(this);
            this.openBookmarkDialog = this.openBookmarkDialog.bind(this);
            this.saveBookmark = this.saveBookmark.bind(this);
            this.closeDialog = this.closeDialog.bind(this);
            this.selectBookmark = this.selectBookmark.bind(this);
            this.clearDatasets = this.clearDatasets.bind(this);
            this.loadBookmarks = this.loadBookmarks.bind(this);
            this.openSunburstDialog = this.openSunburstDialog.bind(this);
        }
    }

    setValues(bookmark = null) {
        latestDataSettings = {
            "location": bookmark != null ? bookmark.location : this.state.location,
            "quantity": bookmark != null ? bookmark.quantity : this.state.quantity,
            "startTime": this.state.startTime,
            "endTime": this.state.endTime,
            "interval": bookmark != null ? bookmark.interval : this.state.interval,
            "aspectSet": bookmark != null ? bookmark.aspectSet : this.state.aspectSet,
            "type": this.state.type,
            "token": localStorage.getItem('session-token'),
        };

        graphs.push(latestDataSettings);
        this.setState({graphs: graphs});

        return latestDataSettings;
    }

    setLocation(e) {
        if (e !== null && e !== "") {
            this.setState({location: e});
            $.ajax({
                type: "GET",
                url: "/charts/locations/quantities/" + e,
                success: (response) => {
                    let quantities = [];

                    response.results.forEach(x => {
                        quantities.push(x);
                    });

                    this.setState({quantities: quantities});

                },
                error: () => {
                    ReactDOM.render(<CustomSnackbar
                            message="Er zijn geen kwantiteiten beschikbaar of konden niet worden opgehaald"
                            severityStrength="error"/>,
                        document.querySelector("div.snackbar-holder"));
                },
            });
        }
    }

    setQuantity(e) {
        this.setState({quantity: e});
    }

    setDataType(e) {
        this.setState({type: e});
    }

    setAspectSet(e) {
        this.setState({aspectSet: e})
    }

    setInterval(e) {
        this.setState({interval: e})
    }

    setChlorosity(e) {
        this.setState({chlorosity: e});
    }

    setStartTime(e) {
        this.setState({startTime: e})
    }

    setEndTime(e) {
        this.setState({endTime: e})
    }

    setOption(e) {
        this.setState({option: e});
    }

    generateNewChart(provider, results) {
        document.querySelector('#chart-holder').removeAttribute('hidden');
        document.querySelector('section.chart-placeholder').setAttribute('hidden', 'true');

        let displayName = results.location?.properties?.displayNameGlobal
            + " - " + results.observationType?.quantityName
            + " (" + results.observationType?.aspectSet?.aspects[0]?.unit + ")";

        let labels = [];
        results.events.forEach(x => {
            let date = new Date(x.timeStamp);
            labels.push(date.toUTCString());
        });

        let ctx = document.getElementById("myChart").getContext("2d");
        myChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    yAxisID: getYaxisType(results.observationType?.aspectSet?.aspects[0]?.unit),
                    label: displayName,
                    data: this.getResultsData(results),
                    backgroundColor: colors.backgroundColor[this.state.colorIndex],
                    pointBackgroundColor: colors.pointBackgroundColor[this.state.colorIndex],
                    borderColor: colors.borderColor[this.state.colorIndex],
                    borderWidth: 1
                }]
            },
            options: {
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    position: 'nearest',
                    callbacks: {
                        label: function (x, y) {
                            // DEBUGGING
                            // console.log(x, y);
                            return "Y-Waarde: " + y.datasets[x.datasetIndex].data[x.index].y
                                + " - Kwaliteit: " + y.datasets[x.datasetIndex].data[x.index].quality
                                + " - Informatie: " + y.datasets[x.datasetIndex].data[x.index].additionalInfo;

                        }
                    }
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                responsiveAnimationDuration: 150,
                onResize: function (chart, newSize) {
                    myChart.update();
                },
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'bottom',
                },
                scales: {
                    yAxes: [{
                        stacked: false,
                        display: false,
                        id: 'level',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "cm"
                        }
                    }, {
                        stacked: false,
                        display: false,
                        id: 'sqcms',
                        position: 'left',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "cm^2 per seconde"
                        }
                    }, {
                        stacked: false,
                        display: false,
                        id: 'speed',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "m/s"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'temperature',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Celcius"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'pressure',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "hPa"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'angle',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Hoek in Graden"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'm3s',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Kubieke meters per seconde"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'mgl',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "milligram per liter"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'gkg',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "gram per kilogram"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'kgm3',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "kilogram per Kubieke meter"
                        },
                    }, {
                        stacked: false,
                        display: false,
                        id: 'siemens',
                        position: 'right',
                        ticks: {
                            beginAtZero: true,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Siemens per meter"
                        },
                    }],
                    xAxes: [{
                        stacked: false,
                        type: 'time',
                        distribution: 'linear',
                        time: {
                            tooltipFormat: "DD MMM YYYY HH:mm",
                            stepSize: this.state.interval === '10min' ? 10 : 1,
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

        updateAxis();
    }

    addNewDataset(dataset = null) {
        if (this.state.colorIndex < 3) {
            if (this.state.quantity === "waterchlorosity" && this.state.chlorosity === "") {
                ReactDOM.render(<CustomSnackbar
                        message={"Kies eerst de Chlorosity"}
                        severityStrength={"warning"}/>,
                    document.querySelector("div.snackbar-holder"));
                return;
            }

            let parameters = this.setValues(dataset ? dataset : null);

            $.ajax({
                type: "POST",
                url: "/charts/result",
                data: dataset != null ? JSON.stringify(dataset) : JSON.stringify(parameters),
                contentType: "application/json; charset=utf-8",
                error: () => {
                    graphs.pop();
                    this.setState({graphs: graphs});
                    ReactDOM.render(<CustomSnackbar
                            message={"Er is geen data beschikbaar"}
                            severityStrength={"error"}/>,
                        document.querySelector("div.snackbar-holder"));
                },
                success: (e) => {
                    if (myChart) {
                        if (myChart.data.datasets.length > 0) {
                            this.setState({colorIndex: this.state.colorIndex + 1});
                        }
                        let dataset = {
                            yAxisID: getYaxisType(e.results[0].observationType.aspectSet.aspects[0].unit),
                            label: e.results[0].location?.properties?.displayNameGlobal
                                + " - " + e.results[0].observationType?.quantityName
                                + " (" + e.results[0].observationType.aspectSet.aspects[0].unit + ")",
                            data: this.getResultsData(e.results[0]),
                            backgroundColor: colors.backgroundColor[this.state.colorIndex],
                            pointBackgroundColor: colors.pointBackgroundColor[this.state.colorIndex],
                            borderColor: colors.borderColor[this.state.colorIndex],
                            borderWidth: 1
                        }
                        myChart.data.datasets.push(dataset);
                        let responseTime = "Response in " + Math.abs(new Date().getTime() - new Date(e.provider?.responseTimestamp).getTime()) / 1000 + "s";
                        ReactDOM.render(<CustomSnackbar
                                message={responseTime}
                                severityStrength={"success"}/>,
                            document.querySelector("div.snackbar-holder"));
                        updateAxis();
                    } else {
                        this.generateNewChart(e.provider, e.results[0]);
                    }
                }
            });
        }
    }

    getResultsData(results) {
        latestResults = results;
        let data = []

        if (latestResults.events[0]?.value != null) {
            this.setState({option: false, extraOption: false, depthOption: false});
            latestResults.events.forEach(item => {
                data.push({
                    "x": item.timeStamp,
                    "y": item.value,
                    "quality": item.quality,
                    "additionalInfo": item.additionalInfo
                });
            });
            return data;

        } else if (this.state.quantity === "waterchlorosity") {
            this.setState({option: false, extraOption: false, depthOption: false});
            latestResults.events.forEach(event => {
                event.aspects.forEach(aspect => {
                    if (aspect.name === this.state.chlorosity) {
                        data.push(aspect);
                    }
                });
            });
            this.showExtraOptions(data);
        } else {
            ReactDOM.render(<CustomSnackbar
                    message={"Kies een optie uit het keuzemenu"}
                    severityStrength={"info"}/>,
                document.querySelector("div.snackbar-holder"));
            this.showExtraOptions(latestResults);
        }

        updateAxis();
    }

    showExtraOptions(results) {
        if (results[0] != null) {
            if (results[0].hasOwnProperty("points")) {
                let optionsList = [];
                results[0].points.forEach(point => {
                    optionsList.push({name: point.coordinates[2] + " meter", value: point.coordinates[2]});
                });

                this.setState({extraOption: false, depthOption: true, options: optionsList});
            }
        } else {
            if (results.events[0]?.hasOwnProperty("points")) {
                if (results.events[0]?.points[0]?.hasOwnProperty("coordinates")) {
                    let optionsList = [];
                    results.events[0].points.forEach(point => {
                        optionsList.push({name: point.coordinates[2] + " meter", value: point.coordinates[2]});
                    });

                    if (optionsList.every((item) => item.name === optionsList[0].name)) {
                        optionsList = [];
                        for (let i = 0; i < results.events[0].points.length; i++) {
                            optionsList.push({
                                name: "Sensor " + i + " - [" + results.events[0].points[i].coordinates[0] + ", " + results.events[0].points[i].coordinates[1] + "]",
                                value: "Sensor " + i + " - [" + results.events[0].points[i].coordinates[0] + ", " + results.events[0].points[i].coordinates[1] + "]"
                            });
                        }
                    }

                    this.setState({extraOption: false, depthOption: true, options: optionsList});
                } else {
                    this.setState({extraOption: true, depthOption: false, options: results.events[0].points});
                }
            } else if (results.events[0]?.hasOwnProperty("aspects")) {
                if (results.events[0]?.aspects[0]?.hasOwnProperty("points")) {
                    this.setState({
                        extraOption: true,
                        depthOption: false,
                        options: results.events[0].aspects[0].points
                    });
                } else {
                    this.setState({extraOption: true, depthOption: false, options: results.events[0].aspects});
                }
            } else {
                this.setState({extraOption: false, depthOption: false});
                alert("There are extra options but they are not ready, contact the administrator");
            }
        }
    }

    setDepthOption(option) {
        let data = [];
        let index = 0;
        this.setState({option: option.toString()})

        if (option.toString().includes("Sensor")) {
            let coordinates = option.toString().split('[')[1].split(']')[0];
            let lat = Number(coordinates.split(',')[0].replace(/[^0-9\.]+/g, ""));
            let long = Number(coordinates.split(',')[1].replace(/[^0-9\.]+/g, ""));
            latestResults.events.forEach(event => {
                event.points.forEach(point => {
                    if (point.coordinates[0] === lat && point.coordinates[1] === long) {
                        data.push({
                            "x": event.timeStamp,
                            "y": point.value,
                            "quality": point.quality,
                            "additionalInfo": point.additionalInfo,
                        });
                    }
                });
            });
            myChart.data.datasets.pop();
            this.addPreloadedData(data);
            return;
        }

        switch (this.state.quantity) {
            case "waterchlorosity":
                latestResults.events.forEach(aspect => {
                    aspect.aspects.forEach(x => {
                        if (x.name == this.state.chlorosity) {
                            x.points.forEach(item => {
                                if (item.coordinates[2] == option) {
                                    data.push({
                                        "x": aspect.timeStamp,
                                        "y": item.value,
                                        "quality": item.quality,
                                        "additionalInfo": item.additionalInfo
                                    });
                                }
                            });
                        }
                    });
                });
                switch (this.state.chlorosity) {
                    case "Average":
                        index = 0;
                        break;
                    case "AverageSalinity":
                        index = 1;
                        break;
                    case "AverageSpecificWeight":
                        index = 2;
                        break;
                }
                if (myChart.data.datasets.length > 0) {
                    myChart.data.datasets.pop();
                }
                this.addPreloadedData(data, index);
                break;
            default:
                latestResults.events.forEach(aspect => {
                    aspect.points.forEach(point => {
                        if (point.coordinates[2] == this.state.option) {
                            data.push({
                                "x": aspect.timeStamp,
                                "y": point.value,
                                "quality": point.quality,
                                "additionalInfo": point.additionalInfo
                            });
                        }
                    });
                });
                myChart.data.datasets.pop();
                this.addPreloadedData(data);
                break;
        }

        updateAxis();
    }

    setExtraOption(option) {
        this.setOption(option);
        let data = [];
        latestResults.events.forEach(aspect => {
            aspect.aspects.forEach(item => {
                if (item.name === option) {
                    data.push({
                        "x": aspect.timeStamp,
                        "y": item.value,
                        "quality": item.quality,
                        "additionalInfo": item.additionalInfo
                    });
                }
            })
        });

        myChart.data.datasets.pop();
        this.addPreloadedData(data);
        updateAxis();
    }

    addPreloadedData(data, index = 0) {
        if (this.state.colorIndex < 4) {

            let dataset = {
                label: latestResults.location.properties.displayNameGlobal
                    + " - " + latestResults.observationType.quantityName
                    + " (" + latestResults.observationType.aspectSet.aspects[index].unit + ")",
                data: data,
                yAxisID: getYaxisType(latestResults.observationType.aspectSet.aspects[index].unit),
                backgroundColor: colors.backgroundColor[this.state.colorIndex],
                pointBackgroundColor: colors.pointBackgroundColor[this.state.colorIndex],
                borderColor: colors.borderColor[this.state.colorIndex],
                borderWidth: 1
            }

            myChart.data.datasets.push(dataset);
            myChart.update();
        }
    }

    removeDataset(index) {
        myChart.data.datasets.splice(index, 1);
        graphs.splice(index, 1);
        this.setState({colorIndex: this.state.colorIndex - 1});

        for (let i = 0; i < myChart.data.datasets.length; i++) {
            myChart.data.datasets[i].backgroundColor = colors.backgroundColor[i];
            myChart.data.datasets[i].borderColor = colors.borderColor[i];
            myChart.data.datasets[i].pointBackgroundColor = colors.pointBackgroundColor[i];
        }

        updateAxis();
    }

    clearDatasets() {
        graphs = [];
        this.setState({colorIndex: 0, graphs: graphs}, () => {
            if (myChart) {
                myChart.data.datasets = [];
            }

            updateAxis();
        });
    }

    openChartWithToken() {

        const handleClick = () => {
            let token = document.getElementById("token-field").value;


            if (token === "") {
                ReactDOM.render(<CustomSnackbar message={"Geen token ingevuld"}
                                                severityStrength="warning"/>,
                    document.querySelector("div.snackbar-holder"));
            } else {
                $.ajax({
                    type: "GET",
                    url: "/charts/load/" + token,
                    contentType: "application/json; charset=utf-8",
                    error: (e) => {
                        ReactDOM.render(<CustomSnackbar message={"Er is iets mis gegaan, STATUS: " + e.status}
                                                        severityStrength="error"/>,
                            document.querySelector("div.snackbar-holder"));
                    },
                    success: (e) => {
                        ReactDOM.unmountComponentAtNode(document.querySelector("div.dialog-holder"));
                        for (let i = 0; i < Object.keys(e).length; i++) {
                            this.setState({location: e[i].location, quantity: e[i].quantity, type: e[i].type});
                            this.addNewDataset(e[i]);
                        }
                        this.setState({graphs: graphs});
                    }
                });
            }
        }

        const handleClose = () => {
            ReactDOM.unmountComponentAtNode(document.querySelector("div.dialog-holder"));
        }

        let dialog =
            <Dialog open={true}>
                <DialogTitle onClose={handleClose.bind(this)} id="form-dialog-title">
                    <span>Grafiek inladen</span>
                    <IconButton onClick={handleClose.bind(this)} style={{right: 8, top: 8, position: "absolute"}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Plak hier de token om de grafiek in te laden.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="token-field"
                        label="Token"
                        type="text"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClick.bind(this)} color="primary">
                        Laad Grafiek
                    </Button>
                </DialogActions>
            </Dialog>

        ReactDOM.render(dialog, document.querySelector("div.dialog-holder"));
    }

    showDatasetInfo(event) {
        const handleClose = () => {
            ReactDOM.unmountComponentAtNode(document.querySelector("div.dialog-holder"));
        }

        let dialog =
            <>
                <div>
                    <Dialog
                        open={true}
                        onClose={handleClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle>{"Parameters"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText>{"Locatie: " + event.location}</DialogContentText>
                            <DialogContentText>{"Kwantiteit: " + event.quantity}</DialogContentText>
                            <DialogContentText>{"Type Meting: " + event.type}</DialogContentText>
                            <DialogContentText>{"Interval: " + event.interval}</DialogContentText>
                            <DialogContentText>{"Start Tijd: " + new Date(event.startTime).toUTCString()}</DialogContentText>
                            <DialogContentText>{"Eind Tijd: " + new Date(event.endTime).toUTCString()}</DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary" autoFocus>{"Sluit"}</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </>


        ReactDOM.render(dialog, document.querySelector("div.dialog-holder"));

    }

    closeDialog() {
        ReactDOM.unmountComponentAtNode(document.querySelector("div.dialog-holder"));
    }

    saveBookmark() {
        graphs[0].bookmarkName = document.querySelector("#save-bookmark-field").value;
        this.setState({graphs: graphs}, () => {
            if (this.state.graphs.bookmarkName !== "" && this.state.graphs.bookmarkName !== null) {
                $.ajax({
                    type: 'POST',
                    url: '/bookmarks/add',
                    data: JSON.stringify(this.state.graphs),
                    contentType: 'application/json; charset=utf-8',
                    success: () => {
                        ReactDOM.render(<CustomSnackbar
                                message={"Bladwijzer opgeslagen"}
                                severityStrength={"success"}/>,
                            document.querySelector("div.snackbar-holder"));
                        this.loadBookmarks();
                        this.closeDialog();
                    },
                    error: () => {
                        ReactDOM.render(<CustomSnackbar
                                message={"De bladwijzer kon niet worden opgeslagen."}
                                severityStrength={"error"}/>,
                            document.querySelector("div.snackbar-holder"));
                    }

                });
            } else {
                ReactDOM.render(<CustomSnackbar
                        message={"Geef een titel voor de bladwijzer"}
                        severityStrength={"warning"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        });
    }

    openBookmarkDialog() {

        let dialog =
            <Dialog open={true} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <span>{"Bladwijzer Opslaan"}</span>
                    <IconButton onClick={this.closeDialog} style={{right: 8, top: 8, position: "absolute"}}>
                        <CloseIcon/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {"Geef een naam aan de bladwijzer"}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="save-bookmark-field"
                        label="Bladwijzer naam"
                        type="text"
                        fullWidth
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.saveBookmark} color="primary">
                        {"Opslaan"}
                    </Button>
                </DialogActions>
            </Dialog>;

        ReactDOM.render(dialog, document.querySelector("div.dialog-holder"));
    }

    loadBookmarks() {
        $.ajax({
            type: 'GET',
            url: 'bookmarks/' + localStorage.getItem('session-token'),
            success: (e) => {
                let bookmarks = [];
                e.forEach(item => {
                    bookmarks.push(item[0][1].name)
                })
                this.setState({bookmarks: bookmarks});
            },
            error: () => {
                ReactDOM.render(<CustomSnackbar message={"Bladwijzers konden niet worden geladen"}
                                                severityStrength={"error"}/>,
                    document.querySelector("div.snackbar-holder"));
            }
        });
    }

    selectBookmark(e) {
        this.setState({bookmark: e}, () => {
            this.clearDatasets();
            $.ajax({
                type: 'GET',
                url: '/bookmarks/' + localStorage.getItem("session-token") + "/" + e,
                success: (bookmarkGroup) => {
                    bookmarkGroup.forEach(bookmark => {
                        bookmark.forEach(dataset => {
                            this.addNewDataset(dataset[0]);
                        });
                    });
                }
            });
        });
    }

    openSunburstDialog() {
        let dialog = <>
            <Dialog open={true} onClose={this.closeDialog}>
                <DialogTitle>{"Sunburst Diagram"}</DialogTitle>
                <DialogContent>
                    <SunburstZoomable/>
                </DialogContent>
            </Dialog>
        </>;

        ReactDOM.render(dialog, document.querySelector("div.dialog-holder"));
    }

    render() {
        return <>
            <FormControl className={"formControl"} variant={"outlined"}>
                <Autocomplete
                    id="bookmarks-select"
                    options={this.state.bookmarks}
                    getOptionLabel={(option) => option}
                    renderOption={(option) => (
                        <React.Fragment key={option}>
                            <Typography variant={"subtitle1"}>{option}</Typography>
                        </React.Fragment>
                    )}
                    noOptionsText={"Geen bladwijzers gevonden"}
                    loadingText={"Bladwijzers laden..."}
                    onChange={(e, value) => this.selectBookmark(value)}
                    value={this.state.bookmark}
                    renderInput={(params) =>
                        <TextField {...params}
                                   label="Bladwijzer"
                                   variant="outlined"
                                   InputProps={{
                                       ...params.InputProps,
                                       style: {
                                           color: "white"
                                       }
                                   }}
                                   InputLabelProps={{
                                       style: {
                                           color: "white"
                                       }
                                   }}
                        />}
                />
            </FormControl>

            <FormControl className={"formControl"} variant={"outlined"}>
                <Autocomplete
                    id="location-select"
                    options={this.props.locations}
                    getOptionLabel={(option) => option}
                    renderOption={(option) => (
                        <React.Fragment key={option}>
                            <Typography variant={"subtitle1"}>{option}</Typography>
                        </React.Fragment>
                    )}
                    noOptionsText={"Geen locatie gevonden"}
                    loadingText={"Locaties laden..."}
                    onChange={(e, value) => this.setLocation(value)}
                    value={this.state.location}
                    renderInput={(params) =>
                        <TextField {...params}
                                   label="Locatie"
                                   variant="outlined"
                                   InputProps={{
                                       ...params.InputProps,
                                       style: {
                                           color: "white"
                                       }
                                   }}
                                   InputLabelProps={{
                                       style: {
                                           color: "white"
                                       }
                                   }}
                        />}
                />
            </FormControl>

            <FormControl hidden={this.state.quantities[0] === ""} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"quantity-select-label"} className={"label-white"}>Kwantiteit</InputLabel>
                <Select className={"label-white"}
                        id={"quantity-select"}
                        labelId={"quantity-select-label"}
                        value={this.state.quantity}
                        label={"Kwantiteit"}
                        onChange={(e) => this.setQuantity(e.target.value)}
                >
                    {this.state.quantities.map(quantity => (
                        <MenuItem key={quantity} value={quantity}>{quantity}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl hidden={this.state.quantities[0] === ""} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"type-select-label"} className={"label-white"}>Type Data</InputLabel>
                <Select className={"label-white"}
                        id={"type-select"}
                        labelId={"type-select-label"}
                        value={this.state.type}
                        label={"Type Data"}
                        onChange={(e) => this.setDataType(e.target.value)}
                >
                    <MenuItem selected key={"measurement"} value={"measurement"}>{"Measurement"}</MenuItem>
                    <MenuItem key={"astronomical"} value={"astronomical"}>{"Astronomical"}</MenuItem>
                    <MenuItem key={"forecast"} value={"forecast"}>{"Forecast"}</MenuItem>
                </Select>
            </FormControl>

            <FormControl hidden={this.state.quantities[0] === ""} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"aspect-select-label"} className={"label-white"}>Aspect Set</InputLabel>
                <Select className={"label-white"}
                        id={"aspect-select"}
                        labelId={"aspect-select-label"}
                        value={this.state.aspectSet}
                        label={"Aspect Set"}
                        onChange={(e) => this.setAspectSet(e.target.value)}
                >
                    <MenuItem key={"minimum"} value={"minimum"}>{"Minimum"}</MenuItem>
                    <MenuItem selected key={"standard"} value={"standard"}>{"Standaard"}</MenuItem>
                    <MenuItem key={"maximum"} value={"maximum"}>{"Maximum"}</MenuItem>
                </Select>
            </FormControl>

            <TextField
                className={"label-white"}
                hidden={this.state.quantities[0] === ""}
                style={{
                    backgroundColor: 'rgba(14, 121, 191, 0.4)',
                    marginTop: 10,
                    width: '95%',
                    borderStyle: 'none',
                    borderRadius: 5
                }}
                variant={"outlined"}
                id="start-time"
                label="Start Tijd"
                type="datetime-local"
                defaultValue={this.state.startTime}
                InputLabelProps={{
                    shrink: true,
                    style: {color: '#F2F2F2', backgroundColor: 'rgba(0,0,0,0)'}
                }}
                InputProps={{
                    className: "label-white"
                }}
            />

            <TextField
                className={"label-white"}
                hidden={this.state.quantities[0] === ""}
                style={{
                    backgroundColor: 'rgba(14, 121, 191, 0.4)',
                    marginTop: 10,
                    width: '95%',
                    borderStyle: 'none',
                    borderRadius: 5
                }}
                variant={"outlined"}
                id="end-time"
                label="Eind Tijd"
                type="datetime-local"
                defaultValue={this.state.endTime}
                InputLabelProps={{
                    shrink: true,
                    style: {color: '#F2F2F2', backgroundColor: 'rgba(0,0,0,0)'}
                }}
                InputProps={{
                    className: "label-white"
                }}
            />

            <FormControl hidden={this.state.quantity !== "waterlevel"} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"interval-select-label"} className={"label-white"}>Interval</InputLabel>
                <Select className={"label-white"}
                        id={"interval-select"}
                        labelId={"interval-select-label"}
                        value={this.state.interval}
                        label={"Interval"}
                        onChange={(e) => this.setInterval(e.target.value)}
                >
                    <MenuItem key={"1min"} value={"1min"}>{"1 Minuut"}</MenuItem>
                    <MenuItem selected key={"10min"} value={"10min"}>{"10 Minuten"}</MenuItem>
                </Select>
            </FormControl>

            <FormControl hidden={this.state.quantity !== "waterchlorosity"} className={"formControl"}
                         variant={"outlined"}>
                <InputLabel id={"chlorosity-select-label"} className={"label-white"}>Chlorosity</InputLabel>
                <Select className={"label-white"}
                        id={"chlorosity-select"}
                        labelId={"chlorosity-select-label"}
                        value={this.state.chlorosity}
                        label={"Chlorisity"}
                        onChange={(e) => this.setChlorosity(e.target.value)}
                >
                    <MenuItem selected key={"Average"} value={"Average"}>{"Average"}</MenuItem>
                    <MenuItem key={"AverageSalinity"} value={"AverageSalinity"}>{"AverageSalinity"}</MenuItem>
                    <MenuItem key={"AverageSpecificWeight"}
                              value={"AverageSpecificWeight"}>{"AverageSpecificWeight"}</MenuItem>
                </Select>
            </FormControl>

            <FormControl hidden={!this.state.extraOption} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"extra-option-select-label"} className={"label-white"}>Opties</InputLabel>
                <Select className={"label-white"}
                        id={"extra-option-select"}
                        labelId={"extra-option-select-label"}
                        value={this.state.option}
                        label={"Opties"}
                        onChange={(e) => this.setExtraOption(e.target.value)}
                >
                    {this.state.options.map(option => (
                        <MenuItem key={option.name} value={option.name}>{option.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl hidden={!this.state.depthOption} className={"formControl"} variant={"outlined"}>
                <InputLabel id={"depth-option-select-label"} className={"label-white"}>Diepte</InputLabel>
                <Select className={"label-white"}
                        id={"depth-option-select"}
                        labelId={"depth-option-select-label"}
                        value={this.state.option}
                        label={"Diepte"}
                        onChange={(e) => this.setDepthOption(e.target.value)}
                >
                    {this.state.options.map(option => (
                        <MenuItem key={option.name} value={option.value}>{option.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>

            {this.state.graphs.length > 0
                ?
                <div style={{display: "flex", justifyContent: "center", margin: 10}}>
                    <ButtonGroup orientaion={"vertical"}>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => this.addNewDataset()}>
                            {"Toevoegen"}
                        </Button>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => encodeChart()}>
                            {"Delen"}
                        </Button>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => this.openBookmarkDialog()}>
                            {"Bladwijzer Opslaan"}
                        </Button>
                    </ButtonGroup>
                </div>
                :
                <div style={{display: "flex", justifyContent: "center", margin: 10}}>
                    <ButtonGroup orientation={"vertical"}>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => this.addNewDataset()}>
                            {"Teken"}
                        </Button>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => this.openChartWithToken()}>
                            {"Open"}
                        </Button>
                        <Button color={"primary"} variant={"contained"}
                                onClick={() => this.openSunburstDialog()}>
                            {"Sunburst"}
                        </Button>
                    </ButtonGroup>
                </div>
            }

            <div hidden={this.state.graphs.length === 0}>
                {this.state.graphs.map(item => (
                    <Chip
                        icon={<InfoIcon style={{color: 'rgba(0, 0, 0, 0.25)'}}/>}
                        label={
                            <Typography variant={"subtitle1"} style={{whiteSpace: 'normal'}}>
                                {item.location + " - " + item.quantity + " (" + item.type + ")"}
                            </Typography>
                        }
                        clickable
                        onClick={() => this.showDatasetInfo(item)}
                        onDelete={() => this.removeDataset(this.state.graphs.indexOf(item))}
                        style={{
                            margin: 10,
                            backgroundColor: colors.borderColor[this.state.graphs.indexOf(item)],
                            height: '100%'
                        }}
                    />
                ))}
            </div>
        </>;
    }

    componentDidMount() {
        this.loadBookmarks();

        if (localStorage.getItem('location') && localStorage.getItem('quantity')) {
            this.setState({
                location: localStorage.getItem('location'),
                quantity: localStorage.getItem('quantity')
            }, () => {
                this.setLocation(localStorage.getItem('location'));
                this.addNewDataset();
                localStorage.removeItem('location');
                localStorage.removeItem('quantity');
            });
        } else if (localStorage.getItem('bookmark')) {
            let bookmarkGroup = JSON.parse(localStorage.getItem('bookmark'));
            bookmarkGroup.bookmarks.forEach(bookmark => {
                this.setState({
                    location: bookmark.location,
                    quantity: bookmark.quantity
                }, () => {
                    this.addNewDataset(bookmark);
                });
            });

            localStorage.removeItem('bookmark');
        }
    }

}

$.ajax({
    type: "GET",
    url: "/charts/locations",
    success: (e) => {
        let locations = [];
        e.results.forEach(x => {
            locations.push(x.properties.locationName);
        });

        ReactDOM.render(<ChartMenu locations={locations}/>, document.querySelector('div.chart-menu'));

    },
    error: () => {
        ReactDOM.render(<CustomSnackbar message={"Locaties konden niet worden opgehaald"}
                                        severityStrength={"error"}/>,
            document.querySelector("div.snackbar-holder"));
    }

});


ReactDOM.render(<ChartComponent/>, document.querySelector('section div.chart-holder'));
ReactDOM.render(<div style={{display: "flex", justifyContent: "center", margin: 10}}>
    <CircularProgress style={{color: '#F9E11E'}}/>
</div>, document.querySelector('section div.chart-menu'));
