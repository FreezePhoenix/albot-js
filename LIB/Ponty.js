function snipe() {
	parent.socket.emit("secondhands");
}
const handler = (data) => {
	show_json(data);
};

if(parent.prev_sec_handler) {
	parent.socket.removeEventListener("secondhands", parent.prev_sec_handler);
}
parent.prev_sec_handler = handler;
parent.socket.on("secondhands", handler);
snipe()