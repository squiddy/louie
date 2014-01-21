// Responsible for sending gamepad events to the browser.
//
// Serves client JS code / CSS that the chrome extension injects into the page.

var WebSocketServer = require('ws').Server,
    http = require('http'),
	https = require('https'),
	fs = require('fs'),
    express = require('express'),
	joystick = require('joystick');

var app = express();

// Client code and styles that will run in the browser page
app.get('/louie.js', function(req, res) {
	res.sendfile(__dirname + '/client.js');
});

app.get('/louie.css', function(req, res) {
	res.sendfile(__dirname + '/client.css');
});

// Provide both HTTP and HTTPS (otherwise browsers may refuse to load
// our script in secure pages)

var server = http.createServer(app);
server.listen(8080);

var options = {
	key: fs.readFileSync(__dirname + '/test/server.key'),
	cert: fs.readFileSync(__dirname + '/test/server.crt')
};

var httpsServer = https.createServer(options, app);
httpsServer.listen(8081);

// Setup websocket and listen for events from the gamepad. Send events
// to all connected clients.

var wss = new WebSocketServer({server: server});

var device = new joystick(0, 3500, 350);
device.on('button', sendUpdate);
device.on('axis', sendUpdate);

function sendUpdate(data) {
	wss.clients.forEach(function(client) {
		client.send(JSON.stringify(data));
	});
}
