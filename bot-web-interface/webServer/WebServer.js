/**
 * Created by Nexus on 29.07.2017.
 */
var express = require('express');
var app = express();
var defaultPort = 22;
var server = require('http').createServer(app);
var cors = require("cors");
var compression = require("compression");

var socketOpen = false;
class WebServer {
    openSocket(port = defaultPort) {
        app.use(compression());
        app.use(cors());
        app.use('/LIB', express.static(__dirname + '/../../LIB'));
        app.use('/', express.static(__dirname + '/public'));

        server.listen(3000, function () {
            console.log('WebServer listening on port ' + port + '.');
        });
    };
};

var Server = require('socket.io');
var Publisher = require("./Publisher");

var defaultPort = 80;

let listeners = {}
class SocketServer {
    constructor() {
        this.publisher = new Publisher(this);
        this.io = null;
    };
    flush(id, modifications) {
        this.io.emit("flush", { id, modifications });
    };
    createInterface(dataExchanger) {
        this.io.emit("createBotUI", { id: dataExchanger.id });
    };
    removeInterface(dataExchanger) {
        this.io.emit("removeBotUI", {id:dataExchanger.id});
    };
    getPublisher() {
        return this.publisher;
    };
    on(message, handler) {
      if (listeners[message]) {
        listeners[message].push(handler);
      } else {
        listeners[message] = [handler];
      }
    }
    openSocket() {
        this.io = Server(server);
        this.io.sockets.on('connection', (socket) => {
            socket.emit("setup", {
                dataList: this.publisher.dataList,
                structure: this.publisher.structure
            });
          socket.on('command', (data) => {
          let is_authed = process.env.master_auth_key != null && data.auth_key == process.env.master_auth_key;
          if (is_authed) {
            listeners['command'].forEach(func => func(Object.assign(data, {admin: true })));
          } else {
            listeners['command'].forEach(func => func(Object.assign(data, {admin: false, keyyyy: process.env.master_auth_key })));
          }
        })
        });
    };
}

module.exports = [new WebServer(), new SocketServer()];
