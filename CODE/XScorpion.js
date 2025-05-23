let tree = false,
	snowman = 0,
	socket = parent.socket;
socket.emit("merchant", {
	close: 1
});
const tree_exists = G.maps.main.npcs.find(({ id }) => id == "xmas_tree"),
	  pi = Math.PI,
	  character_name = character.name,
	  orbit_speed = 64,
	  tier_one_gear = ["coat", "pants", "gloves", "shoes"],
	  ThreeShotTargets = new Set();
game_log(parent.server_addr);
let stomp_times = 0;
let stomp_duration = 3200;

function append_log(log, data) {
	let str = `${data}`;
	log = `${log}`;
	localStorage.setItem(
		log + ":" + character.name,
		(localStorage.getItem(log + ":" + character.name)
		 ? localStorage.getItem(log + ":" + character.name) + "\n"
		 : "") + str
	);
}
setInterval(() => {
	for (let x in parent.entities) {
		const entity = parent.entities[x];
		if (entity.ctype === "merchant" || entity.stand) {
			for (let slot_name in entity.slots) {
				if (slot_name.startsWith("trade")) {
					let slot = entity.slots[x];
					if (slot != null && slot.giveaway) {
						if (!slot.list.includes(character_name)) {
							join_giveaway(slot_name, entity.name, slot.rid);
						}
					}
				}
			}
		}
	}
}, 100);

function join_giveaway(c, b, a) {
	socket.emit("join_giveaway", { slot: c, id: b, rid: a });
}

function get_log(log) {
	return localStorage.getItem(log + ":" + character.name);
}

function handle_death() {
	setTimeout(() => {
		parent.socket.emit("respawn");
		send_cm("Firenus", "teleport");
	});
}
/*
setInterval(() => {
  parent.emit_dracul();
  parent.switch_server(parent.server_region + " " + parent.server_identifier);
}, 60 * 1000 * 60 * 0.1);
// */
// /*
function cruise(speed) {
	socket.emit("cruise", speed);
}
// cruise(orbit_speed);

if (character.ctype == "rogue") {
	setInterval(() => {
		for (let i = 0; i < to_party.length; i++) {
			target = parent.entities[to_party[i]];
			if (
				((target && !target.s.rspeed) ||
				 (to_party[i] == character.name && !character.s.rspeed)) &&
				character.level >= 40
			) {
				use_skill("rspeed", to_party[i]);
				break;
			}
		}
	}, 1000);
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

function orbit_entity(entity, distance) {
	const point = angleToPoint(entity.real_x, entity.real_y);
	const two_pi_radians = 2 * pi;
	let angle = Math.asin(orbit_speed / 2 / distance) * 2;
	// show_json(Math.PI * 2 / angle * 1000)
	const time_taken_to_orbit = ((Math.PI * 2) / angle) * 1000;
	const ttto = time_taken_to_orbit;
	var position = pointOnAngle(
		entity,
		(((Number(hr_time() / BigInt(1e6)) % ttto) - stomp_times * stomp_duration) /
		 ttto) *
		two_pi_radians +
		(((two_pi_radians / /* Object.keys(parent.party).length */ (3 || 1)) *
		  ["Rael", ...to_party].indexOf(character.name)) %
		 two_pi_radians),
		distance
	);
	if (character.name != "Rael" || true) {
		position = pointOnAngle(
			entity,
			((two_pi_radians / /* Object.keys(parent.party).length */ (2 || 1)) *
			 ["Rael", ...to_party].indexOf(character.name)) %
			two_pi_radians,
			distance / 2
		);
	}
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
		let avoid = avoidMobs(position);
		if (!avoid) {
			move(position.x, position.y);
		}
	} else if (!smart.moving) {
		smart_move({
			x: position.x,
			y: position.y
		});
	}
}

setTimeout(() => {
	if (character.ctype === "ranger") {
		// parent.emit_jr();
		// parent.switch_server(parent.server_region + " " + parent.server_identifier);
	}
}, 60 * 1000 * 60 * 0.5);
// */

function happy_holidays() {
	G.maps.main.npcs.find(({ id }) => id === "xmas_tree").return = true;
	// If first argument of "smart_move" includes "return"
	// You are placed back to your original point
	tree = true;
	let xmas_tree = G.maps.main.npcs.find(({ id }) => id === "xmas_tree");
	if (!smart.moving) {
		if (character.map == "main") {
			use_skill("use_town");
		}
		let coords = {
			x: character.x,
			y: character.y
		};
		smart_move(
			{
				x: xmas_tree.position[0],
				y: xmas_tree.position[1],
				map: "main"
			},
			function() {
				tree = false;
				if (character.ctype != "mage") {
					send_cm("Firenus", "teleport");
				} else {
					use_skill("blink", [coords.x, coords.y]);
				}
				// This executes when we reach our destination
				parent.socket.emit("interaction", {
					type: "xmas_tree"
				});
				say("Happy Holidays!");
			}
		);
	}
}
let targets = {
	Raphiel: ["mole"],
	Firenus: ["bee"],
	Boismon: ["bee"],
	Daedulaus: ["ent"],
	AriaHarper: ["xscorpion"],
	Geoffriel: ["xscorpion"],
	Rael: ["xscorpion"],
	Malthael: ["bee"],
	CuteBurn: ["ent"],
	Raelina: ["xscorpion"]
};
game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = targets[character_name],
	state = "farm",
	group = ["Rael", "Raelina", "Geoffriel"], // The group our character operates in. This generally forms a chain.
	to_party = [
		"Rael",
		"Daedulaus",
		"Raelina",
		"Geoffriel",
		"AriaHarper"
	],
	party_leader = "Rael",
	grey_list = ["Moebius"], // Characters we trust, but are willing to nullify if needed be (and are in PVP)
	chain = group.slice(0).reverse(), // How is the chain structured?
	follow = group.indexOf(character_name) != 0, // Should we be following someone?
	follow_distance = 10, // How far should we be from the person we are following?
	merchant = "AriaHarper",
	priest = "Geoffriel",
	warrior_tank = true,
	need_priest = true,
	mage = "Firenus",
	min_potions = 18000, //The number of potions at which to do a resupply run.
	target;

let mana = ["Firneus", "Malthael"].includes(character.name) ? "mpot1" : "mpot0",
	health = "hpot0",
	potion_types = [health, mana]; //The types of potions to keep supplied.
// /*
//The mtype of the event mob we want to kill.
let event_mob_names = ["mrpumpkin"];

//What monsters do we want to farm in between snowman spawns?
var farm_types = [];
const _accept_magiport = {
	name: mage
};
parent.socket.on("magiport", data => {
	if (group.includes(data.name) || to_party.includes(data.name)) {
		parent.socket.emit("magiport", _accept_magiport);
	}
});
//Where do we want to go in between snowman spawns?
var home_location = {
	x: -471,
	y: -692,
	map: "halloween"
};

let switched = false;
//The following variables are assigned while the script is running.

//The map the event mob spawned on
const events = [];
const cachedEvents = new Map();
//Holds the event mob entity if we find it.
let wabbit = null;
let curEvent = null;
if(character.name == "Rael") {
setInterval(function() {
  curEvent = events.find(item => {
		return "easterluck" in character.s ? false : item.name === "wabbit";
	});
 	let data = typeof parent.socket.server_data == "undefined" ? parent.S : parent.socket.server_data;
  if(data.wabbit && data.wabbit.live && curEvent == null) {
    if(!character.s.easterluck) {
      if(events[0] == undefined) {
        curEvent = {x: data.wabbit.x, y: data.wabbit.y, name: "wabbit", map: data.wabbit.map};
      }
    }
  }
	//Try to find the event mob
	if (curEvent != null) {
		target = get_nearest_monster({
			type: curEvent.name
		});
	} else {
		target = null;
	}

	//Did we find it?
	if (target !== null && (curEvent != null && target.mtype === curEvent.name)) {
		//Wait for someone to attack first disable this if you're able to tank it.
		if (target.target != null || true) {
			if (character.ctype == "priest") {
				let team = ["Rael", ...to_party].map(get_player);
				// Basic states to determine if we can heal others. Prevents high spam.
				let healed = false,
					revived = false;
				for (let i = 0, len = team.length; i < len; i++) {
					let char = team[i];
					if (char != null) {
						if (char.rip && !char.c.revival) {
							const revive_target = char;
							if (
								can_use("revive") &&
								revive_target.hp == revive_target.max_hp
							) {
								if (!revived) {
									use_skill("revive", revive_target);
									revived = true;
								}
							} else {
								if (revive_target.hp != revive_target.max_hp) {
									if (!healed && can_heal(revive_target) && can_use("heal")) {
										heal(revive_target);
										healed = true;
									}
								}
							}
						} else if (!healed && needs_hp(char)) {
							const heal_target = char;
							if (can_heal(heal_target) && can_use("heal")) {
								heal(heal_target);
								healed = true;
							}
						}
					}
				}
			}
			move_or_attack(target);
		}
		if (target.mtype == "wabbit") {
			wabbit = target.id;
		}
	} else {
		//normal farming logic here
		if (curEvent == null) {
			if (false) {
				if (
					(character.map != home_location.map ||
					 simple_distance(
						{
							x: character.real_x,
							y: character.real_y
						},
						{
							x: home_location.x,
							y: home_location.y
						}
					) > 300) &&
					!smart.moving
				) {
					smart_move({
						x: home_location.x,
						y: home_location.y,
						map: home_location.map
					});
				} else {
					if (target == null) {
						for (type in farm_types) {
							var mtype = farm_types[type];

							var nearest = get_nearest_monster({
								type: mtype,
								path_check: true
							});

							if (nearest != null) {
								target = nearest;
								break;
							}
						}
					}
					if (event.name == "wabbit") {
						events = events.filter(({ name }) => name != "wabbit");
            curEvent = null;
					}
					if (target != null) {
						move_or_attack(target);
					}
				}
			}
		} else {
			if (character.ctype == "priest") {
				let team = ["Rael", ...to_party].map(get_player);
				// Basic states to determine if we can heal others. Prevents high spam.
				let healed = false,
					revived = false;
				for (let i = 0, len = team.length; i < len; i++) {
					let char = team[i];
					if (char != null) {
						if (char.rip && !char.c.revival) {
							const revive_target = char;
							if (
								can_use("revive") &&
								revive_target.hp == revive_target.max_hp
							) {
								if (!revived) {
									use_skill("revive", revive_target);
									revived = true;
								}
							} else {
								if (revive_target.hp != revive_target.max_hp) {
									if (!healed && can_heal(revive_target) && can_use("heal")) {
										heal(revive_target);
										healed = true;
									}
								}
							}
						} else if (!healed && needs_hp(char)) {
							const heal_target = char;
							if (can_heal(heal_target) && can_use("heal")) {
								heal(heal_target);
								healed = true;
							}
						}
					}
				}
			}
			if (character.map == curEvent.map) {
				var distToEvent = simple_distance(
					{
						x: character.real_x,
						y: character.real_y
					},
					{
						x: curEvent.x,
						y: curEvent.y
					}
				);
				if (distToEvent < 10) {
					let event = events.splice(0, 1)[0];
          curEvent = null;
					if (!switched && ["jr", "greenjr"].includes(event.name)) {
						switch (parent.server_region + " " + parent.server_identifier) {
							case "US I":
								parent.switch_server("US II");
								break;
							case "US II":
								parent.switch_server("US III");
								break;
							case "US III":
								parent.switch_server("EU I");
								break;
							case "EU I":
								parent.switch_server("EU II");
								break;
							case "EU II":
								parent.switch_server("US I");
								break;
						}
						switched = true;
					}
				} else {
					if (can_move_to(curEvent.x, curEvent.y)) {
						move(curEvent.x, curEvent.y);
					}
				}
			}

			if (!smart.moving) {
				smart_move({
					x: curEvent.x,
					y: curEvent.y,
					map: curEvent.map
				});
			}
		}
	}
}, 250);
}
//Function for either attacking or moving to attack
function move_or_attack(target) {
	if (!in_attack_range(target)) {
		//No? Get over there!

		//Can we walk straight to it?
		if (can_move_to(target.real_x, target.real_y)) {
			//Good!
			move(target.real_x, target.real_y);
		} else {
			//Find a way to it!
			if (!smart.moving) {
				smart_move({
					x: target.real_x,
					y: target.real_y,
					map: character.map
				});
			}
		}
	} else {
		//Are we able to fire off an attack?
		if (can_attack(target) && character.ctype != "mage") {
			//Kill it!
			smart_move({ x: character.real_x, y: character.real_y });
			attack(target);
		}
	}
}

function init() {
	if (character.name === party_leader) {
		// If one of the characters is set to be the party leader, we want to know this.
		console.log(`${character.name}: I'm leader!`);
	}
}
let event_priority = {
	mrpumpkin: 1,
	snowman: 0
};
setInterval(() => {
	if (
		socket.server_data &&
		true &&
		"mrpumpkin" in socket.server_data &&
		socket.server_data.mrpumpkin.live &&
		!events.find(a => a.name == "mrpumpkin")
	) {
		let event = socket.server_data.mrpumpkin;

		if (event.map !== "mansion") {
			events.push({
				x: event.x,
				y: event.y,
				map: event.map,
				name: "mrpumpkin"
			});
		}
	}
	if (
		false &&
		socket.server_data &&
		true &&
		"snowman" in socket.server_data &&
		(socket.server_data.snowman.live || socket.server_data.snowman.target) &&
		!events.find(a => a.name == "snowman")
	) {
		let event = socket.server_data.snowman;

		if (event.map !== "mansion") {
			events.push({
				x: event.x,
				y: event.y,
				map: event.map,
				name: "snowman"
			});
		}
	}
	events.sort((e_a, e_b) => {
		return event_priority[e_a] - event_priority[e_b];
	});
}, 1000);
parent.socket.on("game_event", on_game_event);
// */
let NULL_ITEM = {
	name: null,
	level: null
};
let warping = false;
let request_luck = true;
let to_sell = new Set([
	"molesteeth",
	"gemfragment",
	"helmet",
	"wbreeches",
	"wgloves",
	"wshoes",
	"quiver",
	"ringsj",
	"hpamulet",
	"intamulet",
	"dexamulet",
	"stramulet"
]);
let to_send = new Set([
	"wshoes",
  "glitch",
  "svenom",
  "goldenegg",
	"essenceofnature",
	"greenenvelope",
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
	"mcape",
	"firestaff",
	"fireblade",
	"armorbox",
	"weaponbox",
	"gem1",
	"cupid",
	"hpbelt",
	"essenceoffrost",
	"intring",
	"dexring",
	"strring",
	"candypop",
	"intbelt",
	"dexbelt",
	"strbelt",
	"redenvelopev2",
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
	"wbook0",
	"sshield",
	"woodensword",
	"candy0",
	"candy1",
	"ascale",
	"pleather",
	"vitring",
	"wattire",
	"leather",
	"phelmet"
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
					event: "leave"
				});
			}
		} else {
			send_party_request(party_leader);
		}
	}
}, 1000 * 1);
// */
function sell_all_of(name) {
	if (merchant_near()) {
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[0];
			if (item != null && item.name == name) {
				sell(i, 1);
			}
		}
	}
}

function send_all_of(name) {
	if (merchant_near()) {
		character.items.forEach(item => {
			if (
				(item != null && item.name == name) ||
				tier_one_gear.includes(item.name)
			) {
				send_item(merchant, character.items.indexOf(item), 10);
			}
		});
	}
}

function merchant_near() {
	return !!get_player(merchant);
}
let looted_chests = new Set();
setInterval(() => {
  let switched = false;

	let index_of_booster = character.items.findIndex(item => {
		return item && item.name == "luckbooster";
	});
	if (index_of_booster == -1) {
		index_of_booster = character.items.findIndex(item => {
			return item && item.name == "goldbooster";
		});
	} // */
	if (character.name == "Rael") {
		Object.keys(parent.chests).forEach(id => {
			if (!looted_chests.has(id)) { 
        if (!switched) {
					shift(index_of_booster, "goldbooster");
					switched = true;
				}
				if (parent.chests[id].items || true) {
					setTimeout(() => {
						// looted_chests.delete(id);)
						parent.socket.emit("open_chest", {
							id: id
						});
						// */
					}, 500);
				} else {
					send_cm("AriaHarper", { command: "loot", id: id });
				}
				looted_chests.add(id);
				return true;
			}
			return false;
		});
	}
	if (switched) {
		if (index_of_booster == -1) {
      setTimeout(() => {
        index_of_booster = character.items.findIndex(item => {
          return item && item.name == "goldbooster";
        });
      }, 1000)
		}
		shift(index_of_booster, "luckbooster");
	};
}, 100);
setInterval(() => {
	// send_cm("Geoffrey", { command: "loot", ids: ids })
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
		if (num_items(mana) < min_potions) {
			send_cm(merchant, "yo, I need some MP");
		} else if (num_items(mana) > min_potions + 1000) {
			// send_item(merchant, get_index_of_item(mana), 100);
		}
		if (num_items(health) < min_potions) {
			send_cm(merchant, "yo, I need some HP");
		} else if (num_items(health) > min_potions + 1000) {
			send_item(merchant, get_index_of_item(health), 100);
		}
		if (character.gold < 40000) {
			// send_cm(merchant, "yo, I need some gold");
		} else if (character.gold > 50000) {
			send_gold(merchant, character.gold - 40000);
		}
		if (
			character.name == "Rael" && num_items("elixirluck") <= 1 &&
			!is_elixir_equiped("elixirluck") &&
			request_luck
		) {
			send_cm(merchant, "yo, I need some luck");
		}
		if (
			character.name == "Rael" &&
			num_items("elixirluck") >= 2 &&
			!is_elixir_equiped("elixirluck")
		) {
			equip(get_index_of_item("elixirluck"));
		}
		if (
			character.name == "Rael" &&
			num_items("elixirluck") >= 2 &&
			is_elixir_equiped("elixirluck")
		) {
			send_item(merchant, get_index_of_item("elixirluck"));
		}
	}
}, 500);

parent.socket.on("cm", async function(a) {
	let name = a.name;
	let data = await JSON.parse(a.message);
	// function on_cm(name, data) {
	if (group.includes(name) || to_party.includes(name) || name == "AriaHarper") {
		if (typeof data == "object") {
			if (data.command) {
				switch (data.command) {
					case "blink":
						blink(data.x, data.y);
						break;
					case "magiport":
						magiport(data.name);
						break;
					case "aggro":
						targeter.RemoveFromGreyList(data.name);
						say(
							"Removed " + data.name + " from greylist for attacking " + name
						);
						break;
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
					name == "AriaHarper" && process.send({ command: "shutdown" });
					name == "AriaHarper" && parent.shutdown_all();
					break;
				case "teleport":
					magiport(name);
					break;
				case "coords":
					const { x, y, map } = character,
						  command = "blink";
					send_cm(name, {
						x,
						y,
						map,
						command
					});
					break;
			}
		}
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
	if (to_party.indexOf(name) != -1) {
		accept_party_invite(name);
	}
});

function follow_entity(entity, distance) {
	let point = angleToPoint(entity.real_x, entity.real_y);
	var position = pointOnAngle(entity, point, distance);
	if (can_move_to(position.x, position.y)) {
		if (!avoidMobs(position)) {
			smart.moving = false;
			move(position.x, position.y);
		}
	} else if (!smart.moving) {
		if (!avoidMobs(position)) {
			smart_move({
				x: position.x,
				y: position.y
			});
		}
	}
}

function angleToPoint(x, y) {
	const deltaX = character.real_x - x;
	const deltaY = character.real_y - y;

	return Math.atan2(deltaY, deltaX);
}

function pointOnAngle(entity, angle, distance) {
	return {
		x: entity.real_x + distance * Math.cos(angle),
		y: entity.real_y + distance * Math.sin(angle)
	};
}
//Movement And Attacking
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
}, 100); //Execute 10 times per second

function needs_mp(entity) {
	return entity.mp / entity.max_mp < 0.75;
}

function needs_hp(entity) {
	return entity.hp / entity.max_hp < 0.75;
}

function use_hp_or_mp() {
	if (safeties && new Date() - last_potion < min(200, character.ping * 3))
		return;
	let used = false;
	if (new Date() < parent.next_skill.use_hp) return;
	if (character.mp / character.max_mp < 0.2) use("use_mp"), (used = true);
	else if (character.hp / character.max_hp < 0.75) use("use_hp"), (used = true);
	else if (character.mp / character.max_mp < 0.75) use("use_mp"), (used = true);
	else if (character.hp < character.max_hp) use("use_hp"), (used = true);
	else if (character.mp < character.max_mp) use("use_mp"), (used = true);
	if (used) last_potion = new Date() - character.ping;
}

function get_item_name(item) {
	if (item != null) {
		return item.name;
	} else {
		return null;
	}
}

function get_index_of_item(name, max_level) {
	if (!max_level) {
		return character.items.findIndex(item => {
			return item !== null && item.name === name;
		});
	} else {
		const possible_item = character.items.reduce((ret, item) => {
			if (item !== null) {
				if (item.name === name) {
					if (item.level > ret.level) {
						return item;
					} else {
						return ret;
					}
				} else {
					return ret;
				}
			} else {
				return ret;
			}
		}, NULL_ITEM);
		return character.items.indexOf(possible_item);
	}
}

function is_elixir_equiped(elixir) {
	if (character.slots.elixir == null) {
		return false;
	} else {
		if (character.slots.elixir.name == elixir) {
			return true;
		} else {
			return false;
		}
	}
}

// Staying Alive: Part 1
setInterval(() => {
	if (character.map === "jail") {
		parent.socket.emit("leave");
	}
	parent.ping();
}, 500);

// Staying Alive: Part 2
setInterval(() => {
	if (character.rip && !character.c.revival) {
		use_skill("use_town");
	}
	//Heal With Potions if we're below 75% hp.
	if (safeties && new Date() - last_potion < min(200, character.ping * 3))
		return;
	if (new Date() < parent.next_skill.use_hp) return;
	if (
		needs_hp(character) &&
		!(character.ctype == "warrior" && get_player(priest))
	) {
		use("use_hp");
		last_potion = new Date() - character.ping;
	} else if (needs_mp(character)) {
		use("use_mp");
		last_potion = new Date() - character.ping;
	}
}, 200); //Execute 2 times per second

function open_chests() {
	let looted = 0;
	for (let id in parent.chests) {
		send_cm(merchant, {
			command: "loot",
			id: id
		});
		if (looted++ === 2) break;
	}
}

function get_first_non_null(arr) {
	return arr.find(i => i != null) || null;
}
if (character.ctype == "warrior") {
	setInterval(() => {
		if (!get_player(priest) || get_player(priest).rip) {
			let targeted = false;
			for (let id in parent.entities) {
				let entity = parent.entities[id];
				if(parent.entities[id].target == character.name) {

					targeted = true;
				}
			}
			if (can_use("scare") && targeted) {
				game_log("well....")
				let item = character.items.findIndex(item => {
					return item != null && item.name == "jacko";
				});
				game_log(item)
				if (item != -1) {
					equip(item);
					use_skill("scare");
					equip(item);
				}
			}
		}
	}, 1000);
} else if(character.ctype == "priest") {

	setInterval(() => {
		if (!get_player("Rael") || get_player("Rael").rip) {
			let targeted = false;
			for (let id in parent.entities) {
				let entity = parent.entities[id];
				if(parent.entities[id].target == character.name) {

					targeted = true;
				}
			}
			if (can_use("scare") && targeted) {
				use_skill("scare");
			}
		}
	}, 1000);
}
function state_controller() {
	//Default to farming
	let new_state = "farm";
	if (tree_exists && !character.s.xmas2) {
		new_state = "tree";
	} else if (events.length != 0 || curEvent != null) {
		new_state = "event";
	}
	if (state != new_state) {
		state = new_state;
	}
}
setTimeout(() => {
	if (character.ctype == "priest") {
		setInterval(() => {
			let possible_follows = follow
			? chain.slice(chain.indexOf(character.name) + 1).map(get_player)
			: [];
			let follow_target = get_first_non_null(possible_follows);
			if (
				can_use("curse") &&
				target &&
				target.hp > character.attack &&
				follow_target
			) {
				curse(target);
			}
		}, 500);
	}
}, 100);

function in_attack_range(target) {
	if (!target) return false;
	if (parent.distance(character, target) <= character.range + character.xrange)
		return true;
	return false;
}
game.on("attack", (data, event_name) => {
	if (data.kill === true && data.id === wabbit) {
		wabbit = null;
		events = events.filter(({ name }) => name != "wabbit");
	}
	if (data.actor == character.name) {
		if (data.source == "3shot") {
			if (ThreeShotTargets.has(data.target)) {
				game_log("Reducing Cooldown: 3shot");
				ThreeShotTargets.clear();
				reduce_cooldown("attack", character.ping);
			}
		} else if (data.source == "attack") {
			game_log("Reducing Cooldown: attack");
			reduce_cooldown("attack", character.ping);
		}
	}
});
let healed_ghosts = new Set();
let allow_swap = 1;
const orbit_target = { real_x: 535, real_y: 1090 };
const needs_energized = entity => {
	return (
		entity != null &&
		entity.name != character.name &&
		needs_mp(entity) &&
		entity.ctype != "mage"
	);
};
let angle = Math.asin(orbit_speed / 2 / 80) * 2;
// show_json(Math.PI * 2 / angle * 1000)
let time_taken_to_orbit = (Math.PI * 2) / angle;

if (character.ctype == "warrior" && false) {
	let offhand_item = {
		name: "woodensword",
		level: 8
	};
	setInterval(() => {
		if (character.targets >= 4 && can_use("hardshell") && character.mp >= 420) {
			// use_skill("hardshell");
		} else if (
			can_use("stomp") &&
			can_use("cleave") &&
			character.mp > 840 &&
			true
		) {
			// true/false last value is control
			const index_of_basher = character.items.findIndex(item => {
				return item && item.name == "basher";
			});
			const index_of_axe = character.items.findIndex(item => {
				return item && item.name == "bataxe";
			});
			unequip("offhand");
			equip(index_of_basher);
			use_skill("stomp");
			// equip(index_of_axe);
			// use_skill("cleave");
			equip(index_of_basher);
			setTimeout(() => {
				const offhand_index = character.items.findIndex(item => {
					return (
						item &&
						item.name == offhand_item.name &&
						item.level == offhand_item.level
					);
				});
				equip(offhand_index, "offhand");
			}, 200);
		} else if (
			can_use("cleave") &&
			character.mp > 720 &&
			find_viable_targets().filter(entity => {
				return parent.distance(entity, character) < 160;
			}).length > 1
		) {
			let index_of_axe = character.items.findIndex(item => {
				return item && item.name == "bataxe";
			});
			unequip("offhand");
			equip(index_of_axe);
			use_skill("cleave");
			equip(index_of_axe);
			setTimeout(() => {
				let offhand_index = character.items.findIndex(item => {
					return (
						item &&
						item.name == offhand_item.name &&
						item.level == offhand_item.level
					);
				});
				equip(offhand_index, "offhand");
			}, 200);
		} else {
			let offhand_item = {
				name: "spear",
				level: 9
			};
			setTimeout(() => {
				let offhand_index = character.items.findIndex(item => {
					return (
						item &&
						item.name == offhand_item.name &&
						item.level == offhand_item.level
					);
				});
				if (offhand_index != -1) {
					equip(offhand_index, "mainhand");
				}
			}, 0);
		}
	}, 1000);
}
//This function contains our logic for when we're farming mobs
function farm() {
	let possible_follows = follow
	? chain.slice(chain.indexOf(character.name) + 1).map(get_player)
	: [];
	let follow_target = get_first_non_null(possible_follows);
  if(follow_target != null) {
		follow_entity(follow_target, follow_distance);
  }
	let ranger_healed = false;
	let team = ["Rael", ...to_party].map(get_player);
	switch (character.ctype) {
		case "priest":
			// Basic states to determine if we can heal others. Prevents high spam.
			let healed = false,
				revived = false;
			for (let i = 0, len = team.length; i < len; i++) {
				let char = team[i];
				if (char != null) {
					if (char.rip && !char.c.revival) {
						const revive_target = char;
						if (can_use("revive") && revive_target.hp == revive_target.max_hp) {
							if (!revived) {
								use_skill("revive", revive_target);
								revived = true;
							}
						} else {
							if (revive_target.hp != revive_target.max_hp) {
								if (!healed && can_heal(revive_target) && can_use("heal")) {
									heal(revive_target);
									healed = true;
								}
							}
						}
					} else if (!healed && needs_hp(char)) {
						const heal_target = char;
						if (can_heal(heal_target) && can_use("heal")) {
							heal(heal_target);
							healed = true;
						}
					}
				}
			}
			break;
		case "rogue":
			let possible_targets =
				(follow ? get_target_of(follow_target) : find_viable_targets()) || [];
			let attack_target = possible_targets[0];
			//Attack or move to target
			target = attack_target;
			if (target != null && get_player(priest)) {
				if (
					character.ctype == "rogue" &&
					can_use("mentalburst") &&
					distance_to_point(target.real_x, target.real_y) <
					character.range + 60 + 10 + character.xrange
				) {
					parent.socket.emit("skill", { name: "mentalburst", id: target.id });
				}
			}
			break;
		case "mage":
			if (!needs_mp(character)) {
				let energized = false;
				let to_energize = team.filter(needs_energized).sort((a, b) => {
					return a.mp / a.max_mp - b.mp / b.max_mp;
				});
				for (var i = 0, len = to_energize.length; i < len && !energized; i++) {
					energize(to_energize[i]);
					energized = true;
				}
			}
			break;
		case "merchant":
			let lucked = false;
			break;
	}
	if (character.ctype != "merchant") {
		let possible_targets = follow
		? possible_follows.map(get_target_of).filter(a => {
			return a && !to_party.includes(a.name);
		})
		: find_viable_targets() || [];
		if (character.ctype == "mage") {
			possible_targets = possible_targets
				.filter(entity => {
				return (
					parent.distance(character, entity) <
					character.range + character.xrange
				);
			})
				.reverse();
		}
		let attack_target = (target = Array.isArray(possible_targets)
							 ? possible_targets[0]
							 : possible_targets);

		const viable_targets = possible_targets;
		if (attack_target != null && !ranger_healed) {
			let targets = null;
			if (!group.includes(attack_target.id)) {
				if (parent.distance(attack_target, character) < character.range + 10) {
					if (can_use("attack")) {
						if (character.ctype === "rogue" && can_use("invis")) {
							use_skill("invis");
						}
						if (character.ctype === "warrior" && character.name == "Rael") {
							let priest_char = get_player(priest);
							if (
								attack_target.target != character.name &&
								priest_char &&
								distance_to_point(priest_char.x, priest_char.y) < 150
							) {
								use_skill("taunt", attack_target);
							}
							if (true && can_use("hardshell")) {
								// use_skill("hardshell");
							}
							if (can_use("warcry") && !character.s.warcry) {
								use_skill("warcry");
							}
						}
						if (character.ctype === "priest") {
							if (
								can_use("darkblessing") &&
								!character.s.darkblessing &&
								character.s.warcry
							) {
								use_skill("darkblessing");
							}
						}
						if (
							character.ctype === "priest" &&
							attack_target.mtype == "ghost" &&
							!healed_ghosts.has(attack_target.id) &&
							false
						) {
							heal(attack_target);
							healed_ghosts.add(attack_target.id);
						} else {
							if (character.ctype === "ranger" && can_use("huntersmark")) {
								let markable = viable_targets.find(entity => {
									return !("marked" in entity.s);
								});
								if (markable) {
									parent.socket.emit("skill", {
										name: "huntersmark",
										id: markable.id
									});
								}
							}
							if (character.ctype == "mage" && can_use("cburst") && false) {
								parent.socket.emit("skill", {
									name: "cburst",
									targets: viable_targets
									.slice(0, 2)
									.filter(entity => {
										return (
											parent.distance(entity, character) <
											character.range + 10
										);
									})
									.map(({ id, hp }) => [id, 1])
								});
							} else if (
								character.ctype === "ranger" &&
								true &&
								character.mp >= 300 &&
								viable_targets
								.slice(0, 5)
								.filter(entity => {
									return (
										parent.distance(entity, character) < character.range + 10
									);
								})
								.map(({ id }) => id).length >= 3
							) {
								if (
									character.mp > 420 &&
									(targets = viable_targets
									 .slice(0, 5)
									 .filter(entity => {
										return (
											parent.distance(entity, character) <
											character.range + 10
										);
									})
									 .map(({ id }) => id)).length >= 5 &&
									character.level >= 75 &&
									false
								) {
									parent.socket.emit("skill", {
										name: "5shot",
										ids: targets
									});
									targets.forEach(id => ThreeShotTargets.add(id));
								} else if (
									character.mp > 300 &&
									(targets = find_viable_targets()
									 .slice(0, 3)
									 .filter(entity => {
										return (
											parent.distance(entity, character) <
											character.range + 10
										);
									})
									 .map(({ id }) => id)).length >= 3 &&
									character.level >= 60 &&
									false
								) {
									let is_5shot;
									if (true) {
										parent.socket.emit("skill", {
											name: "3shot",
											ids: targets
										});
										targets.forEach(id => ThreeShotTargets.add(id));
									}
								}
							} else if (
								character.ctype == "priest" ||
								character.ctype == "ranger"
							) {
								if (need_priest) {
									if (true) {
										let warrior_char = get_player("Rael");
										if (
											warrior_char &&
											!warrior_char.rip &&
											attack_target.target === "Rael" &&
											distance_to_point(warrior_char.x, warrior_char.y) <
											character.range
										) {
											if (character.ctype == "ranger") {
												if (attack_target.armor > 176) {
													parent.socket.emit("skill", {
														name: "piercingshot",
														id: attack_target.id
													});
												} else {
													attack(attack_target);
												}
											} else {
												attack(attack_target);
											}
										}
									} else {
										attack(attack_target);
									}
								} else {
									attack(attack_target);
								}
							} else if (character.ctype === "warrior") {
								if (need_priest) {
									let priest_char = get_player(priest);
									if (
										priest_char &&
										distance_to_point(priest_char.x, priest_char.y) < 150
									) {
										if (!priest_char.rip) {
											attack(attack_target);
										}
									}
								} else {
									attack(attack_target);
								}
							} else {
								attack(attack_target);
							}
						}
					}
				} else if (!follow_target && !tree) {
					if (character.ctype == "warrior" && can_use("charge") && false) {
						use_skill("charge");
					}
					if (
						character.ctype === "ranger" &&
						character.mp / character.max_mp > 0.75
					) {
						if (
							attack_target.type == "character" ||
							attack_target.mtype == "mummy"
						) {
							if (
								can_use("supershot") &&
								distance_to_point(attack_target.x, attack_target.y) <
								character.range * 3
							) {
								use_skill("supershot", attack_target);
							}
						}
					}
					if (
						can_move_to(target.x, target.y) &&
						target.mtype != "bigbird" &&
						true
					) {
						move_to_target(attack_target);
					} else if (!smart.moving && target.mtype != "bigbird" && true) {
						smart_move({
							x: target.real_x,
							y: target.real_y
						});
					}
				}
			}
		} else {
			if (!smart.moving && !follow_target) {
        console.log("Uh");
        smart_move({
          to: monster_targets[0]
        });
			}
		}
	}
}
function get_door(door) {
	return G.maps[character.map].doors.find(([a, b, c, d, name]) => {
		return name == door;
	});
}

function transport(map, spawn) {
	parent.socket.emit("transport", {
		to: map,
		s: spawn
	});
}

//Returns the number of items in your inventory for a given item name;
function num_items(name) {
	var item_count = character.items.reduce((a, item) => {
		return a + (item != null && item.name == name ? item.q || 1 : 0);
	}, 0);

	return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots() {
	return character.items.reduce((a, b) => {
		return a + (b == null ? 1 : 0);
	});
}
let avoidMobs = (function() {
	const range_cache = new Map();
	//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
	var rangeBuffer = 10;

	//How far away we want to consider monsters for
	var calcRadius = 150;

	//What types of monsters we want to try to avoid
	var avoidTypes = ["stompy"];

	var avoidPlayers = false; //parent.is_pvp; //Set to false to not avoid players at all
	var playerBuffer = 0; //Additional Range around players
	var avoidPlayersWhitelist = [
		"Geoffriel",
		"Boismon",
		"Firenus",
		"Daedulaus",
		"Rael",
		"AriaHarper",
		"Buttercup",
		"Brutus",
		"LambChop",
		"Ronja",
		"ZoetheWolf",
		"Amethyst",
		"Malthael"
	]; //Players want to avoid differently
	var avoidPlayersWhitelistRange = null; //Set to null here to not avoid whitelisted players
	var playerRangeOverride = 10; //Overrides how far to avoid, set to null to use player range.
	var playerAvoidIgnoreClasses = ["merchant"]; //Classes we don't want to try to avoid

	//Tracking when we send movements to avoid flooding the socket and getting DC'd
	var lastMove;

	//Whether we want to draw the various calculations done visually
	var drawDebug = false;

	function avoidMobs(goal) {
		var noGoal = false;

		if (goal == null || goal.x == null || goal.y == null) {
			noGoal = true;
		}

		if (drawDebug && !noGoal) {
			draw_circle(goal.x, goal.y, 25, 1, 0xdfdc22);
		}

		var maxWeight;
		var maxWeightAngle;
		var movingTowards = false;

		var monstersInRadius = getMonstersInRadius();

		var avoidRanges = getAnglesToAvoid(monstersInRadius);
		var inAttackRange = isInAttackRange(monstersInRadius);
		if (!noGoal) {
			var desiredMoveAngle = angleToPoint(character, goal.x, goal.y);

			var movingTowards = angleIntersectsMonsters(
				avoidRanges,
				desiredMoveAngle
			);

			var distanceToDesired = distance_to_point(
				character.real_x,
				character.real_y,
				goal.x,
				goal.y
			);

			var testMovePos = pointOnAngle(
				character,
				desiredMoveAngle,
				distanceToDesired
			);

			if (drawDebug) {
				draw_line(
					character.real_x,
					character.real_y,
					testMovePos.x,
					testMovePos.y,
					1,
					0xdfdc22
				);
			}
		}

		//If we can't just directly walk to the goal without being in danger, we have to try to avoid it
		if (
			inAttackRange ||
			movingTowards ||
			(!noGoal && !can_move_to(goal.x, goal.y))
		) {
			//Loop through the full 360 degrees (2PI Radians) around the character
			//We'll test each point and see which way is the safest to  go
			for (i = 0; i < Math.PI * 2; i += Math.PI / 360) {
				var weight = 0;

				var position = pointOnAngle(character, i, 75);

				//Exclude any directions we cannot move to (walls and whatnot)
				if (can_move_to(position.x, position.y)) {
					//If a direction takes us away from a monster that we're too close to, apply some pressure to that direction to make it preferred
					var rangeWeight = 0;
					var inRange = false;
					for (id in monstersInRadius) {
						var entity = monstersInRadius[id];
						var monsterRange = getRange(entity);

						var distToMonster = distance_to_point(
							position.x,
							position.y,
							entity.real_x,
							entity.real_y
						);

						var charDistToMonster = distance_to_point(
							character.real_x,
							character.real_y,
							entity.real_x,
							entity.real_y
						);

						if (charDistToMonster < monsterRange) {
							inRange = true;
						}

						if (
							charDistToMonster < monsterRange &&
							distToMonster > charDistToMonster
						) {
							rangeWeight += distToMonster - charDistToMonster;
						}
					}

					if (inRange) {
						weight = rangeWeight;
					}

					//Determine if this direction would cause is to walk towards a monster's radius
					var intersectsRadius = angleIntersectsMonsters(avoidRanges, i);

					//Apply some selective pressure to this direction based on whether it takes us closer or further from our intended goal
					if (goal != null && goal.x != null && goal.y != null) {
						var tarDistToPoint = distance_to_point(
							position.x,
							position.y,
							goal.x,
							goal.y
						);

						weight -= tarDistToPoint / 10;
					}

					//Exclude any directions which would make us walk towards a monster's radius
					if (intersectsRadius === false) {
						//Update the current max weight direction if this one is better than the others we've tested
						if (maxWeight == null || weight > maxWeight) {
							maxWeight = weight;
							maxWeightAngle = i;
						}
					}
				}
			}

			//Move towards the direction which has been calculated to be the least dangerous
			const movePoint = pointOnAngle(character, maxWeightAngle, 20);

			if (lastMove == null || new Date() - lastMove > 100) {
				lastMove = new Date();
				move(movePoint.x, movePoint.y);
			}

			if (drawDebug) {
				draw_line(
					character.real_x,
					character.real_y,
					movePoint.x,
					movePoint.y,
					2,
					0xf20d0d
				);
			}

			return true;
		} else {
			return false;
		}
	}

	function getRange(entity) {
		var monsterRange;

		if (entity.type != "character") {
			if (range_cache.has(entity.mtype)) {
				return range_cache.get(entity.mtype);
			}
			monsterRange = G.monsters[entity.mtype].range + rangeBuffer;
			range_cache.set(entity.mtype, monsterRange);
		} else {
			if (
				avoidPlayersWhitelist.includes(entity.id) &&
				avoidPlayersWhitelistRange != null
			) {
				monsterRange = avoidPlayersWhitelistRange;
			} else if (
				!avoidPlayersWhitelist.includes(entity.id) &&
				playerRangeOverride != null
			) {
				monsterRange = playerRangeOverride + playerBuffer;
			} else if (
				!avoidPlayersWhitelist.includes(entity.id) &&
				playerRangeOverride == null
			) {
				monsterRange = entity.range + playerBuffer;
			}
		}

		return monsterRange;
	}

	function isInAttackRange(monstersInRadius) {
		for (id in monstersInRadius) {
			var monster = monstersInRadius[id];
			var monsterRange = getRange(monster);

			var charDistToMonster = distance_to_point(
				character.real_x,
				character.real_y,
				monster.real_x,
				monster.real_y
			);

			if (charDistToMonster < monsterRange) {
				return true;
			}
		}

		return false;
	}

	function angleIntersectsMonsters(avoidRanges, angle) {
		for (id in avoidRanges) {
			var range = avoidRanges[id];

			var between = isBetween(range[1], range[0], angle);

			if (between) {
				return true;
			}
		}

		return false;
	}

	function getAnglesToAvoid(monstersInRadius) {
		var avoidRanges = [];

		if (monstersInRadius.length > 0) {
			for (let id in monstersInRadius) {
				const monster = monstersInRadius[id];

				const monsterRange = getRange(monster);

				const tangents = findTangents(
					{
						x: character.real_x,
						y: character.real_y
					},
					{
						x: monster.real_x,
						y: monster.real_y,
						radius: monsterRange
					}
				);

				//Tangents won't be found if we're within the radius
				if (!isNaN(tangents[0].x)) {
					var angle1 = angleToPoint(character, tangents[0].x, tangents[0].y);
					var angle2 = angleToPoint(character, tangents[1].x, tangents[1].y);

					if (angle1 < angle2) {
						avoidRanges.push([angle1, angle2]);
					} else {
						avoidRanges.push([angle2, angle1]);
					}
					if (drawDebug) {
						draw_line(
							character.real_x,
							character.real_y,
							tangents[0].x,
							tangents[0].y,
							1,
							0x17f20d
						);
						draw_line(
							character.real_x,
							character.real_y,
							tangents[1].x,
							tangents[1].y,
							1,
							0x17f20d
						);
					}
				}

				if (drawDebug) {
					draw_circle(
						monster.real_x,
						monster.real_y,
						monsterRange,
						1,
						0x17f20d
					);
				}
			}
		}

		return avoidRanges;
	}

	function getMonstersInRadius() {
		var monstersInRadius = [];

		for (id in parent.entities) {
			var entity = parent.entities[id];
			var distanceToEntity = distance_to_point(
				entity.real_x,
				entity.real_y,
				character.real_x,
				character.real_y
			);

			var range = getRange(entity);

			if (entity.type === "monster" && avoidTypes.includes(entity.mtype)) {
				var monsterRange = getRange(entity);

				if (distanceToEntity < calcRadius) {
					monstersInRadius.push(entity);
				}
			} else {
				if (
					avoidPlayers &&
					entity.type === "character" &&
					!entity.npc &&
					!playerAvoidIgnoreClasses.includes(entity.ctype)
				) {
					if (!avoidPlayersWhitelist.includes(entity.id)) {
						if (distanceToEntity < calcRadius || distanceToEntity < range)
							monstersInRadius.push(entity);
					}
				}
			}
		}

		return monstersInRadius;
	}

	function normalizeAngle(angle) {
		return Math.atan2(Math.sin(angle), Math.cos(angle));
	}

	//Source: https://stackoverflow.com/questions/11406189/determine-if-angle-lies-between-2-other-angles
	function isBetween(angle1, angle2, target) {
		if (angle1 <= angle2) {
			if (angle2 - angle1 <= Math.PI) {
				return angle1 <= target && target <= angle2;
			} else {
				return angle2 <= target || target <= angle1;
			}
		} else {
			if (angle1 - angle2 <= Math.PI) {
				return angle2 <= target && target <= angle1;
			} else {
				return angle1 <= target || target <= angle2;
			}
		}
	}

	//Source: https://stackoverflow.com/questions/1351746/find-a-tangent-point-on-circle
	function findTangents(point, circle) {
		var dx = circle.x - point.x;
		var dy = circle.y - point.y;
		var dd = Math.sqrt(dx * dx + dy * dy);
		var a = Math.asin(circle.radius / dd);
		var b = Math.atan2(dy, dx);

		var t = b - a;

		var ta = {
			x: circle.x + circle.radius * Math.sin(t),
			y: circle.y + circle.radius * -Math.cos(t)
		};

		t = b + a;
		var tb = {
			x: circle.x + circle.radius * -Math.sin(t),
			y: circle.y + circle.radius * Math.cos(t)
		};

		return [ta, tb];
	}

	function offsetToPoint(x, y) {
		var angle = angleToPoint(x, y) + Math.PI / 2;

		return angle - characterAngle();
	}

	function entityAngle(entity) {
		return (entity.angle * Math.PI) / 180;
	}

	function angleToPoint(entity, x, y) {
		var deltaX = entity.real_x - x;
		var deltaY = entity.real_y - y;

		return Math.atan2(deltaY, deltaX) + Math.PI;
	}

	function characterAngle() {
		return (character.angle * pi) / 180;
	}
	return avoidMobs;
})();

//Gets an NPC by name from the current map.
function get_npc(name) {
	var npc = G.maps[character.map].npcs.filter(npc => npc.id == name);

	if (npc.length > 0) {
		return npc[0];
	}

	return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
	return Math.sqrt((character.real_x - x) ** 2 + (character.real_y - y) ** 2);
}

//This function will ether move straight towards the target entity,
//or utilize smart_move to find their way there.
function move_to_target(target) {
	if (can_move_to(target.real_x, target.real_y)) {
		smart.moving = false;
		smart.searching = false;
		move(
			character.real_x + (target.real_x - character.real_x) / 2,
			character.real_y + (target.real_y - character.real_y) / 2
		);
	} else {
		if (!smart.moving) {
			smart_move({
				x: target.real_x,
				y: target.real_y
			});
		}
	}
}

// Setup the Dual Targeting system.
var targeter = new Targeter(
	/* Patched directly into the targeter. */ null,
	["Boismon", "Firenus", "Raphiel3"],
	["Bjarne", "Bjarni"],
	{
		UseGreyList: true,
		RequireLOS: false,
		DebugPVP: false,
		TagTargets: character.name == "Rael",
		Solo: false
	}
);

var targeter2 = new Targeter(
	/* Patched directly into the targeter. */ null,
	["Boismon", "Firenus", "Raphiel3"],
	["Bjarne", "Bjarni"],
	{
		UseGreyList: true,
		RequireLOS: false,
		DebugPVP: false,
		TagTargets: character.name == "Rael",
		Solo: false
	}
);

setInterval(function() {
	if (targets && !parent.no_graphics) {
		var targets = targeter.GetPriorityTarget(3);
		clear_drawings();
		for (var id in targets) {
			var target = targets[id];
			draw_circle(target.real_x, target.real_y, 20);
		}
	}
}, 100);

/*
	priorityArgs:
		An object that describes what priority a mtype will be given.
		You will always target an accessible priority 1 monster before a priority 2 monster.
		Players are given a priority of zero.
		Example:
		{
			goo: 1,
			bee: 2
		}

	whitelist:
		An array of player names which defines players that will under no circumstances be targeted.
		Example:
			["Foaly", "SpadarFaar"]
	blacklist:
		An array of player names which defines players that will always be targeted if in a PvP environment.
		Example:
			["Foaly", "SpadarFaar"]
	args:
		An object containing additional optional configuration options.
		Example (Default Values):
			{
				UseGreyList: true, //If this is false then all players not whitelisted are attacked on sight.
				RequireLOS: true, //If this is false then monsters located on the other side of obstacles will be targeted.
				DebugPVP: false, //If this is true then players will be targeted in non-pvp areas.
				TagTargets: true //If this is false then only monsters which are already targeting the party will be targeted.
        Solo: false //
			}

*/
function Targeter(priorityArgs, whitelist, blacklist, args) {
	//Set up configuration
	Object.defineProperty(this, "TargetingPriority", {
		value: [...monster_targets].reverse().reduce(
			(ret, value) => {
				ret[value] = monster_targets.indexOf(value) + 2;
				return ret;
			},
			{
				pinkgoo: 1,
				// mvampire: 1,
				// phoenix: 1,
				snowman: 1,
				mrpumpkin: 1
			}
		)
	});
	this.WhiteList = whitelist;
	this.BlackList = blacklist;
	this.GreyList = {};

	this.UseGreyList = args.UseGreyList || true;

	this.Solo = args.Solo || false;

	this.RequireLOS = args.RequireLOS || false;

	this.DebugPVP = args.DebugPVP || false;

	this.TagTargets = args.TagTargets || true;

	/*
    	Primary targeting function.

    	If you specify count, an array of the top n targets will be returned, otherwise only the closest, highest priority, target will be returned.
    */
	this.GetPriorityTarget = function(count) {
		const potentialTargets = [];

		for (let id in parent.entities) {
			let entity = parent.entities[id];

			if (
				this.IsPVP() &&
				entity.type == "character" &&
				!entity.npc &&
				!entity.rip
			) {
				if (this.GreyList[entity.id] === undefined) {
					this.GreyListPlayer(entity);
				}

				if (!this.IsPlayerSafe(entity)) {
					let targetArgs = {};
					targetArgs.priority = 0;
					targetArgs.distance = parent.distance(character, entity);
					targetArgs.entity = entity;
					potentialTargets.push(targetArgs);
				}
			} else {
				if (entity.type == "monster") {
					if (
						(this.TagTargets &&
						 (entity.target == null ||
						  G.monsters[entity.mtype].cooperative)) ||
						this.IsTargetingParty(entity)
					) {
						if (this.TargetingPriority[entity.mtype] != null) {
							if (
								!this.RequireLOS ||
								can_move_to(entity.real_x, entity.real_y)
							) {
								if(entity.s.burned && entity.s.burned.intensity / 5 * (1 / 0.21) * (entity.s.burned.ms)) /100 > entity.hp) {
									continue;
								}
								let targetArgs = {
									priority: this.TargetingPriority[entity.mtype],
									targeting: this.IsTargetingParty(entity),
									distance: parent.distance(character, entity),
									entity: entity
								};
								potentialTargets.push(targetArgs);
							}
						}
					}
				}
			}
		}

		potentialTargets.sort(function(a, b) {
			if (a.priority > b.priority) {
				return 1;
			} else if (a.priority < b.priority) {
				return -1;
			} else if (a.targeting > b.targeting) {
				return -1;
			} else if (b.targeting > a.targeting) {
				return 1;
			} else if (b.targeting == a.targeting) {
				if (a.distance > b.distance) {
					return 1;
				} else if (a.distance < b.distance) {
					return -1;
				}
			} else if (a.distance > b.distance) {
				return -1;
			} else if (a.distance < b.distance) {
				return 1;
			} else {
				return -1;
			}
		});

		if (potentialTargets.length > 0) {
			if (!count) {
				return potentialTargets[0].entity;
			} else {
				return potentialTargets.slice(0, count).map(a => a.entity);
			}
		}

		return null;
	};

	/*
    	Returns true if the player is currently in a PvP environment.
    */
	this.IsPVP = function() {
		if (this.DebugPVP || parent.is_pvp || G.maps[character.in].pvp) {
			return true;
		} else {
			return false;
		}
	};

	/*
    	Returns true if the provided entity is targeting either the player or the player's party.
    */
	this.safe = [...to_party, ...group];
	this.IsTargetingParty = function(entity) {
		if (entity.target == character.id) {
			return 1;
		}
		if (this.Solo) {
			return false;
		}

		if (this.safe.indexOf(entity.target) > -1 && !this.Solo) {
			return 1;
		}

		return false;
	};

	/*
    	Returns true if, according to our configuration, a player should be attacked or not.
    */
	this.IsPlayerSafe = function(entity) {
		if (this.safe.indexOf(entity.id) > -1) {
			return true;
		}

		if (this.BlackList.indexOf(entity.id) > -1) {
			return false;
		}

		if (this.WhiteList.indexOf(entity.id) > -1) {
			return true;
		}

		let greyListEntry = this.GreyList[entity.id];

		if (
			this.UseGreyList &&
			(greyListEntry === undefined || greyListEntry === true)
		) {
			return true;
		}

		return false;
	};

	/*
    	Adds a player to the GreyList, which is used to allow players to not be attacked unless instigated.
    */
	this.GreyListPlayer = function(entity) {
		if (entity.type == "character") {
			game_log("Adding " + entity.id + " to GreyList.");
			this.GreyList[entity.id] = true;
		}
	};

	/*
    	Marks a player on the GreyList to be no longer considered safe. This means that they will be attacked in PvP environments.
    */
	this.RemoveFromGreyList = function(name) {
		this.GreyList[name] = false;
	};

	/*
    	Returns whether or not we want to consider hostile action against this player a reason to engage the aggressor in PvP.
    */
	this.IsPlayerFriendly = function(name) {
		if (character.id == name) {
			return true;
		}

		if (this.safe.indexOf(name) > -1) {
			return true;
		}

		return false;
	};

	// Set up hit event handling to react when attacked

	// Clean out an pre-existing listeners
	if (parent.prev_handlerstargeting) {
		for (let [event, handler] of parent.prev_handlerstargeting) {
			parent.socket.removeListener(event, handler);
		}
	}

	parent.prev_handlerstargeting = [];

	// handler pattern shamelessly stolen from JourneyOver
	function register_targetinghandler(event, handler) {
		parent.prev_handlerstargeting.push([event, handler]);
		parent.socket.on(event, handler);
	}

	let targeter = this;
	this.hitHandler = function(event) {
		if (parent != null) {
			var attacker = event.hid;
			var attacked = event.id;

			var attackedEntity = parent.entities[attacked];
			var attackingEntity = parent.entities[attacker];

			if (attacked == character.name) {
				attackedEntity = character;
			}

			if (attackedEntity != null && event.heal == null) {
				if (
					attackedEntity.type == "character" &&
					targeter.IsPlayerFriendly(attacked) &&
					attackingEntity &&
					attackingEntity.type == "character"
				) {
					targeter.RemoveFromGreyList(attacker);
					game_log(
						"Removing " + attacker + " from greylist for attacking " + attacked
					);
					to_party.forEach(player => {
						send_cm(player, {
							command: "aggro",
							name: attacker
						});
					});
				}
			}
		}
	};

	register_targetinghandler("hit", this.hitHandler);
}
/**
 * Returns an ordered array of all relevant targets as determined by the following:
 *  1. The monsters' type is contained in the 'monsterTargets' array.
 *  2. The monster is attacking you or a party member.
 *  3. The monster is not targeting someone outside your party.
 * The order of the list is as follows:
 *  - Monsters attacking you or party members are ordered first.
 *  - Monsters are then ordered by distance.
 */
function find_viable_targets() {
	return targeter.GetPriorityTarget(5) || [];
}

function energize(target) {
	if (character.ctype == "mage" && can_use("energize")) {
		use_skill("energize", target);
		return true;
	} else {
		return false;
	}
}

function blink(x, y) {
	if (character.ctype == "mage" && can_use("blink")) {
		use_skill("blink", [x, y]);
		return true;
	} else {
		return false;
	}
}

function magiport(target) {
	if (character.ctype == "mage" && can_use("magiport")) {
		use_skill("magiport", target);
		return true;
	} else {
		return false;
	}
}

function supershot(target) {
	if (character.ctype == "ranger" && can_use("supershot")) {
		use_skill("supershot", target);
		return true;
	} else {
		return false;
	}
}

function curse(target) {
	if (character.ctype == "priest" && can_use("curse")) {
		use_skill("curse", target);
		return true;
	} else {
		return false;
	}
}