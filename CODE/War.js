let tree = 0;
game_log(parent.server_addr)
if(character.name == "Firenus") {
  konami();konami();  
function konami(){
   keyMove("up");
   keyMove("up");
   keyMove("down");
   keyMove("down");
   keyMove("left");
   keyMove("right");
   keyMove("left");
   keyMove("right");
   keyEmit("B");
   keyEmit("A");
 };
function keyMove(dir){
  parent.socket.emit("move", {
    x: character.real_x,
    y: character.real_y,
    going_x: character.real_x,
    going_y: character.real_y,
    m: character.m,
    key: dir});
}
function keyEmit(key){
  parent.socket.emit("interaction", {
    key: key
  });
}
}
function append_log(log, data) {
	let str = `${data}`;
	log = `${log}`;
	localStorage.setItem(log + ':' + character.name, (localStorage.getItem(log + ':' + character.name) ? localStorage.getItem(log + ':' + character.name) + '\n' : "") + str)
}
setInterval(() => {
	let merchants = [];
	for(x in parent.entities) {
		if(parent.entities[x].ctype == "merchant") {
			merchants.push(parent.entities[x])
		}
	}
	merchants.forEach((merch) => {
		for (let x in merch.slots) {
			if (x.startsWith("trade")) {
				let slot = merch.slots[x];
				if(slot && slot.giveaway) {
					if(!slot.list.includes(character.name)) {
						join_giveaway(x,merch.name,slot.rid)
					}
				}
			}
		}
	})
}, 100)
function join_giveaway(c,b,a){parent.socket.emit("join_giveaway",{slot:c,id:b,rid:a});};
function get_log(log) {
	return localStorage.getItem(log + ':' + character.name)
}
parent.socket.emit("merchant", {close:1})
function handle_death() {
	setTimeout(() => {
		parent.socket.emit('respawn')
		send_cm("Firenus", "teleport")
	})
}
let snowman = 0;
/*
setInterval(() => {
  parent.emit_dracul();
  parent.switch_server(parent.server_region + " " + parent.server_identifier);
}, 60 * 1000 * 60 * 0.1);
// */
// /* 

function cruise(speed) {
  parent.socket.emit("cruise",speed);
}
//cruise(82)
function orbit_entity(entity, distance) {
	let point = angleToPoint(entity.real_x, entity.real_y);
	let time_taken_to_orbit = 2 * Math.PI * distance / 82 * 1000;
	console.log(time_taken_to_orbit)
	console.log(Object.keys(parent.party).length);
	console.log(process.hrtime.bigint()/BigInt(1e6));
  const ttto = time_taken_to_orbit;
	const two_pi_radians = 2 * Math.PI;
	var position = pointOnAngle(entity, (
		Number(process.hrtime.bigint()/BigInt(1e6))%ttto)/ttto * two_pi_radians +
								((two_pi_radians/(Object.keys(parent.party).length||1))* to_party.indexOf(character.name)) % two_pi_radians, distance)
	if (can_move_to(position.x, position.y)) {
		move(position.x, position.y);
	} else if (!smart.moving) {
		smart_move({ x: position.x, y: position.y })
	}
}

setTimeout(() => {
	// parent.emit_jr();
	// parent.switch_server(parent.server_region + " " + parent.server_identifier);
}, 60 * 1000 * 60 * 0.5);
// */
function happy_holidays() {
	G.maps.main.npcs.find(({
		id
	}) => id == "xmas_tree").return = true;
	// If first argument of "smart_move" includes "return"
	// You are placed back to your original point
	tree = 1;
	let xmas_tree = G.maps.main.npcs.find(({
		id
	}) => id == "xmas_tree");
	if (!smart.moving) {
		if (character.map == "main") {
			use_skill("use_town");
		}
		let coords = {
			x: character.x,
			y: character.y
		}
		smart_move({
			x: xmas_tree.position[0],
			y: xmas_tree.position[1],
			map: "main"
		}, function() {
			tree = 0;
			if (character.ctype != "mage") {
				send_cm("Firenus", "teleport")
			} else {
				use_skill("blink", [coords.x, coords.y]);
			}
			// This executes when we reach our destination
			parent.socket.emit("interaction", {
				type: "xmas_tree"
			});
			say("Happy Holidays!");
		});
	}
}
let targets = {
	Raphiel: ["a2"],
	Firenus: ["wolfie"],
	Boismon: ["bat"],
	Daedulaus: ["wolfie"],
	AriaHarper: ["wolfie"],
	Geoffriel: ["bat"],
  Rael: ["goo"]

};

game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = targets[character.name],
	state = "farm",
	group = ["Rael", character.name], // The group our character operates in. This generally forms a chain.
	to_party = ["Rael", "Geoffriel", "Boismon", "Ronja", "AriaHarper", "Geoffriel", "Raphiel"],
	party_leader = "Rael",
	grey_list = ["Moebius"], // Characters we trust, but are willing to nullify if needed be (and are in PVP)
	chain = group.slice(0).reverse(), // How is the chain structured?
	follow = group.indexOf(character.name) != 0, // Should we be following someone?
	follow_distance = 30, // How far should we be from the person we are following?
	merchant = "AriaHarper",
	min_potions = 3000, //The number of potions at which to do a resupply run.
	target;

let mana = "mpot1",
	health = "hpot1",
	potion_types = [health, mana]; //The types of potions to keep supplied.
// /*
//The mtype of the event mob we want to kill.
var event_mob_names = ["mrpumpkin", "mrgreen"];

//What monsters do we want to farm in between snowman spawns?
var farm_types = [];
parent.socket.on("magiport", (data) => {
	if (group.includes(data.name) || to_party.includes(data.name)) {
		parent.socket.emit("magiport", {
			name: "Firenus"
		});
	};
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
var events = [];

//Holds the event mob entity if we find it.
let wabbit = null;
setInterval(function() {
	parent.ping();
	var curEvent = events.find((item) => {
		return "easterluck" in character.c ? true : item.name == "wabbit" || true
	});

	//Try to find the event mob
	if (curEvent != null) {
		target = get_nearest_monster({
			type: curEvent.name
		});
	} else {
		target = null;
	};

	//Did we find it?
	if (target != null && (curEvent != null && target.mtype === curEvent.name)) {
		//Wait for someone to attack first disable this if you're able to tank it. 
		if (target.target != null || true) {
			move_or_attack(target);
		};
		if(target.mtype == "wabbit") {
			wabbit = target.id
		}
	} else {
		//normal farming logic here
		if (curEvent == null) {
			if (false) {
				if ((character.map != home_location.map || simple_distance({
					x: character.real_x,
					y: character.real_y
				}, {
					x: home_location.x,
					y: home_location.y
				}) > 300) &&
					!smart.moving) {
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
							};
						};
					};
					if (event.name == "wabbit") {
						events = events.filter(({
							name
						}) => name != "wabbit");
					}
					if (target != null) {
						console.log(target);
						move_or_attack(target)
					};
				};
			};
		} else {
			if (character.map == curEvent.map) {
				var distToEvent = simple_distance({
					x: character.real_x,
					y: character.real_y
				}, {
					x: curEvent.x,
					y: curEvent.y
				});
				if (distToEvent < 10) {
					let event = events.splice(0, 1)[0];
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
					};
				} else {
					if (can_move_to(curEvent.x, curEvent.y)) {
						move(curEvent.x, curEvent.y)
					};
				};
			};

			if (!smart.moving) {
				smart_move({
					x: curEvent.x,
					y: curEvent.y,
					map: curEvent.map
				});
			};
		};
	};
}, 250);

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
			};
		};
	} else {
		//Are we able to fire off an attack?
		if (can_attack(target) && character.ctype != "mage") {
			//Kill it!
			smart_move({x:character.real_x, y:character.real_y})
			attack(target);
		};
	};
};
//Listen for event monster spawn, begin search when it does.
function on_game_event(event) {
	if (event_mob_names.includes(event.name)) {
		events.push(event);
	} else if (event.name == "wabbit") {
		parent.G.maps[event.map].monsters.forEach(({
			boundary,
			name,stype
		}) => {
			if(stype != "randomrespawn") {
				events.push({
					x: (boundary[0] + boundary[2]) / 2,
					y: (boundary[1] + boundary[3]) / 2,
					map: event.map,
					name: event.name
				})
			}
		})
	}
}
setTimeout(() => {
	if(false && "wabbit" in parent.S && parent.S.wabbit.live) {
		let wabbit_event = parent.S.wabbit;

		if(wabbit_event.map != "mansion") {
			events.push({
				x: wabbit_event.x,
				y: wabbit_event.y,
				map: wabbit_event.map,
				name: "wabbit"
			});
		}
	}
}, 10000);
parent.socket.on("game_event", on_game_event)
// */
let NULL_ITEM = {
	name: null,
	level: null
}
let warping = false
let request_luck = true;
let to_sell = new Set(["wbreeches", "wgloves", "wshoes", "quiver", "ringsj", "hpamulet", "intamulet", "dexamulet", "stramulet"]);
let to_send = new Set(["leather", "wcap", "feather0", "egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8", "mcape", "firestaff", "fireblade", "armorbox", "weaponbox", "gem1", "cupid", "hpbelt", "essenceoffrost", "intring", "dexring", "strring", "candypop", "intbelt", "dexbelt", "strbelt", "redenvelopev2", "candy0v3", "candy1v3", "gem0", "seashell", "mpot0", "hpot0", "", "lostearring", "mistletoe", "candycane", "ornament", "intearring", "dexearring", "vitearring", "strearring", "vitscroll"]);
// /*
setInterval(() => {
	if (character.map == "jail") {
		parent.socket.emit("leave")
	}
	if (!can_move_to(character.x, character.y)) {
		// parent.use_skill("use_town")
	}
	if (character.name == party_leader) {
		game_log("I'm leader!")
		for (let i = 1; i < to_party.length; i++) {
			let name = to_party[i];
			send_party_invite(name);
		}
	} else {
		if (character.party) {
			if (character.party != party_leader) {
				console.log(character.party)
				parent.socket.emit("party", {
					event: "leave"
				})
			}
		} else {
			send_party_request(party_leader);
		}
	}
}, 1000 * 1);
// */
function sell_all_of(name) {
	if (merchant_near()) {
		let items = character.items
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
			if (item != null && item.name == name) {
				send_item(merchant, character.items.indexOf(item), 10);
			}
		})
	}
}

function merchant_near() {
	return !!get_player(merchant)
}
let looted_chests = new Set;
setInterval(() => {
	if (character.map == "jail") {
		parent.socket.emit("leave")
	}
	Object.keys(parent.chests).forEach(id => {
		if (!looted_chests.has(id)) {
			send_cm(merchant, {
				command: "loot",
				id: id
			})
			setTimeout(() => {
				looted_chests.delete(id)
				parent.socket.emit("open_chest", {
					id: id
				});
			}, 3000);
			looted_chests.add(id);
			return true
		}
		return false;
	});
	// send_cm("Geoffrey", { command: "loot", ids: ids })
	if (merchant_near()) {
		let sold = 0,
			max_send = 8;
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[i]
			if (item != null) {
				if (to_sell.has(item.name) && sold < max_send && (item.level == 0 || item.level == null)) {
					send_item(merchant, i, 10)
					sold++
				}
				if (to_send.has(item.name) && sold < max_send && (item.level == 0 || item.level == null)) {
					send_item(merchant, i, 10)
					sold++;
				}
			}
		}
		if (num_items(mana) < 3000) {
			send_cm(merchant, "yo, I need some MP")
		} else if (num_items(mana) > 4000) {
			send_item(merchant, get_index_of_item(mana), 100)
		}
		if (num_items(health) < 3000) {
			send_cm(merchant, "yo, I need some HP")
		} else if (num_items(health) > 4000) {
			send_item(merchant, get_index_of_item(health), 100)
		}
		if (character.gold < 40000) {
			send_cm(merchant, "yo, I need some gold");
		} else if (character.gold > 50000) {
			send_gold(merchant, 10000)
		}
		if (num_items("bunnyelixir") <= 1 && !is_elixir_equiped("bunnyelixir") && request_luck) {
			// send_cm(merchant, "yo, I need some bunny")
		}
		if (num_items("bunnyelixir") >= 2 && !is_elixir_equiped("bunnyelixir")) {
			equip(get_index_of_item("bunnyelixir"))
		}
		if (num_items("bunnyelixir") >= 2 && is_elixir_equiped("bunnyelixir")) {
			send_item(merchant, get_index_of_item("bunnyelixir"))
		}
	}
}, 500);

parent.socket.on("cm", function(a) {
	let name = a.name;
	let data = JSON.parse(a.message);
	// function on_cm(name, data) {
	if (group.includes(name) || to_party.includes(name) || name == "AriaHarper") {
		if (typeof data == "object") {
			if (data.command) {
				switch (data.command) {
					case "blink":
						blink(data.x, data.y)
						break;
					case "magiport":
						magiport(data.name)
						break;
					case "aggro":
						targeter.RemoveFromGreyList(data.name);
						say("Removed " + data.name + " from greylist for attacking " + name)
						break;
					case "send_cm":
						send_cm(data.name, data.data);
						break;
					case "server":
						parent.switch_server(data.data);
						break;

				}
			}
		} else {
			switch (data) {
				case "shutdown":
					parent.shutdown()
					break;
        case "shutdown_all":
					process.send({command: "shutdown"});
					parent.shutdown_all();
					break;
				case "teleport":
					magiport(name);
					break;
				case "coords":
					const {
						x,
						y,
						map
					} = character,
						  command = "blink"
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
})

parent.socket.on("request",function({name}) {
	console.log("Party Request");
	if (to_party.indexOf(name) != -1 && name != merchant) {
		accept_party_request(name);
	}
})

parent.socket.on("invite", function ({name}) {
	console.log("Party Invite");
	if (to_party.indexOf(name) != -1) {
		accept_party_invite(name);
	}
})

function follow_entity(entity, distance) {
	let point = angleToPoint(entity.real_x, entity.real_y);
	var position = pointOnAngle(entity, point, distance);
	if (can_move_to(position.x, position.y)) {
		clear_drawings();
		let avoid = avoidMobs(position)
		if (!avoid) {
			move(position.x, position.y)
		}
	} else if (!smart.moving) {
		clear_drawings();
		let avoid = avoidMobs(position);
		if (!avoid) {
			smart_move({
				x: position.x,
				y: position.y
			})
		}
	}
}

function angleToPoint(x, y) {
	var deltaX = character.real_x - x;
	var deltaY = character.real_y - y;

	return Math.atan2(deltaY, deltaX);
}

function pointOnAngle(entity, angle, distance) {
	var circX = entity.real_x + (distance * Math.cos(angle));
	var circY = entity.real_y + (distance * Math.sin(angle));

	return {
		x: circX,
		y: circY
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
	return entity.hp / entity.max_hp < 0.75
}
function use_hp_or_mp()
{
	if(safeties && new Date() - last_potion <min(200,character.ping*3)) return;
	var used=false;
	if(new Date()<parent.next_skill.use_hp) return;
	if(character.mp/character.max_mp<0.2) use('use_mp'),used=true;
	else if(character.hp/character.max_hp<0.7) use('use_hp'),used=true;
	else if(character.mp/character.max_mp<0.8) use('use_mp'),used=true;
	else if(character.hp<character.max_hp) use('use_hp'),used=true;
	else if(character.mp<character.max_mp) use('use_mp'),used=true;
	if(used) last_potion=new Date() - character.ping;
}
function get_item_name(item) {
	if (item != null) {
		return item.name
	} else {
		return null;
	}
}

function get_index_of_item(name, max_level) {
	if (!max_level) {
		let possible_items = character.items.map(get_item_name);
		return possible_items.indexOf(name);
	} else {
		let possible_item = character.items.reduce((ret, item) => {
			if (item != null) {
				if (item.name == name) {
					if (item.level > ret.level) {
						return item
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

//Potions And Looting
setInterval(() => {
	if (character.rip && !character.c.revival) {
		use_skill("use_town")
	}
	if (!get_player(merchant)) {
		// loot()
	}
	//Heal With Potions if we're below 75% hp.
	if (needs_hp(character) || needs_mp(character)) {
		use_hp_or_mp();
	}
}, 100); //Execute 2 times per second

function open_chests() {
	let looted = 0;
	for (id in parent.chests) {
		send_cm(merchant, {
			command: "loot",
			id: id
		})
		// parent.socket.emit("open_chest",{id:id}); old version [02/07/18]
		looted++;
		if (looted == 2) break;
	}
}

function get_first_non_null(arr) {
	let copy = arr.slice(0);
	while (copy.length) {
		let val = copy.shift();
		if (val != null) {
			return val;
		}
	}
	return null;
}

function state_controller() {
	//Default to farming
	var new_state = "farm";
	if (G.maps.main.npcs.find(({
		id
	}) => id == "xmas_tree") && !character.s.xmas2) {
		new_state = 'tree';
	}
	if (events.length != 0) {
		new_state = "event";
	}
	if (state != new_state) {
		state = new_state;
	}
}
let ThreeShotTargets = [];
setInterval(() => {
	if (can_use("curse") && target && target.hp > character.attack) {
		curse(target);
	}
}, 500)
function in_attack_range(target) {
	if(!target) return false;
	if(parent.distance(character,target)<=character.range+10) return true;
	return false;

}
game.on("attack", (data, event_name) => {
	console.log(data.actor);
	if(data.kill == true && data.id == wabbit) {
		wabbit = null;
		events = events.filter(({ name }) => name != "wabbit");
	}
	if(data.actor == character.name) {
		if(data.source == "3shot") {
			if(ThreeShotTargets.includes(data.target)) {
				game_log("Reducing Cooldown: 3shot")
				ThreeShotTargets = [];
				reduce_cooldown('attack', character.ping);
			}
		} else if(data.source == "attack") {
			game_log("Reducing Cooldown: attack")
			reduce_cooldown('attack', character.ping);
		}
	}
});
setInterval(() => {
      if(character.slots.mainhand.name == "cupid") {
        equip(character.items.findIndex((item) => item && item.name == "bow"))
      }
}, 500)
let healed_ghosts = new Set();
let allow_swap = 1;
const orbit_target = {real_x:-150, real_y: -2000};
const needs_energized = (entity) => {
	return entity != null && entity.name != character.name && needs_mp(entity);
}
//This function contains our logic for when we're farming mobs
function farm() {
	let possible_follows = (follow) ? chain.slice(chain.indexOf(character.name) + 1).map(get_player) : [];
	let follow_target = get_first_non_null(possible_follows);
	if (follow_target) {
		follow_entity(follow_target, follow_distance);
	}
	let team = to_party.map(get_player)
	switch (character.ctype) {
		case "priest":
			// Basic states to determine if we can heal others. Prevents high spam.
			let healed = false,
				revived = false;

			let to_heal = [get_player("Boismon"), ...team].filter((char) => {
				return char != null && needs_hp(char)
			});

			let to_revive = [get_player("Boismon"), ...team].filter((char) => {
				return char != null && char.rip && !char.c.revival
			});

			for (var i = 0, len = to_revive.length; i < len && !revived; i++) {
				let revive_target = to_revive[i];
				if (can_use("revive") && revive_target.hp == revive_target.max_hp) {
					use_skill("revive", revive_target);
					revived = true;
				} else {
					if (revive_target.hp != revive_target.max_hp) {
						if (!healed && can_heal(revive_target) && can_use("heal")) {
							heal(revive_target);
							healed = true;
						}
					}
				}
			}
			for (var i = 0, len = to_heal.length; i < len && !healed; i++) {
				let heal_target = to_heal[i];
				if (!healed && can_heal(heal_target) && can_use("heal")) {
					heal(heal_target);
          if(heal_target.party == character.party && heal_target.hp / heal_target.max_hp < 0.5) {
            use_skill("partyheal");
          }
					healed = true;
				}
			}
			break;
		case "rogue":
			let possible_targets = follow ? get_target_of(follow_target) : (find_viable_targets() || []);
			if(character.name == "Firenus") {
				possible_targets = possible_targets.splice(0, 2).reverse();
			}
			let attack_target = possible_targets[0];
			//Attack or move to target
			target = attack_target;
			if(target != null) {
				if(character.ctype == "rogue" && can_use('mentalburst') && distance_to_point(target.real_x, target.real_y) < character.range + 60 + 10 + character.xrange) {
					parent.socket.emit("skill", {name: "mentalburst", id: target.id})
			  }
      }
			break;
		case "mage":
			if(!needs_mp(character)) {
				let energized = false;
				let to_energize = team.slice(0).reverse().filter(needs_energized).sort((a, b) => {
					return (a.mp / a.max_mp) - (b.mp / b.max_mp);
				})
				for (var i = 0, len = to_energize.length; i < len && !energized; i++) {
					let energize_target = to_energize[i];
					if (energize_target) {
						energize(energize_target);
						energized = true;
					}
				}
			}
			break;
		case "merchant":
			let lucked = false;
			break;
	}
	if (character.ctype != "merchant") {
		clear_drawings()
		let possible_targets = follow ? get_target_of(follow_target) : (find_viable_targets() || []);
		if(character.name == "Firenus") {
			// possible_targets = possible_targets.splice(0, 2).reverse();
		}
		for (let x in parent.entities) {
      if ("mtype" in parent.entities[x]) {
        let monster = parent.entities[x];
        if (
          monster.s.burned &&
          ((monster.s.burned.intensity / 5) *
            (1 / 0.21) *
            (new Date() - new Date(monster.s.burned.last))) /
            100 >
            monster.hp
        ) {
          if (character.name == "Rael" && monster.target != "Rael" && to_party.includes(monster.target)) {
            use_skill("taunt", monster.id);
          }
          continue;
        }
      }
    }
		let attack_target = Array.isArray(possible_targets) ? possible_targets[0] : possible_targets;
		//Attack or move to target
		target = attack_target;
		if(character.ctype == "rogue") {
			
		  // orbit_entity(orbit_target, 90);
		}
    if(character.map == "winterland") {
      if(!["rogue", "warrior"].includes(character.ctype)) {
			  // orbit_entity(orbit_target, 120);
			}
    }
		if (attack_target != null && (typeof ranger_healed == "undefined" || !ranger_healed) &&  character.ctype != "priest") {
			let targets;

			
			if (!group.includes(attack_target.id) && get_player("Rael")) {
				if (parent.distance(attack_target, character) < character.range) {
					if (can_attack(attack_target)) {
						// Index of a book in your inv.
						// equip(3)
						if(character.ctype == "rogue" && can_use("invis")) {
							use_skill("invis");
						}
						if (character.ctype == "priest" && attack_target.mtype == "ghost" && !healed_ghosts.has(attack_target.id) && true) {
							heal(attack_target);
							healed_ghosts.add(attack_target.id)
						} else {
							if (can_attack(attack_target)) {
								if(character.ctype == "ranger" && can_use("huntersmark")) {
									let markable = find_viable_targets().filter((entity) => {
										return !("marked" in entity.s)
									})
									if(markable[0]) {
										parent.socket.emit("skill",{name:"huntersmark",id:markable[0].id})
									}
								}
								if (character.ctype == "mage" && can_use("cburst") && false) {

									parent.socket.emit("skill", {
										name: "cburst",
										targets: find_viable_targets().slice(0, 2).filter((entity) => {
											return parent.distance(entity, character) < character.range + 10
										}).map(({
											id,
											hp
										}) => [id, 1])
									})
								} else if (character.ctype == "ranger" && can_use("attack") &&
										   (targets = find_viable_targets().slice(0, 5).filter((entity) => {
									return parent.distance(entity, character) < character.range + 10
								}).map(({
									id
								}) => id)).length >= 4 && character.level >= 75 && (character.mp > 420) && false) {
									if ((targets.every((entity) => {
										return entity.hp > character.attack * 0.7 * 1.1;
									}) && character.hp != character.max_hp) || (targets.every((entity) => {
										return entity.hp > character.attack * 0.7 * 1.1 * 2;
									}))) {
										let index = get_index_of_item("gphelmet")
										if(index != -1) {
											equip(index)
										}
										parent.socket.emit("skill", {
											name: "5shot",
											ids: find_viable_targets().slice(0, 5).map(({
												id
											}) => id)
										});
										ThreeShotTargets = find_viable_targets().slice(0, 3).map((entity) => entity.id);
										if(index != -1) {
											equip(index)
										}
									} else {
										parent.socket.emit("skill", {
											name: "5shot",
											ids: find_viable_targets().slice(0, 5).map(({
												id
											}) => id)
										});
										ThreeShotTargets = find_viable_targets().slice(0, 3).map((entity) => entity.id);
									}
								} else if (character.ctype == "ranger" && can_use("attack") &&
										   character.mp > 300 && (targets = find_viable_targets().slice(0, 3).filter((entity) => {
									return parent.distance(entity, character) < character.range + 10
								})).length >= 2 && character.level >= 60 && false) {
									let is_5shot;
                  let targets = find_viable_targets().slice(0, 3)
									if(targets.filter((entity) => entity.target != character.name).length == 2) {
										targets.push(...((targeter2.GetPriorityTarget(2) || []).filter((entity) => entity.target == character.name || entity.target == undefined) || []));
									} else if(targets.every((entity) => entity.target != character.name).length == 3) {
                    targets.push(...((targeter2.GetPriorityTarget(2) || []).filter((entity) => entity.target == character.name || entity.target == undefined) || []));
                    parent.socket.emit("skill", {
											name: "5shot",
											ids: targets.slice(0, 5).map(({
												id
											}) => id)
										});
										ThreeShotTargets = find_viable_targets().slice(0, 3).map((entity) => entity.id);
                    is_5shot = true
                  }
                  if(!is_5shot) {
                    targets = targets.map((entity) => entity ? entity.id : null);
                    parent.socket.emit("skill", {
                      name: "3shot",
                      ids: targets
                    })
                    ThreeShotTargets = targets;
                  }
								} else {
                  if(character.ctype == "ranger") {
                    parent.socket.emit("skill", {
                      name: "piercingshot",
                      id: attack_target.id
                    })
                  } else {
									  attack(attack_target);
                  }
								}
							}
						}
					}
				} else if (!follow_target && !tree) {
					if (character.mp / character.max_mp > 0.75) {
						if (attack_target.type == "character" || attack_target.mtype == "prat") {
							if (can_use("supershot") && distance_to_point(attack_target.x, attack_target.y) < character.range * 3) {
								use_skill("supershot", attack_target)
							}
						}
					}
					if (can_move_to(target.x, target.y) && target.mtype != "prat" ) {
						move_to_target(attack_target)
					} else if (!smart.moving && target.mtype != "prat" ) {
						smart_move({
							x: target.real_x,
							y: target.real_y
						})
					}
				}
			}
		} else {
			if (!smart.moving && !follow_target && !character.rip && !tree) {
				if (monster_targets[0] == "prat") {
					smart_move("ghost", () => {
						smart_move({
							x: -295,
							y: 587,
							map: "level1"
						});
					});
				} else {
					smart_move({
						to: monster_targets[0]
					})
				}
			}
		}
		if(monster_targets[0] == "prat" && (distance_to_point(-295,558) > 5 || character.map != "level1") && !smart.moving) {
			smart_move({
				x: -295,
				y: 587,
				map: "level1"
			}, () => {
				move(-295, 587);
			});
		} 
    
	}
}

function get_door(door) {
	return G.maps[character.map].doors.filter(([a, b, c, d, name]) => {
		return name == door;
	})[0];
}

function transport(map, spawn) {
	parent.socket.emit("transport", {
		to: map,
		s: spawn
	});
}


//Returns the number of items in your inventory for a given item name;
function num_items(name) {
	var item_count = character.items.filter(item => item != null && item.name == name).reduce((a, b) => {
		return a + (b.q || 1);
	}, 0);

	return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots() {
	var empty = character.items.filter(item => item == null).length;

	return empty;
}
let avoidMobs = (function() {
	//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
	var rangeBuffer = 60;

	//How far away we want to consider monsters for
	var calcRadius = 150;

	//What types of monsters we want to try to avoid
	var avoidTypes = ["crabx", "bigbird"];

	var avoidPlayers = false//parent.is_pvp; //Set to false to not avoid players at all
	var playerBuffer = 30; //Additional Range around players
	var avoidPlayersWhitelist = ["Geoffrey", "Firenus", "Daedulaus", "Boismon", "Raphiel3"]; //Players want to avoid differently
	var avoidPlayersWhitelistRange = null; //Set to null here to not avoid whitelisted players
	var playerRangeOverride = 65; //Overrides how far to avoid, set to null to use player range.
	var playerAvoidIgnoreClasses = ["merchant"]; //Classes we don't want to try to avoid

	//Tracking when we send movements to avoid flooding the socket and getting DC'd
	var lastMove;

	//Whether we want to draw the various calculations done visually
	var drawDebug = true;

	function avoidMobs(goal) {
		var noGoal = false;

		if (goal == null || goal.x == null || goal.y == null) {
			noGoal = true;
		}

		if (drawDebug && !noGoal) {
			draw_circle(goal.x, goal.y, 25, 1, 0xDFDC22);
		}

		var maxWeight;
		var maxWeightAngle;
		var movingTowards = false;

		var monstersInRadius = getMonstersInRadius();

		var avoidRanges = getAnglesToAvoid(monstersInRadius);
		var inAttackRange = isInAttackRange(monstersInRadius);
		if (!noGoal) {
			var desiredMoveAngle = angleToPoint(character, goal.x, goal.y);



			var movingTowards = angleIntersectsMonsters(avoidRanges, desiredMoveAngle);

			var distanceToDesired = distanceToPoint(character.real_x, character.real_y, goal.x, goal.y);

			var testMovePos = pointOnAngle(character, desiredMoveAngle, distanceToDesired);

			if (drawDebug) {
				draw_line(character.real_x, character.real_y, testMovePos.x, testMovePos.y, 1, 0xDFDC22);
			}
		}


		//If we can't just directly walk to the goal without being in danger, we have to try to avoid it
		if (inAttackRange || movingTowards || (!noGoal && !can_move_to(goal.x, goal.y))) {
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

						var distToMonster = distanceToPoint(position.x, position.y, entity.real_x, entity.real_y);

						var charDistToMonster = distanceToPoint(character.real_x, character.real_y, entity.real_x, entity.real_y);

						if (charDistToMonster < monsterRange) {
							inRange = true;
						}

						if (charDistToMonster < monsterRange && distToMonster > charDistToMonster) {
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
						var tarDistToPoint = distanceToPoint(position.x, position.y, goal.x, goal.y);

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
			var movePoint = pointOnAngle(character, maxWeightAngle, 20);

			if (lastMove == null || new Date() - lastMove > 100) {
				lastMove = new Date();
				move(movePoint.x, movePoint.y);
			}

			if (drawDebug) {
				draw_line(character.real_x, character.real_y, movePoint.x, movePoint.y, 2, 0xF20D0D);
			}

			return true;
		} else {
			return false;
		}

	}

	function getRange(entity) {
		var monsterRange;

		if (entity.type != "character") {

			monsterRange = parent.G.monsters[entity.mtype].range + rangeBuffer;
		} else {
			if (avoidPlayersWhitelist.includes(entity.id) && avoidPlayersWhitelistRange != null) {
				monsterRange = avoidPlayersWhitelistRange;
			} else if (playerRangeOverride != null) {
				monsterRange = playerRangeOverride + playerBuffer;
			} else {
				monsterRange = entity.range + playerBuffer;
			}
		}

		return monsterRange;
	}

	function isInAttackRange(monstersInRadius) {
		for (id in monstersInRadius) {
			var monster = monstersInRadius[id];
			var monsterRange = getRange(monster);

			var charDistToMonster = distanceToPoint(character.real_x, character.real_y, monster.real_x, monster.real_y);

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
			for (id in monstersInRadius) {
				var monster = monstersInRadius[id];

				var monsterRange = getRange(monster);

				var tangents = findTangents({
					x: character.real_x,
					y: character.real_y
				}, {
					x: monster.real_x,
					y: monster.real_y,
					radius: monsterRange
				});

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
						draw_line(character.real_x, character.real_y, tangents[0].x, tangents[0].y, 1, 0x17F20D);
						draw_line(character.real_x, character.real_y, tangents[1].x, tangents[1].y, 1, 0x17F20D);
					}
				}

				if (drawDebug) {
					draw_circle(monster.real_x, monster.real_y, monsterRange, 1, 0x17F20D);
				}
			}
		}

		return avoidRanges;
	}

	function getMonstersInRadius() {
		var monstersInRadius = [];

		for (id in parent.entities) {
			var entity = parent.entities[id];
			var distanceToEntity = distanceToPoint(entity.real_x, entity.real_y, character.real_x, character.real_y);

			var range = getRange(entity);

			if (entity.type === "monster" && avoidTypes.includes(entity.mtype)) {

				var monsterRange = getRange(entity);

				if (distanceToEntity < calcRadius) {
					monstersInRadius.push(entity);
				}
			} else {
				if (avoidPlayers && entity.type === "character" && !entity.npc && !playerAvoidIgnoreClasses.includes(entity.ctype)) {
					if (!avoidPlayersWhitelist.includes(entity.id) || avoidPlayersWhitelistRange != null) {
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
			x: circle.x + (circle.radius * Math.sin(t)),
			y: circle.y + (circle.radius * -Math.cos(t))
		};

		t = b + a;
		var tb = {
			x: circle.x + circle.radius * -Math.sin(t),
			y: circle.y + circle.radius * Math.cos(t)
		}



		return [ta, tb];
	}

	function offsetToPoint(x, y) {
		var angle = angleToPoint(x, y) + Math.PI / 2;

		return angle - characterAngle();

	}

	function pointOnAngle(entity, angle, distance) {
		var circX = entity.real_x + (distance * Math.cos(angle));
		var circY = entity.real_y + (distance * Math.sin(angle));

		return {
			x: circX,
			y: circY
		};
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
		return (character.angle * Math.PI) / 180;
	}

	function distanceToPoint(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}
	return avoidMobs
})();
//Gets an NPC by name from the current map.
function get_npc(name) {
	var npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

	if (npc.length > 0) {
		return npc[0];
	}

	return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
	return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
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
//Example Usage
var targeter = new Targeter([...monster_targets].reverse().reduce((ret, value) => {
	ret[value] = monster_targets.indexOf(value) + 2;
	return ret;
}, {
	/* phoenix: 1,*/
	snowman: 0
}), ["Boismon", "Firenus", "Raphiel3"], ["Maela"], {
	UseGreyList: true,
	RequireLOS: false,
	DebugPVP: false,
	TagTargets: character.name == "Rael",
	Solo: false
});

var targeter2 = new Targeter([...monster_targets].reverse().reduce((ret, value) => {
	ret[value] = monster_targets.indexOf(value) + 2;
	return ret;
}, {
	/* phoenix: 1,*/
	snowman: 0
}), ["Boismon", "Firenus", "Raphiel3"], ["Maela"], {
	UseGreyList: true,
	RequireLOS: false,
	DebugPVP: false,
	TagTargets: true,
	Solo: true
});

setInterval(function() {
	var targets = targeter.GetPriorityTarget(3);
	clear_drawings();
	if (targets && !parent.no_graphics) {
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
		value: [...monster_targets].reverse().reduce((ret, value) => {
			ret[value] = monster_targets.indexOf(value) + 2;
			return ret;
		}, {
			pinkgoo: 1,
			// mvampire: 1,
			// phoenix: 1,
			snowman: 1
		})
	});
	this.WhiteList = whitelist;
	this.BlackList = blacklist;
	this.GreyList = {};

	if (args.UseGreyList === undefined) {
		args.UseGreyList = true;
	}
	this.UseGreyList = args.UseGreyList;
	if (args.Solo === undefined) {
		args.Solo = false;
	}
	this.Solo = args.Solo;

	if (args.RequireLOS === undefined) {
		args.RequireLOS = true;
	}
	this.RequireLOS = args.RequireLOS;

	if (args.DebugPVP === undefined) {
		args.DebugPVP = false;
	}
	this.DebugPVP = args.DebugPVP;

	if (args.TagTargets === undefined) {
		args.TagTargets = true;
	}
	this.TagTargets = args.TagTargets;

	/*
    	Primary targeting function.

    	If you specify count, an array of the top n targets will be returned, otherwise only the closest, highest priority, target will be returned.
    */
	this.GetPriorityTarget = function(count) {
		let potentialTargets = [];

		for (let id in parent.entities) {
			let entity = parent.entities[id];

			if (this.IsPVP() && entity.type == "character" && !entity.npc && !entity.rip) {
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
					if ((this.TagTargets && (entity.target == null || G.monsters[entity.mtype].cooperative)) || this.IsTargetingParty(entity)) {
						if (this.TargetingPriority[entity.mtype] != null) {
							if (!this.RequireLOS || can_move_to(entity.real_x, entity.real_y)) {
								let targetArgs = {};
								targetArgs.priority = this.TargetingPriority[entity.mtype];
								targetArgs.targeting = this.IsTargetingParty(entity);
								targetArgs.distance = parent.distance(character, entity);
								targetArgs.entity = entity;
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
				return -1
			} else if (b.targeting > a.targeting) {
				return 1
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
    	Returns if the player is currently in a PvP environment.
    */
	this.IsPVP = function() {
		if (this.DebugPVP || parent.is_pvp || parent.G.maps[character.map].pvp) {
			return true;
		} else {
			return false;
		}
	}

	/*
    	Returns if the provided entity is targeting either the player or the player's party.
    */
	this.IsTargetingParty = function(entity) {
		if (entity.target == character.id) {
			return 1;
		}
		if (this.Solo) {
			return false;
		}

		if ([...to_party, ...group].indexOf(entity.target) > -1 && !this.Solo) {
			return 1
		}

		return false;
	}

	/*
    	Returns if, according to our configuration, a player should be attacked or not.
    */
	this.IsPlayerSafe = function(entity) {

		if ([...to_party, ...group].indexOf(entity.id) > -1) {
			return true;
		}

		if (this.BlackList.indexOf(entity.id) > -1) {
			return false;
		}

		if (this.WhiteList.indexOf(entity.id) > -1) {
			return true;
		}

		let greyListEntry = this.GreyList[entity.id];


		if (this.UseGreyList && (greyListEntry === undefined || greyListEntry === true)) {
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
			this.GreyList[entity.id] = (entity.ctype == "merchant" && entity.name != "kouin");
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

		if ([...to_party, ...group].indexOf(name) > -1) {
			return true;
		}

		return false;
	}

	//Set up hit event handling to react when attacked

	//Clean out an pre-existing listeners
	if (parent.prev_handlerstargeting) {
		for (let [event, handler] of parent.prev_handlerstargeting) {
			parent.socket.removeListener(event, handler);
		}
	}

	parent.prev_handlerstargeting = [];

	//handler pattern shamelessly stolen from JourneyOver
	function register_targetinghandler(event, handler) {
		parent.prev_handlerstargeting.push([event, handler]);
		parent.socket.on(event, handler);
	};

	let targeter = this;
	this.hitHandler = function(event) {
		if (parent != null) {

			var attacker = event.hid;
			var attacked = event.id;

			var attackedEntity = parent.entities[attacked];

			if (attacked == character.name) {
				attackedEntity = character;
			}

			if (attackedEntity != null && event.heal == null) {
				if (attackedEntity.type == "character" && targeter.IsPlayerFriendly(attacked) && parent.entities[attacker].type == "character") {
					append_log("attack_log-" + character.name, "Attacked by:" + attacker)
					targeter.RemoveFromGreyList(attacker);
					game_log("Removing " + attacker + " from greylist for attacking " + attacked);
				}
			}
		}
	}

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
	var monsters = Object.values(parent.entities).filter((mob) => {
		if (group.includes(mob.id)) {
			return false;
		} else if (mob.type == "monster" || is_pvp()) {
			if (mob.mtype == "snowman") {
				return true;
			} else {
				if (mob.target == null) {
					if (monster_targets.includes(mob.mtype)) {
						return true
					} else {
						return false;
					}
				} else if (to_party.includes(mob.target) || mob.target == character.name) {
					mob.targeting_party = 1
					return true;
				} else {
					return false;
				}
			}
		} else if (grey_list.includes(mob.id)) {
			if (is_pvp()) {
				if (to_party.includes(mob.target)) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		} else {
			return false;
		}
	});

	for (id in monsters) {
		var monster = monsters[id];

		if (to_party.includes(monster.target) ||
			monster.target == character.name) {
			monster.targeting_party = 1;
		} else {
			monster.targeting_party = 0;
		}
	}

	//Order monsters by whether they're attacking us, then by distance.
	monsters.sort((current, next) => {
		var dist_current = distance(character, current);
		var dist_next = distance(character, next);
		// Else go to the 2nd item
		return dist_current - dist_next;
	}).sort((current, next) => {
		return (next.level || 1) - (current.level || 1)
	}).sort((current, next) => {
		return monster_targets.indexOf(next.mtype) - monster_targets.indexOf(current.mtype);
	}).sort((current, next) => {
		return is_player(next) < is_player(current);
	}).sort((current, next) => {
		if (current.targeting_party > next.targeting_party) {
			return -1;
		};
		return 0;
	})
	return monsters;
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
		use_skill("blink", [x, y])
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
game_log("---PvP Tracking Start---");

var curLog = [];
loadPvPTrackerLog();

function loadPvPTrackerLog() {
	curLog = JSON.parse(localStorage.getItem("PvP_Log:" + character.name));

	if (curLog == null) {
		curLog = [];
	}
}

function savePvPTrackerLog() {
	localStorage.setItem("PvP_Log:" + character.name, JSON.stringify(curLog));
}

//Clean out an pre-existing listeners
if (parent.prev_handlerspvptracker) {
	for (let [event, handler] of parent.prev_handlerspvptracker) {
		parent.socket.removeListener(event, handler);
	}
}

parent.prev_handlerspvptracker = [];

//handler pattern shamelessly stolen from JourneyOver
function register_pvptrackerhandler(event, handler) {
	parent.prev_handlerspvptracker.push([event, handler]);
	parent.socket.on(event, handler);
};

function pvptrackerhitHandler(event) {
	if (parent != null) {}
}

function pvptrackerhitHandler(event) {
	if (parent != null) {
		var attacker = event.hid;
		var attacked = event.id;

		var attackedEntity = parent.entities[attacked];
		var attackerEntity = parent.entities[attacker];

		if (event.hid == character.name) {
			attackerEntity = character;
		}

		if (event.id == character.name) {
			attackedEntity = character;
		}

		if (attackedEntity != null && attackerEntity != null) {
			if (attackedEntity.type == "character" && event.heal == null) {
				var logEntry = {};
				logEntry.Attacker = event.hid;
				logEntry.AttackerOwner = attacker.owner;
				logEntry.Defender = event.id;
				logEntry.Animation = event.anim;
				logEntry.Damage = event.damage;
				logEntry.Time = new Date();

				curLog.push(logEntry);
				savePvPTrackerLog();
			}
		}
	}
}

register_pvptrackerhandler("death", pvptrackerhitHandler);
register_pvptrackerhandler("hit", pvptrackerhitHandler);