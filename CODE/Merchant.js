game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
// However, this is a merchant. They will not be using attack at all.
setInterval(buy_potions, 10000)
game_log(character.items)
let monster_targets = ["mvampire", "bat"],
	state = "farm",

	group = ["Raphiel3", "Firenus", "Boismon", "Geoffrey", "Daedulaus", "Frewyn", "Juna", "Magiest"],
	chain = [...group].reverse(),
	follow = group.indexOf(character.name) != 0,
	follow_distance = 30,
	party_leader = "Juliette"
	min_potions = 1000,
	purchase_amount = 50,
	mana = "mpot0",
	health = "hpot0",
	potion_types = [health, mana], //The types of potions to keep supplied.
	NULL_ITEM = { name: null, level: null },
	request_luck = true,
	to_sell = ["ringsj", "hpbelt", "hpamulet", "vitscroll", "vitearring", "strearring", "strring", "vitring"],
	to_send = ["seashell", "gem0", "gem1", "wbook0", "intbelt", "strbelt", "dexbelt"];

function on_game_event(event) {
	if (event.name == "snowman") {
		let old_monster_targets = monster_targets;
		monster_targets = ["snowman"];
		smart_move({ to: "arcticbee" });
		setTimeout(() => {
			monster_targets = old_monster_targets;
		}, 1000000)
	} else if (event.name == "goldenbat") {
		let old_monster_targets = monster_targets;
		monster_targets = ["goldenbat"];
		smart_move({ to: "bat" });
		setTimeout(() => {
			monster_targets = old_monster_targets;
		}, 1000000)
	}
}
// /*
setInterval(function () {
	if (character.name == party_leader) {
		for (let i = 1; i < group.length; i++) {
			let name = group[i];
			send_party_invite(name);
		}
	} else {
		if (character.party) {
			if (character.party != party_leader) {
				parent.socket.emit("party", { event: "leave" })
			}
		} else {
			send_party_request(party_leader);
		}
	}
}, 1000 * 10);
// */
function on_cm(name, data) {
	if (group.includes(name)) {
		if (typeof data == "object") {
			switch (data.command) {
				case "loot":
					if (data.id) {
						parent.socket.emit("open_chest", { id: data.id });
					} else {
						loot()
					}
					break;
			}
		} else {
			if (data == "shutdown") {
				parent.shutdown()
			} else if (data == "yo, I need some luck") {
				let player = get_player(name);
				if (player != null) {
					send_item(name, character.items.map((item) => (item || {}).name).indexOf("elixirluck"), 1)
					if (can_use("mluck") && distance_to_point(player.real_x, player.real_y) < G.skills.mluck.range) {
						use_skill("mluck", player)
					}
				}
			} else if (data == "yo, I need some gold") {
				send_gold(name, 20000)
			} else if (data == "yo, I need some MP" && get_player(name)) {
				if (num_items(mana) > 0) {
					send_item(name, get_index_of_item(mana), 500)
				} else {
					buy(mana, purchase_amount)
				}
			} else if (data == "yo, I need some HP" && get_player(name)) {
				if (num_items(health) > 0) {
					send_item(name, get_index_of_item(health), 50)
				} else {
					buy(health, purchase_amount)
				}
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
character.items.forEach((item, index) => {
	if (item != null) {
		if (item.name == "shoes" || item.name == "pants") {
			if (item.level == 1) {
				sell(index)
			}
		}
	}
})
function pointOnAngle(entity, angle, distance) {
	var circX = entity.real_x + (distance * Math.cos(angle));
	var circY = entity.real_y + (distance * Math.sin(angle));

	return { x: circX, y: circY };
}
//Movement And Attacking
setInterval(function () {

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
		return item.name
	} else {
		return null;
	}
}

setInterval(function () {
	to_sell.forEach(sell_all_of);
}, 500)

function sell_all_of(name) {
	character.items.forEach(item => {
		if (item != null && item.name == name) {
			sell(character.items.indexOf(item), 1);
		}
	})
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
setInterval(function () {
	if(character.items[4].name == "wbook0" && character.items[4].level == 4) {
		send_item("Firenus", 4);
		send_item("Firenus", 3);
	}
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

	//Do we need potions?
	for (type_id in potion_types) {
		var type = potion_types[type_id];

		var num_potions = num_items(type);

		if (num_potions < min_potions) {
			new_state = "resupply_potions";
			break;
		}
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
	if (follow_target) {
		follow_entity(follow_target, follow_distance);
	}
	let team = chain.map(get_player)
	if (character.ctype == "merchant") {
		let to_luck = team.filter((char) => {
			return char != null && char.name != character.name && (!char.s.mluck || char.s.mluck.f != character.name)
		})
		to_luck.forEach((luck_target) => {
			if (can_use("mluck") && distance_to_point(luck_target.x, luck_target.y) < G.skills.mluck.range) {
				use_skill("mluck", luck_target)
			}
		})
	}
	if (character.ctype == "priest") {
		let to_heal = team.filter((char) => {
			return char != null && char.max_hp - char.hp > 200;
		});
		to_heal.forEach((heal_target) => {
			if (can_heal(heal_target) && character.ctype == "priest") {
				game_log(`Healed ${heal_target.name}`)
				heal(heal_target);
			}
		})
		let to_revive = team.filter((char) => {
			return char != null && char.rip && !char.c.revival
		})
		to_revive.forEach((revive_target) => {
			if (revive_target.hp === revive_target.max_hp && character.ctype == "priest") {
				use_skill("revive", revive_target);
			} else if (character.ctype == "priest") {
				heal(revive_target);
			}
		})
	}
	if (character.ctype == "mage") {
		let to_energize = [...team].reverse().filter((char) => {
			return char != null && character.ctype == "mage" && char.name != character.name && char.mp < char.max_mp / 2;
		})
		to_energize.forEach((energize_target) => {
			if (can_use("energize") && distance_to_point(energize_target.real_x, energize_target.real_y) < G.skills.energize.range) {
				use_skill('energize', energize_target)
			}
		});
	}
	if (!smart.moving && !follow_target && !character.rip) {
		smart_move({ to: monster_targets[0] });
	}
}

//This function contains our logic during resupply runs
function resupply_potions() {
	buy_potions();
}

function get_door(door) {
	return G.maps[character.map].doors.filter(([a, b, c, d, name]) => {
		return name == door;
	})[0];
}

function transport(map, spawn) {
	parent.socket.emit("transport", { to: map, s: spawn });
}

//Buys potions until the amount of each potion_type we defined in the start of the script is above the min_potions value.
function buy_potions() {
	if (empty_slots() > 0) {
		for (type_id in potion_types) {
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
	var item_count = character.items.filter(item => item != null && item.name == name).reduce(function (a, b) {
		return a + (b["q"] || 1);
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
	monsters.sort(function (current, next) {
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
(function () {
	// Auto Compounding
	// Courtesy of: Mark
	// HIGH GRADE ITEMS ONLY
	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['lostearring'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 1;
	//compound settings

	setInterval(function () {

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

		for (var c of to_compound.values()) {
			let scroll_name = use_better_scrolls && c[0] > 0 ? 'cscroll2' : 'cscroll1';

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
(function () {
	// Auto Compounding
	// Courtesy of: Mark

	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['wbook0', 'intearring', 'dexearring', 'dexamulet', 'intamulet', 'dexbelt', 'intbelt', 'intring', 'dexring'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 3;
	//compound settings

	setInterval(function () {

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

		for (var c of to_compound.values()) {
			let scroll_name = use_better_scrolls && c[0] > 1 ? 'cscroll1' : 'cscroll0';

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
let avoidMobs = (function () {
	//Extra range to add to a monsters attack range, to give a little more wiggle room to the algorithm.
	var rangeBuffer = 45;

	//How far away we want to consider monsters for
	var calcRadius = 150;

	//What types of monsters we want to try to avoid
	var avoidTypes = ["mole", "poisio", "bigbird"];

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
/*
(function (name, level, gold_limit, quantity) {
	let target = {
		name: name,
		level: level
	};
	// Only items in the whitelists will be upgraded, items not in the list or above the required level are ignored.
	//Courtesy of: Mark

	var en = true; //Enable Upgrading of items = true, Disable Upgrading of items = false
	var emaxlevel = target.level; //Max level it will stop upgrading items at if enabled
	var whitelist = [target.name]; //Add items that you want to be upgraded as they come to your inventory [always add ' ' around item and , after item]
	// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

	setInterval(function () {

		if (en) {
			upgrade(emaxlevel);
		}

	}, 1000 / 4); // Loops every 1/20 seconds.

	function upgrade(level) {
		let num_made = character.items.reduce((ret, value) => {
			return (value != null && value.name == whitelist[0] && value.level >= emaxlevel) + ret;
		}, 0)
		let item = character.items.find((item) => {
			return item != null && item.name == whitelist[0] && item.level < emaxlevel;
		})
		if (item != null) {
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
		} else {
			buy(whitelist[0])
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
})("gloves", 9, 1000000, 1);
// */