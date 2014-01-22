// Serves client JS code / CSS that the chrome extension injects into the page.

var http = require('http'),
	https = require('https'),
	fs = require('fs'),
    express = require('express');

var app = express();

// Client code and styles that will run in the browser page
app.get('/louie.js', function(req, res) {
	res.sendfile(__dirname + '/client.js');
});

app.get('/louie.css', function(req, res) {
	res.sendfile(__dirname + '/client.css');
});

app.get('/test.html', function(req, res) {
    res.sendfile(__dirname + '/test/testpage.html');
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
