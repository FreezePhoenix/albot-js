let merchant = 'AriaHarper';
const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));
let monster_targets = ['bscorpion'],
	state = 'farm',
	group = ['AriaHarper', 'Rael', 'Raelina', 'Boismon', 'Firenus'],
	to_party = ['AriaHarper', 'Raelina', 'Rael'],
	party_leader = 'AriaHarper';
const {
	restock,
	Mover,
	Exchange,
	Dismantle,
	ItemFilter,
	Adapter,
	Targeter,
  EntityPresenceFilter
} = await proxied_require(
	'Mover.js',
	'Exchange.js',
	'Dismantle.js',
	'restock.js',
	'Targeter.js',
	'ItemFilter.js',
	'Adapter.js',
  'EntityPresenceFilter.js'
);

setInterval(() => {
	if (character.map === 'jail') {
		parent.socket.emit('leave');
	}
	parent.ping();
}, 500);

let curEvent = null;

const kiting_origin = {
		x: -420,
		y: -1250,
	},
	kiting_range = 130;

function determine_clockwise(origin, target, range) {
	let cw = get_kite_point(origin, target, range, true);
	let acw = get_kite_point(origin, target, range, false);
	return distance_to_point(cw.x, cw.y) < distance_to_point(acw.x, acw.y)
		? cw
		: acw;
}

if (typeof ms_until == 'undefined') {
	ms_until = function (skill_name, timestamp = new Date()) {
		if (skill_name in parent.next_skill) {
			return parent.next_skill[skill_name] - timestamp;
		}
		return -Infinity;
	};
}

// determines the coodinates where the character:
// * in range to attack the enemy
// * should drag the enemy in circles around the origin point
const COS_THETA = Math.cos(Math.PI / 2);
const SIN_THETA = Math.sin(Math.PI / 2);
function get_kite_point(origin, target, range, clockwise) {
	let MOD = clockwise ? -1 : 1;

	let DX = target.x - origin.x;
	let DY = target.y - origin.y;
	let HYP = Math.sqrt(DX * DX + DY * DY);

	let scale = range / HYP;

	let NEW_DX = scale * (COS_THETA * DX - MOD * SIN_THETA * DY);
	let NEW_DY = scale * (MOD * SIN_THETA * DX + COS_THETA * DY);

	return {
		x: origin.x + NEW_DX,
		y: origin.y + NEW_DY,
	};
}

if (character.name == 'AriaHarper') {
	setInterval(() => {
		if (
			state == 'farm' &&
			parent.entities["Geoffriel"] == null &&
			character.map == 'desertland' &&
			distance_to_point(kiting_origin.x, kiting_origin.y) < 200
		) {
			let monster = find_viable_target_ignore_fire();
			if (monster) {
				if (monster.mtype != 'bscorpion') {
					return;
				}
				let movePoint = determine_clockwise(
					kiting_origin,
					monster,
					kiting_range
				);
				move(movePoint.x, movePoint.y);
			}
		}
	}, 500);
}

function get(name) {
	// persistent get function that works for serializable objects
	try {
		return localStorage.getItem('cstore_' + name);
	} catch (e) {
		return null;
	}
}


function set(name, value) {
	// persistent set function that works for serializable objects
	try {
		localStorage.setItem('cstore_' + name, value);
		return true;
	} catch (e) {
		game_log(
			'set() call failed for: ' + name + ' reason: ' + e,
			colors.code_error
		);
		return false;
	}
}

parent.socket.emit('merchant', { close: 1 });
let destroyed = JSON.parse(get('destroyed')) ?? 0;
set_message(`D: ${destroyed.toLocaleString()}`);

function increment_destroyed() {
	destroyed++;
	set('destroyed', destroyed);
}

restock({
	sell: {
			offeringp: [2000000, 100, -1],
			t2quiver: [30000000, 1, 0],
	},
	buy: {
    essenceoffire: [ 115000, 9999, -1 ]
  },
});

const ROD_FILTER = ItemFilter.ofName('rod').build();
const LUCK_FILTER = ItemFilter.ofName('elixirluck').build();
const PUMPKIN_FILTER = ItemFilter.ofName('pumpkinspice').build();
const BUNNY_FILTER = ItemFilter.ofName('bunnyelixir').build();

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
	if (character.party == undefined) {
		parent.socket.emit('party', { event: 'request', name: 'Raelina' });
	}
}, 30000);

Exchange('candy1');

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

setInterval(async () => {
	if (num_items('mpot1') < 8000) {
		buy('mpot1', 1000);
	}
	if (num_items('hpot1') < 8000) {
		buy('hpot1', 1000);
	}
	if (!(await ensure_equipped('elixirluck', 'elixir'))) {
		buy('elixirluck');
	}
}, 10000);

const whitelist = [
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

parent.socket.on('request', ({ name }) => {
	console.log('Party Request');
	if (to_party.indexOf(name) != -1 && name != merchant) {
		accept_party_request(name);
	}
});

setInterval(() => {
	for (let i = 0, len = character.isize; i < len; i++) {
		let item = character.items[i];
		if (
			destroy.includes(item?.name) &&
			(item?.level ?? 0) < 1 &&
			!item?.p
		) {
			parent.socket.emit('destroy', { num: i, q: 1, statue: true });
			increment_destroyed();
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

function distance_to_point(x, y) {
	return Math.hypot(character.real_x - x, character.real_y - y);
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

parent.socket.on("ui", (data) => {
  if(data.type == "+$$" && data.seller == character.name) {
    set("buyhistory", get("buyhistory") + "\n" + data.buyer + " " + JSON.stringify(data.item) + " " + (new Date()).toUTCString())
  }
});

const ensure_equipped_batch = async (filters_and_slots) => {
	let call = [];
	for (let i = 0; i < filters_and_slots.length; i++) {
		let [item_filter, slot] = filters_and_slots[i];
		if (!item_filter(character.slots[slot])) {
			const num = character.items.findIndex(item_filter);
			if (num == -1) {
        log(JSON.stringify(item_filter.looking))
				log('Failed while looking for an item.');
				break;
			}
			call.push({ num, slot });
			let temp = character.items[num];
			character.items[num] = character.slots[slot];
			character.slots[slot] = temp;
		}
	}
	if (call.length == 0) {
		return {};
	}
	parent.socket.emit('equip_batch', call);
	return await parent.push_deferred('equip_batch');
};

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

let NOW = performance.now();

const LOOP = async () => {
	while (true) {
		if(parent.entities["Geoffriel"] == null) {
			NOW = performance.now();
	        await farm();
			NOW = performance.now();
	        await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
		} else {
			await sleep(10000);
		}
	}
};

let FARM_LOCATION = {
    x: -420,
    y: -1100,
    map: 'desertland',
};
async function farm(location) {
	let attack_target = find_viable_target();
	if (attack_target != null) {
		let distance_from_target = distance(attack_target, character);
		if (distance_from_target < character.range) {
			if (can_use('attack', NOW)) {
                attack(attack_target);
            }
		}
	} else {
		move_to(FARM_LOCATION);
	}
	await sleep(10);
}

var targeter = new Targeter(monster_targets, [...to_party, ...group], {
	RequireLOS: false,
	TagTargets: character.name == 'AriaHarper',
	Solo: false,
});
let OFFSET = 0;

function find_viable_target() {
	if (curEvent == null) {
		return targeter.GetPriorityTarget(1, true, /* ignore_fire */ true);
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
		return targeter.GetPriorityTarget(1, true, true);
	} else {
		return targeter.GetPriorityTarget(1, false, false, true)[0];
	}
}

setTimeout(LOOP, 100, true);

const timeout = async (promise, timeout) => {
	let TIMEOUT_HANDLE;
	let TIMEOUT_PROMISE = new Promise((_, r) => {
		TIMEOUT_HANDLE = setTimeout(r, timeout);
	});
	promise.then(() => {
		clearTimeout(TIMEOUT_HANDLE);
	});
	return await Promise.race([TIMEOUT_PROMISE, promise]);
};

async function use_mp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name == 'mpot1') {
			try {
				await timeout(equip(i), character.ping * 4);
			} catch (e) {
				log('Potion equip promise seems to have been dropped...' + e);
				parent.resolve_deferred('equip', undefined);
			}
			break;
		}
	}
}

async function use_hp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name == 'hpot1') {
			try {
				await timeout(equip(i), character.ping * 4);
			} catch (e) {
				log('Potion equip promise seems to have been dropped...' + e);
				parent.resolve_deferred('equip', undefined);
			}
			break;
		}
	}
}

if (character.name == 'AriaHarper') {
	// LUCK FILTERS
	const L_CHEST_FILTER = ItemFilter.ofName('tshirt88')
		.level('6', '==')
		.build();
	
	const L_RING1_FILTER = ItemFilter.ofName('ringhs')
		.level('0', '==')
		.build();
	const L_RING2_FILTER = ItemFilter.ofName('ringofluck')
		.level('0', '==')
		.build();
	const L_OFFHAND_FILTER = ItemFilter.ofName('mshield')
		.level('9', '==')
		.build();
	const L_ORB_FILTER = ItemFilter.ofName('rabbitsfoot').build();
	let LUCK_SET = [
		[L_CHEST_FILTER, 'chest'],
		[L_RING1_FILTER, 'ring1'],
		[L_RING2_FILTER, 'ring2'],
		[L_OFFHAND_FILTER, 'offhand'],
		[L_ORB_FILTER, 'orb'],
	];
	setInterval(() => {
		let mtarget = character.target;
		if (mtarget && parent.entities[mtarget]) {
			let etarget = parent.entities[mtarget];
			if (
				etarget.hp / etarget.max_hp < 0.2 &&
				etarget.mtype == 'bscorpion'
			) {
				ensure_equipped_batch(LUCK_SET);
			}
		}
	}, 250);
	// DPS filters
	const D_CHEST_FILTER = ItemFilter.ofName('vattire')
		.level('9', '==')
		.build();
	const D_OFFHAND_FILTER = ItemFilter.ofName('shield')
		.level('9', '==')
		.build();
	const D_RING1_FILTER = ItemFilter.ofName('armorring').level('1', '==').build();
	const D_RING2_FILTER = ItemFilter.ofName('armorring').level('2', '==').build();
	const D_ORB_FILTER = ItemFilter.ofName('ftrinket')
		.level('3', '==')
		.build();

	// GOLD filters
	const BOOSTER_FILTER = new ItemFilter()
		.names('luckbooster', 'goldbooster')
		.build();

	let PDPS_SET = [
		[D_ORB_FILTER, 'orb'],
		[D_RING1_FILTER, 'ring1'],
		[D_RING2_FILTER, 'ring2'],
		[D_OFFHAND_FILTER, 'offhand'],
		[D_CHEST_FILTER, 'chest'],
	];
	let GOLD_SET = [];
	const RESET_GEAR = async () => {
    let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
    if(index_of_booster != -1) {
		  shift(index_of_booster, 'luckbooster');
    }
		ensure_equipped_batch(PDPS_SET);
	};
	const LOOT_CHEST = (id) => {
		parent.socket.emit('open_chest', {
			id: id,
		});
	};
	RESET_GEAR();
	parent.socket.on('drop', (data) => {
		let { id, x, y } = data;
		// console.log(data);
		if (curEvent != null) {
			setTimeout(LOOT_CHEST, 500, id);
			setTimeout(RESET_GEAR, 1000);
			return;
		}
		if (distance_to_point(x, y) < 200) {
			let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
			ensure_equipped_batch(GOLD_SET);
      if(index_of_booster != -1) {
			  shift(index_of_booster, 'goldbooster');
      }
			LOOT_CHEST(id);
			RESET_GEAR();
		}
	});
}

// Staying Alive: Part 2
setTimeout(async () => {
	while (true) {
		try {
			if (character.mp < character.max_mp - 500) {
				await use_mp();
				await sleep(2000);
				continue;
			} else if (character.hp / character.max_hp < 0.5) {
				await use_hp();
				await sleep(2000);
				continue;
			}
		} finally {
			await sleep(100);
		}
	}
}, 100);

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
	}
}, 4000);
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
