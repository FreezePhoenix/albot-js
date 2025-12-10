const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));
const {
    Mover,
    Targeter
} = await proxied_require(
    'Mover.js',
    'Targeter.js',
);

let FARM_TARGET = "boar";

let FARM_LOCATION = {
	    x: 19.5,
	    y: -1109,
	    map: 'winterland',
	},
	to_party = ['Rael', 'Raelina', 'Geoffriel'],
	party_leader = 'Geoffriel',
	merchant = 'AriaHarper';

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
		for(let i = 0; i < EARTH.length; i++) {
			if(EARTH[i] in parent.entities) {
				EARTH_NEARBY = EARTH[i];
				break;
			}
		}
		if (character.party) {
			if(EARTH_NEARBY && !character.party.startsWith("earth")) {
				
				parent.socket.emit("party",{event:"leave"});
				send_party_request(EARTH_NEARBY);
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

var targeter = new Targeter([FARM_TARGET], [character.name], {
    RequireLOS: false,
    TagTargets: true,
    Solo: false,
});

function find_viable_target() {
    return targeter.GetPriorityTarget(1, false, /* ignore_fire */ true)[0];
}

async function farm() {
    let attack_target = find_viable_target();
    if (attack_target != null) {
        let distance_from_target = distance(attack_target, character);
        if (distance_from_target < character.range) {
            if (can_use('attack', NOW)) {
                attack(attack_target);
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
	'wbookhs',
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
