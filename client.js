var Gamepad = {
    found: false,

    pollGamepads: function() {
        var pad = navigator.webkitGetGamepads && navigator.webkitGetGamepads()[0];
        if (pad) {
            this.found = true;
        }
    },

    update: function() {
        var pad = navigator.webkitGetGamepads()[0];

        this.buttons = {
            primary: pad.buttons[0] > 0.5,
            secondary: pad.buttons[1] > 0.5,
            tertiary: pad.buttons[2] > 0.5,
            quaternary: pad.buttons[3] > 0.5,
            leftShoulder: pad.buttons[4] > 0.5,
            rightShoulder: pad.buttons[5] > 0.5
        };

        this.axes = {
            leftStickX: this.denoiseAxis(pad.axes[0]),
            leftStickY: this.denoiseAxis(pad.axes[1])
        };
    },

    // Sometimes the value of an axis doesn't go back to zero.
    denoiseAxis: function(value) {
        if (value < -0.01) {
            return value;
        } else if (value > 0.01) {
            return value;
        } else {
            return 0;
        }
    }
};

var pageTransform = {zoom: 1, posX: 0, posY: 0},
    lastPageTransform = {zoom: 1, posX: 0, posY: 0};

// Zoom

var zoomInterval = null;

function zoomStep(step) {
	pageTransform.zoom += step;
	if (pageTransform.zoom < 0.5) { pageTransform.zoom = 0.5; }
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

function handleInput() {
    // Zoom
    if (Gamepad.buttons.leftShoulder) {
        startZoom(-0.04);
    } else if (Gamepad.buttons.rightShoulder) {
        startZoom(+0.04);
    } else if (!Gamepad.buttons.leftShoulder || !Gamepad.buttons.rightShoulder) {
        stopZoom();
    }

    // Move horizontally
    if (Gamepad.axes.leftStickX) {
        deltaX = -Gamepad.axes.leftStickX * 10;
        startPan();
    } else {
        deltaX = 0;
    }

    // Move vertically
    if (Gamepad.axes.leftStickY) {
        deltaY = -Gamepad.axes.leftStickY * 10;
        startPan();
    } else {
        deltaY = 0;
    }

    // Click link -> Y
    if (Gamepad.buttons.primary) {
        clickElement(currentElement);
    }

    if (deltaX === 0 && deltaY === 0) {
        stopPan();
    }
}

var centerX = window.innerWidth / 2,
	centerY = window.innerHeight / 2,
	currentElement,
	$cursor;

function setUp() {
	$("html").css("-webkit-transform-origin", centerX + "px " + centerY + "px");

	$cursor = $("<div class='LOUIE_cursor' />");
	$cursor.html('<svg><circle cx="50" cy="50" r="10" /></svg>');
	// Surprised this works (in chrome/FF), but it makes things much easier
	$cursor.appendTo("html");

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
    if (!Gamepad.found) {
        Gamepad.pollGamepads();
        return window.requestAnimationFrame(update);
    }

    Gamepad.update();
    handleInput();

	var lastT = lastPageTransform,
        nowT = pageTransform;
	
	if (lastT.zoom === nowT.zoom && lastT.posX === nowT.posX && lastT.posY === nowT.posY) {
		// Nothing changed, skip this frame
		window.requestAnimationFrame(update);
		return;
	}

	lastPageTransform = {zoom: nowT.zoom, posX: nowT.posX, posY: nowT.posY};

	var t = "scale(" + nowT.zoom + ") translate3d(" + nowT.posX + "px, " + nowT.posY + "px, 0)";
	$("body").css("-webkit-transform", t);

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
