let AOE = true;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const {
	Lazy,
	Adapter,
	Targeter,
	Skills: {
		hardshell,
		taunt,
		warcry,
		curse,
		darkblessing,
		absorb,
		cleave,
		zap,
	},
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

const pi = Math.PI,
	character_name = character.name;

// Exchange('basketofeggs');

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
let monster_targets = ['gscorpion'],
	state = 'farm',
	to_party = ['Rael', 'Raelina', 'Malthael', 'AriaHarper'],
	party_leader = 'Rael',
	merchant = 'AriaHarper',
	priest = 'Geoffriel',
	warrior_tank = false,
	need_priest = false,
	min_potions = 18000, //The number of potions at which to do a resupply run.
	target;
let mana = 'mpot1';
// /*

// */
let to_sell = new Set([
	'molesteeth',
	'gemfragment',
	'helmet',
	'wbreeches',
	'ringsj',
	'hpamulet',
	'intamulet',
	'dexamulet',
	'stramulet',
]);
let to_send = new Set([
	'quiver',
	'bunnyelixir',
	'ecape',
	'eears',
	'epyjamas',
	'eslippers',
	'carrotsword',
	'bataxe',
	'pinkie',
	'rabbitsfoot',
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
	'broom',
	'oozingterror',
	'harbringer',
]);
// /*
setInterval(() => {
	if (character_name === party_leader) {
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
			send_party_request(party_leader);
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
		if (call.length == 0) {
			return Promise.resolve(true);
		}
		parent.socket.emit('equip_batch', call);
		return parent.push_deferred('equip_batch');
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
					const index = character.items.findIndex(item_filter);
					if (index != -1) {
            
						let result = parent
							.push_deferred('equip')
							.then(() => true);
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						let temp = character.items[index];
						character.items[index] = character.slots[slot];
						character.slots[slot] = temp;
						return result;
					}
					return false;
				}
				return true;
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
						let temp = character.items[index];
						character.items[index] = character.slots[slot];
						character.slots[slot] = temp;
						return result;
					}
					return false;
				}
				return true;
		}
	};
})();
let ORBIT_SPEED = 40;
let ORBIT_DISTANCE = 30;
const ORBIT_TARGET = {
	real_x: 390.675,
	x: 390.675,
	real_y: -1422.46,
	y: -1422.46,
	map: 'desertland',
	in: 'desertland',
};
function cruise(speed) {
	parent.socket.emit('cruise', speed);
}
function hr_time() {
	return Number(parent.hrtime() / 1_000_000n);
}
const TWO_PI = 2 * Math.PI;
const ORBIT_TIME = ((TWO_PI * ORBIT_DISTANCE) / ORBIT_SPEED) * 1000;
const PARTY_OFFSET = to_party.indexOf(character.name) / 3;
function orbit() {
	const TIME_OFFSET = hr_time() / ORBIT_TIME;
	const OFFSET = (PARTY_OFFSET + TIME_OFFSET) % 1.0;
	const ORBIT_ANGLE = OFFSET * TWO_PI;
	const DEST_X = ORBIT_TARGET.real_x + ORBIT_DISTANCE * Math.cos(ORBIT_ANGLE);
	const DEST_Y = ORBIT_TARGET.real_y + ORBIT_DISTANCE * Math.sin(ORBIT_ANGLE);
	move(DEST_X, DEST_Y);
}
setInterval(() => {
	orbit();
}, 150);

const JACKO_FILTER = ItemFilter.ofName('jacko').build();
const ORB_FILTER = ItemFilter.ofName('orbofstr').level('4', '>=').build();

const BOOSTER_FILTER = new ItemFilter()
	.names('luckbooster', 'goldbooster')
	.build();
if (AOE) {
  setInterval(() => {
    let total = 0;
    if(can_use("agitate")) {
      for (let X in parent.entities) {
        let entity = parent.entities[X];
        if (
          entity.type == 'monster' &&
          entity.mtype == 'gscorpion'
        ) {
          if (entity.target == null) {
            total++;
          }
        }
      }
      if(total > 1) {
        use_skill("agitate");
      }
    }
  }, 300);
}
setInterval(() => {
	if (num_items(mana) < min_potions) {
		buy(mana, 1000);
	}

	if (merchant_near()) {
		let sold = 0,
			max_send = 8;
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[i];
			if (item != null) {
				if (
					to_sell.has(item.name) &&
					sold < max_send &&
					(item.level == 0 || item.level == null)
				) {
					send_item(merchant, i, 10);
					sold++;
				} else if (
					to_send.has(item.name) &&
					sold < max_send &&
					(item.level == 0 || item.level == null)
				) {
					send_item(merchant, i, 10);
					sold++;
				}
			}
		}
		if (character.gold > 51000000) {
			send_gold(merchant, character.gold - 50000000);
		}
		if (character.ctype == 'warrior') {
			if (!ensure_equipped('elixirluck', 'elixir')) {
				buy('elixirluck');
			}
		} else {
			if (!ensure_equipped('elixirluck', 'elixir')) {
				buy('elixirluck');
			}
		}
	}
}, 500);

parent.socket.on('cm', async function (a) {
	let name = a.name;
	let data = await JSON.parse(a.message);
	// function on_cm(name, data) {
	if (to_party.includes(name) || name == 'AriaHarper') {
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
	return entity.mp + 500 < entity.max_mp;
}

function needs_hp(entity) {
	return entity && entity.hp / entity.max_hp < 0.75;
}

async function use_mp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name?.startsWith?.('mpot1')) {
			try {
				let r = await Promise.race([
					equip(i),
					sleep(character.ping * 4),
				]);
				if (r == undefined) {
					console.log('Failed to equip potion for unknown reason.');
				}
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
		} else {
			await sleep(100);
		}
	}
}, 100);

const NEEDS_PRIEST = new Lazy([...to_party, merchant])
	.map(get_player)
	.filter(needs_hp)
	.while(() => can_use('attack'));

const afflicted = (status_name) => status_name in character.s;

let NOW = performance.now();

const LOOP = async () => {
	while (true) {
		NOW = performance.now();
		await farm();
		NOW = performance.now();

		if (character.name == 'Geoffriel') {
			await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
		} else if (character.s.sugarrush) {
			await sleep(Math.ceil(Math.max(0, ms_until('attack', NOW))));
		} else {
			let ms_until_attack = ms_until('attack', NOW);
			if (ms_until_attack > 360) {
				await sleep(
					Math.max(
						0,
						Math.ceil(
							Math.min(
								Math.max(0, ms_until_attack),
								Math.max(0, ms_until('cleave', NOW))
							)
						)
					) + 1
				);
			} else {
				await sleep(Math.ceil(Math.max(0, ms_until_attack)) + 1);
			}
		}
	}
};

setTimeout(LOOP, 100, true);
let MAINHAND_FILTER = null;
let OFFHAND_FILTER = null;
if (AOE) {
	if (character.name == 'Rael') {
		MAINHAND_FILTER = ItemFilter.ofName('glolipop')
			.level('11', '==')
			.build();
		OFFHAND_FILTER = ItemFilter.ofName('glolipop')
			.level('10', '==')
			.build();
	} else if (character.name == 'Raelina') {
		MAINHAND_FILTER = ItemFilter.ofName('ololipop')
			.level('9', '==')
			.build();
		OFFHAND_FILTER = ItemFilter.ofName('ololipop')
			.level('9', '==')
			.build();
	}
} else {
	MAINHAND_FILTER = OFFHAND_FILTER = ItemFilter.ofName('fireblade')
		.level('10', '==')
		.build();
}
let FIRE_BLADE_FILTER = ItemFilter.ofName('fireblade')
	.level('10', '==')
	.build();
let MANA_STEAL_FILTER = ItemFilter.ofName('tshirt9').level('6', '>=').build();
let AXE_FILTER;
if (character.name == 'Rael') {
	AXE_FILTER = ItemFilter.ofName('bataxe').level('9', '>=').build();
} else {
	AXE_FILTER = ItemFilter.ofName('scythe').level('7', '>=').build();
}
let HAM_FILTER = ItemFilter.ofName('basher').build();
let PCHEST_FILTER = ItemFilter.ofName('tshirt7').build();
let MCHEST_FILTER = ItemFilter.ofName('tshirt9').build();

const BLAST_SET = [
	[MAINHAND_FILTER, 'mainhand'],
	[OFFHAND_FILTER, 'offhand'],
];

const SINGLE_SET = [
	[FIRE_BLADE_FILTER, 'mainhand'],
	[FIRE_BLADE_FILTER, 'offhand'],
];

if (character.name == 'Rael' || character.name == 'Raelina') {
	ensure_equipped_batch(BLAST_SET);
	setInterval(() => {
		
    // ensure_equipped(FGLOVE_FILTER, "gloves");
    ensure_equipped(MCHEST_FILTER, 'chest');
	}, 200);
}

setInterval(() => {
	let chests = 0;
	for (let chest_id in parent.chests) {
		chests++;
	}
	if (chests > 10) {
		let looted = false;
		for (let chest_id in parent.chests) {
			let chest = parent.chests[chest_id];
			// console.log(chest);
			if (!looted) {
				looted = true;
			}
			parent.socket.emit('open_chest', {
				id: chest_id,
			});
		}
	}
}, 1000);

function follow_entity(entity, distance) {
	let point = angleToPoint(entity.real_x, entity.real_y);
	var position = pointOnAngle(entity, point, distance);
	moving = false;
	move(position.x, position.y);
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

async function farm(location = ORBIT_TARGET) {
	switch (character.ctype) {
		case 'priest':
			if (
				can_use('darkblessing') &&
				!afflicted('darkblessing') &&
				afflicted('warcry')
			) {
				darkblessing();
			}
			// Basic states to determine if we can heal others. Prevents high spam.
			NEEDS_PRIEST.forEach((entity) => {
				if (can_heal(entity)) {
					heal(entity);
					return false;
				}
				return true;
			});
			break;
		case 'warrior':
			if (can_use('warcry') && !afflicted('warcry')) {
				warcry();
			}
			break;
	}

	let attack_target = find_viable_target();

	if (attack_target != null) {
		if (character.name == 'Geoffriel') {
			if (
				can_use('curse') &&
				attack_target.target != null &&
				attack_target.target != 'AriaHarper'
			) {
				curse(attack_target.id);
			}
		} else if (
			parent.distance(attack_target, character) <
			character.range + character.xrange
		) {
			if (can_use('attack', NOW)) {
				switch (character.ctype) {
					case 'priest':
						break;
					case 'warrior':
						{
							try {
								let r = Promise.race([
									attack(attack_target, true),
									sleep(character.ping * 4),
								]);
                if (
                  AOE &&
                  can_use('cleave', NOW) &&
                  character.mp > 800
                ) {
                  unequip('offhand');
                  await ensure_equipped(AXE_FILTER, 'mainhand');
                  cleave();
                  ensure_equipped_batch(BLAST_SET);
                  try {
                    await parent.push_deferred('cleave');
                  } catch (e) {}
                }
                r = await r;
								if (r != undefined) {
									reduce_cooldown(
										'attack',
										(character.ping ?? 0) * 0.75
									);
								} else {
									console.log(
										'Attack promise seems to have been dropped'
									);
									parent.resolve_deferred(
										'attack',
										undefined
									);
								}
							} catch (e) {
								switch (e.reason) {
									case 'too_far':
										console.error(
											'Too far... ',
											JSON.stringify(e)
										);
										await sleep(10);
										break;
									case 'cooldown':
										console.error(
											'TIME ',
											JSON.stringify(e)
										);
										await sleep(e.ms);
										return;
									case 'not_there':
										return;
									case 'no_mp':
										console.error(
											'WHY IS THIS HAPPENING? WE ARE OUT OF MP: ' +
												character.name
										);
										await sleep(100);
										return;
									default:
										console.log(e);
										await sleep(10);
										break;
								}
							}
						}
						break;
					default:
						await attack(attack_target);
				}
			} else if(character.ctype == "warrior") {
				let ANY = false;
				for (let x in parent.entities) {
					let entity = parent.entities[x];
					if (
						entity.type == 'monster' &&
						entity.mtype == 'gscorpion'
					) {
						ANY = true;
						break;
					}
				}
				if (
					ANY &&
					AOE &&
					can_use('cleave', NOW) &&
					character.mp > 800 &&
					ms_until('attack', NOW) > 360
				) {
					unequip('offhand');
					await ensure_equipped(AXE_FILTER, 'mainhand');
					cleave();
					ensure_equipped_batch(BLAST_SET);
					try {
						await parent.push_deferred('cleave');
					} catch (e) {}
				} else {
					await sleep(10);
				}
			} else {
        await sleep(10);
      }
		} else {
			if (character.ctype == 'warrior') {
				let ANY = false;
				for (let x in parent.entities) {
					let entity = parent.entities[x];
					if (
						entity.type == 'monster' &&
						entity.mtype == 'gscorpion' &&
						distance(character, entity) < 160
					) {
						ANY = true;
						break;
					}
				}
				if (
					ANY &&
					AOE &&
					can_use('cleave', NOW) &&
					character.mp > 800
				) {
					unequip('offhand');
					await ensure_equipped(AXE_FILTER, 'mainhand');
					cleave();
					ensure_equipped_batch(BLAST_SET);
					try {
						await parent.push_deferred('cleave');
					} catch (e) {}
				}
			} else {
				await sleep(10);
			}
		}
	} else {
		if (
			curEvent == null &&
			distance_to_point(location.x, location.y) > 100
		) {
			move_to(location);
		}
	}
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

function next_event(curEvent) {
	return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
	return Math.hypot(character.real_x - x, character.real_y - y);
}

var targeter = new Targeter(monster_targets, [...to_party, merchant], {
	RequireLOS: false,
	TagTargets: true,
	Solo: false,
});

function find_viable_target() {
	return targeter.GetPriorityTarget(
		1,
		true,
		/* ignore_fire */ true,
		false,
		character.name != 'Geoffriel',
		character.name == 'Geoffriel'
	); // [0];
}
