let { CompleteAdapter, stand_analysis } =
	await require('CompleteAdapter.js', 'stand_analysis.js');
const EQUIP_ADAPTER = CompleteAdapter('q', 'slot', 'num', 'price'),
	UNEQUIP_ADAPTER = CompleteAdapter('slot'),
	WISHLIST_ADAPTER = CompleteAdapter('q', 'slot', 'price', 'level', 'name'),
	FALSE_STUB = () => false;

function first_null_trade(max) {
	for (let i = 0; i++ < max; ) {
		let slot = character.slots['trade' + i];
		if (slot == null) {
			return i;
		}
	}
	return -1;
}
let def = { buy: {}, sell: {} };
/**
 * Restockables takes the form of: { buy: { item_name: [gold, quantity, level] }, sell: { item_name: [gold, quantity, level, remove_filter, is_whitelist]}}
 */
function restock(restockables) {
	def = restockables;
}
setInterval(() => {
	let restockables = def;
	let max = 4;
	if (character.stand) {
		max = 30;
	}
	stand_analysis.analyze();
	for (let name in restockables.sell) {
		let [gold, quantity, level, remove_filter = FALSE_STUB, is_whitelist = false] =
			restockables.sell[name];
		// Do we have this item on our stand?
		let sell_analysis = stand_analysis.analysis.sell[name];
		if (sell_analysis && quantity != -1) {
			// We do! Where is it? How many do we have listed?
			let [slot, cur_price, cur_quantity, cur_level] = sell_analysis[0];
			// If we have less listed than we want to, see if we can fix that.
			if (remove_filter() ^ is_whitelist) {
				parent.socket.emit('unequip', UNEQUIP_ADAPTER(slot));
				break;
			}
			if (cur_quantity < quantity) {
				// We don't. But, we might have it in our inventory.
				// Find the item. If we don't specify a level (-1 is put for a level) then match anything.
				let index = -1;
				let count = 0;
				for (let i = 0; i < character.isize; i++) {
					if (character.items[i]?.name === name) {
						if (
							level === -1 ||
							character.items[i].level === level
						) {
							index = i;
							count = character.items[i].q ?? 1;
							break;
						}
					}
				}

				if (index !== -1) {
					count += cur_quantity;
					// If we have more of the item than the quantity we want listed, lower the amount to list to the max
					if (count > quantity) {
						count = quantity;
					}
					parent.socket.emit('unequip', UNEQUIP_ADAPTER(slot));
					parent.socket.emit(
						'equip',
						EQUIP_ADAPTER(count, slot, index, gold)
					);

					// Only list one item please!
					break;
				}
			}
		} else if (!(remove_filter() ^ is_whitelist)) {
			// We don't. But, we might have it in our inventory.
			// Find the item. If we don't specify a level (-1 is put for a level) then match anything.
			let index = -1;
			let count = 0;
			for (let i = 0; i < 42; i++) {
				if (character.items[i]?.name === name) {
					if (level === -1 || character.items[i].level === level) {
						index = i;
						count = character.items[i].q ?? 1;
						break;
					}
				}
			}

			if (index !== -1) {
				const open_slot = first_null_trade(max);
				if (open_slot !== -1) {
					// If we have more of the item than the quantity we want listed, lower the amount to list to the max
					if (count > quantity) {
						count = quantity;
					}
					parent.socket.emit(
						'equip',
						EQUIP_ADAPTER(count, 'trade' + open_slot, index, gold)
					);

					// Only list one item please!
					break;
				}
			}
		}
	}
	for (let name in restockables.buy) {
		let [gold, quantity, level] = restockables.buy[name];
		// Do we have this item on our stand?
		let buy_analysis = stand_analysis.analysis.buy[name];
		if (buy_analysis) {
			// We do! Where is it? How many do we have listed?
			let [slot, cur_price, cur_quantity, cur_level] = buy_analysis[0];
			// If we have less listed than we want to, see if we can fix that.
			if (cur_quantity < quantity) {
				parent.socket.emit('unequip', UNEQUIP_ADAPTER(slot));
				parent.socket.emit(
					'trade_wishlist',
					WISHLIST_ADAPTER(quantity, slot, gold, level, name)
				);
				// Only list one item please!
				break;
			}
		} else {
			const open_slot = first_null_trade(max);
			if (open_slot !== -1) {
				parent.socket.emit(
					'trade_wishlist',
					WISHLIST_ADAPTER(
						quantity,
						'trade' + open_slot,
						gold,
						level,
						name
					)
				);
			}
		}
	}
}, 1000);

module.exports = restock;
