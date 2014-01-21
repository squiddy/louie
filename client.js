var pageTransform = {zoom: 1, posX: 0, posY: 0},
    lastPageTransform = {zoom: 1, posX: 0, posY: 0};

// Zoom

var zoomInterval = null;

function zoomStep(step) {
	pageTransform.zoom += step;
	if (pageTransform.zoom < 0.2) { pageTransform.zoom = 0.2; }
}

function startZoom(step) {
	var doZoom = zoomStep.bind(undefined, step);
	clearInterval(zoomInterval);
	zoomInterval = setInterval(doZoom, 16);
	doZoom();
}

function stopZoom() {
	clearInterval(zoomInterval);
}

// Pan

var panInterval = null,
	deltaX = 0,
	deltaY = 0;

function panStep() {
	pageTransform.posX = parseInt(pageTransform.posX + deltaX);
	pageTransform.posY = parseInt(pageTransform.posY + deltaY);
}

function startPan() {
	if (panInterval) return;
	panInterval = setInterval(panStep, 16);
}

function stopPan() {
	clearInterval(panInterval);
	panInterval = null;
}


function clickElement(element) {
    if (!element) return;

    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
        "click",
        true,       // canBubble
        true,       // canceable
        window,     // view
        0,          // detail
        0,          // screenX
        0,          // screenY
        0,          // clientX
        0,          // clientY
        false,      // ctrlKey
        false,      // altKey
        false,      // shiftKey
        false,      // metaKey
        0,          // button
        null        // relatedTarget
    );
    element.dispatchEvent(evt);
}

// Handle incoming joystick data

var ws = new WebSocket("ws://localhost:8080");

ws.onmessage = function(evt) { 
	var data = JSON.parse(evt.data);
	handleData(data);
};

function handleData(data) {
	// Left bumber -> zoom out
	if (data.number === 4 && data.value === 1) {
		startZoom(-0.1);
	// Right bumber -> zoom in
	} else if (data.number === 5 && data.value === 1) {
		startZoom(+0.1);
	} else if ((data.number === 4 || data.number === 5) && data.value === 0) {
		stopZoom();
	// Left stick -> left/right
	} else if (data.number === 0) {
		if (data.value !== 0) {
			deltaX = -data.value / 32000 * 10;
			startPan();
		} else {
			deltaX = 0;
		}
	// Right stick -> up/down
	} else if (data.number === 1) {
		if (data.value !== 0) {
			deltaY = -data.value / 32000 * 10;
			startPan();
		} else {
			deltaY = 0;
		}
	// Click link -> Y
	} else if (data.number === 2 && data.type === "button" && data.value === 1) {
        clickElement(currentElement);
	} else {
		console.log(data);
	}

	if (deltaX === 0 && deltaY === 0) {
		stopPan();
	}
}

var centerX = window.innerWidth / 2,
	centerY = window.innerHeight / 2,
	currentElement,
	$page,
	$cursor;

function setUp() {
	// Move page content into a new element that can be transformed independently
	// from our cursor.
	$("body").wrapInner("<div class='LOUIE_page' />");
	$page = $(".LOUIE_page");
	$page.css("-webkit-transform-origin", centerX + "px " + centerY + "px");

	$cursor = $("<div class='LOUIE_cursor' />");
	$cursor.html('<svg><circle cx="50" cy="50" r="10" /></svg>');
	$cursor.appendTo("body");

	window.requestAnimationFrame(update);
}

// Check if the element is (part of) a link
function isLink(element) {
    var depth = 0;
    while (element && depth < 10) {
        if (element.nodeName === "A") {
            return true;
        }
        
        var style = window.getComputedStyle(element);
        if (style && style.getPropertyValue("cursor") === "pointer") {
            return true;
        }

        element = element.parentNode;
    }

    return false;
}

function update(timestamp) {
	var lastT = lastPageTransform,
        nowT = pageTransform;
	
	if (lastT.zoom === nowT.zoom && lastT.posX === nowT.posX && lastT.posY === nowT.posY) {
		// Nothing changed, skip this frame
		window.requestAnimationFrame(update);
		return;
	}

	lastPageTransform = {zoom: nowT.zoom, posX: nowT.posX, posY: nowT.posY};

	var t = "scale(" + nowT.zoom + ") translate(" + nowT.posX + "px, " + nowT.posY + "px)";
	$page.css("-webkit-transform", t);

	// Find element under our cursor. Need to hide the cursor, otherwise all we
	// get is the cursor.
	$cursor.hide();
	element = document.elementFromPoint(centerX, centerY);
	$cursor.show();

    if (element && element !== currentElement) {
        // If it's a link change cursor
        if (isLink(element)) {
            $cursor.addClass("hover");
            currentElement = element;
        } else {
            $cursor.removeClass("hover");
        }
    }

	window.requestAnimationFrame(update);
}

var element = document.createElement("script");
element.src = "//code.jquery.com/jquery-2.0.3.min.js";
element.onload = setUp;
document.body.appendChild(element);
