const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const {
    Lazy,
    Adapter,
    Targeter,
    Skills: { three_shot, hardshell, taunt, warcry, curse, darkblessing, absorb },
    Mover,
    ItemFilter,
    Exchange,
} = await proxied_require(
    "Exchange.js",
    "Mover.js",
    "Lazy.js",
    "Adapter.js",
    "Targeter.js",
    "GiveawayJoin.js",
    "Skills.js",
    "ItemFilter.js"
);

Mover.init(smart, G, smart_move);
let range_multiplier = 1;
if (character.ctype == "warrior") {
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
parent.socket.emit("merchant", {
    close: 1,
});
const tree_exists = G.maps.main.npcs.find(({ id }) => id == "newyear_tree"),
    pi = Math.PI,
    character_name = character.name,
    tier_one_gear = ["coat", "pants", "gloves", "shoes"];

function get_log(log) {
    return localStorage.getItem(log + ":" + character.name);
}

function get(name) {
	// persistent get function that works for serializable objects
	try {
		return JSON.parse(localStorage.getItem('cstore_' + character.name + name));
	} catch (e) {
		return null;
	}
}
function set(name, value) {
	// persistent set function that works for serializable objects
	try {
		localStorage.setItem('cstore_' + character.name + name, JSON.stringify(value));
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


let DESTROY = ["wattire", "wgloves", "quiver"];
let SELL = ["strring", "vitring", "intring", "dexring", "ringsj", "hpamulet", "hpbelt", "wbook0"];
setInterval(() => {
    for (let i = 0; i < character.items.length; i++) {
        let item = character.items[i];
        if (item != null) {
            if (item.p == null) {
                if(DESTROY.includes(item.name)) {
                    console.log(`[${character.name}]: destroyed ${item.name}`);
                    parent.socket.emit("destroy", {
                        num: i, q: 1, statue: true
                    });
                    character.items[i] = null;
                    increment_destroyed();
                } else if(SELL.includes(item.name)) {
                    sell(i);
                    character.items[i] = null;
                }
            } else if (item.p != null) {
                if (i != 0) {
                    //parent.socket.emit("imove", { a: i, b: 0 });
                }
                if (item.p != null) {
                    // parent.socket.emit('mail', { to: "Geoffriel", subject: "Shiny Thing", message: "", item: true });
                } else {
                    // parent.socket.emit('mail',{to:"Geoffriel",subject:"Strength Ring",message:"",item:true});
                }
                // break;
            }
        }
    }
}, 10000);

function happy_holidays() {
    // If first argument of "smart_move" includes "return"
    // You are placed back to your original point
    tree = true;
    let xmas_tree = G.maps.main.npcs.find(({ id }) => id === "newyear_tree");
    move_to(
        {
            x: 0,
            y: 0,
            map: "main",
        },
        () => {
            tree = false;
            // This executes when we reach our destination
            parent.socket.emit("interaction", {
                type: "newyear_tree",
            });
            say("Happy Holidays!");
        }
    );
}
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = ["wolfie"],
    state = "farm",
    group = ["Boismon", "earthiverse", "earthRan3", "earthRan2", "Nihkaa"],
    to_party = ["earthiverse", "Boismon"],
    party_leader = "earthiverse",
    merchant = "AriaHarper",
    priest = "Geoffriel",
    warrior_tank = false,
    need_priest = false,
    min_potions = 18000, //The number of potions at which to do a resupply run.
    target;
send_cm('Polio', { data: "partyInvite", id: character.name });
let mana = "mpot1",
    health = "hpot0",
    potion_types = [health, mana]; //The types of potions to keep supplied.
// /*

// */
let to_sell = new Set([
    "molesteeth",
    "gemfragment",
    "helmet",
    "wbreeches",
    "quiver",
    "intamulet",
    "dexamulet",
    "stramulet",
]);
let to_send = new Set([
    'bwing',
    'cryptkey',
    'bataxe',
    'handofmidas',
    "orbofstr",
    "orbofdex",
    "essenceoffire",
    "networkcard",
    "wshoes",
    "glitch",
    "svenom",
    "offeringp",
    "goldenegg",
    "essenceofnature",
    "greenenvelope",
    "funtoken",
    "monstertoken",
    "wcap",
    "feather0",
    "egg0",
    "egg1",
    "egg2",
    "egg3",
    "egg4",
    "egg5",
    "egg6",
    "egg7",
    "egg8",
    "candy1",
    "x0",
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "x8",
    "mcape",
    "firestaff",
    "ringsj",
    "fireblade",
    "armorbox",
    "skullamulet",
    "weaponbox",
    "gem1",
    "cupid",
    "essenceoffrost",
    "candypop",
    "intbelt",
    "dexbelt",
    "strbelt",
    "redenvelopev4",
    "candy0v3",
    "candy1v3",
    "gem0",
    "seashell",
    "lostearring",
    "mistletoe",
    "candycane",
    "ornament",
    "intearring",
    "dexearring",
    "vitearring",
    "strearring",
    "vitscroll",
    "sshield",
    "woodensword",
    "candy0",
    "smoke",
    "ascale",
    "pleather",
    "vitring",
    "wattire",
    "leather",
    "phelmet",
    "oozingterror",
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
                parent.socket.emit("party", {
                    event: "leave",
                });
            }
        } else {
            if (party_leader == "DoubleG") {
                send_cm("DoubleG", {
                    data: "partyInvite",
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

const ensure_equipped = (() => {
    const EQUIP_ADAPTABLE = {
        num: 0,
        slot: "",
    };
    const EQUIP_ADAPTER = Adapter("num", "slot");
    return (item_filter, slot) => {
        switch (typeof item_filter) {
            case "function":
                if (!item_filter(character.slots[slot])) {
                    const index = get_index_of_item(item_filter);
                    if (index != -1) {
                        parent.socket.emit(
                            "equip",
                            EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
                        );
                        return true;
                    }
                    return false;
                }
                return true;
            case "string":
                if (character.slots[slot]?.name != item_filter) {
                    const index = get_index_of_item(item_filter);
                    if (index != -1) {
                        parent.socket.emit(
                            "equip",
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
let orbit_speed = character.name === "Geoffriel" ? 50 : 50;
const orbit_target = { real_x: 110, real_y: -2020 };
function angleToPoint(x, y) {
    const deltaX = character.real_x - x;
    const deltaY = character.real_y - y;

    return Math.atan2(deltaY, deltaX);
}
function pointOnAngle(entity, angle, distance) {
    return {
        x: entity.real_x + distance * Math.cos(angle),
        y: entity.real_y + distance * Math.sin(angle),
    };
}
function cruise(speed) {
    parent.socket.emit("cruise", speed);
}
function hr_time() {
    if (typeof process != "undefined") {
        return process.hrtime.bigint();
    } else {
        const time = parent.performance.now();
        const seconds = BigInt(~~time) * BigInt(1e6);
        return seconds;
    }
}
let angle = Math.asin(orbit_speed / 2 / 80) * 2;
// show_json(Math.PI * 2 / angle * 1000)
let time_taken_to_orbit = (Math.PI * 2) / angle;
function orbit_entity(entity, distance) {
    const point = angleToPoint(entity.real_x, entity.real_y);
    const two_pi_radians = 2 * Math.PI;
    let angle = Math.asin(orbit_speed / 2 / distance) * 2;
    // show_json(Math.PI * 2 / angle * 1000)
    const time_taken_to_orbit = ((Math.PI * 2) / angle) * 1000;
    const ttto = time_taken_to_orbit;
    var position = pointOnAngle(
        entity,
        ((Number(hr_time() / BigInt(1e6)) % ttto) / ttto) * two_pi_radians +
        (((two_pi_radians / /* Object.keys(parent.party).length */ (3 || 1)) *
            to_party.indexOf(character.name)) %
            two_pi_radians),
        distance
    );
    if (can_move_to(position.x, position.y)) {
        if (
            character.speed != orbit_speed &&
            character.map != "winterland" &&
            character.ctype != "warrior"
        ) {
            // cruise(orbit_speed);
        }
        clear_drawings();
        // draw_line(character.x, character.y, position.x, position.y);
        move(position.x, position.y);
    } else if (!smart.moving) {
        smart_move({
            x: position.x,
            y: position.y,
        });
    }
}
setInterval(() => {
    switch (character.name) {
        case "Geoffriel":
            orbit_entity(orbit_target, 30);
            break;
        case "Raelina":
            orbit_entity(orbit_target, 30);
            break;
        case "Rael":
            orbit_entity(orbit_target, 30);
            break;
    }
}, 300);

const BOOSTER_FILTER = new ItemFilter()
    .names("luckbooster", "goldbooster")
    .build();
if (character.name == "Geoffriel") {
    setInterval(() => {
        let switched_booster = false;
        let booster_index = -1;
        for (let chest_id in parent.chests) {
            if (!switched_booster) {
                let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
                shift(index_of_booster, "goldbooster");
                switched_booster = true;
                booster_index = index_of_booster;
            }
            parent.socket.emit("open_chest", {
                id: chest_id,
            });
        }
        if (switched_booster) {
            shift(booster_index, "luckbooster");
        }
    }, 1000);
}
setInterval(() => {
    if (num_items(mana) < min_potions) {
        buy(mana, 1000);
    }
    if (num_items(health) < min_potions) {
        buy(health, 1000);
    }
    if (character.name == "Geoffriel") {
        if (!ensure_equipped("pumpkinspice", "elixir")) {
            send_cm(merchant, "yo, I need some pump");
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
                    send_item(merchant, i, item.q ?? 1);
                    sold++;
                } else if (
                    (to_send.has(item.name) &&
                        sold < max_send &&
                        (item.level == 0 || item.level == null)) ||
                    tier_one_gear.includes(item.name)
                ) {
                    send_item(merchant, i, item.q ?? 1);
                    sold++;
                }
            }
        }
        if (character.gold > 51000000) {
            send_gold(merchant, character.gold - 50000000);
        }
        if (character.ctype == "warrior") {
            if (!ensure_equipped("pumpkinspice", "elixir")) {
                send_cm(merchant, "yo, I need some pump");
            }
        }
    }
}, 500);

parent.socket.on("cm", async function (a) {
    let name = a.name;
    let data = await JSON.parse(a.message);
    // function on_cm(name, data) {
    if (group.includes(name) || to_party.includes(name) || name == "AriaHarper") {
        if (typeof data == "object") {
            if (data.command) {
                switch (data.command) {
                    case "send_cm":
                        send_cm(data.name, data.data);
                        break;
                    case "server":
                        name == "AriaHarper" && parent.switch_server(data.data);
                        break;
                    case "delete_chest":
                        delete parent.chests[data.data];
                        break;
                }
            }
        } else {
            switch (data) {
                case "shutdown":
                    name == "AriaHarper" && parent.shutdown();
                    break;
                case "shutdown_all":
                    name == "AriaHarper" && parent.shutdown_all();
                    break;
            }
        }
    }
});
parent.socket.on("server_message", (data) => {
    if (JSON.stringify(data).includes("shutdown")) {
        parent.shutdown_all();
    }
});
parent.socket.on("request", ({ name }) => {
    console.log("Party Request");
    if (to_party.indexOf(name) != -1 && name != merchant) {
        accept_party_request(name);
    }
});

parent.socket.on("invite", ({ name }) => {
    console.log("Party Invite", name);
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
        if (character.items[i]?.name?.startsWith?.("hpot")) {
            equip(i);
            break;
        }
    }
}

async function use_mp() {
    for (let i = 0; i < character.isize; i++) {
        if (character.items[i]?.name == mana) {
            try {
                let r = Promise.race([equip(i), sleep(character.ping * 4)]);
                if ((await r) == undefined) {
                    console.log(
                        'Equip promise seems to have been dropped: ' +
                        character.name
                    );
                    parent.resolve_deferred('equip', undefined);
                }
            } catch (e) {
                console.log('wth', e);
            }
            break;
        }
    }
}

function get_index_of_item(name, max_level) {
    if (typeof name == "function") {
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
    if (character.map === "jail") {
        parent.socket.emit("leave");
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

if (character.ctype == "warrior" && character.name == "Rael") {
    // pointless
}
parent.socket.on("hit", (data) => {
    if (data.hid == character.name) {
        if (!data.splash) {
            switch (data.source) {
                case "curse":
                    reduce_cooldown("curse", (character.ping ?? 0) * 0.95);
                    break;
                case "attack":
                case "heal":
                    reduce_cooldown("attack", (character.ping ?? 0) * 0.95);
                    break;
            }
        }
    }
});

const kiting_origin = {
    x: 110,
    y: -2020,
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

const NEEDS_PRIEST = new Lazy([...to_party, merchant])
    .map(get_player)
    .filter(needs_hp)
    .while(() => can_use("attack"));
//This function contains our logic for when we're farming mobs
const afflicted = (status_name) => status_name in character.s;

function state_controller() {
    //Default to farming
    let new_state = "farm";
    if (
        tree_exists &&
        !character.s.holidayspirit &&
        find_viable_target_ignore_fire()?.target == null
    ) {
        new_state = "tree";
    } else if (curEvent != null) {
        new_state = "event";
    }
    if (state != new_state) {
        state = new_state;
    }
}
setInterval(() => {
    //Determine what state we should be in.
    state_controller();

    //Switch statement decides what we should do based on the value of 'state'
    switch (state) {
        case "farm":
            farm();
            break;
        case "tree":
            happy_holidays();
            break;
        case "event":
            break;
    }
}, 100);

if (character.ctype == "warrior" && character.name == "Rael") {
    function hr_time() {
        if (typeof process != "undefined") {
            return Number(process.hrtime.bigint() / BigInt(1e6));
        } else {
            const time = parent.performance.now();
            return ~~time;
        }
    }
    let warriors = ["Rael", "Raelina"];
    let interval = 4000;
    let delay = (warriors.indexOf(character.name) * interval) / warriors.length;
    (async function () {
        const wait = (ms) => new Promise((r) => setTimeout(r, ms));
        await wait(interval - (hr_time() % interval) + delay);
    })();
}

let MAINHAND_FILTER = null;
let OFFHAND_FILTER = null;
if (character.name == "Rael") {
    MAINHAND_FILTER = ItemFilter.ofName("glolipop").level("11", "==").build();
    OFFHAND_FILTER = ItemFilter.ofName("glolipop").level("10", "==").build();
} else if (character.name == "Raelina") {
    MAINHAND_FILTER = ItemFilter.ofName("vhammer").level("7", "==").build();
    OFFHAND_FILTER = ItemFilter.ofName("ololipop").level("9", "==").build();
}

let MANA_STEAL_FILTER = ItemFilter.ofName("tshirt9").level("6", ">=").build();
let last_cleave = Date.now();
let AXE_FILTER = ItemFilter.ofName("bataxe").level("7", ">=").build();
let CHEST_FILTER = ItemFilter.ofName("tshirt7").build();

async function farm(location) {
    switch (character.ctype) {
        case "priest":
            if (
                can_use("darkblessing") &&
                !afflicted("darkblessing") &&
                afflicted("warcry")
            ) {
                darkblessing();
            }
            // Basic states to determine if we can heal others. Prevents high spam.
            NEEDS_PRIEST.forEach((entity) => {
                if (can_heal(entity)) {
                    let monster_target = character.target;
                    heal(entity);
                    parent.socket.emit("target", {
                        id: monster_target,
                    });

                    return false;
                }
                return true;
            });
            break;
        case "warrior":
            if (can_use("warcry") && !afflicted("warcry")) {
                warcry();
            }
            if (character.name == "Rael") {
                let to_taunt = [];
                for (let x in parent.entities) {
                    if (parent.entities[x].mtype == "wolfie" && parent.entities[x].target == null) {
                        to_taunt.push(x);
                    }
                }
                if (to_taunt.length > 1) {
                    if (can_use("agitate")) {
                        use_skill("agitate");
                    }
                } else if (to_taunt.length == 1) {
                    if (can_use("taunt")) {
                        use_skill("taunt", to_taunt[0]);
                    }
                }
            }
            break;
    }
    const viable_targets = targeter.GetPriorityTarget(5);
    let attack_target = find_viable_target();

    if (attack_target != null) {
        if (character.name == "Geoffriel") {
            if (can_use("curse")) {
                curse(attack_target.id);
            }
        }
        if (
            parent.distance(attack_target, character) <
            character.range + character.xrange &&
            can_use("attack")
        ) {
            switch (character.ctype) {
                case "priest":
                    break;
                case "warrior":
                    ensure_equipped(MAINHAND_FILTER, "mainhand");
                    ensure_equipped(OFFHAND_FILTER, "offhand");
                    ensure_equipped(CHEST_FILTER, "chest");
                    attack(attack_target);
                    if (
                        !("sugarrush" in character.s) &&
                        Date.now() - last_cleave > 2000 &&
                        can_use("cleave") &&
                        character.mp > 1300
                    ) {
                        let manasteal_index = character.items.findIndex(MANA_STEAL_FILTER);
                        if (manasteal_index != -1) {
                            equip(manasteal_index, "chest");
                        }
                        let axe_index = character.items.findIndex(AXE_FILTER);
                        await unequip("offhand");
                        let index = character.items.findIndex(OFFHAND_FILTER);
                        equip(axe_index, "mainhand");
                        use_skill("cleave");
                        if (manasteal_index != -1) {
                            equip(manasteal_index, "chest");
                        }
                        equip(axe_index, "mainhand");

                        equip(index, "offhand");
                        last_cleave = Date.now();
                    }
                    break;
                case "ranger":
                    if (
                        true &&
                        character.ctype == "ranger" &&
                        can_use("attack") &&
                        (targets = viable_targets
                            .slice(0, 5)
                            .filter(entity => {
                                return (
                                    parent.distance(entity, character) < character.range + 10
                                );
                            })
                            .map(({ id }) => id)).length >= 5 &&
                        character.level >= 75 &&
                        character.mp > 420
                    ) {
                        parent.socket.emit("skill", {
                            name: "5shot",
                            ids: targets
                        });
                    } else if (
                        character.ctype == "ranger" &&
                        can_use("attack") &&
                        (targets = viable_targets
                            .slice(0, 3)
                            .filter(entity => {
                                return (
                                    parent.distance(entity, character) < character.range + 10
                                );
                            })
                            .map(({ id }) => id)).length >= 2 &&
                        character.level >= 60 &&
                        character.mp > 300 &&
                        true
                    ) {
                        parent.socket.emit("skill", {
                            name: "3shot",
                            ids: targets
                        });
                    } else {
                        attack(attack_target);
                    }
                default:
                    attack(attack_target);
            }
        } else {
            if (character.ctype == "warrior") {
                if (
                    !("sugarrush" in character.s) &&
                    Date.now() - last_cleave > 2000 &&
                    can_use("cleave") &&
                    character.mp > 1300 &&
                    ms_until("attack") > 600
                ) {
                    let manasteal_index = character.items.findIndex(MANA_STEAL_FILTER);
                    if (manasteal_index != -1) {
                        equip(manasteal_index, "chest");
                    }
                    let axe_index = character.items.findIndex(AXE_FILTER);
                    await unequip("offhand");
                    equip(axe_index, "mainhand");
                    use_skill("cleave");
                    if (manasteal_index != -1) {
                        equip(manasteal_index, "chest");
                    }
                    equip(axe_index, "mainhand");
                    let index = character.items.findIndex(OFFHAND_FILTER);
                    equip(index, "offhand");
                    last_cleave = Date.now();
                }
            }
        }
    }
}
if (character.name == "Rael") {
    setTimeout(() => {
        parent.socket.emit("ccreport");
    }, 60000);
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
    TagTargets: false,
    Solo: false,
});

function next_event(curEvent) {
    return null;
}
if (true) {
    setInterval(function () {
        let data = parent.socket.server_data ?? {};
        curEvent = next_event(curEvent);
        if (curEvent != null) {
            farm(curEvent);
        }
    }, 250);
}

function find_viable_target() {
    return targeter.GetPriorityTarget(
        1,
        true,
    /* ignore_fire */ true,
        false,
        character.name != "Geoffriel",
        character.name == "Geoffriel"
    ); // [0];
}

function find_viable_target_ignore_fire() {
    return targeter.GetPriorityTarget(
        1,
        true,
        true,
        false,
        character.name != "Geoffriel",
        character.name == "Geoffriel"
    ); // [0];
}
