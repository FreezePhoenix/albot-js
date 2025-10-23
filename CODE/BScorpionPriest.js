const {
	Lazy,
	Adapter,
	Targeter,
	Skills: { warcry, curse, darkblessing, absorb, zap, taunt },
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

Exchange('basketofeggs', 1, 1);
Exchange('armorbox', 1, 1);
Exchange('candycane', 1, 1);

const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));

const timeout = async (promise, timeout) => {
	let EXECUTE_PROMISE = promise;
	let TIMEOUT_HANDLE;
	let TIMEOUT_PROMISE = new Promise((_, r) => {
		TIMEOUT_HANDLE = setTimeout(r, timeout);
	});
	EXECUTE_PROMISE.then(() => {
		clearTimeout(TIMEOUT_HANDLE);
	});
	return await Promise.race([TIMEOUT_PROMISE, EXECUTE_PROMISE]);
};

Mover.init(smart, G, smart_move);

let range_multiplier = 1;
if (character.ctype == 'warrior') {
	range_multiplier = 0.25;
}

let curEvent = null;
let moving = false;

function move_to(location, callback) {
	if (!moving) {
		if (character.map == location.map) {
			if (distance_to_point(location.x, location.y) >= 2) {
				if (can_move_to(location.x, location.y) && !moving) {
					moving = true;
					move(location.x, location.y).then(() => {
						moving = false;
					});
				} else {
					moving = true;
					Mover.move_by_path(location, (success) => {
						moving = false;
					});
				}
			} else {
				callback?.();
			}
		} else {
			moving = true;
			Mover.move_by_path(location, (success) => {
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

function get_log(log) {
	return localStorage.getItem(log + ':' + character.name);
}
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = ['bscorpion'],
	state = 'farm',
	group = ['Geoffriel', 'Rael', 'Raelina', 'AriaHarper'],
	to_party = ['Rael', 'Raelina', 'Geoffriel'],
	party_leader = character.name == 'Raelina' ? 'AriaHarper' : 'Geoffriel',
	// party_leader = character.name == 'Rael' ? 'earthiverse' : 'Geoffriel',
	merchant = 'AriaHarper',
	priest = 'Geoffriel',
	min_potions = 9000, //The number of potions at which to do a resupply run.
	target;
let mana = 'mpot1',
	health = 'hpot0',
	potion_types = [health, mana]; //The types of potions to keep supplied.
// /*
// */
let to_sell = new Set([
	'intamulet',
	'dexamulet',
	'stramulet',
	'intbelt',
	'dexbelt',
	'strbelt',
	'ringsj',
	'hpamulet',
	'vitring',
	'hpbelt',
	'intring',
	'dexring',
	'strring',
	'wbook0',
	'smoke',
	'hhelmet',
	'harmor',
	'hgloves',
	'hpants',
	'hboots',
	'lantern',
	'skullamulet',
	'santasbelt',
	'snowball',
	'hotchocolate',
	'eggnog',
	'snowball',
	'rednose',
]);
let to_destroy = new Set([
	'ololipop',
	'glolipop',
	'pants1',
	'helmet1',
	'coat1',
	'shoes1',
	'gloves1',
	'snowflakes',
	'warmscarf',
	'candycanesword',
	'ornamentstaff',
	'merry',
	'xmashat',
	'xmasshoes',
	'xmassweater',
	'xmaspants',
	'mittens',
	'angelwings',
	'wattire',
	'wcap',
	'wgloves',
	'wbreeches',
	'quiver',
	'phelmet',
	'gcape',
	'broom',
	'gphelmet',
	'oozingterror',
	'harbringer',
	'ecape',
	'eears',
	'epyjamas',
	'eslippers',
	'carrotsword',
	'pinkie',
]);
let to_send = new Set([
	'fallen',
	'hdagger',
	'bataxe',
	'xarmor',
	'xboots',
	'xpants',
	'xhelmet',
	'xgloves',
  "scroll3",
  "mearring",
	'mshield',
	'cscroll3',
	'offering',
	'supermittens',
	'fury',
	'starkillers',
	'swirlipop',
	'greenbomb',
	'cryptkey',
	'handofmidas',
	'bwing',
	'tshirt4',
	'tshirt3',
	'bunnyelixir',
	'rabbitsfoot',
	'molesteeth',
	'gemfragment',
	'helmet',
	'sstinger',
	'beewings',
	'hpot1',
	'scroll0',
	'scroll1',
	'cscroll0',
	'cscroll1',
	'emptyheart',
	'orbofstr',
	'orbofdex',
	'essenceoffire',
	'networkcard',
	'wshoes',
	'glitch',
	'svenom',
	'offeringp',
	'goldenegg',
	'iceskates',
	'gcape',
	'sweaterhs',
	'wbookhs',
	'firecrackers',
	'dragondagger',
	'lmace',
	'oxhelmet',
	'cdragon',
	'essenceofnature',
	'funtoken',
	'monstertoken',
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
	'weaponbox',
	'gem1',
	'cupid',
	'essenceoffrost',
	'redenvelopev4',
	'greenenvelope',
	'5bucks',
	'candy0v3',
	'candy1v3',
	'gem0',
	'seashell',
	'lostearring',
	// 'mistletoe',
	// 'candycane',
	'ornament',
	'intearring',
	'dexearring',
	'vitearring',
	'strearring',
	'vitscroll',
	'sshield',
	'woodensword',
	'candy0',
	'candy1',
	'ascale',
	'pleather',
	'leather',
	'candypop',
]);
// /*
setInterval(() => {
	if (character.name === party_leader) {
		for (let i = 1; i < to_party.length; i++) {
			const name = to_party[i];
			if (!(name in parent.party)) {
				send_party_invite(name);
			}
		}
	} else {
		if (character.party) {
		} else {
			send_party_request(party_leader);
		}
	}
}, 1000 * 1);
// */

function merchant_near() {
	return merchant in parent.entities;
}

const ensure_equipped_batch = async (filters_and_slots) => {
	let call = [];
	for (let i = 0; i < filters_and_slots.length; i++) {
		let [item_filter, slot] = filters_and_slots[i];
		if (!item_filter(character.slots[slot])) {
			const index = character.items.findIndex(item_filter);
			if (index == -1) {
        			log(JSON.stringify(item_filter.looking))
				log('Failed while looking for an item.');
				break;
			}
			call.push({ num: index, slot: slot });
			let temp = character.items[index];
			character.items[index] = character.slots[slot];
			character.slots[slot] = temp;
		}
	}
	if (call.length == 0) {
		return {};
	}
	parent.socket.emit('equip_batch', call);
	return await parent.push_deferred('equip_batch');
};

function follow_entity(entity, distance) {
	let point = angleToPoint(entity.real_x, entity.real_y);
	var position = pointOnAngle(entity, point, distance);
	position.map = character.map;
	moving = false;
	if (!character.moving) {
		move_to(position);
	}
}

function angleToPoint(x, y) {
	const deltaX = character.real_x - x;
	const deltaY = character.real_y - y;

	return Math.atan2(deltaY, deltaX);
}

function pointOnAngle(entity, angle, tdistance) {
	let cur_distance = distance(character, entity);
	let cur_linear_distance = distance_to_point(entity.real_x, entity.real_y);
	tdistance = tdistance + cur_linear_distance - cur_distance;
	return {
		x: entity.real_x + tdistance * Math.cos(angle),
		y: entity.real_y + tdistance * Math.sin(angle),
	};
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
						let result = parent
							.push_deferred('equip')
							.then(() => true);
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						return result;
					}
					return Promise.resolve(false);
				}
				return Promise.resolve(true);
			case 'string':
				if (character.slots[slot]?.name != item_filter) {
					const index = get_index_of_item(item_filter);
					if (index != -1) {
						let result = parent
							.push_deferred('equip')
							.then(() => true);
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						return result;
					}
					return Promise.resolve(false);
				}
				return Promise.resolve(true);
		}
	};
})();
setInterval(() => {
	if (character.skin != 'bscorpion') {
		let closest = null;
		let closest_distance = Infinity;
		for (let x in parent.entities) {
			let mob = parent.entities[x];
			if (mob.type != 'monster') {
				continue;
			}
			let dist = distance(character, mob);
			if (dist < closest_distance) {
				closest = mob;
				closest_distance = dist;
			}
		}
		if (closest?.mtype == 'bscorpion' && closest_distance < 500) {
			parent.socket.emit('blend');
			character.skin = 'bscorpion';
		}
	}
}, 1000);

function get(name) {
	// persistent get function that works for serializable objects
	try {
		return JSON.parse(
			localStorage.getItem('cstore_' + character.name + name)
		);
	} catch (e) {
		return null;
	}
}
function set(name, value) {
	// persistent set function that works for serializable objects
	try {
		localStorage.setItem(
			'cstore_' + character.name + name,
			JSON.stringify(value)
		);
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
function increment_destroyed() {
	destroyed++;
	// set_message(`D: ${destroyed.toLocaleString()}`);
	set('destroyed', destroyed);
}

setInterval(async () => {
	if (num_items(mana) < min_potions) {
		buy(mana, 1000);
	}
	if (character.name === 'Geoffriel') {
		if (!(await ensure_equipped('elixirluck', 'elixir'))) {
			buy('elixirluck');
		}
	}
	for (let i = 0; i < character.items.length; i++) {
		let item = character.items[i];
		if (item != null && (item.level == 0 || item.level == null)) {
			if (to_destroy.has(item.name) && item.p == null) {
				log(`destroyed ${item.name}`);
				parent.socket.emit('destroy', {
					num: i,
					q: 1,
					statue: true,
				});
				character.items[i] = null;
				increment_destroyed();
			} else if (to_sell.has(item.name) && item.p == null) {
				sell(i, item.q ?? 1);
				character.items[i] = null;
			}
		}
	}

	if (merchant_near()) {
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[i];
			if (item != null) {
				if (
					to_destroy.has(item.name) &&
					item.p != null &&
					(item.level == 0 || item.level == null)
				) {
					send_item(merchant, i, item.q ?? 1);
				} else if (
					to_send.has(item.name) &&
					(item.level == 0 || item.level == null) && item.l == null
				) {
					send_item(merchant, i, item.q ?? 1);
				}
			}
		}
		if (character.gold > 51000000) {
			send_gold(merchant, character.gold - 50000000);
		}
	}
	if (character.ctype == 'warrior') {
		if (!(await ensure_equipped('pumpkinspice', 'elixir'))) {
			send_cm(merchant, 'yo, I need some pump');
		}
	}
}, 500);

parent.socket.on('cm', async function (a) {
	let name = a.name;
	let data = await JSON.parse(a.message);
	// function on_cm(name, data) {
  console.log(a);
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
      console.log(data)
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
	return entity.mp < entity.max_mp - 500;
}

function needs_hp(entity) {
	return entity && entity.hp / entity.max_hp < 0.75;
}

async function use_mp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name == mana) {
			try {
				await timeout(equip(i), character.ping * 4);
			} catch (e) {
				log('Potion equip promise seems to have been dropped...');
				parent.resolve_deferred('equip', undefined);
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
		if (needs_mp(character)) {
			await use_mp();
			await sleep(2000);
			continue;
		} else {
			await sleep(100);
		}
	}
}, 100);

if (character.ctype == 'warrior') {
	
	const L_ORB_FILTER = ItemFilter.ofName('rabbitsfoot').build();
	const DPS_ORB_FILTER = ItemFilter.ofName("orbofstr").build();
	let LUCK_SET = [
		[L_ORB_FILTER, 'orb']
	];
	let NON_LUCK_ORB = [
		[DPS_ORB_FILTER, 'orb'] 
	];
	if(character.name == "Rael") {
		LUCK_SET.push([ItemFilter.ofName("ringofluck").build(), "ring1"]);
		LUCK_SET.push([ItemFilter.ofName("ringhs").build(), "ring2"]);
		NON_LUCK_ORB.push([ItemFilter.ofName("suckerpunch").build(), "ring1"]);
		NON_LUCK_ORB.push([ItemFilter.ofName("suckerpunch").build(), "ring2"]);
	}
	
	parent.socket.on('drop', (data) => {
		ensure_equipped_batch(NON_LUCK_ORB);
	});
	const JACKO_FILTER = ItemFilter.ofName('jacko').build();
	const ORB_FILTER = new ItemFilter()
		.level('4', '>=')
		.name('orbofstr')
		.build();
	setInterval(async () => {
		let targeted = false;
		let grinch = null;
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (entity.type === 'monster' && entity.target === character.name) {
				if (!get_player(priest) || get_player(priest).rip) {
					targeted = true;
					break;
				}
			}
		}
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (entity.type === 'monster' && entity.mtype == 'grinch') {
				if (character.name == 'Rael' && entity.target == 'Geoffriel') {
					grinch = entity;
				} else if (
					character.name == 'Raelina' &&
					entity.target == 'AriaHarper'
				) {
					grinch = entity;
				}
				break;
			}
		}
		if (grinch != null && can_use('taunt')) {
			taunt(grinch.id);
		} else if (targeted && can_use('scare')) {
			if (await ensure_equipped(JACKO_FILTER, 'orb')) {
				await use_skill('scare');
				await ensure_equipped(ORB_FILTER, 'orb');
			}
		} else {

			let found = false;
			for(let x in parent.entities) {
				let etarget = parent.entities[x];
				if(etarget) {
					if (
						etarget.hp / etarget.max_hp < 0.05 &&
						(etarget.mtype == 'mrpumpkin' || etarget.mtype == 'mrgreen')
					) {
						found = true;
						ensure_equipped_batch(LUCK_SET);
						break;
					}
				}
			}
			if(!found) {
				await ensure_equipped(ORB_FILTER, 'orb');
			}
		}
	}, 1000);
} else {
	const JACKO_FILTER = ItemFilter.ofName('jacko').build();
	setInterval(async () => {
		let targeted = false;
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (entity.type === 'monster' && entity.target === character.name) {
				if (character.hp < 6000) {
					targeted = true;
					break;
				}
			}
		}
		if (targeted && can_use('scare')) {
			if (await ensure_equipped(JACKO_FILTER, 'orb')) {
				await use_skill('scare');
			}
		}
	}, 1000);
}

parent.socket.on('hit', (data) => {
	if (data.stacked && data.id == character.name) {
		move(
			parent.character.real_x + (Math.floor(Math.random() * 30) - 15),
			parent.character.real_y + (Math.floor(Math.random() * 30) - 15)
		);
	}
});

const kiting_origin = {
		x: -440,
		y: -1240,
	},
	kiting_range = (2 * 181) / 3;

function determine_clockwise(origin, target, range) {
	let cw = get_kite_point(origin, target, range, true);
	let acw = get_kite_point(origin, target, range, false);
	return distance_to_point(cw.x, cw.y) < distance_to_point(acw.x, acw.y)
		? cw
		: acw;
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

const NEEDS_PRIEST = new Lazy([...to_party, 'AriaHarper'])
	.map(get_player)
	.filter(needs_hp);

const afflicted = (status_name, entity = character) => status_name in entity.s;

const DEBUFF_HP_CHEST = ItemFilter.ofName('coat').level('13', '==').build();
const D_RING1_FILTER = ItemFilter.ofName('zapper').build();
const D_CHEST_FILTER = ItemFilter.ofName('vattire').level('9', '==').build();
let USING_LUCK = false;

if (character.name == 'Geoffriel') {
	// LUCK FILTERS
	const L_HELMET_FILTER = ItemFilter.ofName('wcap').level('8', '==').build();
	const L_EARRING1_FILTER = ItemFilter.ofName('mearring').build();
	const L_EARRING2_FILTER = ItemFilter.ofName('dexearringx').build();
	const L_AMULET_FILTER = ItemFilter.ofName('spookyamulet').build();
	const L_STAFF_FILTER = ItemFilter.ofName('lmace')
		.level('4', '==')
		.property('lucky')
		.build();
	const L_OFFHAND_FILTER = ItemFilter.ofName('mshield')
		.level('9', '==')
		.build();
	const L_CAPE_FILTER = ItemFilter.ofName('ecape')
		.level('8', '==')
		.property('festive')
		.build();
	const L_PANTS_FILTER = ItemFilter.ofName('wbreeches')
		.level('6', '==')
		.build();
	const L_CHEST_FILTER = ItemFilter.ofName('wattire').level('6', '==').build();
	const L_RING_FILTER = ItemFilter.ofName('ringhs').build();
	const L_ORB_FILTER = ItemFilter.ofName('rabbitsfoot').build();
	const L_BELT_FILTER = ItemFilter.ofName('santasbelt').level('3', '==').build();
	const L_GLOVE_FILTER = ItemFilter.ofName('wgloves')
		.level('7', '==')
		.build();
	const L_BOOTS_FILTER = ItemFilter.ofName('wshoes').level('9', '==').build();
	let LUCK_SET = [
		[L_HELMET_FILTER, 'helmet'],
		[L_EARRING1_FILTER, 'earring1'],
		[L_EARRING2_FILTER, 'earring2'],
		[L_AMULET_FILTER, 'amulet'],
		[L_STAFF_FILTER, 'mainhand'],
		[L_CHEST_FILTER, 'chest'],
		[L_OFFHAND_FILTER, 'offhand'],
		[L_CAPE_FILTER, 'cape'],
		[L_PANTS_FILTER, 'pants'],
		[L_RING_FILTER, 'ring1'],
		[L_RING_FILTER, 'ring2'],
		[L_ORB_FILTER, 'orb'],
		[L_GLOVE_FILTER, 'gloves'],
		[L_BOOTS_FILTER, 'shoes'],
		[L_BELT_FILTER, 'belt']
	];
	setInterval(() => {
		USING_LUCK = false;
		for(let x in parent.entities) {
			let etarget = parent.entities[x];
			if (
				etarget.hp / etarget.max_hp < 0.2 &&
				etarget.mtype == 'bscorpion'
			) {
				USING_LUCK = true;
				ensure_equipped_batch(LUCK_SET);
				break;
			} else if(etarget.hp / etarget.max_hp < 0.05 && (etarget.mtype == "mrpumpkin" || etarget.mtype == "mrgreen")) {
				USING_LUCK = true;
				ensure_equipped_batch(LUCK_SET);
				break;
			}
		}
	}, 250);
	// DPS filters
	const D_HELMET_FILTER = ItemFilter.ofName('eears')
		.level('13', '==')
		.build();
	const D_EARRING_FILTER = ItemFilter.ofName('cearring')
		.level('4', '==')
		.build();
	const D_AMULET_FILTER = ItemFilter.ofName('intamulet')
		.level('5', '==')
		.build();
	const H_STAFF_FILTER = ItemFilter.ofName('lmace').level('9', '==').build();
	const D_STAFF_FILTER = ItemFilter.ofName('lmace').level('9', '==').build();
	const D_OFFHAND_FILTER = ItemFilter.ofName('wbookhs')
		.level('3', '==')
		.build();
	const D_WINGS_FILTER = ItemFilter.ofName('angelwings')
		.level('8', '==')
		.build();
	const D_PANTS_FILTER = ItemFilter.ofName('pants').level('13', '==').build();
	const D_RING2_FILTER = ItemFilter.ofName('cring').level('5', '==').build();
	const D_ORB_FILTER = ItemFilter.ofName('jacko').level('5', '==').build();
	const D_GLOVE_FILTER = ItemFilter.ofName('gloves')
		.level('13', '==')
		.build();
	const D_BELT_FILTER = ItemFilter.ofName('intbelt')
		.level('5', '==')
		.build();
	const D_BOOTS_FILTER = ItemFilter.ofName('wingedboots')
		.level('11', '==')
		.build();
	// GOLD filters
	const BOOSTER_FILTER = new ItemFilter()
		.names('xpbooster', 'luckbooster', 'goldbooster')
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

	ensure_equipped(D_WINGS_FILTER, 'cape');
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
		[D_EARRING_FILTER, 'earring1'],
		[D_EARRING_FILTER, 'earring2'],
		[D_HELMET_FILTER, 'helmet'],
		[D_BELT_FILTER, 'belt']
	];
	let GOLD_SET = [
		[G_RING1_FILTER, 'ring1'],
		[G_PANTS_FILTER, 'pants'],
		[G_RING2_FILTER, 'ring2'],
		[G_GLOVE_FILTER, 'gloves'],
	];
	const RESET_GEAR = async () => {
	    let booster_index = character.items.findIndex(BOOSTER_FILTER);
	    if(booster_index != -1) {
			  shift(character.items.findIndex(BOOSTER_FILTER), 'luckbooster');
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

let NOW = performance.now();

const LOOP = async () => {
	while (true) {
		curEvent = next_event(curEvent);
		NOW = performance.now();
		if (curEvent) {
			await farm(curEvent);
		} else {
			await farm();
		}
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

let SUGAR_FILTER = ItemFilter.ofName('candycanesword').level('1', '==').build();
let PIERCE_FILTER = ItemFilter.ofName('tshirt7').level('8', '>=').build();
let MANASTEAL_FILTER = ItemFilter.ofName('tshirt9').level('8', '>=').build();
let FIRE_FILTER = ItemFilter.ofName('fireblade').level('10', '==').build();
let AXE_FILTER = new ItemFilter()
	.names('scythe', 'bataxe')
	.level('7', '>=')
	.build();
// /*
let SUGAR_SET = [
	[MANASTEAL_FILTER, 'chest'],
	[SUGAR_FILTER, 'mainhand'],
	[SUGAR_FILTER, 'offhand'],
];
let SUGAR_LESSER_SET = [
	[SUGAR_FILTER, 'mainhand'],
	[PIERCE_FILTER, 'chest'],
];
let DPS_SET = [
	[FIRE_FILTER, 'mainhand'],
	[FIRE_FILTER, 'offhand'],
];
if (character.name == 'Rael') {
	DPS_SET[0] = [
		ItemFilter.ofName('fireblade').level('13', '==').build(),
		'mainhand',
	];
}
// */
if (character.name == 'Rael' || character.name == 'Raelina') {
	setInterval(() => {
		let attack_target = find_viable_target();
		if (attack_target != null) {
			follow_entity(attack_target, 20);
		} else {
			ensure_equipped_batch(DPS_SET);
		}
	}, 400);
	parent.socket.on('hit', (data) => {
		if (data.hid == character.name && data.source == 'attack') {
			ensure_equipped_batch(DPS_SET);
		}
	});
} else {
	setInterval(() => {
		let attack_target = find_viable_target();
		if (attack_target != null) {
			if (attack_target.mtype != 'bscorpion') {
				follow_entity(attack_target, 60);
			} else if (
				character.map == 'desertland' &&
				distance_to_point(kiting_origin.x, kiting_origin.y) < 200
			) {
				let movePoint = determine_clockwise(
					kiting_origin,
					attack_target,
					kiting_range
				);
				move(movePoint.x, movePoint.y);
			}
		}
	}, 500);
}
let LOGGED = 0;

async function farm(location) {
	switch (character.ctype) {
		case 'priest':
			// Basic states to determine if we can heal others. Prevents high spam.
			NEEDS_PRIEST.forEach((entity) => {
				if (can_heal(entity)) {
					heal(entity);
					return false;
				}
				return true;
			});
			break;
	}
	let attack_target = find_viable_target();

	if (attack_target != null) {
		if (
			attack_target.mtype == 'bscorpion' &&
			attack_target.target == null &&
			character.ctype == 'priest' &&
			ensure_equipped(D_RING1_FILTER, 'ring1')
		) {
			zap(attack_target.id);
		}
		let distance_from_target = distance(attack_target, character);
		if (distance_from_target < character.range) {
			if (can_use('curse', NOW)) {
				curse(attack_target.id);
			}
			switch (character.ctype) {
				case 'priest':
					if (
						can_use('darkblessing', NOW) &&
						!afflicted('darkblessing') &&
						afflicted('warcry')
					) {
						darkblessing();
					}
					if (
						attack_target.mtype == 'bscorpion' &&
						attack_target.target != null &&
						attack_target.target != character.name &&
						can_use('absorb', NOW)
					) {
						absorb(attack_target.target);
					}
					if (can_use('attack', NOW)) {
						if(curEvent != null) {
							if(character.s.coop == null || USING_LUCK) {
								attack(attack_target);
							} else {
								ensure_equipped_batch([[D_CHEST_FILTER, 'chest']]);
								heal(character);
								ensure_equipped_batch([[DEBUFF_HP_CHEST, 'chest']]);
							}
						} else {
							attack(attack_target);
						}
					}
					break;
				case 'warrior':
					if (can_use('warcry', NOW) && !afflicted('warcry')) {
						warcry();
					}
					try {
						if (can_use('attack', NOW)) {
							// if(character.name == "Rael" && Targeter.WillDieFromFire(attack_target) && attack_target.s.burned.fid == "Rael") {
							// 	await sleep(100);
							// 	return;
							// }
							let r = Promise.race([
								attack(attack_target, true),
								sleep(character.ping * 4),
							]);
							if (character.s.sugarrush == null) {
								if (
									can_use('cleave', NOW) &&
									character.mp > 1200 &&
									attack_target.mtype == 'bscorpion'
								) {
									parent.socket.emit('unequip', {
										slot: 'offhand',
									});
									ensure_equipped_batch([
										[AXE_FILTER, 'mainhand'],
									]);
									use_skill('cleave');
								}
								if (distance_from_target > 0) {
									ensure_equipped_batch(SUGAR_SET);
								}
							} else {
								ensure_equipped_batch(SUGAR_LESSER_SET);
							}

							if ((await r) == undefined) {
								// log(
								// 	'Attack promise seems to have been dropped'
								// );
								ensure_equipped_batch(DPS_SET);
								parent.resolve_deferred('attack', undefined);
							}
						} else if(Targeter.WillDieFromFire(attack_target)) {
							await sleep(100);
						}
					} catch (e) {
						switch (e.reason) {
							case 'too_far':
								console.error('Too far... ', JSON.stringify(e));
								await sleep(10);
								ensure_equipped_batch(DPS_SET);
								break;
							case 'cooldown':
								console.error('TIME ', JSON.stringify(e));
								await sleep(e.ms);
								ensure_equipped_batch(DPS_SET);
								return;
							case 'not_there':
								await sleep(10);
								ensure_equipped_batch(DPS_SET);
								return;
							case 'no_mp':
								if (LOGGED++ < 10) {
									console.error(
										'WHY IS THIS HAPPENING? WE ARE OUT OF MP: ' +
											character.name
									);
								}
								await sleep(100);
								ensure_equipped_batch(DPS_SET);
								return;
							default:
								console.log('wtaf', e);
								await sleep(10);
								break;
						}
					}
					break;
				default:
					if (can_use('attack', NOW)) {
						await attack(attack_target);
					}
			}
		}
	} else if (character.name == 'Geoffriel') {
		// We still want to avoid flaming scorpions.
		// Move the priest outside of the spawn
		move_to(
			location ?? {
				x: -420,
				y: -1100,
				map: 'desertland',
			}
		);
	} else {
		let priest_nearby = get_player(priest);
		if (
			(priest_nearby == null || priest_nearby.rip) &&
			!(character.name == 'Raelina' && get_player('AriaHarper'))
		) {
			// Move outside the spawn, so we don't die to a random scorpion...
			move_to(
				location ?? {
					x: -420,
					y: -1410,
					map: 'desertland',
				}
			);
		} else {
			// Move the warriors into the center of the spawn
			move_to(
				location ?? {
					x: -398,
					y: -1261.5,
					map: 'desertland',
				}
			);
		}
	}
	await sleep(10);
}

//Returns the number of items in your inventory for a given item name;
function num_items(name) {
	let total = 0;
	for (let i = 0; i < character.items.length; i++) {
		let item = character.items[i];
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
let OFFSET = 0;
function next_event(curEvent) {
	let data = parent.socket.server_data ?? {};
	if (curEvent == null) {
		if (data.mrgreen?.live && data.mrgreen?.target) {
			return {
				x: (data.mrgreen.x ?? 0) + OFFSET,
				y: (data.mrgreen.y ?? 0) + OFFSET,
				name: 'mrgreen',
				map: data.mrgreen.map,
			};
		} else if (data.mrpumpkin?.live && data.mrpumpkin?.target) {
			return {
				x: (data.mrpumpkin.x ?? 0) + OFFSET,
				y: (data.mrpumpkin.y ?? 0) + OFFSET,
				name: 'mrpumpkin',
				map: data.mrpumpkin.map,
			};
		} else if (data.goobrawl) {
			if (character.map != 'goobrawl') {
				parent.socket.emit('join', {
					name: 'goobrawl',
				});
			}
			return {
				x: 0,
				y: 0,
				name: 'goobrawl',
				map: 'goobrawl',
			};
		} else if (
			data.wabbit?.live &&
			!afflicted('easterluck', parent.entities.Geoffriel || character)
		) {
			return {
				x: (data.wabbit.x ?? 0) + OFFSET,
				y: (data.wabbit.y ?? 0) + OFFSET,
				name: 'wabbit',
				map: data.wabbit.map,
			};
		} else {
			for (let x in parent.entities) {
				if (
					parent.entities[x].mtype == 'rgoo' ||
					parent.entities[x].mtype == 'bgoo'
				) {
					return {
						x: 0,
						y: 0,
						name: 'goobrawl',
						map: 'goobrawl',
					};
				}
			}
		}
	} else {
		for (let x in parent.entities) {
			if (
				parent.entities[x].mtype == 'rgoo' ||
				parent.entities[x].mtype == 'bgoo'
			) {
				return {
					x: 0,
					y: 0,
					name: 'goobrawl',
					map: 'goobrawl',
				};
			}
		}
		if (data[curEvent.name]?.live) {
			return {
				x: (data[curEvent.name].x ?? 0) + OFFSET,
				y: (data[curEvent.name].y ?? 0) + OFFSET,
				name: curEvent.name,
				map: data[curEvent.name].map,
			};
		} else {
			return next_event(null);
		}
	}
}
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
