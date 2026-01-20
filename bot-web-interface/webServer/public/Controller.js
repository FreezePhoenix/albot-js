class Controller {
    structure = null;
    botUIs = {};
    socket = null;
    start() {
        let host = document.location.hostname;
        let protocol = document.location.protocol
        let port = document.location.port == '' ? '' : (':' + document.location.port);
        
        let socket = io(protocol + "//" + host + port, {
            parser,
            transports: ["websocket"],
            autoConnect: false
        });

        socket.on("setup", (data) => {
            console.log(data);
            for (let id in this.botUIs) {
                this.botUIs[id].destroy();
                delete this.botUIs[id];
            }
            /**
             * @typedef {object} data
             * @typedef {Array<int>} data.dataIDs
             * @typedef {Array<object>} data.structure;
             */
            this.dataList = data.dataList;
            this.structure = data.structure;

            for (let i in this.dataList) {
                var botUI = new BotUi(i, this.structure);
                botUI.create();
                this.botUIs[i] = botUI;
            }
            for (let i in this.dataList) {
                if (this.botUIs[i])
                    this.botUIs[i].update(this.dataList[i]);
            }

        });

        socket.on("flush", ([id, modifications]) => {
            if (this.botUIs[id]) {
                modifications.forEach(([index, value]) => {
                    this.botUIs[id].data[this.botUIs[id].structure[index].name] = value;
                });
                this.botUIs[id].render();
            }
        });

        socket.on("removeBotUI", (data) => {
            if (this.botUIs[data.id]) {
                this.botUIs[data.id].destroy();
                delete this.botUIs[data.id];
            }
        });

        socket.on("createBotUI", (data) => {
            if (this.botUIs[data.id]) {
                this.botUIs[data.id].destroy();
                delete this.botUIs[data.id];
            }
            var botUI = new BotUi(data.id, this.structure);
            botUI.create();
            this.botUIs[data.id] = botUI;
        });

        socket.open();
        this.socket = socket;
    };
}