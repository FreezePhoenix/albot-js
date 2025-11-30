const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));
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

restock({
	sell: {
			offeringp: [2500000, 500],
	},
	buy: {},
});

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
    parent.socket.emit('open_chest', {
        id: data.id,
    });
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


let FARM_LOCATION = {
    x: -1124,
    y: 1118,
    map: 'main',
};

const LOOP = async () => {
    while (true) {
        NOW = performance.now();
        await farm();
        NOW = performance.now();
        await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
    }
};


let LOOKUP = {
    USIII: "US II",
    USII: "US I",
    USI: "EU II",
    EUII: "EU I",
    EUI: "ASIA I",
    ASIAI: "US III",
};

var targeter = new Targeter(['frog'], [character.name], {
    RequireLOS: false,
    TagTargets: true,
    Solo: false,
});

function find_viable_target() {
    return targeter.GetPriorityTarget(1, true, /* ignore_fire */ true);
}

async function farm() {
    let attack_target = find_viable_target();
    if (attack_target != null) {
        let distance_from_target = distance(attack_target, character);
        if (distance_from_target < character.range) {
            if (attack_target.hp > 1 && attack_target.mtype == "frog") { // We need to kill frogs with throw.
                // We need to use throw.
                let shield_index = -1;
                for (let i = 0; i < character.items.length; i++) {
                    if (character.items[i] != null && character.items[i].name == "wshield") {
                        shield_index = i;
                        break;
                    }
                }
                if (shield_index != -1) {
                    parent.socket.emit("skill", {
                        name: "throw",
                        num: shield_index,
                        id: attack_target.id
                    });
                } else {
                    buy("wshield");
					await sleep(300);
					for (let i = 0; i < character.items.length; i++) {
	                    if (character.items[i] != null && character.items[i].name == "wshield") {
	                        shield_index = i;
	                        break;
	                    }
	                }
					if (shield_index != -1) {
	                    parent.socket.emit("skill", {
	                        name: "throw",
	                        num: shield_index,
	                        id: attack_target.id
	                    });
	                }
                }
            } else if (can_use('attack', NOW)) {
				if(can_use("mfrenzy", NOW)) {
					parent.socket.emit("skill", {
						name: "mfrenzy"
					});
				}
                attack(attack_target);
            }
        } else {
            move_to(attack_target);
        }
    } else {
        if (character.map != FARM_LOCATION.map || distance_to_point(FARM_LOCATION.x, FARM_LOCATION.y) > 100) {
            move_to(FARM_LOCATION);
        } else {
            let SERVER_ID = parent.server_region + parent.server_identifier;
            parent.switch_server(LOOKUP[SERVER_ID]);
            await sleep(10000);
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
