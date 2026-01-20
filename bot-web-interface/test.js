/**
 * Created by Nexus on 15.08.2017.
 */
var botWebInterface = require("./main");

botWebInterface.startOnPort(3000);
var publisher = botWebInterface.SocketServer.getPublisher();



publisher.setStructure([
    {name: "name", type: "text", label: "name"},
    {name: "inv", type: "text", label: "Inventory"},
    {name: "level", type: "text", label: "Level"},
    {name: "xp", type: "progressBar", label: "Experience", options:{color:"green"}},
    {name: "health", type: "progressBar", label: "Health", options:{color:"red"}},
    {name: "mana", type: "progressBar", label: "Mana",     options:{color:"blue"}},
    {name: "status", type: "text", label: "Status"},

]);

let interface = publisher.createInterface();

let i = 0;

setInterval(() => {
    interface.pushData("level", i++);
    interface.pushData("health", Math.floor(Math.random() * 100));
    interface.flush();
}, 1000);