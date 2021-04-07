var React = require('react');
var ReactDOM = require('react-dom');

const NavigationMenu = require('./Components/NavigationMenu.jsx');

ReactDOM.render(<NavigationMenu/>, document.querySelector('#container'));

const menuBtn = document.querySelector('.burger');
const menu = document.querySelector('.menu');
const menuItems = document.querySelectorAll('.menu ul li a p');
const headerTitle = document.querySelector('#title');

let menuOpen = false;

// $(document).ready(function () {
//     menuOpen = JSON.parse(localStorage.getItem('isMenuOpen'));
//
//     if (menuOpen) {
//         menuBtn.classList.add('open');
//         menu.classList.add('menu-open');
//
//         menuItems.forEach(item => {
//             item.classList.add('menu-open__text');
//         });
//     }
// });

// Validate Session
const token = localStorage.getItem('session-token');

if (token) {
    $.ajax({
        type: "POST",
        url: "/session/" + token,
        contentType: "application/json; charset=utf-8",
        error: function (e) {
            if (e.status === 403) {
                window.location.href = "/";
            }
        },
    });
} else {
    window.location.href = "/";
}

headerTitle.innerHTML = "Rijkswaterstaat DD-OPER - " + document.title;


menuBtn.addEventListener('click', () => {
    if (!menuOpen) {
        menuBtn.classList.add('open');
        menu.classList.add('menu-open');

        menuItems.forEach(item => {
            item.classList.add('menu-open__text');
        });

        localStorage.setItem('isMenuOpen', "true");
        menuOpen = true;
    } else {
        menuBtn.classList.remove('open');
        menu.classList.remove('menu-open');

        menuItems.forEach(item => {
            item.classList.remove('menu-open__text');
        });

        localStorage.setItem('isMenuOpen', "false");
        menuOpen = false;
    }
});
