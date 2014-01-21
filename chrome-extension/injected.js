// This file is injected into the page by the extension. It loads the client
// code from the NodeJS server.
//
// This is easier for development since we don't need to reload the extension
// every time the code changes.

if (window.location.protocol === 'https:') {
    var base = "https://localhost:8081";
} else {
    var base = "http://localhost:8080";
}

var element = document.createElement("script");
element.src = base + "/louie.js";
document.body.appendChild(element);

element = document.createElement("link");
element.rel = "stylesheet";
element.href = base + "/louie.css";
document.body.appendChild(element);
