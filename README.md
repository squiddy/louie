louie - gamepad browser control
===============================

Think Steam "Big Picture"-mode control in your browser.

Why? I liked the idea behind the controls. Doesn't matter if it ends up being
useful or not. Take this as a proof-of-concept, it won't be able to hold up
against Steams optimized browser.


Features (WIP)
--------------

* Chrome/Chromium - Support
* Zoom
* Moving around page
* Highlighting and clicking links


How
---

CSS transitions are used to scale/translate the page. I couldn't get the
new joystick API working, so for the time beeing I'm using a websocket
connection to a NodeJS server that sends events to the browser.


TODO
----

Client

* use requestAnimationFrame
* implement daisywheel
* vimium link navigation as alternative to clicking links
* make use of joystick API for browsers that support it
* kinetic scrolling
* request fullscreen
* improve page isolation (move attributes on body to page div, change affected
  stylesheet selectors)
* keep zoom-level consistent across pages

Browser-Extension

* enable/disable globally
