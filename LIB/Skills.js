const { Adapter, CompleteAdapter } = await require("Adapter.js", "CompleteAdapter.js");

// for skills of form { name }
const NAME_ADAPTER = CompleteAdapter("name");
// for skills of form { name, id }
const NAME_ID_ADAPTER = CompleteAdapter("name", "id");

exports.curse = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("curse", id));

exports.zap = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("zapperzap", id));

exports.taunt = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("taunt", id));

exports.absorb = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("absorb", id));

exports.warcry = () => parent.socket.emit("skill", NAME_ADAPTER("warcry"));

exports.cleave = () => parent.socket.emit("skill", NAME_ADAPTER("cleave"));

exports.hardshell = () => parent.socket.emit("skill", NAME_ADAPTER("hardshell"));

exports.darkblessing = () => parent.socket.emit("skill", NAME_ADAPTER("darkblessing"));
