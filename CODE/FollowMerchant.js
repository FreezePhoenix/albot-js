 let tree = 0;
function happy_holidays() {
	G.maps.main.npcs.find(({id}) => id == "xmas_tree").return = true;
	// If first argument of "smart_move" includes "return"
	// You are placed back to your original point
	tree = 1;
	let xmas_tree = G.maps.main.npcs.find(({id}) => id == "xmas_tree");
	if(!smart.moving) {
	if(character.map == "main") {
		use_skill("use_town");
	}
	let coords = {x: character.x, y: character.y}
	smart_move({'return': true, x: xmas_tree.position[0], y: xmas_tree.position[1], map: "main"}, function () {
		tree = 0;
		if(character.ctype != "mage") {
			send_cm("Firenus", "teleport")
		} else {
			use_skill("blink", [coords.x, coords.y]);
		}
		// This executes when we reach our destination
		parent.socket.emit("interaction", { type: "xmas_tree" });
		say("Happy Holidays!");
	});
	}
}

game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = ["wolfie"],
	state = "farm",
	group = ["Geoffrey", "Raphiel3", "Firenus", "Boismon", "Daedulaus"], // The group our character operates in. This generally forms a chain.
	grey_list = ["Moebius"], // Characters we trust, but are willing to nullify if needed be (and are in PVP)
	chain = [...group].reverse(), // How is the chain structured?
	follow = group.indexOf(character.name) != 0, // Should we be following someone?
	follow_distance = 30, // How far should we be from the person we are following?
	merchant = "Geoffrey",
	min_potions = 3000, //The number of potions at which to do a resupply run.
	target;

let mana = "mpot1",
	health = "hpot1"
var potion_types = [health, mana]; //The types of potions to keep supplied.
/*
function on_game_event(event) {
	group = ["Raphiel3", "Firenus", "Boismon", "Geoffrey", "Daedulaus"]
	if (event.name == "snowman") {
		let old_monster_targets = monster_targets;
		monster_targets = ["snowman"];
		
		smart_move({ to: "arcticbee" }, () => {
			let interval1 = setInterval(() => {
				if (find_viable_targets().some(({ mtype }) => mtype == "snowman")) {
					clearInterval(interval1);
					let interval2 = setInterval(() => {
						if (!find_viable_targets().some(({ mtype }) => mtype == "snowman")) {
							monster_targets = old_monster_targets;
							group = ["Boismon", "Firenus", "Raphiel3", "Geoffrey", "Daedulaus"]
							clearInterval(interval2);
						}
					})
				}
			}, 1000)
		});
	} else if (event.name == "goldenbat") {
		let old_monster_targets = monster_targets;
		monster_targets = ["goldenbat"];
		smart_move({ to: "bat" }, () => {
			let interval1 = setInterval(() => {
				if (find_viable_targets().some(({ mtype }) => mtype == "goldenbat")) {
					clearInterval(interval1);
					let interval2 = setInterval(() => {
						if (!find_viable_targets().some(({ mtype }) => mtype == "goldenbat")) {
							monster_targets = old_monster_targets;
							group = ["Boismon", "Firenus", "Raphiel3", "Geoffrey", "Daedulaus"]
							clearInterval(interval2);
						}
					})
				}
			}, 1000)
		});
	}
}
// */
let NULL_ITEM = { name: null, level: null }
let warping = false
let request_luck = true;
let to_sell = new Set(["ringsj", "hpbelt", "hpamulet", "vitearring", "vitscroll", "strearring", "stramulet", "strring", "vitring"]);
let to_send = new Set(["x8", "ornament", 'candy0v3', "candy1v3", "candycane", "mistletoe", "funtoken", "seashell", "gem0", "gem1", "wbook0", "intbelt", "strbelt", "dexbelt", "intearring", "dexearring", "intamulet", "dexamulet", "intring", "dexring", "bugbountybox", "feather0"]);
/*
setInterval(() => {
	if (character.name == group[0]) {
		for (let i = 1; i < group.length; i++) {
			let name = group[i];
			send_party_invite(name);
		}
	} else {
		if (character.party) {
			if (character.party != group[0]) {
				parent.socket.emit("party", { event: "leave" })
			}
		} else {
			send_party_request(group[0]);
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
				send_item(merchant, character.items.indexOf(item), 1);
			}
		})
	}
}

function merchant_near() {
	return !!get_player(merchant)
}

setInterval(() => {
	if (merchant_near()) {
		Object.keys(parent.chests).forEach(id => {
			send_cm("Geoffrey", { command: "loot", id: id })
			setTimeout(() => {
				parent.socket.emit("open_chest", { id: id });
			}, 3000)
		});
		let sold = 0,
			max_send = 8;
		let items = character.items;
		for (let i = 0, len = items.length; i < len; i++) {
			let item = items[i]
			if (item != null) {
				if (to_sell.has(item.name) && sold < max_send && (item.level == 0 || item.level == null)) {
					send_item(merchant, i, 1)
					sold++
				}
				if (to_send.has(item.name) && sold < max_send && (item.level == 0 || item.level == null)) {
					send_item(merchant, i, 1)
					sold++;
				}
			}
		}
		if (num_items(mana) < 3000) {
			send_cm(merchant, "yo, I need some MP")
		} else if(num_items(mana) > 4000) {
			send_item(merchant, get_index_of_item(mana), 50)
		}
		if (num_items(health) < 3000) {
			send_cm(merchant, "yo, I need some HP")
		} else if(num_items(health) > 4000) {
			send_item(merchant, get_index_of_item(health), 50)
		}
		if (character.gold < 40000) {
			send_cm(merchant, "yo, I need some gold");
		} else if (character.gold > 50000) {
			send_gold(merchant, 10000)
		}
		if (num_items("elixirluck") <= 1 && !is_elixir_equiped("elixirluck") && request_luck) {
			send_cm(merchant, "yo, I need some luck")
		}
		if (num_items("elixirluck") >= 2 && !is_elixir_equiped("elixirluck")) {
			equip(get_index_of_item("elixirluck"))
		}
	}
}, 500);

function on_cm(name, data) {
	if (group.includes(name) || name == "Geoffrey") {
		if (typeof data == "object") {
			if (data.command) {
				switch (data.command) {
					case "blink":
						blink(data.x, data.y)
						break;
					case "magiport":
						magiport(c)
					case "switch_server":
						
				}
			}
		} else {
			switch (data) {
				case "shutdown":
					parent.shutdown()
					break;
				case "teleport":
					magiport(name);
					break;
				case "coords":
					const { x, y, map } = character,
						command = "blink"
					send_cm(name, { x, y, map, command });
					break;
			}
		}
	}
}

function on_party_request(name) {
	console.log("Party Request");
	if (group.indexOf(name) != -1) {
		accept_party_request(name);
	}
}
function on_party_invite(name) {
	console.log("Party Invite");
	if (group.indexOf(name) != -1) {
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
		clear_drawings();
		let avoid = avoidMobs(position);
		if (!avoid) {
			smart_move({ x: position.x, y: position.y })
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

	return { x: circX, y: circY };
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
	}
}, 100); //Execute 10 times per second

function needs_mp(entity) {
	return entity.mp / entity.max_mp < 0.75;
}

function needs_hp(entity) {
	return entity.hp / entity.max_hp < 0.75
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
	open_chests()
	if (character.rip) {
		use_skill("use_town")
	}
	if(character.map == "jail") {
		parent.socket.emit('leave')
	}
	if (!get_player("Geoffrey")) {
		loot()
	}
	//Heal With Potions if we're below 75% hp.
	if (needs_hp(character) || needs_mp(character)) {
		use_hp_or_mp();
	}
}, 500); //Execute 2 times per second

function open_chests() {
	let looted = 0;
	for (id in parent.chests) {
		send_cm(merchant, { command: "loot", id: id })
		// parent.socket.emit("open_chest",{id:id}); old version [02/07/18]
		looted++;
		if (looted == 2) break;
	}
}

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
	if(G.maps.main.npcs.find(({id}) => id == "xmas_tree") && !character.s.xmas2) {
		new_state = 'tree';
	}
	if (state != new_state) {
		state = new_state;
	}
}

setInterval(() => {
	if (can_use("curse") && target) {
		curse(target);
	}
}, 500)
let healed_ghosts = new Set();
let allow_swap = 1;
//This function contains our logic for when we're farming mobs
function farm() {
	if(character.map ==  "jail") {
		parent.socket.emit("leave")
	}
	let possible_follows = follow ? chain.slice(chain.indexOf(character.name) + 1).map(get_player) : [];
	let follow_target = get_first_non_null(possible_follows);
	if (follow_target) {
		follow_entity(follow_target, follow_distance);
	}
	let team = chain.map(get_player)
	switch (character.ctype) {
		case "priest":
			// Basic states to determine if we can heal others. Prevents high spam.
			let healed = false,
				revived = false;

			let to_heal = team.filter((char) => {
				return char != null && needs_hp(char)
			});

			let to_revive = team.filter((char) => {
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
					healed = true;
				}
			}
			break;
		case "mage":
			let energized = false;
			let to_energize = [...team].reverse().filter((char) => {
				return char != null && char.name != character.name && needs_mp(char);
			})
			for (var i = 0, len = to_energize.length; i < len && !energized; i++) {
				if (!needs_mp(character)) {
					let energize_target = to_energize[i];
					energize(energize_target);
					energized = true;
				}
			}
			break;
		case "merchant":
			let lucked = false;
			break;
	}
	if (character.ctype != "merchant") {
		clear_drawings()
		let attack_target = follow ? get_target_of(follow_target) : find_viable_targets()[0]
		//Attack or move to target
		target = attack_target;
		if (attack_target != null) {
			if (!group.includes(attack_target.id)) {
				if (distance_to_point(attack_target.real_x, attack_target.real_y) < character.range) {
					if (can_attack(attack_target)) {
						// Index of a book in your inv.
						// equip(3)
						if (character.ctype == "priest" && attack_target.mtype == "ghost" && !healed_ghosts.has(attack_target.id) && true) {
							heal(attack_target);
							healed_ghosts.add(attack_target.id)
						} else {
							if (can_attack(attack_target)) {
								let item = character.items[41]
								setTimeout(attack.bind(null, (attack_target)), 50)
								setTimeout(() => {
									let item = character.items[41]
									if (item != null && item.name == "lantern" && ["priest", "mage"].includes(character.ctype)) {
										if (character.slots.offhand.name == "wbook0" && allow_swap) {
											equip(41);
											allow_swap = false; setTimeout(() => {
												allow_swap = true;
											}, 200)
										}
									}
								}, 100);
							}
						}
					}
					if (character.mp / character.max_mp > 0.75) {
					}
				} else if (!follow_target && !tree) {
					if (can_move_to(target.x, target.y) && target.mtype != "prat") {
						move_to_target(attack_target)
					} else if (!smart.moving && target.mtype != "prat") {
						smart_move({ x: target.real_x, y: target.real_y })
					}
				}
			}
		} else {
			if (!smart.moving && !follow_target && !character.rip && !tree) {
				if(monster_targets[0] == "prat") {
					smart_move("cave", () => {

					smart_move({ x: 40, y:560, map: "level1"});
					})
				} else {
					smart_move({ to: monster_targets[0] })
				}
			}
		}

		avoidMobs({ x: character.real_x, y: character.real_y})
	}
}

function get_door(door) {
	return G.maps[character.map].doors.filter(([a, b, c, d, name]) => {
		return name == door;
	})[0];
}

function transport(map, spawn) {
	parent.socket.emit("transport", { to: map, s: spawn });
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
let avoidMobs = (function () {
	//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
	var rangeBuffer = 45;

	//How far away we want to consider monsters for
	var calcRadius = 150;

	//What types of monsters we want to try to avoid
	var avoidTypes = ["skeletor", "greenjr", "mole", "poisio", "bigbird", "crabx", "rudolph", "rat"];

	var avoidPlayers = false;//Set to false to not avoid players at all
	var playerBuffer = 30;//Additional Range around players
	var avoidPlayersWhitelist = [];//Players want to avoid differently
	var avoidPlayersWhitelistRange = 30; //Set to null here to not avoid whitelisted players
	var playerRangeOverride = 65; //Overrides how far to avoid, set to null to use player range.
	var playerAvoidIgnoreClasses = ["merchant"];//Classes we don't want to try to avoid

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
		}
		else {
			return false;
		}

	}

	function getRange(entity) {
		var monsterRange;

		if (entity.type != "character") {

			monsterRange = parent.G.monsters[entity.mtype].range + rangeBuffer;
		}
		else {
			if (avoidPlayersWhitelist.includes(entity.id) && avoidPlayersWhitelistRange != null) {
				monsterRange = avoidPlayersWhitelistRange;
			}
			else if (playerRangeOverride != null) {
				monsterRange = playerRangeOverride + playerBuffer;
			}
			else {
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

				var tangents = findTangents({ x: character.real_x, y: character.real_y }, { x: monster.real_x, y: monster.real_y, radius: monsterRange });

				//Tangents won't be found if we're within the radius
				if (!isNaN(tangents[0].x)) {
					var angle1 = angleToPoint(character, tangents[0].x, tangents[0].y);
					var angle2 = angleToPoint(character, tangents[1].x, tangents[1].y);

					if (angle1 < angle2) {
						avoidRanges.push([angle1, angle2]);
					}
					else {
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
			}
			else {
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

		var ta = { x: circle.x + (circle.radius * Math.sin(t)), y: circle.y + (circle.radius * -Math.cos(t)) };

		t = b + a;
		var tb = { x: circle.x + circle.radius * -Math.sin(t), y: circle.y + circle.radius * Math.cos(t) }



		return [ta, tb];
	}

	function offsetToPoint(x, y) {
		var angle = angleToPoint(x, y) + Math.PI / 2;

		return angle - characterAngle();

	}

	function pointOnAngle(entity, angle, distance) {
		var circX = entity.real_x + (distance * Math.cos(angle));
		var circY = entity.real_y + (distance * Math.sin(angle));

		return { x: circX, y: circY };
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
				} else if (group.includes(mob.target)) {
					return true;
				} else {
					return false;
				}
			}
		} else if (grey_list.includes(mob.id)) {
			if (is_pvp()) {
				if (group.includes(mob.target)) {
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

		if (group.includes(monster.target) ||
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
		return monster_targets.indexOf(next) - monster_targets.indexOf(current);
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