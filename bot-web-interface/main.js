/**
 * Created by Nexus on 29.07.2017.
 */
var [WebServer, SocketServer] = require("./webServer/WebServer");

module.exports =  {
    WebServer: WebServer,
    SocketServer: SocketServer,
    startOnPort: function (port) {
        WebServer.openSocket(port);
        SocketServer.openSocket();
    }
};