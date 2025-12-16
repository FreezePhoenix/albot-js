const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));
const {
    Mover,
    Targeter,
	ItemFilter,
	Adapter
} = await proxied_require(
    'Mover.js',
	'Adapter.js',
    'Targeter.js',
	'ItemFilter.js',
);

let FARM_TARGET = "minimush";

let AXE_FILTER = new ItemFilter()
	.names('scythe', 'bataxe')
	.level('7', '>=')
	.build();

let FIRE_FILTER = ItemFilter.ofName('fireblade').level('10', '>=').build();


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

let AXE_SET = [[AXE_FILTER, 'mainhand']]

let FARM_LOCATION = {
	    x: 8,
	    y: 630.5,
	    map: 'halloween',
	},
	to_party = ['Rael', 'Raelina', 'Geoffriel'],
	party_leader = 'Geoffriel',
	merchant = 'AriaHarper';

let perform_miracles = character.name == "Raelina";

if(!perform_miracles) {
	FARM_TARGET = "scorpion";

	FARM_LOCATION = {
	    x: 1577.5,
	    y: -168,
	    map: 'main',
	};
}

var targeter = new Targeter([FARM_TARGET], [character.name], {
    RequireLOS: false,
    TagTargets: true,
    Solo: false,
});

setInterval(() => {
	if (character.skin != FARM_TARGET) {
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
		if (closest?.mtype == FARM_TARGET && closest_distance < 500) {
			parent.socket.emit('blend');
			character.skin = FARM_TARGET;
		}
	}
}, 1000);

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

let EARTH = ["earthPri", "earthRan3", "earthRog3"];
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

Mover.init(smart, G, smart_move);

function distance_to_point(x, y) {
    return Math.hypot(character.real_x - x, character.real_y - y);
}

parent.socket.on('drop', (data) => {
	if(data.map == FARM_LOCATION.map) {
	    parent.socket.emit('open_chest', {
	        id: data.id,
	    });
	}
});

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

let NOW = performance.now();



setInterval(() => {
	if (character.name === party_leader) {
		for (let i = 1; i < to_party.length; i++) {
			const name = to_party[i];
			if (!(name in parent.party)) {
				send_party_invite(name);
			}
		}
	} else {
		let EARTH_NEARBY = false;
		if (character.party) {
			if(EARTH_NEARBY && !character.party.startsWith("earth")) {
				
				parent.socket.emit("party",{event:"leave"});
				send_party_request(EARTH_NEARBY);
			} else if(!EARTH_NEARBY && character.party.startsWith("earth")) {
				parent.socket.emit("party",{event:"leave"});
				send_party_request(party_leader);
			}
		} else {
			if(EARTH_NEARBY) {
				send_party_request(EARTH_NEARBY);
			} else {
				send_party_request(party_leader);
			}
		}
	}
}, 1000 * 1);

const LOOP = async () => {
    while (true) {
        NOW = performance.now();
        await farm();
        NOW = performance.now();
        await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
    }
};

function find_viable_target() {
    return targeter.GetPriorityTarget(1, false, /* ignore_fire */ true)[0];
}

parent.socket.on('hit', (data) => {
	if (data.hid == character.name && data.source == 'attack') {
		ensure_equipped_batch(DPS_SET);
	}
});

async function farm() {
    let attack_target = find_viable_target();
    if (attack_target != null) {
        let distance_from_target = distance(attack_target, character);
        if (distance_from_target < character.range) {
            if (can_use('attack', NOW)) {
				if(can_use("cleave", NOW) && character.mp > 800) {
					parent.socket.emit('unequip', {	slot: 'offhand' });
					ensure_equipped_batch(AXE_SET);
					use_skill('cleave');
				} else {
                	attack(attack_target);
				}
            }
        } else {
            move_to(attack_target);
        }
    } else {
        if (character.map != FARM_LOCATION.map || distance_to_point(FARM_LOCATION.x, FARM_LOCATION.y) > 100) {
            move_to(FARM_LOCATION);
        }
    }
    await sleep(10);
}


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
const whitelist = [
	'mushroomstaff',
	'quiver',
	'pclaw',
	'elixirpnres',
	'dstones',
	'swifty',
	'hbow',
	'pleather',
	'frogt',
	'mcape',
	'firestaff',
	'pmace',
	'gcape',
	'wbookhs',
	'sweaterhs',
	'iceskates',
	'xmace',
	'shield',
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
	'cclaw',
	'snowball',
	'smoke',
	'strbelt',
	'intbelt',
	'dexbelt',
	'dexamulet',
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
	'wshoes',
	'wattire',
	'wcap',
	'wgloves',
	'wbreeches',
];

let destroy = [
	'broom',
	'gphelmet',
	'throwingstars',
	'phelmet',
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
			parent.socket.emit('destroy', { num: i, q: 1, statue: true });
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

setInterval(async () => {
    if (num_items('mpot1') < 8000) {
        buy('mpot1', 1000);
    }
    if (num_items('hpot1') < 8000) {
        buy('hpot1', 1000);
    }
}, 1000);

setTimeout(LOOP, 3000);
