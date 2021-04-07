let locationDropdown = document.querySelector('#locations');
let quantitiesDropdown = document.querySelector('#quantities');
let intervalDropdown = document.querySelector('#timeSeries');
let startTimePicker = document.querySelector('#startTime');
let extraDropdown = document.querySelector('#extra');
let chlorosityDropdown = document.querySelector('#chlorosity');
let depthDropdown = document.querySelector('#depth');
let endTimePicker = document.querySelector('#endTime');
let aspectSet = document.querySelector('#aspect');
let drawBtn = document.querySelector('#generate');
let addSetBtn = document.querySelector('#add-dataset');
let chartHolderSection = document.querySelector('#chart-holder');
let chartPlaceholderSection = document.querySelector('section.chart-placeholder');
let bookmarkDialog = document.querySelector('dialog.bookmark-dialog');

let responseMessage = document.querySelector('.mdl-js-snackbar');
let latestResults;
let latestDataSettings;

let date = new Date();
let endDate = new Date();
let myChart;
let colorIndex = 0;
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
date.setDate(date.getDate() - 1);
endDate.setDate(endDate.getDate());

startTimePicker.value = date.toISOString().slice(0, 16);
endTimePicker.value = endDate.toISOString().slice(0, 16);

$.ajax({
    type: "GET",
    url: "/charts/locations",
    contentType: "application/json; charset=utf-8",
    error: function () {
        locationDropdown.remove(0);
        locationDropdown.append(new Option("Locaties kunnen niet worden opgehaald", ""));
        showSnackbar("ERROR: Locaties kunnen niet worden opgehaald");
    },
    success: function (e) {
        locationDropdown.remove(0);
        let placeholder = new Option("Kies locatie", "");
        placeholder.classList.add("mdl-textfield__label");
        placeholder.setAttribute("selected", "true");
        placeholder.setAttribute("disabled", "true");
        locationDropdown.append(placeholder);
        e.results.forEach(o => {
            let option = new Option(o.properties?.locationName, o.properties?.locationName);
            option.classList.add("mdl-textfield__label");
            locationDropdown.append(option);
        })
    }
});

function removeLastDataset() {
    myChart.data.datasets.pop();
    colorIndex--;
    updateAxis();
}

function updateDialog(api, source, process) {
    document.querySelector('span.api-version').innerHTML = api;
    document.querySelector('span.source').innerHTML = source;
    document.querySelector('span.process').innerHTML = process;
}

function showSnackbar(message) {
    responseMessage.MaterialSnackbar.showSnackbar(
        {
            message: message
        }
    );
}

function setValues() {
    latestDataSettings = {
        "location": locationDropdown.value,
        "quantity": quantitiesDropdown.value,
        "startTime": startTimePicker.value,
        "endTime": endTimePicker.value,
        "interval": intervalDropdown.value,
        "aspectSet": aspectSet.value,
        "token": localStorage.getItem('session-token'),
    };

    return latestDataSettings;
}

function addBookmark() {

    let data = setValues();
    data.bookmarkName = document.querySelector("#bookmark-name").value;


    $.ajax({
        type: "POST",
        url: "/bookmarks/add",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        error: function (e) {

        },
        success: function () {
            showSnackbar("Bladwijzer toegevoegd");
            bookmarkDialog.close();
        }
    });
}

function showOptions() {
    $.ajax({
        type: "GET",
        url: "/charts/locations/quantities/" + locationDropdown.value,
        contentType: "application/json; charset=utf-8",
        error: function () {
            quantitiesDropdown.parentElement.setAttribute("hidden", "true");
        },
        success: function (e) {
            quantitiesDropdown.parentElement.removeAttribute("hidden");
            startTimePicker.parentElement.removeAttribute('hidden');
            endTimePicker.parentElement.removeAttribute('hidden');
            aspectSet.parentElement.removeAttribute('hidden');

            if (quantitiesDropdown.hasChildNodes()) {
                $(quantitiesDropdown).empty();
            }

            e.results.forEach(q => {
                let option = new Option(q, q);
                option.classList.add("mdl-textfield__label");
                quantitiesDropdown.append(option);

            });

            if (quantitiesDropdown.childNodes[0].innerHTML.includes("waterlevel")) {
                intervalDropdown.parentElement.removeAttribute('hidden');
            }
        }
    });
}

function getChart() {
    let data = setValues();

    $.ajax({
        type: "POST",
        url: "/charts/result",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        error: function () {
            showSnackbar("Er is geen data beschikbaar");
        },
        success: function (e) {
            drawBtn.parentElement.setAttribute('hidden', true);
            addSetBtn.parentElement.removeAttribute('hidden');
            if (e.results[0].events.length === 0) {
                showSnackbar("Er is geen data beschikbaar");
            } else {
                let responseTime = "Response in " + Math.abs(new Date() - new Date(e.provider?.responseTimestamp)) / 1000 + "s";
                showSnackbar(responseTime);
                generateNewChart(e.provider, e.results[0]);
                localStorage.setItem('last-chart', JSON.stringify(data));
            }
        }
    });
}

function setDepthOption(option) {
    let data = [];
    let index = 0;
    switch (quantitiesDropdown.value) {
        case "waterchlorosity":
            latestResults.events.forEach(aspect => {
                aspect.aspects.forEach(x => {
                    if (x.name === chlorosityDropdown.value) {
                        x.points.forEach(item => {
                            if (option != null) {
                                if (item.coordinates[2] == option.value) {
                                    data.push({"x": aspect.timeStamp, "y": item.value, "quality": item.quality, "additionalInfo": item.additionalInfo});
                                }
                            } else {
                                if (item.coordinates[2] == depthDropdown.value) {
                                    data.push({"x": aspect.timeStamp, "y": item.value, "quality": item.quality, "additionalInfo": item.additionalInfo});
                                }
                            }
                        });
                    }
                });
            });
            switch (chlorosityDropdown.value) {
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
            removeLastDataset();
            addPreloadedData(data, index);
            break;
        default:
            latestResults.events.forEach(aspect => {
                aspect.points.forEach(point => {
                    if (point.coordinates[2] == depthDropdown.value) {
                        data.push({"x": aspect.timeStamp, "y": point.value, "quality": point.quality, "additionalInfo": point.additionalInfo});
                    }
                });
            });
            removeLastDataset();
            addPreloadedData(data)
            break;
    }

    updateAxis();
}

function setExtraOption(option) {
    let data = [];
    latestResults.events.forEach(aspect => {
        aspect.aspects.forEach(item => {
            if (item.name === option.value) {
                data.push({"x": aspect.timeStamp, "y": item.value, "quality": item.quality, "additionalInfo": item.additionalInfo});
            }
        })
    });

    removeLastDataset();
    addPreloadedData(data);
    updateAxis();
}

function getData(results) {
    console.log(results);
    latestResults = results;
    let data = []

    if (latestResults.events[0]?.value != null) {
        extraDropdown.parentElement.setAttribute('hidden', 'true');
        latestResults.events.forEach(item => {
            data.push({"x": item.timeStamp, "y": item.value, "quality": item.quality, "additionalInfo": item.additionalInfo});
        });
        return data;
    } else {
        showSnackbar("Kies een optie in de keuzemenu");
        showExtraOptions(latestResults);
    }

    updateAxis();
}

function showExtraOptions(results) {
    if (results.events[0]?.hasOwnProperty("points")) {
        if (depthDropdown.hasChildNodes()) {
            $(depthDropdown).empty();
        }
        depthDropdown.parentElement.removeAttribute('hidden');
        results.events[0].points.forEach(item => {
            let option = new Option(item.coordinates[2] + " meter", item.coordinates[2]);
            depthDropdown.append(option);
        });
    } else if (results.events[0]?.hasOwnProperty("aspects")) {
        if (results.events[0]?.aspects[0]?.hasOwnProperty("points")) {
            if (depthDropdown.hasChildNodes()) {
                $(depthDropdown).empty();
            }
            depthDropdown.parentElement.removeAttribute('hidden');
            results.events[0].aspects[0].points.forEach(item => {
                let option = new Option(item.coordinates[2] + " meter", item.coordinates[2]);
                depthDropdown.append(option);
            });
        } else {
            if (extraDropdown.hasChildNodes()) {
                $(extraDropdown).empty();
            }
            extraDropdown.parentElement.removeAttribute('hidden');
            results.events[0].aspects.forEach(item => {
                let option = new Option(item.name, item.name);
                extraDropdown.append(option);
            });
        }
    } else {
        alert("There are extra options but they are not ready, contact the administrator");
    }
}

function addPreloadedData(data, index = 0) {
    if (colorIndex < 3) {
        colorIndex++;

        let dataset = {
            label: latestResults.location.properties.displayNameGlobal
                + " - "
                + latestResults.observationType.quantityName
                + " (" + latestResults.observationType.aspectSet.aspects[index].unit + ")",
            data: data,
            yAxisID: getYaxisType(latestResults.observationType.aspectSet.aspects[index].unit),
            backgroundColor: colors.backgroundColor[colorIndex],
            pointBackgroundColor: colors.pointBackgroundColor[colorIndex],
            borderColor: colors.borderColor[colorIndex],
            borderWidth: 1
        }

        myChart.data.datasets.push(dataset);
        myChart.update();

    }
}

function checkForQuantity(event) {
    if (event.value === "waterlevel") {
        intervalDropdown.parentElement.removeAttribute('hidden');
        depthDropdown.parentElement.setAttribute('hidden', 'true');
        chlorosityDropdown.parentElement.setAttribute('hidden', 'true');
    } else {
        intervalDropdown.parentElement.setAttribute('hidden', 'true');
        depthDropdown.parentElement.setAttribute('hidden', 'true');
        chlorosityDropdown.parentElement.setAttribute('hidden', 'true');
    }
}

function getYaxisType(observationType) {
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

function updateAxis() {
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

function addNewDataset() {
    if (colorIndex < 3) {

        if (quantitiesDropdown.value === "waterchlorosity") {
            chlorosityDropdown.parentElement.removeAttribute('hidden');
        } else {
            chlorosityDropdown.parentElement.setAttribute('hidden', 'true');
        }

        let parameters = setValues();

        $.ajax({
            type: "POST",
            url: "/charts/result",
            data: JSON.stringify(parameters),
            contentType: "application/json; charset=utf-8",
            error: function () {
                showSnackbar("Er is geen data beschikbaar");
            },
            success: function (e) {
                colorIndex++;
                if (myChart) {
                    let dataset = {
                        yAxisID: getYaxisType(e.results[0].observationType.aspectSet.aspects[0].unit),
                        label: e.results[0].location?.properties?.displayNameGlobal
                            + " - " + e.results[0].observationType?.quantityName
                            + " (" + e.results[0].observationType.aspectSet.aspects[0].unit + ")",
                        data: getData(e.results[0]),
                        backgroundColor: colors.backgroundColor[colorIndex],
                        pointBackgroundColor: colors.pointBackgroundColor[colorIndex],
                        borderColor: colors.borderColor[colorIndex],
                        borderWidth: 1
                    }

                    myChart.data.datasets.push(dataset);
                    let responseTime = "Response in " + Math.abs(new Date() - new Date(e.provider?.responseTimestamp)) / 1000 + "s";
                    showSnackbar(responseTime);
                    updateAxis();
                } else {
                    generateNewChart(e.provider, e.results[0]);
                }

            }
        });
    }
}

function generateNewChart(provider, results) {
    chartHolderSection.removeAttribute('hidden');
    chartPlaceholderSection.setAttribute('hidden', 'true');

    if (quantitiesDropdown.value === "waterchlorosity") {
        chlorosityDropdown.parentElement.removeAttribute('hidden');
    }

    colorIndex = 0;
    let displayName = results.location?.properties?.displayNameGlobal
        + " - " + results.observationType?.quantityName
        + " (" + results.observationType?.aspectSet?.aspects[0]?.unit + ")";

    let labels = [];
    results.events.forEach(x => {
        let date = new Date(x.timeStamp);
        labels.push(date.toUTCString());
    });

    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                yAxisID: getYaxisType(results.observationType?.aspectSet?.aspects[0]?.unit),
                label: displayName,
                data: getData(results),
                backgroundColor: colors.backgroundColor[colorIndex],
                pointBackgroundColor: colors.pointBackgroundColor[colorIndex],
                borderColor: colors.borderColor[colorIndex],
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
                        stepSize: intervalDropdown.value === '10min' ? 10 : 1,
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
    updateDialog(provider.apiVersion, results.source.institution.name, results.source.process);
}
