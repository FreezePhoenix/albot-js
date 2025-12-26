const sleep = (ms, value) => new Promise((r) => setTimeout(r, ms, value));
const {
    Mover,
    Targeter
} = await proxied_require(
    'Mover.js',
    'Targeter.js',
);

let SERVER_ID = parent.server_region + " " + parent.server_identifier;
if (SERVER_ID != "EU I") {
    parent.switch_server("EU I");
} else {
    let FARM_TARGET = "cutebee";
    let INDEX = 0;
    let MAX_INDEX = G.maps.main.monsters.length;

    function center(boundary) {
        return {
            x: (boundary[0] + boundary[2]) / 2,
            y: (boundary[1] + boundary[3]) / 2,
            map: "main"
        }
    }

    function FARM_LOCATION() {
        return center(G.maps.main.monsters[INDEX].boundary);
    }
    let to_party = ['Rael', 'Raelina', 'Geoffriel'],
        party_leader = 'trololol',
        merchant = 'AriaHarper';


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

    parent.socket.on('drop', data => {
		parent.socket.emit('open_chest', data);
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

    const LOOP = async () => {
        while (true) {
            NOW = performance.now();
            await farm();
            NOW = performance.now();
            await sleep(Math.max(100, Math.ceil(ms_until('attack', NOW))));
        }
    };

	setInterval(() => {
		for(let x in parent.entities) {
			if(parent.entities[x].type == "monster" && parent.entities[x].target == character.name && can_use("scare", NOW)) {
				use_skill("scare");
				break;
			}
		}
	}, 1000);

    function find_viable_target() {
        return targeter.GetPriorityTarget(1, false, /* ignore_fire */ true, false, false, false, true)[0];
    }

    async function farm() {
        let attack_target = find_viable_target();
        if (attack_target != null) {
            let distance_from_target = distance(attack_target, character);
            if (distance_from_target < character.range) {
                if (attack_target.hp > 1) {
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
                    }
                } else if (can_use('attack', NOW)) {
                    attack(attack_target);
                }
            } else {
                move_to(attack_target);
            }
        } else {
			let FARM = FARM_LOCATION();
            if (character.map != FARM.map || distance_to_point(FARM.x, FARM.y) > 100) {
                move_to(FARM);
            } else {
				INDEX++;
				INDEX %= G.maps.main.monsters.length;
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
                parent.socket.emit('destroy', {
                    num: i,
                    q: 1,
                    statue: true
                });
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

}
