var React = require('react');
var ReactDOM = require('react-dom');
const ChartComponent = require('./Components/Chart.jsx');

ReactDOM.render(<ChartComponent/>, document.querySelector('section div.chart-holder'));

let dialog = document.querySelector('dialog');
let showModalButton = document.querySelector('.show-modal');
let showDialogModalButton = document.querySelector('#add-bookmark');

if (!dialog.showModal) {
    dialogPolyfill.registerDialog(dialog);
}
showModalButton.addEventListener('click', function () {
    dialog.showModal();
});
dialog.querySelector('.close').addEventListener('click', function () {
    dialog.close();
});

if (!bookmarkDialog.showModal) {
    dialogPolyfill.registerDialog(bookmarkDialog);
}
showDialogModalButton.addEventListener('click', function () {
    setValues();
    document.querySelector(".bookmark-location").innerHTML = latestDataSettings.location;
    document.querySelector(".bookmark-quantity").innerHTML = latestDataSettings.quantity;
    document.querySelector(".bookmark-aspect").innerHTML = latestDataSettings.aspectSet;
    document.querySelector(".bookmark-startTime").innerHTML = latestDataSettings.startTime;
    document.querySelector(".bookmark-endTime").innerHTML = latestDataSettings.endTime;
    document.querySelector(".bookmark-interval").innerHTML = latestDataSettings.interval;
    bookmarkDialog.showModal();
});
bookmarkDialog.querySelector('.close').addEventListener('click', function () {
    bookmarkDialog.close();
});
bookmarkDialog.querySelector('.submit').addEventListener('click', function () {
    addBookmark();
});

document.querySelector("#bookmark-name").addEventListener('input', function() {
    if (document.querySelector("#bookmark-name").value !== "") {
        bookmarkDialog.querySelector(".submit").removeAttribute('disabled');
    }
    else {
        bookmarkDialog.querySelector(".submit").setAttribute('disabled', 'true');
    }
});



