function use_hp() {
    for (let i = 0; i < character.isize; i++) {
        if (character.items[i]?.name?.startsWith?.("hpot")) {
            equip(i);
            break;
        }
    }
}

function use_mp() {
    for (let i = 0; i < character.isize; i++) {
        if (character.items[i]?.name?.startsWith?.("mpot")) {
            equip(i);
            break;
        }
    }
}

let tree = 0;
let socket = parent.socket;
game_log(parent.server_addr);

var equipment_value = 0;
for (var slot in character.slots) {
  var item = character.slots[slot];

  if (item) {
    equipment_value += item_value(item);
  }
}
if (character.ctype == "rogue") {
  setInterval(() => {
    for (let i = 0; i < group.length; i++) {
      target = parent.entities[group[i]];
      if (target && !target.s.rspeed && character.level >= 40) {
        use_skill("rspeed", group[i]);
        break;
      }
    }
  }, 1000);
}
setInterval(() => {
  if(character.rip) {
use_skill("use_town")
  }
  
}, 1000)
console.log(character.name + ": " + equipment_value.toLocaleString());

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
const send_chests = false;

setInterval(() => {
  parent.ping();
}, 1000);

socket.emit("merchant", {
  close: 1
});

function handle_death() {
  setTimeout(() => {
    parent.socket.emit("respawn");
    send_cm("Firenus", "teleport");
  });
}
let snowman = 0;
/*
setInterval(() => {
  parent.emit_dracul();
  parent.switch_server(parent.server_region + " " + parent.server_identifier);
}, 60 * 1000 * 60 * 0.1);
// */
/* 
setTimeout(() => {
    if (character.ctype == "ranger") {
        parent.emit_jr();
        parent.switch_server(parent.server_region + " " + parent.server_identifier);
    }
}, 60 * 1000 * 60 * 0.5);
// */
function happy_holidays() {
  G.maps.main.npcs.find(({ id }) => id == "xmas_tree").return = true;
  // If first argument of "smart_move" includes "return"
  // You are placed back to your original point
  tree = 1;
  let xmas_tree = G.maps.main.npcs.find(({ id }) => id == "xmas_tree");
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
        tree = 0;
        if (character.ctype != "mage") {
          send_cm("Firenus", "teleport");
        } else {
          use_skill("blink", [coords.x, coords.y]);
        }
        // This executes when we reach our destination
        socket.emit("interaction", {
          type: "xmas_tree"
        });
        say("Happy Holidays!");
      }
    );
  }
}
let targets = {
  Raphiel3: ["crab"],
  Firenus: ["crab"],
  Boismon: ["crab"],
  Daedulaus: ["crab"],
  AriaHarper: ["boar"],
  Geoffriel: ["crab"],
  Raelina: ["crab"],
  Rael: ["crab"],
  Malthael: ["crab"],
  CuteBurn: ["target"],
  CuteFreeze: ["crab"]
};

game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = targets[character.name],
  state = "farm",
  group = [
    character.name,
    "Firenus",
    "Boismon",
    "Malthael",
    "AriaHarper"
  ], // The group our character operates in. This generally forms a chain.
  to_party = [
    "Firenus",
    "Boismon",
    "Malthael",
    "AriaHarper"
  ],
  mages = ["Firenus", "Malthael"],
  party_leader = "Firenus",
  grey_list = ["Moebius"], // Characters we trust, but are willing to nullify if needed be (and are in PVP)
  chain = [...group].reverse(), // How is the chain structured?
  follow = false, // Should we be following someone?
  follow_distance = 30, // How far should we be from the person we are following?
  merchant = "AriaHarper",
  min_potions = 18000, //The number of potions at which to do a resupply run.
  target;

function hr_time() {
  if (typeof process != "undefined") {
    return process.hrtime.bigint();
  } else {
    const time = parent.performance.now();
    const seconds = BigInt(~~time) * BigInt(1e6);
    return seconds;
  }
}

if (character.ctype == "mage") {
  (async function() {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    await wait(
      4500 -
        Number((hr_time() / BigInt(1e6)) % BigInt(4500)) +
        mages.indexOf(character.name) * 2250
    );
    let ranger = ["Boismon", "Daedulaus"];
    let tar = 0;
    while (true) {
      tar = 1 - tar;
      if (character.mp > 1000) {
        parent.socket.emit("skill", {
          name: "energize",
          id: ranger[tar],
          mana: 2000
        });
      }
      await wait(
        4500 -
          Number(
            (hr_time() / BigInt(1e6) + BigInt(mages.indexOf(character.name)) * BigInt(2250)) %
              BigInt(4500)
          )
      );
    }
  })();
}
let mana = "mpot1",
  health = "hpot1",
  potion_types = [health, mana]; //The types of potions to keep supplied.
// /*
//The mtype of the event mob we want to kill.
var event_mob_names = ["mrpumpkin", "mrgreen"];

//What monsters do we want to farm in between snowman spawns?
var farm_types = [];
socket.on("magiport", data => {
  if (group.includes(data.name) || to_party.includes(data.name)) {
    socket.emit("magiport", {
      name: "Firenus"
    });
  }
});

/* //Where do we want to go in between snowman spawns?
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
	// parent.ping();
	var curEvent = events.find(item => {
		return "easterluck" in character.c ? true : item.name == "wabbit" || true;
	});

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
					}
					if (target != null) {
						console.log(target);
						move_or_attack(target);
					}
				}
			}
		} else {
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
					events.push(event);
					if (false && !switched && ["jr", "greenjr"].includes(event.name)) {
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
// */

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
      smart_move({
        x: character.real_x,
        y: character.real_y
      });
      attack(target);
    }
  }
}

setTimeout(() => {
  if (false && "wabbit" in parent.S && parent.S.wabbit.live) {
    let wabbit_event = parent.S.wabbit;

    if (wabbit_event.map != "mansion") {
      events.push({
        x: wabbit_event.x,
        y: wabbit_event.y,
        map: wabbit_event.map,
        name: "wabbit"
      });
    }
  }
}, 10000);
parent.socket.on("game_event", on_game_event);
// */
let NULL_ITEM = {
  name: null,
  level: null
};
if (character.name == party_leader) {
  game_log("I'm leader!");
}
let warping = false;
let request_luck = true;
let to_sell = new Set([
  "spidersilk",
  "poison",
  "smush",
  "wshoes",
  "wbreeches",
  "wcap",
  "ringsj",
  "hpamulet",
  "intamulet",
  "dexamulet",
  "stramulet",
  "crabclaw",
  "cclaw",
  "hpbelt"
]);
let to_send = new Set([
  "candy0",
  "candy1",
  "ascale",
  "gslime",
  "slimestaff",
  "pleather",
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
  "essenceoffrost",
  "intring",
  "dexring",
  "strring",
  "candypop",
  "intbelt",
  "dexbelt",
  "strbelt",
  "suckerpunch",
  "greenenvelope",
  "redenvelopev3",
  "candy0v3",
  "candy1v3",
  "gem0",
  "seashell",
  "lostearring",
  "mistletoe",
  "candycane",
  "ornament",
  "pvptoken",
  "intearring",
  "dexearring",
  "vitearring",
  "strearring",
  "vitscroll"
]);
// /*
setInterval(() => {
  if (character.map == "jail") {
    socket.emit("leave");
  }
  if (character.name == party_leader) {
    for (let i = 1; i < to_party.length; i++) {
      let name = to_party[i];
      if (!(name in parent.party)) {
        send_party_invite(name);
      }
    }
  } else {
    if (character.party) {
      if (character.party != party_leader) {
        console.log(character.party);
        socket.emit("party", {
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
      if (item != null && item.name == name) {
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
  for (let id in parent.chests) {
    if (!looted_chests.has(id)) {
      socket.emit("open_chest", {
        id: id
      });
    }
  }
}, 100);
setInterval(() => {
  if (character.map == "jail") {
    parent.socket.emit("leave");
  }
  if (merchant_near()) {
    let sold = 0,
      max_send = 8;
    let items = character.items;
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      if (item != null) {
        if (
          to_sell.has(item.name) &&
          sold < max_send &&
          (item.level == 0 || item.level == null)
        ) {
          send_item(merchant, i, 10);
          sold++;
        }
        if (
          merchant_near() &&
          to_send.has(item.name) &&
          sold < max_send &&
          (item.level == 0 || item.level == null)
        ) {
          send_item(merchant, i, 10);
          sold++;
        }
      }
    }
    if (character.gold < 40000) {
      send_cm(merchant, "yo, I need some gold");
    } else if (character.gold > 50000) {
      send_gold(merchant, 10000);
    }
    if (character.name != "Daedulaus") {
      return;
    }
    if (num_items(mana) < min_potions) {
      // send_cm(merchant, "yo, I need some MP");
    } else if (num_items(mana) > min_potions + 1000) {
      // send_item(merchant, get_index_of_item(mana), 100);
    }
    if (num_items(health) < min_potions) {
      // send_cm(merchant, "yo, I need some HP");
    } else if (num_items(health) > min_potions + 1000) {
      // send_item(merchant, get_index_of_item(health), 100);
    }
    if (
      num_items("elixirluck") <= 1 &&
      !is_elixir_equiped("elixirluck") &&
      request_luck
    ) {
      send_cm(merchant, "yo, I need some luck");
    }
    if (num_items("elixirluck") >= 2 && !is_elixir_equiped("elixirluck")) {
      equip(get_index_of_item("elixirluck"));
    }
    if (num_items("elixirluck") >= 2 && is_elixir_equiped("elixirluck")) {
      // send_item(merchant, get_index_of_item("elixirluck"));
    }
  }
}, 2000);

parent.socket.on("cm", function(a) {
  let name = a.name;
  let data = JSON.parse(a.message);
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
            // say("Removed " + data.name + " from greylist for attacking " + name)
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
          parent.shutdown();
          break;
        case "shutdown_all":
          process.send({ command: "shutdown" });
          parent.shutdown_all();
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

socket.on("request", function({ name }) {
  console.log("Party Request");
  if (to_party.indexOf(name) != -1 && name != merchant) {
    accept_party_request(name);
  }
});

socket.on("invite", function({ name }) {
  console.log("Party Invite");
  if (to_party.indexOf(name) != -1) {
    accept_party_invite(name);
  }
});

function follow_entity(entity, distance) {
  let point = angleToPoint(entity.real_x, entity.real_y);
  var position = pointOnAngle(entity, point, distance);
  if (can_move_to(position.x, position.y)) {
    clear_drawings();
    let avoid = avoidMobs(position);
    if (!avoid) {
      move(position.x, position.y);
    }
  } else if (!smart.moving) {
    clear_drawings();
    let avoid = avoidMobs(position);
    if (!avoid) {
      smart_move({
        x: position.x,
        y: position.y
      });
    }
  }
}

function angleToPoint(x, y) {
  var deltaX = character.real_x - x;
  var deltaY = character.real_y - y;

  return Math.atan2(deltaY, deltaX);
}

function pointOnAngle(entity, angle, distance) {
  var circX = entity.real_x + distance * Math.cos(angle);
  var circY = entity.real_y + distance * Math.sin(angle);

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
}, 50); //Execute 10 times per second

function needs_mp(entity) {
  return entity.mp / entity.max_mp < 0.75;
}

function needs_hp(entity) {
  return entity.hp / entity.max_hp < 0.75;
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
    let possible_items = character.items.map(get_item_name);
    return possible_items.indexOf(name);
  } else {
    let possible_item = character.items.reduce((ret, item) => {
      if (item != null) {
        if (item.name == name) {
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

//Potions And Looting
setInterval(() => {
  // open_chests();
  if (!get_player(merchant)) {
    // loot()
  }
  //Heal With Potions if we're below 75% hp.
  if (needs_hp(character) || needs_mp(character)) {
    use_hp_or_mp();
  }
}, 500); //Execute 2 times per second

function open_chests() {
  let looted = 0;
  for (id in parent.chests) {
    parent.socket.emit("open_chest", { id: id });
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
  if (
    G.maps.main.npcs.find(({ id }) => id == "xmas_tree") &&
    !character.s.xmas2
  ) {
    new_state = "tree";
  }
  // if (events.length != 0) {
  // 	new_state = "event";
  // }
  if (state != new_state) {
    state = new_state;
  }
}
let ThreeShotTargets = [];
if (character.ctype == "priest") {
  setInterval(() => {
    if (can_use("curse") && target && target.hp > character.attack) {
      curse(target);
    }
  }, 500);
}

game.on("attack", (data, event_name) => {
  if (data.kill == true && data.id == wabbit) {
    wabbit = null;
    events = events.filter(({ name }) => name != "wabbit");
  }
  if (data.actor == character.name) {
    if (data.source == "3shot") {
      if (ThreeShotTargets.includes(data.target)) {
        game_log("Reducing Cooldown: 3shot");
        ThreeShotTargets.splice(0, 100);
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
//This function contains our logic for when we're farming mobs
function farm() {
  let team = to_party.map(get_player);
  switch (character.ctype) {
    case "priest":
      // Basic states to determine if we can heal others. Prevents high spam.
      let healed = false,
        revived = false;

      let to_heal = [get_player("Boismon"), ...team].filter(char => {
        return char != null && needs_hp(char);
      });

      let to_revive = [get_player("Boismon"), ...team].filter(char => {
        return char != null && char.rip && !char.c.revival;
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
      break;
      let energized = false;
      let to_energize = [...team]
        .reverse()
        .filter(char => {
          return (
            char != null &&
            char.name != character.name &&
            char.mp / char.max_mp < 500 / char.max_mp
          );
        })
        .sort((a, b) => {
          return a.mp / a.max_mp - b.mp / b.max_mp;
        });
      for (let i = 0, len = to_energize.length; i < len && !energized; i++) {
        if (!needs_mp(character)) {
          let energize_target = to_energize[i];
          if (to_energize[i]) {
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
  if (character.ctype == "warrior" && can_use("warcry") && true) {
    socket.emit("skill", {
      name: "warcry"
    });
  }
  if (character.ctype == "warrior" && can_use("charge") && true) {
    socket.emit("skill", {
      name: "charge"
    });
  }
  if (character.ctype != "merchant") {
    clear_drawings();
    let possible_targets = find_viable_targets() || [];
    let attack_target = possible_targets[0];
    //Attack or move to target
    target = attack_target;
    const viable_targets = find_viable_targets();
    if (attack_target != null) {
      let targets;
      if (!group.includes(attack_target.id)) {
        if (
          parent.distance(attack_target, character) <
          character.range + character.xrange - 20
        ) {
          if (can_attack(attack_target)) {
            // Index of a book in your inv.
            // equip(3)
            if (character.ctype == "rogue" && can_use("invis")) {
              use_skill("invis");
            }
            if (
              character.ctype == "rogue" &&
              can_use("quickstab") &&
              distance_to_point(target.real_x, target.real_y) < character.range
            ) {
              // use_skill("quickstab", target)
            }
            if (
              character.ctype == "rogue" &&
              can_use("mentalburst") &&
              distance_to_point(target.real_x, target.real_y) <
                character.range + 32 + 10 + character.xrange
            ) {
              // use_skill("mentalburst", target)
            }
            if (
              character.ctype == "priest" &&
              attack_target.mtype == "ghost" &&
              !healed_ghosts.has(attack_target.id) &&
              true
            ) {
              heal(attack_target);
              healed_ghosts.add(attack_target.id);
            } else {
              if (character.ctype == "warrior" && can_use("agitate") && false) {
                socket.emit("skill", {
                  name: "agitate"
                });
              }
              if (
                false &&
                character.ctype == "ranger" &&
                can_use("huntersmark")
              ) {
                let markable = viable_targets.filter(entity => {
                  return !("marked" in entity.s);
                });
                if (markable[0]) {
                  socket.emit("skill", {
                    name: "huntersmark",
                    id: markable[0].id
                  });
                }
              }
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
                  .map(({ id }) => id)).length >= 4 &&
                character.level >= 75 &&
                character.mp > 420
              ) {
                socket.emit("skill", {
                  name: "5shot",
                  ids: targets
                });
                ThreeShotTargets = targets;
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
                socket.emit("skill", {
                  name: "3shot",
                  ids: targets
                });
                ThreeShotTargets = targets;
              } else {
                attack(attack_target);
              }
            }
          }
        } else {
          if (character.mp / character.max_mp > 0.75) {
            if (
              attack_target.type == "character" ||
              attack_target.mtype == "prat"
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
          if (can_move_to(target.x, target.y) && false) {
            move_to_target(attack_target);
          } else if (!smart.moving && false) {
            smart_move({
              x: target.real_x,
              y: target.real_y
            });
          }
        }
      }
    } else {
      if (!smart.moving && !character.rip && !tree && false) {
        if (monster_targets[0] == "cgoo") {
          smart_move("arena");
        } else {
          smart_move({
            to: monster_targets[0]
          });
        }
      }
    }
  }
}

function guard_post(location) {
  setInterval(() => {
    if (
      can_move_to(location.x, location.y) &&
      distance_to_point(location.x, location.y) > 1 &&
      character.map == location.map
    ) {
      move(location.x, location.y);
    } else if (!smart.moving && distance_to_point(location.x, location.y) > 1) {
      smart_move(location);
    }
  }, 1000);
}
switch (character.name) {
  case "Boismon":
    guard_post({ x: -1202, y: -136, map: "main" });
    break;
  case "Firenus":
    guard_post({ x: -1202, y: -66, map: "main" });
    break;
  case "Daedulaus":
    guard_post({ x: -1202, y: 4, map: "main" });
    break;
}

//Returns the number of items in your inventory for a given item name;
function num_items(name) {
    let count = 0;
    let i = character.items.length;
    while(i --> 0) {
        let item = character.items[i];
        item && item.name == name && (count += (item.q || 1));
    }
    return count;
}


//Returns how many inventory slots have not yet been filled.
function empty_slots() {
  return character.items.reduce((a, b) => a + (b ? 0 : 1), 0);
}
//Gets an NPC by name from the current map.
function get_npc(name) {
  return parent.G.maps[character.map].npcs.find(npc => npc.id == name);
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
  return Math.sqrt(
    Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2)
  );
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
var targeter = new Targeter(
  [...monster_targets].reverse().reduce(
    (ret, value) => {
      ret[value] = monster_targets.indexOf(value) + 2;
      return ret;
    },
    {
      a1: 0
    }
  ),
  ["Boismon", "Firenus", "Raphiel3"],
  ["Maela"],
  {
    UseGreyList: true,
    RequireLOS: false,
    DebugPVP: false,
    TagTargets: true,
    Solo: false
  }
);

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
      return [...monster_targets].reverse().reduce(
        (ret, value) => {
          ret[value] = monster_targets.indexOf(value) + 2;
          return ret;
        },
        {
          pinkgoo: 1,
          // mvampire: 1,
          a1: 0
        }
      );
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
    let isPVP = this.IsPVP();
    for (let id in parent.entities) {
      let entity = parent.entities[id];

      if (isPVP && entity.type == "character" && !entity.npc && !entity.rip) {
        if (this.GreyList[entity.id] === undefined) {
          this.GreyListPlayer(entity);
        }

        if (!this.IsPlayerSafe(entity)) {
          let targetArgs = {
            priority: 0,
            distance: parent.distance(character, entity),
            entity: entity
          };
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
            if (
              this.TargetingPriority[entity.mtype] != null ||
              this.IsTargetingParty(entity)
            ) {
              if (
                !this.RequireLOS ||
                can_move_to(entity.real_x, entity.real_y)
              ) {
                let mode = "Dual";
                let other_ranger = character.name == "Boismon" ? "Daedulaus" : "Boismon";
                if(mode == "Dual") {
                if (
                  monster_targets[0] == "crab" &&
                  get_player(other_ranger)
                ) {
                  if (
                    parent.distance(get_player(other_ranger), entity) <
                    parent.distance(character, entity)
                  ) {
                    continue;
                  }
                }
                } else if(mode == "Single") {
                  if(character.ctype == "mage") {
                    if(parent.distance(get_player(other_ranger), entity) < get_player(other_ranger).range) {
                      continue;
                    }
                  }
                }
                let targetArgs = {
                  priority: this.TargetingPriority[entity.mtype],
                  targeting: this.IsTargetingParty(entity),
                  distance: parent.distance(character, entity),
                  entity
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
    	Returns if the player is currently in a PvP environment.
    */
  this.IsPVP = function() {
    if (this.DebugPVP || parent.is_pvp || parent.G.maps[character.in].pvp) {
      return true;
    } else {
      return false;
    }
  };

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

    if (
      (to_party.includes(entity.target) || group.includes(entity.target)) &&
      !this.Solo
    ) {
      if (can_attack(entity)) {
        return 0.5;
      } else {
        return 0;
      }
    }

    return false;
  };

  /*
    	Returns if, according to our configuration, a player should be attacked or not.
    */
  this.IsPlayerSafe = function(entity) {
    if (to_party.includes(entity.id) || group.includes(entity.id)) {
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

    if (to_party.includes(name) || group.includes(name)) {
      return true;
    }

    return false;
  };

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

      if (attackedEntity != null && event.heal == null && attackingEntity) {
        if (
          attackedEntity.type == "character" &&
          parent.entities[attacker].type == "character" &&
          targeter.IsPlayerFriendly(attacked)
        ) {
          // append_log("attack_log-" + character.name, "Attacked by:" + attacker)
          targeter.RemoveFromGreyList(attacker);
          // game_log("Removing " + attacker + " from greylist for attacking " + attacked);
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

  // register_targetinghandler("hit", this.hitHandler);
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
  var monsters = Object.values(parent.entities).filter(mob => {
    if (group.includes(mob.id)) {
      return false;
    } else if (mob.type == "monster" || is_pvp()) {
      if (mob.mtype == "snowman") {
        return true;
      } else {
        if (mob.target == null) {
          if (monster_targets.includes(mob.mtype)) {
            return true;
          } else {
            return false;
          }
        } else if (
          to_party.includes(mob.target) ||
          mob.target == character.name
        ) {
          mob.targeting_party = 1;
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

    if (to_party.includes(monster.target) || monster.target == character.name) {
      monster.targeting_party = 1;
    } else {
      monster.targeting_party = 0;
    }
  }

  //Order monsters by whether they're attacking us, then by distance.
  monsters
    .sort((current, next) => {
      var dist_current = distance(character, current);
      var dist_next = distance(character, next);
      // Else go to the 2nd item
      return dist_current - dist_next;
    })
    .sort((current, next) => {
      return (next.level || 1) - (current.level || 1);
    })
    .sort((current, next) => {
      return (
        monster_targets.indexOf(next.mtype) -
        monster_targets.indexOf(current.mtype)
      );
    })
    .sort((current, next) => {
      return is_player(next) < is_player(current);
    })
    .sort((current, next) => {
      if (current.targeting_party > next.targeting_party) {
        return -1;
      }
      return 0;
    });
  return monsters;
}

function energize(target) {
  if (character.ctype == "mage" && can_use("energize")) {
    parent.socket.emit("skill", {
      name: "energize",
      id: target.id,
      mana: 2000
    });
    return true;
  } else {
    return false;
  }
}
const blink = (function() {
  const OBJ = { name: "blink" };
  function blink(x, y) {
    OBJ.x = x;
    OBJ.y = y;
    socket.emit("skill", OBJ);
  }
  return blink;
})();

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

const three_shot = (function() {
  const OBJ = { name: "3shot" };
  function three_shot(targets) {
    OBJ.ids = targets;
    parent.socket.emit("skill", OBJ);
  }
  return three_shot;
})();

function curse(target) {
  if (character.ctype == "priest" && can_use("curse")) {
    use_skill("curse", target);
    return true;
  } else {
    return false;
  }
}
