const { CompleteAdapter } = await require("CompleteAdapter.js");
const EMIT_ADAPTER = CompleteAdapter("slot", "id", "rid");
setInterval(() => {
  for (let entity_name in parent.entities) {
    const entity = parent.entities[entity_name];
		for(let slot in entity.slots) {
			if(slot.startsWith("trade")) {
				const item = entity.slots[slot];
				if (item?.giveaway && !item.list.includes(character.name)) {
          parent.socket.emit(
            "join_giveaway",
            EMIT_ADAPTER(slot, entity_name, item.rid)
          );
        }
			}
		}
  }
}, 1000);
