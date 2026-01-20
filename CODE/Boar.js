const {
	restock,
	Mover,
	Exchange,
	Dismantle,
	ItemFilter,
	Adapter
} = await proxied_require(
	'Mover.js',
	'Exchange.js',
	'Dismantle.js',
	'restock.js',
	'ItemFilter.js',
	'Adapter.js'
);

function get(name) {
	// persistent get function that works for serializable objects
	try {
		return JSON.parse(localStorage.getItem('cstore_' + name));
	} catch (e) {
		return null;
	}
}

function set(name, value) {
	// persistent set function that works for serializable objects
	try {
		localStorage.setItem('cstore_' + name, JSON.stringify(value));
		return true;
	} catch (e) {
		game_log(
			'set() call failed for: ' + name + ' reason: ' + e,
			colors.code_error
		);
		return false;
	}
}

let destroyed = get('destroyed') ?? 0;
set_message(`D: ${destroyed.toLocaleString()}`);

function increment_destroyed() {
	destroyed++;
	// set_message(`D: ${destroyed.toLocaleString()}`);
	set('destroyed', destroyed);
}

restock({
	sell: {
		offeringp: [2500000, 500, -1],
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
	if (character.party != undefined && !character.party?.startsWith?.("earth")) {
		parent.socket.emit('party', { event: 'leave' });
	}
	if(character.party == undefined) {
		parent.socket.emit('party',{event:'request',name:'earthWar'});
	}
}, 30000);

Mover.init(smart, G, smart_move);

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
	// "spookyamulet",
	'hpamulet',
	'wbook0',
	'wbookhs',
	'iceskates',
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
	'xmashat',
	'ornamentstaff',
	'candycanesword',
];

let destroy = [
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
			destroy.includes(item?.name) &&
			(item?.level ?? 0) < 1 &&
			!item?.p
		) {
			sell(i);
			continue;
		}
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

// const guard_location = { x: 115, y: -1915, map: "desertland" };
const guard_location = { x: -500, y: -1415, map: 'desertland' };
// const guard_location = { x: 1337, y: 420, map: "main" }
const fishing_location = { x: -1367, y: -15, map: 'main' };
const mining_location = { x: 279, y: -105, map: 'tunnel' };
setInterval(() => {
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
	if (!smart.moving) {
		use_skill(
			'mluck',
			parent.entities[
				luck_targets[
					(luck_target = ++luck_target % luck_targets.length)
				]
			] ?? character
		);
		parent.socket.emit('use', {
			item: 'mp',
		});
	}
}, 4000);
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
// const socket = parent.socket;

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
					case 'shutdown':
						parent.shutdown();
						break;
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
function on_destroy() {
	parent.socket.off('cm');
}
let doUpgrades = false;
if (doUpgrades) {
	setTimeout(async function () {
		const {
			restock,
			Mover,
			Exchange,
			Dismantle,
			ItemFilter,
			Adapter,
			EntityPresenceFilter,
		} = await proxied_require(
			'Mover.js',
			'Exchange.js',
			'Dismantle.js',
			'restock.js',
			'ItemFilter.js',
			'Adapter.js',
			'EntityPresenceFilter.js'
		);
		function swap(a, b) {
			// inventory move/swap
			parent.socket.emit('imove', { a: a, b: b });
			return parent.push_deferred('imove');
		}
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
		const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
		const LUCKY_BLADE = ItemFilter.ofName('fireblade')
			.level('4', '<=')
			.property('lucky')
			.build();
		const SHINY_BLADE = ItemFilter.ofName('fireblade')
			.level('4', '<=')
			.property('shiny')
			.build();
		const PRODUCED_FILTER = ItemFilter.ofName('fireblade')
			.level('9', '==')
			.build();
		const BLADE_FILTER = ItemFilter.ofName('blade').build();
		const FIREBLADE_FILTER = ItemFilter.ofName('fireblade')
			.level('8', '<=')
			.property(false)
			.build();
		const FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property(false)
			.build();
		const SHINY_FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property('shiny')
			.build();
		const LUCKY_FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property('lucky')
			.build();
		const GREED_FILTER = ItemFilter.ofName('essenceofgreed').build();
		const T0_SCROLL = ItemFilter.ofName('scroll0').build();
		const T1_SCROLL = ItemFilter.ofName('scroll1').build();
		const T2_SCROLL = ItemFilter.ofName('scroll2').build();
		const PRIMLING_FILTER = ItemFilter.ofName('offeringp').build();
		const PRIMORDIAL_FILTER = ItemFilter.ofName('offering').build();

		let chances = [99.99, 99.99, 99.99, 92.0, 94.0, 74.0, 60.0, 42.0, 9.79];
		// let chances = [99.99, 97.00, 94.00, 92.00, 82.00, 62.00, 60.00, 42.00, 9.79];
		let failstack_offering_filters = [];
		let failstack_offering_filters_exact = [];
		for (let i = 0; i < chances.length + 1; i++) {
			failstack_offering_filters[i] = ItemFilter.ofName('helmet')
				.level(i, '<=')
				.build();
			failstack_offering_filters_exact[i] = ItemFilter.ofName('helmet')
				.level(i, '==')
				.build();
		}
		let failstack_scrolls = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2];
		let gains = [0, 0, 0, 0, 0, 1, 3.58, 3.92, 2.06, 0.29];
		let scrolls = [1, 2, 2, 2, 2, 2, 2, 2, 2];
		let offering = [0, 0, 0, 1, 1, 1, 1, 2, 2];
		const getScrollFilter = (level) => {
			if (level == 0) {
				return T0_SCROLL;
			}
			if (level == 1) {
				return T1_SCROLL;
			}
			if (level == 2) {
				return T2_SCROLL;
			}
		};
		const getOfferingFilter = (level) => {
			if (level == 0) {
				return null;
			}
			if (level == 1) {
				return PRIMLING_FILTER;
			}
			if (level == 2) {
				return PRIMORDIAL_FILTER;
			}
		};
		while (true) {
			let pblade = get_index_of_item(LUCKY_BLADE);
			if (pblade == -1) {
				pblade = get_index_of_item(SHINY_BLADE);
			}
			if (pblade != -1) {
				parent.socket.emit('dismantle', { num: pblade });
			}
			if (num_items(PRODUCED_FILTER) >= 8) {
				break;
			}
			// Check if we have a FireBlade
			let fb_i = get_index_of_item(FIREBLADE_FILTER);
			if (fb_i == -1) {
				// In this branch, we don't have a FireBlade... unfortunate.
				// Check if we have fire essence.
				let fire_index = get_index_of_item(FIREESSENCE_FILTER);
				if (fire_index == -1) {
					// We don't have any fire essence. Abort.
					return;
				}
				let blade_index = get_index_of_item(BLADE_FILTER);
				if (blade_index == -1) {
					// Buy a blade, and then go to the next iteration of the loop.
					await buy('blade');
					continue;
				}
				parent.socket.emit('craft', {
					items: [
						[0, fire_index],
						[1, blade_index],
					],
				});
				await sleep(200);
				continue;
			}
			let level = character.items[fb_i].level;
			let scroll_i = get_index_of_item(getScrollFilter(scrolls[level]));
			if (scroll_i == -1) {
				await buy(`scroll${scrolls[level]}`);
				continue;
			}
			let offeringInd = get_index_of_item(
				getOfferingFilter(offering[level])
			);
			if (offeringInd == -1) {
				if (offering[level] == 1) {
					// Can't do stuff without primlings, wait for one to come in.
					await sleep(100);
					continue;
				}
				if (offering[level] == 2) {
					await buy('offering');
					continue;
				}
			}
			let chance = await upgrade(fb_i, scroll_i, offeringInd, true);
			if (chance.chance * 100 >= chances[level] || level < 4) {
				console.log(
					`Attempting upgrade: ${level} -> ${
						level + 1
					} with chance ${(chance.chance * 100).toFixed(2)}`
				);
				if (fb_i != 0) {
					if (scroll_i == 0) {
						scroll_i = fb_i;
					}
					if (offeringInd == 0) {
						offeringInd = fb_i;
					}
					await swap(fb_i, 0);
					fb_i = 0;
				}

				if (level > 4) {
					parent.socket.emit('skill', { name: 'massproductionpp' });
				} else {
					parent.socket.emit('skill', { name: 'massproduction' });
				}
				let result = await upgrade(fb_i, scroll_i, offeringInd, false);
				console.log(`Success: ${result.success}`);
			} else {
				let num_failable = num_items(
					failstack_offering_filters_exact[level + 1]
				);
				if (
					num_failable * gains[level + 1] + chance.chance * 100 >=
					chances[level]
				) {
					let failstack_item_index = get_index_of_item(
						failstack_offering_filters_exact[level + 1]
					);
					let failstack_level =
						character.items[failstack_item_index].level ?? 0;
					let failstack_scroll_index = get_index_of_item(
						getScrollFilter(failstack_scrolls[failstack_level])
					);
					if (failstack_scroll_index == -1) {
						await buy(`scroll${failstack_scrolls[failstack_level]}`);
						continue;
					}
					if (
						can_use('mp') &&
						character.mp + 500 < character.max_mp
					) {
						use_skill('mp');
					}
					parent.socket.emit('skill', { name: 'massproduction' });
					console.log(
						`We have enough failstack items of level ${
							level + 1
						} to fail to get from ${(chance.chance * 100).toFixed(
							2
						)} to ${chances[level]}`
					);
					console.log(
						`Attempting failstack: ${failstack_level} -> ${
							failstack_level + 1
						}`
					);
					let result = await upgrade(
						failstack_item_index,
						failstack_scroll_index,
						null,
						false
					);
					console.log(`Failstack success: ${!result.success}`);
					continue;
				}
				let failstack_item_index = get_index_of_item(
					failstack_offering_filters[level]
				);
				if (failstack_item_index == -1) {
					await buy('helmet');
					continue;
				}
				let failstack_level =
					character.items[failstack_item_index].level ?? 0;
				let failstack_scroll_index = get_index_of_item(
					getScrollFilter(failstack_scrolls[failstack_level])
				);
				if (failstack_scroll_index == -1) {
					await buy(`scroll${failstack_scrolls[failstack_level]}`);
					continue;
				}
				/* game_log(
					`Building failstack to raise chance from ${(
						chance.chance * 100
					).toFixed(2)} to ${chances[level]}`
				); // */
				game_log(
					`Attempting failstack: ${failstack_level} -> ${
						failstack_level + 1
					}`
				);
				if (can_use('mp') && character.mp + 500 < character.max_mp) {
					await use_skill('mp');
				}
				if (failstack_level > 4) {
					parent.socket.emit('skill', { name: 'massproductionpp' });
				} else {
					parent.socket.emit('skill', { name: 'massproduction' });
				}
				if (failstack_level == level) {
					if (failstack_item_index == 0) {
						if (failstack_scroll_index == 1) {
							failstack_scroll_index = 0;
						}
						await swap(0, 1);
						failstack_item_index = 1;
					}
				} else {
					if (failstack_item_index != 0) {
						if (failstack_scroll_index == 0) {
							failstack_scroll_index = failstack_item_index;
						}
						await swap(0, failstack_item_index);
						failstack_item_index = 0;
					}
				}
				let result = await upgrade(
					failstack_item_index,
					failstack_scroll_index,
					null,
					false
				);
				if (failstack_level == level) {
					console.log(`Failstack success: ${!result.success}`);
				} else {
					console.log(`Failstack success: ${result.success}`);
				}
			}
		}
	}, 0);
}
