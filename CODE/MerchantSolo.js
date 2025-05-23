
let socket = parent.socket;
function distance_to_point(x, y) {
	return Math.sqrt(Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2));
}
setInterval(() => {
	for(let x in parent.entities) {
		let entity = parent.entities[x];
		if(entity.type == "character" && !entity.npc && distance_to_point(entity.real_x, entity.real_y) < 320) {
			if(!entity.s.mluck || entity.s.mluck.f != character.name) {
				use_skill('mluck', entity.id);
				break;
			}
		}
	}
	if (character.skin != "tf_orange") {
		socket.emit("activate", {
			slot: "ring2"
		})
	}
}, 500);

  
function append_log(log, data) {
	let str = `${data}`;
	let current_log = localStorage.getItem(log + ':' + character.name) || '';
	localStorage.setItem(`${log}:${character.name}`, current_log + '\n'  + str)
}

const slots = {};
if (character.on) {
	character.on("cm", function(data) {
		on_cm(data.name, data.message);
	});
}
for (let slot in character.slots) {
	let value = character.slots[slot];
	if (value && !value.b) {
		slots[slot] = [value.name, value.price, value.q];
	}
};
const elixirs = ["elixirvit0", "elixirvit1", "elixirdex0", "elixirdex1", "elixirint0", "elixirint1", "elixirstr0", "elixirstr1"];
setInterval(() => {
	elixirs.forEach((elixir_name) => {
		let elixir_item = character.items.find((item) => {
			return item != null && item.name == elixir_name;
		});
		let number_of_elixir = elixir_item ? elixir_item.q : 0;
		if(number_of_elixir > 10) {
			parent.socket.emit("craft", {
				items: [[0, character.items.indexOf(elixir_item)]]
			})
		}
	})
}, 100)

function on_disappear(entity, data) {
	if (group.includes(data.id) && data.id != character.name) {
		// smart_move(data.to)
	}
}

socket.on("magiport", (data) => {
	if (group.includes(data.name)) {
		socket.emit("magiport", {
			name: data.name
		});
	};
});
const index_of_stand = character.items.findIndex((item) => item != null && item.name == "stand0");
setInterval(() => {
	if (!character.stand && !character.moving && !smart.moving) {
		socket.emit("merchant", {
			num: index_of_stand
		});
	} else if (character.moving && character.stand) {
		socket.emit("merchant", {
			close: 1
		});
	}
}, 100);

var handle_death = function() {}

/*
 * Various flags that are used to determine what state the character is in:
 * tree: it is definitely christmas season and the xmas tree is located in town square; we also need to renew the buff
 * bank: this is the merchant character and they need to deposit items in the bank
 * gold: this is the merchant character and they need to deposit gold in the bank
 */
let tree = 0,
	 bank = 0,
	 gold = 0
const
to_party = [],
		zoe = ["ZoetheWolf", "Amethyst", "Caroline", "Ronja"]

function happy_holidays() {
	// set the tree flag
	tree = 1;
	let xmas_tree = G.maps.main.npcs.find((npc) => npc.id == "xmas_tree");
	if (!smart.moving) {
		if (character.map == "main") {
			use_skill("use_town");
		}
		const coords = {
			x: character.x,
			y: character.y,
			map: character.in
		}
		if (character.stand) {
			socket.emit("merchant", {
				close: 1
			})
		}
		smart_move({
			'return': true,
			x: xmas_tree.position[0],
			y: xmas_tree.position[1],
			map: "main"
		}, function() {
			socket.emit("merchant", {
				num: get_index_of_item("stand0")
			})
			tree = 0;
			if (character.ctype != "mage") {
				send_cm("Firenus", "teleport")
			} else if (character.in == coords.map) {
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
game_log("---Script Start---");
// Put monsters you want to kill in here
// If your character has no target, it will travel to a spawn of the first monster in the list below.
// However, this is a merchant. They will not be using attack at all.
setInterval(buy_potions, 1000);
let monster_targets = ["crab"],
	 state = "farm",
	 merchant = "AriaHarper",
	 group = ["CuteBurn", "CuteFreeze", "Geoffriel", "AriaHarper", "Firenus", "Malthael"],
	 chain = [...group].reverse(),
	 follow = group.indexOf(character.name) != 0,
	 follow_distance = 15,
	 min_potions = 1000,
	 purchase_amount = 50,
	 party_leader = "CuteBurn",
	 mana = "mpot0",
	 health = "hpot0",
	 potion_types = [health, mana, "mpot1"], //The types of potions to keep supplied.
	 NULL_ITEM = {
		 name: null,
		 level: null
	 },
	 request_luck = true,
	 target,
	 to_dismantle = ["firestaff", "fireblade"],
	 to_sell = new Set(["quiver", "phelmet", "dexamulet", "intamulet", "strearring", "dexearring", "intearring", "stramulet", "wcap", "dexring", "wbook0", "shoes1", "coat1", "pants1", "gloves1","helmet",  "wshoes", "wcap", "ecape", "carrotsword", "wbreeches", "wattire", "pants1", "coat1", "helmet1", "gloves1", "wgloves", "strbelt", "strring", "", "rednose", "ringsj", "hpbelt", "hpamulet", "", "strearring", "", "", "", "vitring", "", "vitearring", ""]),
	 to_send = ["seashell", "gem0", "gem1", "wbook0", "intbelt", "strbelt", "dexbelt", "quiver"];
let event_active = false;
// /*
var event_mob_names = [];

//What monsters do we want to farm in between snowman spawns?
var farm_types = [];


//Where do we want to go in between snowman spawns?
var home_location = {
	x: -471,
	y: -692,
	map: "halloween"
};


//The following variables are assigned while the script is running. 

let switched = false;
//The map the event mob spawned on
var events = []

//Holds the event mob entity if we find it.

setInterval(function() {
	var curEvent = events[0];

	//Try to find the event mob
	if (curEvent != null) {
		target = get_nearest_monster({
			type: curEvent.name
		});
	} else {
		target = null;
	}

	//Did we find it?
	if (target != null && (curEvent != null && target.mtype === curEvent.name)) {
		//Wait for someone to attack first disable this if you're able to tank it. 
		if (target.target != null || true) {
			move_or_attack(target);
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
							}
						}
					}

					if (target != null) {
						move_or_attack(target)
					}
				}
			}
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
					events.splice(0, 1);
					if (!switched) {
						switch (parent.server_region + " " + parent.server_identifier) {
							case "US I":
								parent.switch_server("US II");
								break;
							case "US II":
								parent.switch_server("EU I");
								break;
							case "EU I":
								parent.switch_server("US I")
						}
						switched = true;
					}
				} else {
					if (can_move_to(curEvent.x, curEvent.y)) {
						move(curEvent.x, curEvent.y)
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

//Function for either attacking or moving to attack
function move_or_attack(target) {
	if (!in_attack_range(target)) {
		//No? Get over there!

		//Can we walk straight to it?
		if (can_move_to(target.real_x, target.real_y)) {
			//Good!
			move(
				character.real_x + (target.real_x - character.real_x) / 2,
				character.real_y + (target.real_y - character.real_y) / 2
			);
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
		if (can_attack(target)) {
			//Kill it!
			attack(target);
		}
	}
}

//Listen for event monster spawn, begin search when it does.
function on_game_event(event) {
	if (event_mob_names.includes(event.name)) {
		events.push(event);
	}
}
// */
setInterval(function() {
	if (character.rip) {
		use_skill("use_town")
		send_cm("Firenus", "teleport")
	}
	if (character.name == "AriaHarper") {
		for (let i = 0; i < group.length; i++) {
			let name = group[i];
			if (name != merchant && name == "Rael") {
				// send_party_invite(name);
			}
		}
	} else {
		if (character.party) {
			if (character.party != party_leader) {
				parent.socket.emit("party", {
					event: "leave"
				})
			}
		} else if (character.ctype != "merchant") {
			send_party_request(group[0]);
		}
	}
}, 1000);
// */
let looted_chests = new Set;
parent.past_cm_handlers = parent.past_cm_handlers || [];
// const socket = parent.socket;
on_cm = function on_cm(name, data) {
	if (group.includes(name) || zoe.includes(name)) {
		if (typeof data == "object") {
			switch (data.command) {
				case "loot":
					if(true) {
						if (data.id && !looted_chests.has(data.id)) {
							looted_chests.add(data.id)
							socket.emit("open_chest", {
								id: data.id
							});
              send_cm(name, {command: "delete_chest", data: data.id});
						} else if (data.ids) {
							data.ids.forEach((id) => {
								if (data.id && !looted_chests.has(data.id)) {
									looted_chests.add(data.id)
									socket.emit("open_chest", {
										id: data.id
									});
								}
							});
						} else {
							loot();
						}
					}
					break;
			}
		} else {
			if (data == "shutdown") {
				parent.shutdown()
			} else if (data == "yo, I need some luck") {
				let player = get_player(name);
				if (player != null) {
					send_item(name, character.items.findIndex((item) => {
						return item != null && item.name == "elixirluck";
					}), 1)
					if (can_use("mluck") && distance_to_point(player.real_x, player.real_y) < G.skills.mluck.range) {
						use_skill("mluck", player)
					}
				}
			} else if (data == "yo, I need some pump") {
				let player = get_player(name);
				if (player != null) {
					send_item(name, character.items.findIndex((item) => {
						return item != null && item.name == "pumpkinspice";
					}), 1)
					if (can_use("mluck") && distance_to_point(player.real_x, player.real_y) < G.skills.mluck.range) {
						use_skill("mluck", player)
					}
				}
			} else if (data == "yo, I need some bunny") {
				let player = get_player(name);
				if (player != null) {
					send_item(name, character.items.map((item) => (item || {}).name).indexOf("bunnyelixir"), 1)
					if (can_use("mluck") && distance_to_point(player.real_x, player.real_y) < G.skills.mluck.range) {
						use_skill("mluck", player)
					}
				}
			} else if (data == "yo, I need some dex") {
				let player = get_player(name);
				if (player != null) {
					send_item(name, character.items.map((item) => (item || {}).name).indexOf("elixirdex1"), 1)
					if (can_use("mluck") && distance_to_point(player.real_x, player.real_y) < G.skills.mluck.range) {
						use_skill("mluck", player)
					}
				}
			} else if (data == "yo, I need some gold") {
				send_gold(name, 20000);
			} else if (data == "yo, I need some MP") {
				if (num_items(mana) > 0) {
          if(name == "Firenus" || name == "Malthael") {
            send_item(name, get_index_of_item("mpot1"), 500)
          } else {
					  send_item(name, get_index_of_item(mana), 500)
          }
				} else {
					buy(mana, purchase_amount)
				}
			} else if (data == "yo, I need some HP") {
				if (num_items(health) > 0) {
					send_item(name, get_index_of_item(health), 50)
				} else {
					buy(health, purchase_amount)
				}
			}
		}
	}
};
let handler;
parent.socket.on("cm", handler = function(a) {
	let name = a.name;
	let data = JSON.parse(a.message);
	on_cm(name, data);
});
parent.past_cm_handlers.push(handler);

function on_party_request(name) {
	console.log("Party Request");
	if (group.indexOf(name) != -1 && true) {
		accept_party_request(name);
	}
}

function on_party_invite(name) {
	console.log("Party Invite");
	if (group.indexOf(name) != -1 && name == "CuteBurn") {
		accept_party_invite(name);
	}
}

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
setInterval(function() {
	//Determine what state we should be in.
	state_controller();
	if (num_items("elixirluck") < 3) {
		buy("elixirluck", 1)
	}

	//Switch statement decides what we should do based on the value of 'state'
	switch (state) {
		case "farm":
			farm();
			break;
		case "resupply_potions":
			resupply_potions();
			break;
		case "event":
			break;
		case "bank":
			break;
		case "tree":
			happy_holidays();
			break;
	}
}, 100); //Execute 10 times per second

function needs_mp() {
	return character.mp / character.max_mp < 0.75;
}

function needs_hp() {
	return character.hp / character.max_hp < 0.75
}

function get_item_name(item) {
	if (item != null) {
		return item.name;
	} else {
		return null;
	};
};
setInterval(function() {
	let actions = 0;
	let max_actions = 10;
	let merchants = Object.values(parent.entities).filter((player) => {
		return "ctype" in player && (player.ctype == "merchant" || player.stand);
	})
	let higher_prices = [];
	merchants.forEach((merch) => {
		for (let x in merch.slots) {
			if (x.startsWith("trade")) {
				let slot = merch.slots[x];
				if (slot && slot.b == true) {
					if (to_sell.has(slot.name)) {
						if (true || slot.level == item.level) {
							higher_prices.push([slot.rid, slot.price, x, merch.name, slot.name]);
						}
					}
				} else if (slot && !slot.b && !slot.giveaway) {
					if (slot.price < parent.calculate_item_value(slot)) {
						let {
							rid
						} = slot;
						parent.trade_buy(x, merch.name, rid);
						setTimeout(() => {
							let item = character.items.find((i) => {
								if (i && i.name == slot.name && i.level == slot.level && (to_sell.includes(i.name) || true)) {
									return true;
								}
							})
							if (item) {
								sell(character.items.indexOf(item))
							}
						})
					}
				}
			}
		}
	})
	higher_prices.sort((a, b) => {
		return a[1] - b[1];
	})
	// */
	character.items.forEach((item, index) => {
		if (item != null) {
			if (to_dismantle.includes(item.name) && (item.level == 0) && actions < max_actions) {
				actions++;
				parent.socket.emit("dismantle", {
					num: index
				});
			} else if (to_sell.has(item.name) && (item.level == 0 || (["helmet", "pants", "shoes", "coat"].includes(item.name) && item.level <=4)) && actions < max_actions) {
				actions++;
				let possible_buyers = higher_prices.filter((offer) => { return offer[4] == item.name });
				if (true && possible_buyers[0] && possible_buyers[0][1] > parent.calculate_item_value(item)) {
					let [rid, _, slot, name] = possible_buyers[0];
					parent.trade_sell(slot, name, rid)
				} else {
					sell(index, 1);
				};
			};
		};
	});
}, 500);

function sell_all_of(name) {
	character.items.forEach((item, index) => {
		if (item != null && item.name == name && (!item.level || item.level == 0)) {
			// /*
			let merchants = Object.values(parent.entities).filter((player) => {
				return "ctype" in player && (player.ctype == "merchant" || player.stand == "stand0");
			})
			let buying_amulets = [];
			merchants.forEach((merch) => {
				for (let x in merch.slots) {
					if (x.startsWith("trade")) {
						let slot = merch.slots[x];
						if(slot.giveaway) {
							if(!slot.list.includes(character.name)) {
								join_giveaway(x,merch.name,slot.rid)
							}
						} else {
							if (slot && slot.b == true) {
								if (slot.name == name) {
									if (slot.level == item.level) {
										buying_amulets.push([slot.rid, slot.price, x, merch.name]);
									}
								}
							} else if (slot && !slot.b) {
								if (slot.price < parent.calculate_item_value(slot)) {
									let {
										rid
									} = slot;
									parent.trade_buy(x, merch.name, rid);
									setTimeout(() => {
										let item = character.items.find((i) => {
											if (i.name == slot.name && i.level == slot.level && (to_sell.includes(i.name) || true)) {
												return true;
											}
										})
										if (item) {
											sell(character.items.indexOf(item))
										}
									})
								}
							}
						}
					}
				}
			})
			buying_amulets.sort((a, b) => {
				return a.price - b.price;
			})
			// */
			if (true && buying_amulets[0] && buying_amulets[0][1] > parent.calculate_item_value(item)) {
				let [rid, _, slot, name] = buying_amulets[0];
				parent.trade_sell(slot, name, rid)
			} else {
				sell(index, 1);
			}
		}
	})
};

function get_index_of_item(name, max_level) {
	if (!max_level) {
		return character.items.findIndex((item) => {
			return item != null && item.name == name;
		});
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
setInterval(function() {
	loot();
	//Heal With Potions if we're below 75% hp.
	if (needs_hp() || needs_mp()) {
		use_hp_or_mp();
	}
}, 500); //Execute 2 times per second

function get_first_non_null(arr) {
	let copy = [...arr];
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
		new_state = "event"
	}
	//Do we need potions?
	for (let type_id in potion_types) {
		var type = potion_types[type_id];

		var num_potions = num_items(type);

		if (num_potions < min_potions) {
			new_state = "resupply_potions";
			break;
		}
	}
	if (bank || gold) {
		new_state = "bank"
	}

	if (state != new_state) {
		state = new_state;
	}
}

//This function contains our logic for when we're farming mobs
function farm() {
	if (character.rip) {
		use_skill("use_town")
	}
	// Ancient computer does wonderful things, eh?
	if (num_items("elixirluck") < 3) {
		buy("elixirluck", 1)
	}
	let possible_follows = follow ? chain.slice(chain.indexOf(character.name) + 1).map(get_player) : [];
	let follow_target = get_first_non_null(possible_follows);
	if (follow_target || true) {
		if (monster_targets[0] == "rat" && !smart.moving) {
			if(distance_to_point(0, -400) > 10 || character.map != "mansion") {
				smart_move({
					map: "mansion",
					x:0,
					y:-400
				});
			}
		} else if(monster_targets[0] == "xscorpion" && !smart.moving) {
			if(distance_to_point(-720, 806) > 10 || character.map != "halloween")
				smart_move({
					map: "halloween",
					x: -720,
					y: 806
				}, () => {
					move(-720, 806)
				});
		}if (monster_targets[0] == "bigbird" && !smart.moving) {
			if(distance_to_point(1440, 430) > 10 || character.map != "main") {
				smart_move({
					map: "main",
					x: 1440,
					y: 430
				});
			}
		} else if(monster_targets[0] == "mole" && !smart.moving) {
			if(distance_to_point(-720, 806) > 10 || character.map != "tunnel")
				smart_move({
					map: "tunnel",
					x: 248,
					y: -376
				}, () => {
					move(248, -376)
				});
		} else if(monster_targets[0] == "wolfie" && !smart.moving) {
			smart_move({
				map: "winterland",
				x: -276,
				y: -1802
			});
		} else if(monster_targets[0] == "bbpompom" && !smart.moving) {
			smart_move({
				map: "winter_cave",
				x: -134,
				y: -762
			});
		} else if(monster_targets[0] == "boar" && !smart.moving) {
			smart_move({
				map: "winterland",
				x: -231,
				y: -1086
			});
		} else if(monster_targets[0] == "mummy" && !smart.moving) {
			smart_move({
				map: "spookytown",
				x: 168,
				y: -1065
			});
    } else if(monster_targets[0] == "bee" && !smart.moving) {
			smart_move({
				map: "main",
				x: 535,
				y: 1100
			});
		} else {
			// follow_entity(follow_target, follow_distance);
		}
	}
	let team = Object.entries(parent.entities).filter(([_, e]) => e.type == "character" && "ctype" in e).map(([i, _]) => _)
	if (character.ctype == "merchant") {
		let to_luck = team.filter((char) => {
			return char != null && char.name != character.name && (!char.s.mluck || char.s.mluck.f != character.name)
		})
		to_luck.forEach((luck_target) => {
			if (can_use("mluck") && distance_to_point(luck_target.x, luck_target.y) < G.skills.mluck.range && luck_target.name != character.name) {
				parent.tar = luck_target
				// use_skill("mluck", luck_target)
			}
		})
	}
	if (!["xscorpion"].includes(monster_targets[0]) && !smart.moving && !follow_target && !character.rip) {
		if (monster_targets[0] == "prat") {
			smart_move("halloween",() => {  
				smart_move("ghost", () => {
					smart_move({
						x: -295,
						y: 587,
						map: "level1"
					});
				})
			})
		}else if (monster_targets[0] == "boar") {
			smart_move({
				x: -231,
				y: -1086,
				map: "winterland"
			});
		}if (monster_targets[0] == "bigbird" && !smart.moving) {
			if(distance_to_point(1440, 430) > 10 || character.map != "main") {
				smart_move({
					map: "main",
					x: 1440,
					y: 430
				});
			}
		} else if (["rat"].includes(monster_targets[0])) {
			smart_move({
				to: "goo"
			}, () => {
				smart_move({
					to: monster_targets[0]
				});
			});
		} else if(true && !smart.moving) {
			smart_move(monster_targets[0]);
		}
	}
}

//This function contains our logic during resupply runs
const resupply_potions = buy_potions;

function get_door(door) {
	return G.maps[character.map].doors.find(([a, b, c, d, name]) => {
		return name == door;
	})
}

function transport(map, spawn) {
	parent.socket.emit("transport", {
		to: map,
		s: spawn
	});
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions() {
	if (empty_slots() > 0) {
		for (let type_id in potion_types) {
			var type = potion_types[type_id];
			var item_def = parent.G.items[type];
			if (item_def != null) {
				var cost = item_def.g * purchase_amount;
				if (character.gold >= cost) {
					var num_potions = num_items(type);

					if (num_potions < min_potions) {
						buy(type, purchase_amount);
						console.log("Bought!")
					}
				} else {
					game_log("Not Enough Gold!");
				}
			}
		}
	} else {
		game_log("Inventory Full!");
	}
}


//Returns the number of items in your inventory for a given item name;
function num_items(name) {
	var item_count = character.items.reduce(function(a, item) {
		return a + (item != null && item.name == name ? (item.q || 1) : 0);
	}, 0);

	return item_count;
}

//Returns how many inventory slots have not yet been filled.
function empty_slots() {
	var empty = character.items.filter(item => item == null).length;

	return empty;
}

//Gets an NPC by name from the current map.
function get_npc(name) {
	var npc = parent.G.maps[character.map].npcs.filter(npc => npc.id == name);

	if (npc.length > 0) {
		return npc[0];
	}

	return null;
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

//Returns an ordered array of all relevant targets as determined by the following:
////1. The monsters' type is contained in the 'monsterTargets' array.
////2. The monster is attacking you or a party member.
////3. The monster is not targeting someone outside your party.
//The order of the list is as follows:
////Monsters attacking you or party members are ordered first.
////Monsters are then ordered by distance.
function find_viable_targets() {
	var monsters = Object.values(parent.entities).filter(
		mob => !group.includes(mob.id) && ((mob.type == "monster" && !group.includes(mob.id) && mob.target == null ||
														(group.includes(mob.target) && (!group.includes(mob.id))) ||
														mob.target == character.name) &&
													  (mob.type == "monster" &&
														(group.includes(mob.target) && (!group.includes(mob.id)) ||
														 mob.target == character.name)) ||
													  monster_targets.includes(mob.mtype)));

	for (id in monsters) {
		var monster = monsters[id];

		if (group.includes(monster.target) ||
			 monster.target == character.name) {
			monster.targeting_party = 1;
		} else {
			monster.targeting_party = 0;
		}
	}

	//Order monsters by whether they're attacking us, then by distance.
	monsters.sort(function(current, next) {
		if (current.targeting_party > next.targeting_party) {
			return -1;
		}
		var dist_current = distance(character, current);
		var dist_next = distance(character, next);
		// Else go to the 2nd item
		if (dist_current < dist_next) {
			return -1;
		} else if (dist_current > dist_next) {
			return 1
		} else {
			return 0;
		}
	});
	return monsters;
}

function blink(x, y) {
	if (character.ctype == "mage" && can_use("blink")) {
		use_skill("blink", [x, y])
		return true;
	} else {
		return false;
	}
}

function magiport(name) {
	if (character.ctype == "mage" && can_use("magiport")) {
		use_skill("magiport", name);
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
(function() {
	// Auto Compounding
	// Courtesy of: Mark
	// HIGH GRADE ITEMS ONLY
	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['lostearring'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 1;
	//compound settings

	setInterval(function() {

		//Compound Items
		if (cp) {
			compound_items();
		}

	}, 1000 / 4); // Loops every 1/4 seconds.

	function compound_items() {
		let to_compound = character.items.reduce((collection, item, index) => {
			if (item && item.level < maxLevel && whitelist.includes(item.name)) {
				let key = item.name + item.level;
				!collection.has(key) ? collection.set(key, [item.level, index]) : collection.get(key).push(index);
			}
			return collection;
		}, new Map());

		for (let c of to_compound.values()) {
				let scroll_name = use_better_scrolls && c[0] > 1 ? 'cscroll2' : 'cscroll1';

				for (let i = 1; i + 2 < c.length; i += 3) {
				let [scroll, _] = find_item(i => i.name == scroll_name);
				if (scroll == -1) {
					parent.buy(scroll_name);
					return;
				}
				parent.socket.emit('compound', {
					items: [c[i], c[i + 1], c[i + 2]],
					scroll_num: scroll,
					offering_num: null,
					clevel: c[0]
				});
			}
		}
	}

	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})();
(function() {
	// Auto Compounding
	// Courtesy of: Mark
	var cf = true;
	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['dexbelt', 'strring', 'vitearring', 'ringsj', 'wbook0', 'intearring', 'dexearring', 'dexamulet', 'intamulet', 'dexbelt', 'intbelt', 'ctristone', 'stramulet', 'intring', 'dexring'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 3;
	//compound settings

	setInterval(function() {

		if (cf) {
			craft_items();
		}
		//Compound Items
		if (cp) {
			compound_items();
		}

	}, 1000 / 4); // Loops every 1/4 seconds.
	function craft_items() {
		let basket = {
			'shoes':1,
			'feather0': 20
		}
		let can_craft = true;
		let slots = [];
		for (x in basket) {
			let it = character.items.find((item) => {
				return item != null && (item.level == 0 || !item.level) && item.name == x && (item.q >= basket[x] || (basket[x] == 1 && !item.q));
			})
			can_craft = can_craft && (it != null)
			if (can_craft) {
				slots.push([slots.length, character.items.indexOf(it)]);
			}
		}
		if (can_craft) {
			parent.socket.emit("craft", {
				items: slots
			})
		}
	}

	function compound_items() {
		let to_compound = character.items.reduce((collection, item, index) => {
			if (item && item.level < maxLevel && whitelist.includes(item.name)) {
				let key = item.name + item.level;
				!collection.has(key) ? collection.set(key, [item.level, index, item]) : collection.get(key).push(index, item);
			}
			return collection;
		}, new Map());
		if(!character.q.compound) {
			for (var c of to_compound.values()) {
				let scroll_name;
				try {
					scroll_name = calculate_item_grade(G.items[c[2].name], c[2]) ? 'cscroll1' : 'cscroll0';
					for (let i = 1; i + 5 < c.length; i += 6) {
						console.log(c)
						let [scroll, _] = find_item(i => i.name == scroll_name);
						if (scroll == -1) {
							parent.buy(scroll_name);
							return;
						}
						parent.socket.emit('compound', {
							items: [c[i], c[i + 2], c[i + 4]],
							scroll_num: scroll,
							offering_num: null,
							clevel: c[0]
						});
					}
				} catch (e) {
					console.log(e)
				}
			}
		}
	}

	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})();(function() {
	// Auto Compounding
	// Courtesy of: Mark
	var cf = true;
	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['jacko'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 1;
	//compound settings

	setInterval(function() {

		if (cf) {
			craft_items();
		}
		//Compound Items
		if (cp) {
			compound_items();
		}

	}, 1000 / 4); // Loops every 1/4 seconds.
	function craft_items() {
		let basket = {
			'shoes':1,
			'feather0': 20
		}
		let can_craft = true;
		let slots = [];
		for (x in basket) {
			let it = character.items.find((item) => {
				return item != null && (item.level == 0 || !item.level) && item.name == x && (item.q >= basket[x] || (basket[x] == 1 && !item.q));
			})
			can_craft = can_craft && (it != null)
			if (can_craft) {
				slots.push([slots.length, character.items.indexOf(it)]);
			}
		}
		if (can_craft) {
			parent.socket.emit("craft", {
				items: slots
			})
		}
	}

	function compound_items() {
		let to_compound = character.items.reduce((collection, item, index) => {
			if (item && item.level < maxLevel && whitelist.includes(item.name)) {
				let key = item.name + item.level;
				!collection.has(key) ? collection.set(key, [item.level, index, item]) : collection.get(key).push(index, item);
			}
			return collection;
		}, new Map());
		if(!character.q.compound) {
			for (var c of to_compound.values()) {
				let scroll_name;
				try {
					scroll_name = calculate_item_grade(G.items[c[2].name], c[2]) ? 'cscroll1' : 'cscroll0';
					for (let i = 1; i + 5 < c.length; i += 6) {
						console.log(c)
						let [scroll, _] = find_item(i => i.name == scroll_name);
						if (scroll == -1) {
							parent.buy(scroll_name);
							return;
						}
						parent.socket.emit('compound', {
							items: [c[i], c[i + 2], c[i + 4]],
							scroll_num: scroll,
							offering_num: null,
							clevel: c[0]
						});
					}
				} catch (e) {
					console.log(e)
				}
			}
		}
	}

	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})();
let avoidMobs = (function() {
	//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
	var rangeBuffer = 45;

	//How far away we want to consider monsters for
	var calcRadius = 150;

	//What types of monsters we want to try to avoid
	var avoidTypes = ["mole", "poisio", "bigbird", "crabx", "boar"];

	var avoidPlayers = parent.is_pvp; //Set to false to not avoid players at all
	var playerBuffer = 30; //Additional Range around players
	var avoidPlayersWhitelist = []; //Players want to avoid differently
	var avoidPlayersWhitelistRange = 30; //Set to null here to not avoid whitelisted players
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
			for (let i = 0; i < Math.PI * 2; i += Math.PI / 360) {
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
		for (let id in monstersInRadius) {
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
		for (let id in avoidRanges) {
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

		for (let id in parent.entities) {
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
// /*
(function(name, level, gold_limit, quantity) {
	let target = {
		name: name,
		level: level
	};
	// Only items in the whitelists will be upgraded, items not in the list or above the required level are ignored.
	//Courtesy of: Mark

	var en = true; //Enable Upgrading of items = true, Disable Upgrading of items = false
	var emaxlevel = target.level;
	var whitelist = [target.name];
	// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

	setInterval(function() {

		if (en) {
			upgrade(emaxlevel);
		}

	}, 1000 / 20); // Loops every 30 seconds.

	function upgrade(level) {
		let num_made = character.items.reduce((ret, value) => {
			return (value != null && value.name == whitelist[0] && value.level == emaxlevel) + ret;
		}, 0)
		let item = character.items.find((item) => {
			return item != null && item.name == whitelist[0] && item.level < emaxlevel;
		})
		if (item != null && !character.q.upgrade) {
			let c = item
			if (character.gold > gold_limit && num_made < quantity) {
				if (c && whitelist.includes(c.name) && c.level < level) {
					let grades = get_grade(c);
					let scrollname;
					if (c.level < grades[0])
						scrollname = 'scroll0';
					else if (c.level < grades[1])
						scrollname = 'scroll1';
					else
						scrollname = 'scroll2';

					let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
					if (!scroll) {
						parent.buy(scrollname);
						return;
					}

					parent.socket.emit('upgrade', {
						item_num: character.items.indexOf(c),
						scroll_num: scroll_slot,
						offering_num: null,
						clevel: c.level
					});
					return;
				}
			}
		} else if (num_made < quantity) {
			// buy(whitelist[0])
		}
	}

	function get_grade(item) {
		return parent.G.items[item.name].grades;
	}

	// Returns the item slot and the item given the slot to start from and a filter.
	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})("naaaaaaani", 5, 0, 19);
(function(name, level, gold_limit, quantity) {
	let target = {
		name: name,
		level: level
	};
	// Only items in the whitelists will be upgraded, items not in the list or above the required level are ignored.
	//Courtesy of: Mark

	var en = true; //Enable Upgrading of items = true, Disable Upgrading of items = false
	var emaxlevel = target.level;
	var whitelist = [target.name];
	// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

	setInterval(function() {

		if (en) {
			upgrade(emaxlevel);
		}

	}, 1000 / 20); // Loops every 30 seconds.

	function upgrade(level) {
		let num_made = character.items.reduce((ret, value) => {
			return (value != null && value.name == whitelist[0] && value.level == emaxlevel) + ret;
		}, 0)
		let item = character.items.find((item) => {
			return item != null && item.name == whitelist[0] && item.level < emaxlevel;
		})
		if (item != null &&  !character.q.upgrade) {
			let c = item
			if (character.gold > gold_limit && num_made < quantity) {
				if (c && whitelist.includes(c.name) && c.level < level) {
					let grades = get_grade(c);
					let scrollname;
					if (c.level < grades[0])
						scrollname = 'scroll0';
					else if (c.level < grades[1])
						scrollname = 'scroll1';
					else
						scrollname = 'scroll2';

					let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
					if (!scroll) {
						parent.buy(scrollname);
						return;
					}

					parent.socket.emit('upgrade', {
						item_num: character.items.indexOf(c),
						scroll_num: scroll_slot,
						offering_num: null,
						clevel: c.level
					});
					return;
				}
			}
		} else if (num_made < quantity) {
			// buy(whitelist[0])
		}
	}

	function get_grade(item) {
		return parent.G.items[item.name].grades;
	}

	// Returns the item slot and the item given the slot to start from and a filter.
	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})("neni?", 5, 0, 19);
(function(name, level, gold_limit, quantity) {
	let target = {
		name: name,
		level: level
	};
	// Only items in the whitelists will be upgraded, items not in the list or above the required level are ignored.
	//Courtesy of: Mark

	var en = true; //Enable Upgrading of items = true, Disable Upgrading of items = false
	var emaxlevel = target.level;
	var whitelist = [target.name];
	// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

	setInterval(function() {

		if (en) {
			upgrade(emaxlevel);
		}

	}, 1000 / 20); // Loops every 30 seconds.

	function upgrade(level) {
		let num_made = character.items.reduce((ret, value) => {
			return (value != null && value.name == whitelist[0] && value.level == emaxlevel) + ret;
		}, 0)
		let item = character.items.find((item) => {
			return item != null && item.name == whitelist[0] && item.level < emaxlevel;
		})
		if (item != null && !character.q.upgrade) {
			let c = item
			if (character.gold > gold_limit && num_made < quantity) {
				if (c && whitelist.includes(c.name) && c.level < level) {
					let grades = get_grade(c);
					let scrollname;
					if (c.level < grades[0])
						scrollname = 'scroll0';
					else if (c.level < grades[1])
						scrollname = 'scroll1';
					else
						scrollname = 'scroll2';

					let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
					if (!scroll) {
						parent.buy(scrollname);
						return;
					}

					parent.socket.emit('upgrade', {
						item_num: character.items.indexOf(c),
						scroll_num: scroll_slot,
						offering_num: null,
						clevel: c.level
					});
					return;
				}
			}
		} else if (num_made < quantity) {
			// buy(whitelist[0])
		}
	}

	function get_grade(item) {
		return parent.G.items[item.name].grades;
	}

	// Returns the item slot and the item given the slot to start from and a filter.
	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item))
				return [i, character.items[i]];
		}

		return [-1, null];
	}
})("nani", 5, 0, 19);
// */
// /*
var stack = 1;

var deposit_bank_0_whitelist = {
	dexamulet: 1,
	intamulet: 1,
	dexearring: 1,
	dexring: 1
};
var deposit_bank_1_whitelist = {
	mistletoe: 1,
	candycane: 1,
	funtoken: 1,
	intring: 1,
	strring: 1,
	vitscroll: 10,
	candy0v3: 1,
	candy1v3: 1,
	ornament: 1,
	essenceoffrost: 1,
	offering: 1,
	gem0: 1,
	feather: 2,
	redenvelopev2: 1
};
var deposit_bank_2_whitelist = {
	lostearring:1
};
var deposit_bank_3_whitelist = {};
var deposit_bank_4_whitelist = {};
var deposit_bank_5_whitelist = {};
var deposit_bank_6_whitelist = {};
var deposit_bank_7_whitelist = {};

setInterval(function() {
	if ((!character.slots.gloves || character.slots.gloves.name != "handofmidas") && !bank && !gold) {
		// equip(get_index_of_item("handofmidas"));
	}
	// deposit_to_bank();
	if (character.gold > 2000000 && false) {
		gold = 1;
		if (character.slots.gloves && character.slots.gloves.name == "handofmidas") {
			unequip("gloves");
		}
		parent.socket.emit("merchant", {
			close: 1
		})
		if (!smart.moving) {
			game_log("gold uwu")
			if (character.map == "main") {
				use_skill("use_town")
			}
			smart_move("bank", () => {
				if (character.map == "bank") {
					if (!character.slots.gloves || character.slots.gloves.name != "handofmidas") {
						equip(get_index_of_item("handofmidas"));
					}
					setTimeout(() => {

						parent.socket.emit("bank", {
							operation: "deposit",
							amount: 1000000
						});
					}, 500)
					setTimeout(() => {
						if(character.gold < 2000000) {
							gold = 0;
							send_cm("Firenus", "teleport");
							smart_move(monster_targets[0]);
						}
					}, 1000)
				}
			})
		}
	}
}, 1000);

function deposit_to_bank() {
	let desposited = false;
	for (let i = 0; i < character.items.length; i++) {
		let c = character.items[i];

		if (c && true) {
			if (!bank && character.map != "bank" &&
				 character.items.some((item) => {
				return item && (item.v) && (item.name in deposit_bank_1_whitelist || item.name in deposit_bank_0_whitelist) && (item.q >= deposit_bank_1_whitelist[item.name] || item.level >= deposit_bank_0_whitelist[item.name])
			})) {
				bank = 1
				if (!bank) {

					parent.socket.emit("merchant", {
						close: 1
					})
					if (character.map == "main") {
						use_skill("use_town")
					}

					if (character.slots.gloves && character.slots.gloves.name == "handofmidas") {
						unequip("gloves");
					}
					smart_move("bank", deposit_to_bank);
				}
				return;
			}
			if (character.items.some((item) => {
				return item && (item.v || true) && (item.name in deposit_bank_1_whitelist || item.name in deposit_bank_0_whitelist) && (item.q >= deposit_bank_1_whitelist[item.name] || item.level >= deposit_bank_1_whitelist[item.name] || item.level >= deposit_bank_0_whitelist[item.name])
			})) {
				bank = 1
				if (character.map == "bank") {
					desposited = true;
				}
			}

			var bank_0_level = Object.keys(deposit_bank_0_whitelist).includes(c.name) ? deposit_bank_0_whitelist[c.name] : null;
			var bank_1_level = Object.keys(deposit_bank_1_whitelist).includes(c.name) ? deposit_bank_1_whitelist[c.name] : null;
			var bank_2_level = Object.keys(deposit_bank_2_whitelist).includes(c.name) ? deposit_bank_2_whitelist[c.name] : null;
			var bank_3_level = Object.keys(deposit_bank_3_whitelist).includes(c.name) ? deposit_bank_3_whitelist[c.name] : null;
			var bank_4_level = Object.keys(deposit_bank_4_whitelist).includes(c.name) ? deposit_bank_4_whitelist[c.name] : null;
			var bank_5_level = Object.keys(deposit_bank_5_whitelist).includes(c.name) ? deposit_bank_5_whitelist[c.name] : null;
			var bank_6_level = Object.keys(deposit_bank_6_whitelist).includes(c.name) ? deposit_bank_6_whitelist[c.name] : null;
			var bank_7_level = Object.keys(deposit_bank_7_whitelist).includes(c.name) ? deposit_bank_7_whitelist[c.name] : null;

			if (bank_0_level != null && (c.level === bank_0_level || c.q >= bank_0_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items0"
				});
			}

			if (bank_1_level != null && (c.level === bank_1_level || c.q >= bank_1_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items1"
				});
			}

			if (bank_2_level != null && (c.level === bank_2_level || c.q >= bank_2_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items2"
				});
			}

			if (bank_3_level != null && (c.level === bank_3_level || c.q >= bank_3_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items3"
				});
			}

			if (bank_4_level != null && (c.level === bank_4_level || c.q >= bank_4_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items4"
				});
			}

			if (bank_5_level != null && (c.level === bank_5_level || c.q >= bank_5_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items5"
				});
			}

			if (bank_6_level != null && (c.level === bank_6_level || c.q >= bank_6_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items6"
				});
			}

			if (bank_7_level != null && (c.level === bank_7_level || c.q >= bank_7_level)) {
				if (!smart.moving && character.map !== "bank") smart_move("bank");
				parent.socket.emit("bank", {
					operation: "swap",
					inv: i,
					str: -1,
					pack: "items7"
				});
			}

		}

	}
	if (desposited) {
		if (bank && character.gold < 2000000) {
			bank = 0;
			equip(get_index_of_item("handofmidas"))
			setTimeout(() => {  
				send_cm("Firenus", "teleport");
				smart_move(monster_targets[0]);
			}, 1000)
		}
	}
}
// */
var targeter = new Targeter([...monster_targets].reverse().reduce((ret, value) => {
	ret[value] = monster_targets.indexOf(value) + 2;
	return ret;
}, {
	/* phoenix: 1,*/
	snowman: 0
}), ["Boismon", "Firenus", "Raphiel3"], ["CrownTown", "CrownPriest", "CrownsAnal", "CrownMerch"], {
	UseGreyList: true,
	RequireLOS: true,
	DebugPVP: false,
	TagTargets: true,
	Solo: false
});

setInterval(function() {
	var targets = targeter.GetPriorityTarget(3);
	clear_drawings();
	if (targets) {
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
		get: () => {
			return [...monster_targets].reverse().reduce((ret, value) => {
				ret[value] = monster_targets.indexOf(value) + 2;
				return ret;
			}, {
				phoenix: 1,
				snowman: 1
			})
		}
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
			} else if (a.distance > b.distance) {
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
		if (this.DebugPVP || parent.is_pvp || parent.G.maps[character.in].pvp) {
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
			return true;
		}
		if (this.Solo) {
			return false;
		}

		if ([...to_party, ...group].indexOf(entity.target) > -1 && !this.Solo) {
			return true;
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
			// game_log("Adding " + entity.id + " to GreyList.");
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

			if (attackedEntity != null && event.heal == null && parent.entities[attacker] && parent.entities[attacker].type == "character") {
				if (attackedEntity.type == "character" && targeter.IsPlayerFriendly(attacked)) {
					append_log("attack_log-" + character.name, "Attacked by:" + attacker)
					targeter.RemoveFromGreyList(attacker);
					// game_log("Removing " + attacker + " from greylist for attacking " + attacked);
					to_party.forEach(player => {
						send_cm(player, {
							command: "aggro",
							name: attacker
						})
					})
				}
			}
		}
	}

	register_targetinghandler("hit", this.hitHandler);
}