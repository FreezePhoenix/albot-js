class Controller {
    botAmount = 0;
    dataIDs = null;
    structure = null;
    botUIs = {};
    socket = null;
    start() {
        var self = this;
        var host = document.location.hostname;
        let protocol = document.location.protocol

        var socket = io(protocol + "//" + host, {

            transports: ["websocket"],
            autoConnect: false
        });
        console.log(socket)

        socket.on("connect", () => {
            socket.emit("auth", { token: "all" });
        });

        socket.on("setup", (data) => {
            for (let id in self.botUIs) {
                self.botUIs[id].destroy();
                delete self.botUIs[id];
            }
            /**
             * @typedef {object} data
             * @typedef {Array<int>} data.dataIDs
             * @typedef {Array<object>} data.structure;
             */
            console.log(data)
            self.dataList = data.dataList;
            self.structure = data.structure;

            for (let i in self.dataList) {
                var botUI = new BotUi(i, self.structure);
                botUI.create();
                self.botUIs[i] = botUI;
            }
            for (let i in self.dataList) {
                if (self.botUIs[i])
                    self.botUIs[i].update(self.dataList[i]);
            }

        });

        socket.on("updateStructure", function (data) {
            //TODO: implement
            return;

            self.structure = data.structure;

            for (var j in self.botUIs) {

            }

            for (var i in self.dataIDs) {
                var botUI = new BotUi(self.dataIDs[i], self.structure);
                botUI.create();
                self.botUIs[self.dataIDs[i]] = botUI;
            }
        });

        socket.on('auth_success', (data) => {
            console.log(data)
        });

        socket.on("flush", (data) => {
            if (self.botUIs[data.id]) {
                data.modifications.forEach(([name, value]) => {
                    self.botUIs[data.id].data[name] = value;
                });
                self.botUIs[data.id].render();
            }
        });

        socket.on("removeBotUI", (data) => {
            if (self.botUIs[data.id]) {
                self.botUIs[data.id].destroy();
                delete self.botUIs[data.id];
            }
        });

        socket.on("createBotUI", (data) => {
            if (self.botUIs[data.id]) {
                self.botUIs[data.id].destroy();
                delete self.botUIs[data.id];
            }
            var botUI = new BotUi(data.id, self.structure);
            botUI.create();
            self.botUIs[data.id] = botUI;
        });

        socket.open();
        this.socket = socket;
    };
}