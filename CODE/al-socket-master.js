let sockets = {};
let _handlers = {};
function on_cm(name, data) {
	if (data.message == "connect") {
		let handlers = {}
		let socket = sockets[name] = {
			on: function (event, handler) {
				handlers[event] = handler;
			},
			exec: function (event, args) {
				handlers[event](...args);
			},
      emit:
		}
		
	} else if (name in sockets) {
		sockets[name].exec(data.messege, data.args);
	}
}
let io = {
	on: function (event, handler) {
		_handlers[event] = handler;
	}
}
io.on("connect", function (socket) {

})