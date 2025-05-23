/**
 * Created by Nexus on 29.07.2017.
 */
var express = require('express');
var app = express();
var defaultPort = 22;
var server = require('http').createServer(app)
var cors = require("cors");
var compression = require("compression");
var socketOpen = false;
var WebServer = function () {
};

WebServer.prototype.openSocket = function (port) {

	port = (port) ? port : defaultPort;
  app.use(compression());
  app.use(cors());
	app.use('/LIB', express.static(__dirname + '/../../LIB'));
	app.use('/', express.static(__dirname + '/public'));

	app.use(function (request, response, next) {
		if (request.method == 'POST') {
    console.log('POST')
    var body = ''
    request.on('data', function(data) {
      body += data
    })
    request.on('end', function() {
      console.log('Body: ' + body)
      response.writeHead(200, {'Content-Type': 'text/html'})
      response.end('post received')
    })
  }
	});

	server.listen(3000, function () {
		console.log('WebServer listening on port ' + port + '.');
	});
};

/**
 * Created by Nexus on 29.07.2017.
 */
var Server = new require('socket.io');
var Client = require("./Client");
var Publisher = require("./Publisher");

var defaultPort = 80;
var socketOpen = false;

var SocketServer = function () {
	this.clients = [];
	this.structure = [];
	this.publisher = new Publisher();

	this.io = null;
};

SocketServer.prototype.getPublisher = function () {
	return this.publisher;
};

SocketServer.prototype.removeClient = function (client) {
	for (var i in this.clients) {
		if (this.clients[i] === client) {
			this.publisher.clientLeft(client);
			delete this.clients[i];
		}

	}
};
function randomStr() {
	let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let format = [8, 4, 4, 4, 12];
	return format.map((len) => {
		let res = '';
		for (let i = 0; i < len; i++) {
			let char = Math.floor(Math.random() * chars.length);
			res += chars[char];
		}
		return res;
	}).join('-')
}
let active_keys = []
let listeners = {}
SocketServer.prototype.on = function (message, handler) {
	if (listeners[message]) {
		listeners[message].push(handler);
	} else {
		listeners[message] = [handler];
	}
}
let sockets = {}
SocketServer.prototype.send_to_client = function (client, message) {
	if (sockets[client]) {
		sockets[client].emit('api', message)
	}
}
SocketServer.prototype.openSocket = function (port) {
	var self = this;
	this.active_keys = [];
	this.io = Server(server);
	this.io.sockets.on('connection', function (socket) {
		var client = new Client(socket, self, self.clients.length);
		let client_id = null;
		self.publisher.clientJoined(client);
		sockets[client_id = self.clients.push(client)] = socket;
		socket.on('master_auth', (data) => {
      console.log("Attempt to log in with: " + JSON.stringify(data));
			if (process.env.master_auth_key != undefined && data.key == process.env.master_auth_key) {
				let response_key = randomStr()
				socket.emit('auth_success', { key: response_key });
				active_keys.push([response_key, socket]);
			}
		});
		socket.on('command', (data) => {
			let is_authed = active_keys.find((value) => {
				if (value[0] == data.auth_key && value[1] == socket && data.auth_key != undefined) {
					return true
				}
				return false;
			})
			if (is_authed) {
				listeners['command'].forEach(func => func(Object.assign(data, { client: client_id, admin: true })));
			} else {
				listeners['command'].forEach(func => func(Object.assign(data, { client: client_id, admin: false })));
			}
		})
	});
};

module.exports = [new WebServer(), new SocketServer()];