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
	let PATH = [
    {
        "x": -332.544784228186,
        "y": -28.60668093801261,
        "map": "main"
    },
    {
        "x": -1098.3119836572364,
        "y": -25.66158122382164,
        "map": "main"
    },
    {
        "x": -1098.3119836572364,
        "y": 1468.7433898880852,
        "map": "main"
    },
    {
        "x": -941.5004498955194,
        "y": 1828.2149205966134,
        "map": "main"
    },
    {
        "x": -745.6212668639272,
        "y": 1435.4557405026028,
        "map": "main"
    },
    {
        "x": -254.88369627318073,
        "y": 1451.3833205895546,
        "map": "main"
    },
    {
        "x": -254.88369627318073,
        "y": 1883.03331295657,
        "map": "main"
    },
    {
        "x": 155.35621122703043,
        "y": 2010.0332251215852,
        "map": "main"
    },
    {
        "x": 755.088293512992,
        "y": 1687.4011372936136,
        "map": "main"
    },
    {
        "x": 761.6276818319196,
        "y": 1229.3789504459983,
        "map": "main"
    },
    {
        "x": 1027.6649999867,
        "y": 1217.4182393618346,
        "map": "main"
    },
    {
        "x": 1027.6649999867,
        "y": 1024.8732422127284,
        "map": "main"
    },
    {
        "x": 1230.1549969369062,
        "y": 1024.8732422127284,
        "map": "main"
    },
    {
        "x": 1215.1289781416392,
        "y": 783.2172269943968,
        "map": "main"
    },
    {
        "x": 1248.9456082101656,
        "y": 505.8556007689705,
        "map": "main"
    },
    {
        "x": 1248.9456082101656,
        "y": 186.3406071592704,
        "map": "main"
    },
    {
        "x": 1518.4129760723247,
        "y": 180.36797853022193,
        "map": "main"
    },
    {
        "x": 1518.4129760723247,
        "y": -204.36201477517844,
        "map": "main"
    },
    {
        "x": 905.882987322906,
        "y": -204.36201477517844,
        "map": "main"
    },
    {
        "x": 1219.4405425040884,
        "y": 26.725541055403678,
        "map": "main"
    },
    {
        "x": 1219.4405425040884,
        "y": 468.15053322690386,
        "map": "main"
    },
    {
        "x": 1244.3493842096082,
        "y": 883.654368142255,
        "map": "main"
    },
    {
        "x": 1211.3939772508054,
        "y": 1011.9999998999999,
        "map": "main"
    },
    {
        "x": 1161.3939772508054,
        "y": 1043.1949989136976,
        "map": "main"
    },
    {
        "x": 1015.5249972694975,
        "y": 1035.8558487799044,
        "map": "main"
    },
    {
        "x": 1015.5249972694975,
        "y": 1207.4908463472095,
        "map": "main"
    },
    {
        "x": 599.4300045914047,
        "y": 1207.4908463472095,
        "map": "main"
    },
    {
        "x": 247.40212425370902,
        "y": 977.7129645645103,
        "map": "main"
    },
    {
        "x": 199.89457986658928,
        "y": 773.4654229758828,
        "map": "main"
    },
    {
        "x": 3.4595837952890065,
        "y": 770.0454220442818,
        "map": "main"
    },
    {
        "x": 3.4595837952890065,
        "y": -100.96956153541342,
        "map": "main"
    },
    {
        "x": -344.63541024281136,
        "y": -100.96956153541342,
        "map": "main"
    },
    {
        "x": -344.63541024281136,
        "y": -388.5445567839136,
        "map": "main"
    },
    {
        "x": -262.08041089391145,
        "y": -388.5445567839136,
        "map": "main"
    },
    {
        "x": -262.08041089391145,
        "y": -562.9845542951136,
        "map": "main"
    },
    {
        "x": -363.16540987221157,
        "y": -625.6495540418133,
        "map": "main"
    },
    {
        "x": -288.74276561333943,
        "y": -569.5019094174438,
        "map": "main"
    },
    {
        "x": -288.74276561333943,
        "y": -348.4819128378452,
        "map": "main"
    },
    {
        "x": -321.6577659550395,
        "y": -348.4819128378452,
        "map": "main"
    },
    {
        "x": -330.0302454076889,
        "y": -30.07443756194077,
        "map": "main"
    }
];
    let FARM_TARGET = "cutebee";
    let INDEX = 0;

    function FARM_LOCATION() {
		return PATH[INDEX];
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
				INDEX %= PATH.length;
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
