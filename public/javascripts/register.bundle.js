(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var inputEmail = document.querySelector('#input_email');
var inputEmail2 = document.querySelector('#input_email2');
var inputPassword = document.querySelector('#input_password');
var inputFname = document.querySelector('#input_fname');
var inputLname = document.querySelector('#input_lname');
var spinner = document.querySelector('#spinner');
var registerBtn = document.querySelector('#register-button'); // Messages

var errFields = document.querySelector('#err_fields');
var errEmail = document.querySelector('#err_email');
var errEmailComp = document.querySelector('#err_email_comp');
var errEmailPattern = document.querySelector('#err_email_pattern');
var errReg = document.querySelector('#err_reg');
var successfulRegister = document.querySelector('#suc_reg');
registerBtn.addEventListener('click', function () {
  register();
});

function register() {
  var email = inputEmail.value;
  var email2 = inputEmail2.value;
  var password = inputPassword.value;
  var firstname = inputFname.value;
  var lastname = inputLname.value;
  successfulRegister.setAttribute('hidden', 'true');
  errFields.setAttribute('hidden', 'true');
  errEmail.setAttribute('hidden', 'true');
  errEmailComp.setAttribute('hidden', 'true');
  errEmailPattern.setAttribute('hidden', 'true');
  errReg.setAttribute('hidden', 'true');

  if (email !== "" && email2 !== "" && password !== "" && firstname !== "" && lastname !== "") {
    if (email.includes('@') && email.includes('.')) {
      if (email === email2) {
        spinner.classList.add('is-active');
        var credentials = {
          "email": email,
          "password": password,
          "firstname": firstname,
          "lastname": lastname
        };
        $.ajax({
          type: "POST",
          url: "/register",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(credentials),
          error: function error(e) {
            spinner.classList.remove('is-active');

            if (e.status === 400) {
              errEmail.removeAttribute('hidden');
            }

            if (e.status === 500) {
              errReg.removeAttribute('hidden');
            }
          },
          success: function success() {
            spinner.classList.remove('is-active');
            successfulRegister.removeAttribute('hidden');
            setTimeout(function () {
              window.location.href = '/';
            }, 2000);
          }
        });
      } else {
        errEmailComp.removeAttribute('hidden');
      }
    } else {
      errEmailPattern.removeAttribute('hidden');
    }
  } else {
    errFields.removeAttribute('hidden');
  }
}

},{}]},{},[1]);
