/**
 * Created by Nexus on 16.08.2017.
 */

var DataExchanger = require("./DataExchanger");
var dataSourcesCount = 0;
var Publisher = function (socketServer) {
    var self = this;
    this.socketServer = socketServer;
    this.structure = [];
    this.dataList = [];
    this.dataSources = [];
    this.clients = [];

    // setInterval(function () {
    //     for (var i in self.dataSources) {
    //         if (self.dataSources[i]) {
    //             self.dataList[self.dataSources[i].id] = self.dataSources[i].getData();
    //         }
    //     }
    //     for (var i in self.clients) {
    //         if (self.clients[i]) {
    //             self.clients[i].sendUpdate(self.dataList);
    //         }
    //     }
    // }, 500);
};

Publisher.prototype.flush = function(id, modifications) {
    for (let i in this.clients) {
        if (this.clients[i]) {
            this.clients[i].flush(id, modifications);
        }
    }
    modifications.forEach(([name, value]) => {
        this.dataList[id][name] = value;
    });
}

Publisher.prototype.clientJoined = function (client) {
    this.clients.push(client);
    console.log("Client " + client.id + " joined.");
    client.sendSetup(this.structure, this.dataList);
};

Publisher.prototype.clientLeft = function (client) {
    delete this.clients[client.id];
    console.log("Client " + client.id + " left");
};

Publisher.prototype.createInterface = function () {
    let dataSource = new DataExchanger(this, dataSourcesCount++);
    this.dataSources.push(dataSource);
    for (let i in this.clients) {
        if (this.clients[i]) {
            this.clients[i].createInterface(dataSource)
        }
    }
    this.dataList.push(dataSource.getData());
    return dataSource;
};

Publisher.prototype.removeInterface = function (dataExchanger) {
    for (let i in this.clients) {
        if (this.clients[i]) {
            this.clients[i].removeInterface(dataExchanger)
        }
    }

    for (let i = 0; i < this.dataSources.length; i++) {
        if (this.dataSources[i].id == dataExchanger.id) {
            this.dataSources.splice(i, 1);
            this.dataList.splice(i, 1);
            break;
        }
    }
};

Publisher.prototype.setStructure = function (structure) {
    this.structure = structure;
};

Publisher.prototype.pushData = function (id, name, value) {
    if(this.dataList[id][name] != value) {
      this.dataList[id][name] = value;
      for (var i = 0; i < this.clients.length; i++) {
          if (this.clients[i]) {
              this.clients[i].pushData(id, name, value);
          }
      }
    }
};


module.exports = Publisher;