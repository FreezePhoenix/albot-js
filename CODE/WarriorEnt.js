const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const {
	Lazy,
	Adapter,
	Targeter,
	Skills: { hardshell, taunt, warcry, curse, darkblessing, absorb },
	Mover,
	ItemFilter,
	Exchange,
} = await proxied_require(
	'Exchange.js',
	'Mover.js',
	'Lazy.js',
	'Adapter.js',
	'Targeter.js',
	'GiveawayJoin.js',
	'Skills.js',
	'ItemFilter.js'
);
// Exchange("candy1", ({reward, num}) => {
//   send_item("AriaHarper", num);
// });
Mover.init(smart, G, smart_move);
let range_multiplier = 1;
if (character.ctype == 'warrior') {
	range_multiplier = 0.5;
}

let curEvent = null;
let moving = false;

function move_to(location, callback) {
	if (!moving) {
		if (character.map == location.map) {
			if (distance_to_point(location.x, location.y) > 2) {
				if (can_move_to(location.x, location.y)) {
					moving = false;
					move(location.x, location.y);
				} else {
					moving = true;
					Mover.move_by_path(location, () => {
						moving = false;
					});
				}
			} else {
				callback?.();
			}
		} else {
			moving = true;
			Mover.move_by_path(location, () => {
				moving = false;
			});
		}
	} else {
		if (distance_to_point(location.x, location.y) < 2) {
			callback?.();
			moving = false;
		}
	}
}
let tree = false;
parent.socket.emit('merchant', {
	close: 1,
});
const tree_exists = G.maps.main.npcs.find(({ id }) => id == 'newyear_tree'),
	pi = Math.PI,
	character_name = character.name,
	tier_one_gear = ['coat', 'pants', 'gloves', 'shoes'];

function get_log(log) {
	return localStorage.getItem(log + ':' + character.name);
}

function handle_death() {
	setTimeout(() => {
		// parent.socket.emit("respawn");
		send_cm('Firenus', 'teleport');
	});
}

function happy_holidays() {
	// If first argument of "smart_move" includes "return"
	// You are placed back to your original point
	tree = true;
	let xmas_tree = G.maps.main.npcs.find(({ id }) => id === 'newyear_tree');
	move_to(
		{
			x: 0,
			y: 0,
			map: 'main',
		},
		() => {
			tree = false;
			// This executes when we reach our destination
			parent.socket.emit('interaction', {
				type: 'newyear_tree',
			});
			say('Happy Holidays!');
		}
	);
}
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = ['ent'],
	state = 'farm',
	group = ['Geoffriel', 'Rael', 'Raelina'],
	to_party = ['Rael', 'Raelina', 'Geoffriel'],
	party_leader = 'Rael',
	merchant = 'AriaHarper',
	priest = 'Geoffriel',
	warrior_tank = false,
	need_priest = false,
	min_potions = 18000, //The number of potions at which to do a resupply run.
	target;
let mana = character.name == 'Geoffriel' ? 'mpot1' : 'mpot0',
	health = 'hpot0',
	potion_types = [health, mana]; //The types of potions to keep supplied.
// /*

// */
let to_sell = new Set([
	'molesteeth',
	'gemfragment',
	'helmet',
	'wbreeches',
	'quiver',
	'ringsj',
	'hpamulet',
	'intamulet',
	'dexamulet',
	'stramulet',
]);
let to_send = new Set([
	'networkcard',
	'wshoes',
	'glitch',
	'svenom',
	'offeringp',
	'goldenegg',
	'essenceofnature',
	'greenenvelope',
	'funtoken',
	'monstertoken',
	'wcap',
	'feather0',
	'egg0',
	'egg1',
	'egg2',
	'egg3',
	'egg4',
	'egg5',
	'egg6',
	'egg7',
	'egg8',
	'candy1',
	'x0',
	'x1',
	'x2',
	'x3',
	'x4',
	'x5',
	'x6',
	'x7',
	'x8',
	'mcape',
	'firestaff',
	'fireblade',
	'armorbox',
	'skullamulet',
	'weaponbox',
	'gem1',
	'cupid',
	'hpbelt',
	'essenceoffrost',
	'intring',
	'dexring',
	'strring',
	'candypop',
	'intbelt',
	'dexbelt',
	'strbelt',
	'redenvelopev4',
	'candy0v3',
	'candy1v3',
	'gem0',
	'seashell',
	'lostearring',
	'mistletoe',
	'candycane',
	'ornament',
	'intearring',
	'dexearring',
	'vitearring',
	'strearring',
	'vitscroll',
	'wbook0',
	'sshield',
	'woodensword',
	'candy0',
	'smoke',
	'ascale',
	'pleather',
	'vitring',
	'wattire',
	'leather',
	'phelmet',
	'oozingterror',
]);
// /*
setInterval(() => {
	if (character.name === party_leader) {
		for (let i = 1, len = to_party.length; i < len; i++) {
			const name = to_party[i];
			if (!(name in parent.party)) {
				send_party_invite(name);
			}
		}
	} else {
		if (character.party) {
			if (character.party != party_leader) {
				parent.socket.emit('party', {
					event: 'leave',
				});
			}
		} else {
			if (party_leader == 'DoubleG') {
				send_cm('DoubleG', {
					data: 'partyInvite',
					id: character.name,
				});
			} else {
				send_party_request(party_leader);
			}
		}
	}
}, 1000 * 1);
// */

function merchant_near() {
	return get_player(merchant) != null;
}

const ensure_equipped_batch = (() => {
	return (filters_and_slots) => {
		let call = [];
		let success = true;
		for (let i = 0; i < filters_and_slots.length; i++) {
			let [item_filter, slot] = filters_and_slots[i];
			if (!item_filter(character.slots[slot])) {
				const index = character.items.findIndex(item_filter);
				if (index == -1) {
					success = false;
					break;
				}
				call.push({ num: index, slot: slot });
				let temp = character.items[index];
				character.items[index] = character.slots[slot];
				character.slots[slot] = temp;
			}
		}
		if (call.length == 1) {
			let result = parent.push_deferred('equip');
			parent.socket.emit('equip', call[0]);
			return result;
		} else {
			let result = parent.push_deferred('equip_batch');
			parent.socket.emit('equip_batch', call);
			return result;
		}
	};
})();

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

const D_HELMET_FILTER = ItemFilter.ofName('helmet').level('13', '==').build();
const D_EARRING_FILTER = ItemFilter.ofName('cearring').level('4', '==').build();
const D_AMULET_FILTER = ItemFilter.ofName('intamulet').level('5', '==').build();
const H_STAFF_FILTER = ItemFilter.ofName('lmace').level('9', '==').build();
const D_STAFF_FILTER = ItemFilter.ofName('lmace').level('9', '==').build();
const D_CHEST_FILTER = ItemFilter.ofName('coat').level('13', '==').build();
const D_OFFHAND_FILTER = ItemFilter.ofName('wbookhs').level('3', '==').build();
const D_WINGS_FILTER = ItemFilter.ofName('angelwings').level('8', '==').build();
const D_PANTS_FILTER = ItemFilter.ofName('pants').level('13', '==').build();
const D_RING1_FILTER = ItemFilter.ofName('zapper').build();
const D_RING2_FILTER = ItemFilter.ofName('cring').level('4', '==').build();
const D_ORB_FILTER = ItemFilter.ofName('jacko').level('5', '==').build();
const D_GLOVE_FILTER = ItemFilter.ofName('gloves').level('13', '==').build();
const D_BOOTS_FILTER = ItemFilter.ofName('wingedboots')
	.level('9', '==')
	.build();

const L_HELMET_FILTER = ItemFilter.ofName('wcap').level('8', '==').build();
const L_CHEST_FILTER = ItemFilter.ofName('wattire').level('6', '==').build();
const L_PANTS_FILTER = ItemFilter.ofName('wbreeches').level('6', '==').build();
const L_BOOTS_FILTER = ItemFilter.ofName('wshoes').level('9', '==').build();

let PDPS_SET = [
	[D_GLOVE_FILTER, 'gloves'],
	[D_BOOTS_FILTER, 'shoes'],
	[D_ORB_FILTER, 'orb'],
	[D_RING2_FILTER, 'ring2'],
	[D_PANTS_FILTER, 'pants'],
	[D_RING1_FILTER, 'ring1'],
	[D_WINGS_FILTER, 'cape'],
	[D_OFFHAND_FILTER, 'offhand'],
	[D_CHEST_FILTER, 'chest'],
	[D_STAFF_FILTER, 'mainhand'],
	[D_AMULET_FILTER, 'amulet'],
	[D_EARRING_FILTER, 'earring2'],
	[D_HELMET_FILTER, 'helmet'],
];

if (character.name == 'Geoffriel') {
	const BOOSTER_FILTER = new ItemFilter()
		.names('luckbooster', 'goldbooster')
		.build();
	const G_GLOVE_FILTER = ItemFilter.ofName('handofmidas').build();
	const G_PANTS_FILTER = ItemFilter.ofName('wbreeches')
		.level('6', '==')
		.build();
	const G_RING1_FILTER = ItemFilter.ofName('goldring')
		.property('glitched')
		.build();
	const G_RING2_FILTER = ItemFilter.ofName('goldring')
		.property(false)
		.build();

	let GOLD_SET = [
		[G_RING1_FILTER, 'ring1'],
		[G_PANTS_FILTER, 'pants'],
		[G_RING2_FILTER, 'ring2'],
		[G_GLOVE_FILTER, 'gloves'],
		[L_HELMET_FILTER, 'helmet'],
		[L_CHEST_FILTER, 'chest'],
		[L_PANTS_FILTER, 'pants'],
		[L_BOOTS_FILTER, 'shoes'],
	];

	const RESET_GEAR = () => {
		shift(character.items.findIndex(BOOSTER_FILTER), 'luckbooster');
		ensure_equipped_batch(PDPS_SET);
	};
	const LOOT_CHEST = (id) => {
		parent.socket.emit('open_chest', {
			id: id,
		});
	};
	RESET_GEAR();
	parent.socket.on('drop', ({ id, x, y }) => {
		if (distance_to_point(x, y) < 200) {
			let looted = false;
			let switched_midas = false;
			let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
			ensure_equipped_batch(GOLD_SET);
			shift(index_of_booster, 'goldbooster');
			LOOT_CHEST(id);
			setTimeout(RESET_GEAR, 1000);
		}
	});
}
setInterval(() => {
	if (num_items(mana) < min_potions) {
		buy(mana, 1000);
	}
	if (num_items(health) < min_potions) {
		buy(health, 1000);
	}
	if (character.name == 'Geoffriel') {
		if (!ensure_equipped('elixirluck', 'elixir')) {
			buy('elixirluck');
		}
	}

	if (merchant_near()) {
		let sold = 0,
			max_send = 8;
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[i];
			if (item != null) {
				if (
					(to_sell.has(item.name) &&
						sold < max_send &&
						(item.level == 0 || item.level == null)) ||
					tier_one_gear.includes(item.name)
				) {
					send_item(merchant, i, 10);
					sold++;
				} else if (
					(to_send.has(item.name) &&
						sold < max_send &&
						(item.level == 0 || item.level == null)) ||
					tier_one_gear.includes(item.name)
				) {
					send_item(merchant, i, 10);
					sold++;
				}
			}
		}
		if (character.gold > 500000) {
			send_gold(merchant, character.gold - 500000);
		}
		if (character.ctype == 'warrior') {
			if (!ensure_equipped('pumpkinspice', 'elixir')) {
				send_cm(merchant, 'yo, I need some pump');
			}
		}
	}
}, 500);

parent.socket.on('cm', async function (a) {
	let name = a.name;
	let data = await JSON.parse(a.message);
	// function on_cm(name, data) {
	if (
		group.includes(name) ||
		to_party.includes(name) ||
		name == 'AriaHarper'
	) {
		if (typeof data == 'object') {
			if (data.command) {
				switch (data.command) {
					case 'send_cm':
						send_cm(data.name, data.data);
						break;
					case 'server':
						name == 'AriaHarper' && parent.switch_server(data.data);
						break;
					case 'delete_chest':
						delete parent.chests[data.data];
						break;
				}
			}
		} else {
			switch (data) {
				case 'shutdown':
					name == 'AriaHarper' && parent.shutdown();
					break;
				case 'shutdown_all':
					name == 'AriaHarper' && parent.shutdown_all();
					break;
			}
		}
	}
});
parent.socket.on('server_message', (data) => {
	if (JSON.stringify(data).includes('shutdown')) {
		parent.shutdown_all();
	}
});
parent.socket.on('request', ({ name }) => {
	console.log('Party Request');
	if (to_party.indexOf(name) != -1 && name != merchant) {
		accept_party_request(name);
	}
});

parent.socket.on('invite', ({ name }) => {
	console.log('Party Invite', name);
	if (to_party.indexOf(name) != -1 || name == party_leader) {
		accept_party_invite(name);
	}
});

function needs_mp(entity) {
	return entity.mp / entity.max_mp < 0.75;
}

function needs_hp(entity) {
	return entity && entity.hp / entity.max_hp < 0.75;
}

function use_hp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name?.startsWith?.('hpot')) {
			equip(i);
			break;
		}
	}
}

async function use_mp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name == mana) {
			try {
				await equip(i);
			} catch (e) {
				console.log('wth', e);
			}
			break;
		}
	}
}

function get_index_of_item(name, max_level) {
	if (typeof name == 'function') {
		return character.items.findIndex(name); // name is a filter;
	} else {
		return character.items.findIndex((item) => {
			return item?.name == name;
		});
	}
}

function is_elixir_equiped(elixir) {
	return character.slots.elixir?.name == elixir;
}

// Staying Alive: Part 1
setInterval(() => {
	if (character.map === 'jail') {
		parent.socket.emit('leave');
	}
	parent.ping();
}, 500);

// Staying Alive: Part 2
setTimeout(async () => {
	while (true) {
		try {
			if (needs_mp(character)) {
				await use_mp();
				await sleep(2000);
			} else {
				await sleep(100);
			}
		} catch (e) {
			await sleep(100);
		}
	}
}, 100);

if (character.ctype == 'warrior') {
	const JACKO_FILTER = ItemFilter.ofName('jacko').build();
	const ORB_FILTER = new ItemFilter().level(4).name('orbofstr').build();
	setInterval(() => {
		let targeted = false;
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (parent.entities[id].target == character.name) {
				if (
					!get_player(priest) ||
					get_player(priest).rip ||
					parent.entities[id].mtype == 'grinch'
				) {
					targeted = true;
					break;
				}
			}
		}
		if (targeted && can_use('scare')) {
			if (ensure_equipped(JACKO_FILTER, 'orb')) {
				use_skill('scare');
				ensure_equipped(ORB_FILTER, 'orb');
			}
		} else {
			ensure_equipped(ORB_FILTER, 'orb');
		}
	}, 1000);
}

const kiting_origin = {
		x: -450,
		y: -1240,
	},
	kiting_range = (2 * character.range) / 3;

function determine_clockwise(origin, target, range) {
	let cw = get_kite_point(origin, target, range, true);
	let acw = get_kite_point(origin, target, range, false);
	return distance(character, cw) < distance(character, acw);
}

// determines the coodinates where the character:
// * in range to attack the enemy
// * should drag the enemy in circles around the origin point
function get_kite_point(origin, target, range, clockwise) {
	let mod = 1;
	if (!clockwise) {
		mod = -1;
	}

	let opp = target.y - origin.y;
	let adj = target.x - origin.x;
	let hyp = Math.sqrt(Math.pow(opp, 2) + Math.pow(adj, 2));

	let theta = null;
	let yDif = null;
	if (adj > 0) {
		theta = Math.asin(opp / hyp) + mod * ((8 * Math.PI) / 12);
		yDif = range * Math.sin(theta);
	} else {
		theta = Math.asin(opp / hyp) + mod * ((4 * Math.PI) / 12);
		yDif = -range * Math.sin(theta);
	}
	let xDif = range * Math.cos(theta);
	return {
		x: origin.x - xDif,
		y: origin.y - yDif,
	};
}

const NEEDS_PRIEST = new Lazy(to_party)
	.map(get_player)
	.filter(needs_hp)
	.while(() => can_use('attack'));
//This function contains our logic for when we're farming mobs
const afflicted = (status_name) => status_name in character.s;

function state_controller() {
	//Default to farming
	let new_state = 'farm';
	if (
		tree_exists &&
		!character.s.holidayspirit &&
		find_viable_target_ignore_fire()?.target == null
	) {
		new_state = 'tree';
	} else if (curEvent != null) {
		new_state = 'event';
	}
	if (state != new_state) {
		state = new_state;
	}
}

let NOW = performance.now();

const LOOP = async () => {
	while (true) {
		// curEvent = next_event(curEvent);
		NOW = performance.now();
		// if (curEvent) {
		// await farm(curEvent);
		// } else {
		await farm();
		// }
		NOW = performance.now();

		if (character.name == 'Geoffriel') {
			await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
		} else if (character.s.sugarrush) {
			await sleep(Math.ceil(Math.max(0, ms_until('attack', NOW))));
		} else {
			await sleep(
				Math.max(0, Math.ceil(Math.max(0, ms_until('attack', NOW)))) + 1
			);
		}
	}
};

setTimeout(LOOP, 100, true);

let SUGAR_MAINHAND_FILTER = ItemFilter.ofName('candycanesword')
	.level('1', '==')
	.build();
let SUGAR_OFFHAND_FILTER = ItemFilter.ofName('candycanesword')
	.level('1', '==')
	.build();
let FIRE_FILTER = ItemFilter.ofName('fireblade').level('10', '==').build();

let SUGAR_SET = [
	[SUGAR_MAINHAND_FILTER, 'mainhand'],
	[SUGAR_OFFHAND_FILTER, 'offhand'],
];
let DPS_SET = [
	[FIRE_FILTER, 'mainhand'],
	[FIRE_FILTER, 'offhand'],
];

if (character.name == 'Rael' || character.name == 'Raelina') {
	parent.socket.on('hit', (data) => {
		if (data.hid == character.name && data.source == 'attack') {
			ensure_equipped_batch(DPS_SET);
		}
	});
}

let LOGGED = 0;

async function farm(location) {
	switch (character.ctype) {
		case 'priest':
			// Basic states to determine if we can heal others. Prevents high spam.
			NEEDS_PRIEST.forEach((entity) => {
				if (can_heal(entity)) {
					let monster_target = character.target;
					heal(entity);
					parent.socket.emit('target', {
						id: monster_target,
					});
					return false;
				}
				return true;
			});
			break;
	}
	let attack_target = find_viable_target();

	if (attack_target != null) {
		if (attack_target.target == null && character.ctype == 'priest') {
			parent.socket.emit('skill', {
				name: 'zapperzap',
				id: attack_target.id,
			});
		}
		if (
			parent.distance(attack_target, character) <
			character.range + character.xrange
		) {
			if (can_use('curse', NOW)) {
				curse(attack_target.id);
			}
			if (can_use('attack', NOW)) {
				switch (character.ctype) {
					case 'priest':
						if (
							can_use('darkblessing') &&
							!afflicted('darkblessing') &&
							afflicted('warcry')
						) {
							darkblessing();
						}
						if (attack_target.hp > 20000) {
							attack(attack_target);
						}
						break;
					case 'warrior':
						if (can_use('warcry') && !afflicted('warcry')) {
							warcry();
						}
						try {
							if (can_use('attack', NOW)) {
								let r = Promise.race([
									attack(attack_target, true),
									sleep(character.ping * 4),
								]);
								if (character.s.sugarrush == null) {
									ensure_equipped_batch(SUGAR_SET);
								}

								if ((await r) == undefined) {
									console.log(
										'Attack promise seems to have been dropped'
									);
									parent.resolve_deferred(
										'attack',
										undefined
									);
								}
							}
						} catch (e) {
							switch (e.reason) {
								case 'too_far':
									// console.error('Too far... ', JSON.stringify(e));
									await sleep(10);
									break;
								case 'cooldown':
									console.error('TIME ', JSON.stringify(e));
									await sleep(e.ms);
									return;
								case 'not_there':
									return;
								case 'no_mp':
									if (LOGGED++ < 10) {
										console.error(
											'WHY IS THIS HAPPENING? WE ARE OUT OF MP: ' +
												character.name
										);
									}
									await sleep(100);
									return;
								default:
									console.log(e);
									await sleep(10);
									break;
							}
						}
						break;
					default:
						attack(attack_target);
				}
			}
			if (character.ctype == 'warrior' && attack_target.mtype == 'ent') {
				console.log(distance(character, attack_target));
				let offset = 5;
				if (character.name == 'Rael') {
					offset = -offset;
				}
				if (attack_target.mtype == 'ent') {
					if (
						(character.x != 40 || character.y != -1920 + offset) &&
						!character.moving
					) {
						move_to({
							x: 40,
							y: -1920 + offset,
							map: attack_target.map,
						});
					}
				} else {
					move_to({
						x: attack_target.x,
						y: attack_target.y,
						map: attack_target.map,
					});
				}
			} else {
				if (attack_target.mtype == 'ent') {
					move_to({
						x: 0,
						y: -1920,
						map: attack_target.map,
					});
				} else {
					move_to({
						x: attack_target.x,
						y: attack_target.y,
						map: attack_target.map,
					});
				}
			}
		} else if (
			character.ctype == 'priest' ||
			attack_target.mtype != 'ent'
		) {
			move_to({
				x: attack_target.x,
				y: attack_target.y,
				map: attack_target.map,
			});
		}
	} else if (character.name == 'Geoffriel') {
		// We still want to avoid flaming scorpions.
		if (find_viable_target_ignore_fire() == null) {
			// Move the priest outside of the spawn
			move_to(
				location ?? {
					x: -33,
					y: -1959,
					map: 'desertland',
				}
			);
		}
	} else {
		let offset = 5;
		if (character.name == 'Rael') {
			offset = -offset;
		}
		// Move the warriors into the center of the spawn
		move_to(
			location ?? {
				x: 40,
				y: -1920 + offset,
				map: 'desertland',
			}
		);
	}
	await sleep(10);
}

//Returns the number of items in your inventory for a given item name;
function num_items(name) {
	let total = 0;
	for (let item of character.items) {
		if (item?.name == name) {
			total += item.q ?? 1;
		}
	}
	return total;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
	return Math.hypot(character.real_x - x, character.real_y - y);
}

var targeter = new Targeter(monster_targets, [...to_party, ...group], {
	RequireLOS: false,
	TagTargets: character.name == 'Geoffriel',
	Solo: false,
});

function next_event(curEvent) {
	return null;
}

function find_viable_target() {
	if (curEvent == null) {
		return targeter.GetPriorityTarget(1, false, /* ignore_fire */ true)[0];
	} else {
		return targeter.GetPriorityTarget(
			1,
			false,
			/* ignore_fire */ true,
			true
		)[0];
	}
}

function find_viable_target_ignore_fire() {
	if (curEvent == null) {
		return targeter.GetPriorityTarget(1, false, true)[0];
	} else {
		return targeter.GetPriorityTarget(1, false, false, true)[0];
	}
}
