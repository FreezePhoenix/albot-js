const { Adapter } = await require("Adapter.js");

// for skills of form { name, id }
const TARGET_ADAPTER = Adapter("id");

const CURSE_ADAPTABLE = {
  name: "curse",
  id: 0,
};
exports.curse = (id) =>
  parent.socket.emit("skill", TARGET_ADAPTER(CURSE_ADAPTABLE, id));

const ZAP_ADAPTABLE = {
  name: "zapperzap",
  id: 0,
};
exports.zap = (id) =>
  parent.socket.emit("skill", TARGET_ADAPTER(ZAP_ADAPTABLE, id));

const TAUNT_ADAPTABLE = {
  name: "taunt",
  id: 0,
};
exports.taunt = (id) =>
  parent.socket.emit("skill", TARGET_ADAPTER(TAUNT_ADAPTABLE, id));

const ABSORB_ADAPTABLE = {
  name: "absorb",
  id: 0,
};
exports.absorb = (id) =>
  parent.socket.emit("skill", TARGET_ADAPTER(ABSORB_ADAPTABLE, id));

const WARCRY = {
  name: "warcry",
};
exports.warcry = () => parent.socket.emit("skill", WARCRY);

const CLEAVE = {
  name: "cleave",
};
exports.cleave = () => parent.socket.emit("skill", CLEAVE);

const HARDSHELL = {
  name: "hardshell",
};
exports.hardshell = () => parent.socket.emit("skill", HARDSHELL);

const DARKBLESSING = {
  name: "darkblessing",
};

exports.darkblessing = () => parent.socket.emit("skill", DARKBLESSING);
