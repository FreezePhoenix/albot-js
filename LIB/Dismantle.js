const { CompleteAdapter } = await require("CompleteAdapter.js");
const DISMANTLE_ADAPTER = CompleteAdapter("num");
const dismantle_items = new Set();
setInterval(() => {
  for(let i = 0; i < 42; i++) {
    let item = character.items[i];
    if(item != null && dismantle_items.has(item.name) && item.p == null && (item.level ?? 0) == 0) {
      parent.socket.emit("dismantle", DISMANTLE_ADAPTER(i));
      break;
    }
  }
}, 1000);
module.exports = (item_name) => {
    dismantle_items.add(item_name);
}