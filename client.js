// Zoom

var zoomInterval = null,
	zoomLevel = 1;

function zoomStep(step) {
	zoomLevel += step;
	if (zoomLevel < 0.2) { zoomLevel = 0.2; }
	updateView();
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
	positionX = 0,
	positionY = 0,
	deltaX = 0,
	deltaY = 0;

function panStep() {
	positionX = parseInt(positionX + deltaX);
	positionY = parseInt(positionY + deltaY);
	updateView();
}

function startPan() {
	if (panInterval) return;
	panInterval = setInterval(panStep, 16);
}

function stopPan() {
	clearInterval(panInterval);
	panInterval = null;
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
	} else if (data.number === 2 && data.type === "button") {
		if ($currentElement) {
			$currentElement.get(0).click();
		}
	} else {
		console.log(data);
	}

	if (deltaX === 0 && deltaY === 0) {
		stopPan();
	}
}

var centerX = window.innerWidth / 2,
	centerY = window.innerHeight / 2,
	$page,
	$cursor,
	$currentElement;

function setUp() {
	// Move page content into a new element that can be transformed independently
	// from our cursor.
	$("body").wrapInner("<div class='LOUIE_page' />");
	$page = $(".LOUIE_page");
	$page.css("-webkit-transform-origin", centerX + "px " + centerY + "px");

	$cursor = $("<div class='LOUIE_cursor' />");
	$cursor.html('<svg><circle cx="50" cy="50" r="10" /></svg>');
	$cursor.appendTo("body");
}

function updateView() {
	var t = "scale(" + zoomLevel + ") translate(" + positionX + "px, " + positionY + "px)";
	$page.css("-webkit-transform", t);

	// Find element under our cursor. Need to hide the cursor, otherwise all we
	// get is the cursor.
	$cursor.hide();
	element = document.elementFromPoint(centerX, centerY);
	$cursor.show();

	// If it's a link, highlight and save it (so we can click on it later)
	if ($currentElement) {
		$currentElement.removeClass("LOUIE_hover");
	}

	if (element.nodeName === "A") {
		$currentElement = $(element);
		$currentElement.addClass("LOUIE_hover");
	} else {
		$currentElement = null;
	}
}

var element = document.createElement("script");
element.src = "//code.jquery.com/jquery-2.0.3.min.js";
element.onload = setUp;
document.body.appendChild(element);
