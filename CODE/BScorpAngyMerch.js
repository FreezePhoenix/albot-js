function CompleteAdapter(...properties) {
	return Function(
		`const object = { ${properties
		.map((initial) => `${initial}: null`)
		.join(", ")} };\nreturn (${properties.join(",")}) => {\n${properties
		.map((initial) => `\tobject.${initial} = ${initial};`)
		.join("\n")}\n\treturn object;\n}`
	)();
}
function Adapter(...properties) {
	return Function("object", ...properties, properties.map((initial) => {
		return "\tobject." + initial + " = " + initial + ";" 
	}).join("\n") + "return object");
}

class Mover {
	static async move_by_path(destination, callback, tries = 0) {
		await smart_move(destination);
		callback?.(true);
		return;
	}
}

let FILTERS = [];

let min_mp = 300;

const dismantle_items = new Set();
setInterval(() => {
	for(let i = 0; i < 42; i++) {
		let item = character.items[i];
		if(item != null && dismantle_items.has(item.name) && item.p == null && (item.level ?? 0) == 0) {
			parent.socket.emit("dismantle", { num: i });
			break;
		}
	}
}, 1000);

Dismantle = (item_name) => {
	dismantle_items.add(item_name);
}

function P_EXCHANGE(item_num) {
	if (character.q.exchange) {
		return Promise.resolve({
			success: false,
			in_progress: true,
			num: character.q.exchange.num,
			response: 'data',
			place: 'exchange',
		});
	} else {
		if(character.mp > min_mp) {
			parent.socket.emit('skill', {name: "massexchangepp"});
		}
		return exchange(item_num)
	}
}

async function EXCHANGE(item_num) {
	var call = await P_EXCHANGE(item_num),
		num = undefined,
		name = undefined;
	if (!call.in_progress) return call;
	if (character.q.exchange) num = character.q.exchange.num;
	while (
		character.q.exchange ||
		(character.items[num] && character.items[num].name == 'placeholder')
	)
		await sleep(1);
	if (character.items[num]) name = character.items[num].name;
	else num = undefined;
	return { success: true, reward: name, num: num };
}

let enabled = true;
(async () => {
	main: while (true) {
		if (enabled && character.map != "bank" && character.map != "bank_b" && character.esize) {
			for (let i = 0; i < FILTERS.length; i++) {
				let [name, quantity, keep] = FILTERS[i];

				let first_index = -1;
				for (let i = 0; i < 42; i++) {
					if (character.items[i]?.name == name) {
						if (character.items[i].q >= quantity + keep) {
							await EXCHANGE(i);
							continue main;
						} else if (first_index == -1) {
							first_index = i;
						} else {
							await swap(first_index, i);
							continue main;
						}
					}
				}
			}
		}
		await sleep(1000);
	}
})();

var Exchange = (name, quantity = 1, keep = 0) => {
	FILTERS.push([name, quantity, keep]);
};

(async () => {
	async function visit_featured_player() {
		var round = server.status.anniversary;
		var ticket = character.s.anniversary_visit;
		if (!round || !round.active || !round.live || !ticket ||
			ticket.ms <= 0 || ticket.round !== round.round ||
			ticket.realm !== server.region + " " + server.id ||
			Date.now() >= ticket.expires || Date.now() >= round.expires) {
			return game_log("No Anniversary Visit available right now");
		}
		if (round.available === false) return game_log("Waiting for " + round.target + " to return");

		await smart_move({ map: round.map, x: round.x, y: round.y });
		var current = server.status.anniversary;
		ticket = character.s.anniversary_visit;
		if (!current || !current.active || !current.live || current.available === false || current.round !== round.round ||
			current.id !== round.id || !ticket || ticket.ms <= 0 ||
			Date.now() >= ticket.expires || Date.now() >= current.expires) return;

		var player = get_player(current.target);
		if (!player || distance(character, player) > 80) {
			return game_log("The featured player moved. Find them again.");
		}
		use_skill("ikissyou", player);
	}

	while(false) {
		await visit_featured_player();
		await sleep(10000);
		await smart_move("bscorpion");
	}
})();

Exchange.set_min_mp = (min) => {
	min_mp = min;
};

Exchange.reset = () => {
	FILTERS.length = 0;
};

Exchange.toggle = () => {
	enabled = !enabled;
};

// Exchange("anniversarygift", 1, 1);

let stand_analysis = {};
const analyze = () => {
	const buy = (stand_analysis.buy = {});
	const sell = (stand_analysis.sell = {});
	let max = 4;
	if (character.stand) {
		max = 30;
	}
	for (let i = 0; i++ < max; i) {
		let slot_id = "trade" + i;
		let slot = character.slots[slot_id];
		if (slot != null) {
			if (slot.b === true) {
				let analysis = (buy[slot.name] ??= []);
				analysis.push([slot_id, slot.price, slot.q ?? 1, slot.level ?? 0])
			} else {
				let analysis = (sell[slot.name] ??= []);
				analysis.push([slot_id, slot.price, slot.q ?? 1, slot.level ?? 0])
			}
		}
	}
};
stand_analysis.analysis = stand_analysis;
stand_analysis.analyze = analyze;

const FALSE_STUB = () => false;

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
				parent.socket.emit('unequip', {slot});
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
					parent.socket.emit('unequip', { slot });
					parent.socket.emit(
						'equip',
						{ q: count, slot, num: index, price: gold }
					);

					// Only list one item please!
					break;
				}
			}
		} else if (!(remove_filter() ^ is_whitelist)) {
			// We don't. But, we might have it in our inventory.
			// Find the item. If we don't specify a level (-1 is put for a level) then match anything.
			let num = -1;
			let count = 0;
			for (let i = 0; i < 42; i++) {
				if (character.items[i]?.name === name) {
					if (level === -1 || character.items[i].level === level) {
						num = i;
						count = character.items[i].q ?? 1;
						break;
					}
				}
			}

			if (num !== -1) {
				const open_slot = first_null_trade(max);
				if (open_slot !== -1) {
					// If we have more of the item than the quantity we want listed, lower the amount to list to the max
					if (count > quantity) {
						count = quantity;
					}
					parent.socket.emit(
						'equip',
						{ q: count, slot: 'trade' + open_slot, num, price: gold }
					);

					// Only list one item please!
					break;
				}
			}
		}
	}
	for (let name in restockables.buy) {
		let [price, count, level] = restockables.buy[name];
		// Do we have this item on our stand?
		let buy_analysis = stand_analysis.analysis.buy[name];
		if (buy_analysis) {
			// We do! Where is it? How many do we have listed?
			let [slot, cur_price, cur_quantity, cur_level] = buy_analysis[0];
			// If we have less listed than we want to, see if we can fix that.
			if (cur_quantity < count) {
				parent.socket.emit('unequip', { slot });
				parent.socket.emit(
					'trade_wishlist',
					{ q: count, slot, price, level, name }
				);
				// Only list one item please!
				break;
			}
		} else {
			const open_slot = first_null_trade(max);
			if (open_slot !== -1) {
				parent.socket.emit(
					'trade_wishlist',
					{ q: count, slot: 'trade' + open_slot, price, level, name }
				);
			}
		}
	}
}, 1000);

class ItemFilter {
	#level = -1;
	#levelMode = '==';
	#names = [];
	#property = true;
	level(level, mode = '==') {
		this.#level = level;
		this.#levelMode = mode;
		return this;
	}
	toString() {
		let parts = [];
		if (this.#names.length == 1) {
			parts.push(`name='${this.#names[0]}'`);
		} else if (this.#names.length > 1) {
			parts.push(`name=['${this.#names.join("','")}']`);
		}
		if (this.#level != -1) {
			parts.push(`level${this.#levelMode}${this.#level}`);
		}
		if (this.#property == false) {
			parts.push('property=null');
		} else if (this.#property != true) {
			parts.push(`property='${this.#property}'`);
		}
		return `ItemFilter(${parts.join(',')})`;
	}
	property(name) {
		this.#property = name;
		return this;
	}
	name(name) {
		if (!this.#names.includes(name) && typeof name == 'string') {
			this.#names.push(name);
		}
		return this;
	}
	names(...names) {
		for (let name of names) {
			this.name(name);
		}
		return this;
	}
	#propertyFilter() {
		if (this.#property === true) {
			return 'true';
		}
		if (this.#property === false) {
			return '(item?.p == null)';
		}
		return `(item?.p == "${this.#property}")`;
	}
	#levelFilter() {
		if (this.#level == -1) {
			return 'true';
		}
		return `(item?.level ${this.#levelMode} ${this.#level})`;
	}
	#nameFilter() {
		if (this.#names.length == 0) {
			throw new Error('ItemFilter.names must not be empty');
		}
		return `(${this.#names
			.map((name) => `item?.name == "${name}"`)
			.join(' || ')})`;
	}
	build() {
		let parts = [
			this.#levelFilter(),
			this.#nameFilter(),
			this.#propertyFilter(),
		].filter((str) => str != 'true');
		let result = Function(`return (item) => ${parts.join(' && ')};`)();
		result.looking = this.#names;
		return result;
	}
	static ofName(name) {
		return new ItemFilter().name(name);
	}
	static toFilter(object) {
		if (object instanceof Function) {
			return object;
		}
		if (object instanceof String) {
			return ofName(object).build();
		}
		return null;
	}
}

restock({
	sell: {
		offeringp: [5000000, 500, -1],
	},
	buy: {},
});

parent.socket.emit('respawn');

const JACKO_FILTER = ItemFilter.ofName('jacko').build();
const FTRINKET_FILTER = ItemFilter.ofName('ftrinket').build();
const BROOM_FILTER = ItemFilter.ofName('broom').build();
const ROD_FILTER = ItemFilter.ofName('rod').build();
const LUCK_FILTER = ItemFilter.ofName('elixirluck').build();
const PUMPKIN_FILTER = ItemFilter.ofName('pumpkinspice').build();
const BUNNY_FILTER = ItemFilter.ofName('bunnyelixir').build();

const group = ['Raelina', 'Rael', 'Geoffriel'];

const tree_exists = G.maps.main.npcs.find(({ id }) => id == 'newyear_tree');

Dismantle(
	'bowofthedead',
	'swordofthedead',
	'staffofthedead',
	'daggerofthedead',
	'maceofthedead',
	'spearofthedead'
);

setInterval(() => {
	if (character.party != undefined && character.party != 'AriaHarper') {
		parent.socket.emit('party', { event: 'leave' });
	}
	// if (character.party != 'AriaHarper') {
	// 	parent.socket.emit('party', { event: 'invite', name: 'Geoffriel' });
	// }
}, 30000);

Exchange('armorbox');

let tree = false;
let purchase_amount = 1000;

function num_items(name) {
	let item_count = 0;
	if (typeof name == 'function') {
		for (let i = 0; i < character.isize; i++) {
			let item = character.items[i];
			item_count += name(item) ? item.q ?? 1 : 0;
		}
	} else {
		for (let i = 0; i < character.isize; i++) {
			let item = character.items[i];
			item_count += item?.name === name ? item.q ?? 1 : 0;
		}
	}

	return item_count;
}

function happy_holidays() {
	tree = true;
	let xmas_tree = G.maps.main.npcs.find(({ id }) => id === 'newyear_tree');
	if (!moving) {
		moving = true;
		Mover.move_by_path({ x: 0, y: 0, map: 'main' }, () => {
			tree = false;
			parent.socket.emit('interaction', {
				type: 'newyear_tree',
			});
			say('Happy Holidays!');
			moving = false;
		});
	}
}

setInterval(() => {
	if (character.moving && character.stand) {
		parent.socket.emit('merchant', { close: 1 });
	} else if (!character.moving && !character.stand) {
		parent.socket.emit('merchant', { num: 41 });
	}
}, 250);

const whitelist = [
	"poker",
	"gloves",
	"helmet",
	"shoes",
	"pants",
	"coat",
	// "spookyamulet",
	'hpamulet',
	'wbook0',
	'hpbelt',
	'gloves1',
	'smoke',
	'intring',
	'dexring',
	'strring',
	'vitring',
	'pants1',
	'coat1',
	'shoes1',
	'helmet1',
	'ringsj',
	'wshield',
	'cclaw',
	'snowball',
	'smoke',
	'strbelt',
	'intbelt',
	'dexbelt',
	'intamulet',
	'stramulet',
	'ecape',
	'lantern',
	'eslippers',
	'epyjamas',
	'eears',
	'smoke',
	'skullamulet',
	// "pinkie",
	'xmassweater',
	'carrotsword',
	'xmasshoes',
	'mittens',
	'merry',
	'rednose',
	'warmscarf',
	'xmaspants',
	"partyhat",
	'xmashat',
	'ornamentstaff',
	'candycanesword',
];

let to_destroy = [
	'broom',
	'wshoes',
	'gphelmet',
	'wattire',
	'throwingstars',
	'wcap',
	'phelmet',
	'wgloves',
	'wbreeches',
	'tshirt2',
	'tshirt0',
	'tshirt1',
	// "tshirt3",
	// "tshirt4"
];

setInterval(() => {
	for (let i = 0, len = character.isize; i < len; i++) {
		let item = character.items[i];
		if (
			whitelist.includes(item?.name) &&
			(item?.level ?? 0) < 1 &&
			!item?.p
		) {
			sell(i);
		}
	}
}, 5000);

const USE_HP = { item: 'hp' };
setInterval(() => {
	if (character.hp < character.max_hp - 100 && can_use('use_hp')) {
		parent.socket.emit('use', USE_HP);
	}
}, 100);

const distance_to_point = (x, y) => {
	return Math.sqrt(
		Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2)
	);
};

let STATE = 'guard';

function state_detector() {
	if (tree_exists && !character.s.holidayspirit) {
		STATE = 'tree';
	} else if (can_use('fishing') && ensure_equipped(ROD_FILTER, 'mainhand')) {
		STATE = 'fishing';
	} else if (can_use('mining') && ensure_equipped('pickaxe', 'mainhand')) {
		STATE = 'mining';
	} else {
		STATE = 'guard';
	}
}

let moving = false;

function move_to(location, callback) {
	if (
		can_move_to(location.x, location.y) &&
		distance_to_point(location.x, location.y) > 1 &&
		character.map == location.map
	) {
		move(location.x, location.y);
	} else if (!moving && distance_to_point(location.x, location.y) > 2) {
		moving = true;
		Mover.move_by_path(location, () => {
			moving = false;
		});
	}
	if (
		character.map == location.map &&
		distance_to_point(location.x, location.y) < 1
	) {
		callback?.();
	}
}

const ensure_equipped = (() => {
	const EQUIP_ADAPTABLE = {
		num: 0,
		slot: '',
	};
	const EQUIP_ADAPTER = Adapter('num', 'slot');
	return (item_filter, slot) => {
		switch (typeof item_filter) {
			case 'function':
				if (!item_filter(character.slots[slot])) {
					const index = get_index_of_item(item_filter);
					if (index != -1) {
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						return true;
					}
					return false;
				}
				return true;
			case 'string':
				if (character.slots[slot]?.name != item_filter) {
					const index = get_index_of_item(item_filter);
					if (index != -1) {
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						return true;
					}
					return false;
				}
				return true;
		}
	};
})();
const go_fishing = () => {
	if (!character.c.fishing) {
		use_skill('fishing');
	}
};
const go_mining = () => {
	if (!character.c.mining) {
		use_skill('mining');
	}
};
setInterval(state_detector, 1000);

// const guard_location = { x: 115, y: -1915, map: "desertland" };
const guard_location = { x: -500, y: -1415, map: 'desertland' };
// const guard_location = { x: 1337, y: 420, map: "main" }
const fishing_location = { x: -1367, y: -15, map: 'main' };
const mining_location = { x: 279, y: -105, map: 'tunnel' };
setInterval(() => {
	return;
	if (character.targets > 0) {
		if (can_use('scare') && ensure_equipped(JACKO_FILTER, 'orb')) {
			use_skill('scare');
		}
	} else {
		ensure_equipped(FTRINKET_FILTER, 'orb');
	}
	switch (STATE) {
			// case "banking":
			//   break;
		case 'tree':
			happy_holidays();
			break;
		case 'guard':
			move_to(guard_location);
			break;
		case 'fishing':
			move_to(fishing_location, go_fishing);
			break;
		case 'mining':
			move_to(mining_location, go_mining);
			break;
	}
}, 1000);


let banking = false;
let should_bank = true;
let to_bank_gold = 100_000_000_000;
// Object<ItemID, [Level | Count, Pack]>
const deposit_whitelist = {
	suckerpunch: [0, 0],
	crabclaw: [10, 1],
	lantern: [0, 2],
	oozingterror: [0, 4],
	harbringer: [0, 4],
	// greenenvelope: [1, 1],
	pvptoken: [1, 1],
},
	  shiny_bank_pack = 5;
setInterval(() => {
	return;
	let local_banking = false;
	if (character.gold > to_bank_gold) {
		local_banking = true;
	} else {
		for (let i = 0; i < 42; i++) {
			let item = character.items[i];
			if (item) {
				if (deposit_whitelist[item.name]) {
					let list_definition = deposit_whitelist[item.name];
					let G_definition = G.items[item.name];
					if (
						G_definition.upgrade ||
						G_definition.compound ||
						G_definition.scroll
					) {
						if (item.level >= list_definition[0]) {
							local_banking = true;
							break;
						}
					} else {
						if ((item.q || 1) >= list_definition[0]) {
							local_banking = true;
							break;
						}
					}
				} else if (item.p && !item.p.chance && false) {
					local_banking = true;
					break;
				}
			}
		}
	}
	banking = local_banking;
	if (banking) {
		if (character.map != 'bank') {
			if (!moving && !smart.moving && !character.moving) {
				moving = true;
				Mover.move_by_path({ x: 0, y: 0, map: 'bank' }, () => {
					moving = false;
				});
			}
		} else {
			if (character.gold > to_bank_gold) {
				parent.socket.emit('bank', {
					operation: 'deposit',
					amount: character.gold - (character.gold % to_bank_gold),
				});
			}
			for (let i = 0; i < 42; i++) {
				let item = character.items[i];
				if (item) {
					if (deposit_whitelist[item.name]) {
						let list_definition = deposit_whitelist[item.name];
						let G_definition = G.items[item.name];
						if (
							G_definition.upgrade ||
							G_definition.compound ||
							G_definition.scroll
						) {
							let bank_pack = list_definition[1];
							if (item.level >= list_definition[0]) {
								parent.socket.emit('bank', {
									operation: 'swap',
									inv: i,
									str: -1,
									pack: 'items' + bank_pack,
								});
							}
						} else {
							if ((item.q || 1) >= list_definition[0]) {
								let bank_pack = list_definition[1];
								parent.socket.emit('bank', {
									operation: 'swap',
									inv: i,
									str: -1,
									pack: 'items' + bank_pack,
								});
							}
						}
					} else if (item.p && !item.p.chance) {
						parent.socket.emit('bank', {
							operation: 'swap',
							inv: i,
							str: -1,
							pack: 'items' + shiny_bank_pack,
						});
					}
				}
			}
		}
	}
}, 1000);
let luck_targets = ['Rael', 'Raelina', 'Geoffriel', 'AriaHarper'];
let luck_target = 0;
setInterval(() => {
	use_skill(
		'mluck',
		parent.entities[
			luck_targets[
				(luck_target = ++luck_target % luck_targets.length)
			]
		] ?? character
	);
	if(character.mp + 500 < character.max_mp) {
		use_skill("use_mp");
	}
}, 2100);
const get_index_of_item = (filter) => {
	if (filter == null) {
		return null;
	}
	switch (typeof filter) {
		case 'function':
			return character.items.findIndex(filter);
		case 'string':
			return character.items.findIndex((item) => {
				return item?.name == filter;
			});
	}
};

const check_present = (name) => name in parent.entities;

const cm_handler = (() => {
	return ({ name, message: data }) => {
		if (group.includes(name)) {
			if (typeof data == 'object') {
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {}
				switch (data) {
					case 'yo, I need some pump':
						if (check_present(name)) {
							send_item(
								name,
								get_index_of_item(PUMPKIN_FILTER),
								1
							);
						}
						break;
					case 'yo, I need some bunny':
						if (check_present(name)) {
							send_item(name, get_index_of_item(BUNNY_FILTER), 1);
						}
						break;
					case 'yo, I need some gold':
						send_gold(name, 20000);
						break;
				}
			}
		}
	};
})();
parent.socket.on('cm', (data) => {
	cm_handler(data);
});
let doUpgrades = false;
