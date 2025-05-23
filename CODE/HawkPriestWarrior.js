let tree = false,
  snowman = 0,
  socket = parent.socket;
socket.emit("merchant", {
  close: 1,
});
let range_multiplier = 1;
if (character.ctype == "warrior") {
  range_multiplier = 0.5;
}
const {
  Lazy,
  Adapter,
  Targeter,
  Skills: { warcry, curse, darkblessing, absorb },
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

let moving = false;
function move_to(location, callback) {
  if (can_move_to(location.x, location.y)) {
    moving = false;
    move(location.x, location.y);
  } else if (!moving) {
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
      }
    } else {
      moving = true;
      Mover.move_by_path(location, () => {
        moving = false;
      });
    }
  } else {
    if (distance_to_point(location.x, location.y) < 2) {
      moving = false;
    }
  }
}
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
      y: position.y,
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
      y: character.y,
    };
    smart_move(
      {
        x: xmas_tree.position[0],
        y: xmas_tree.position[1],
        map: "main",
      },
      function () {
        tree = false;
        if (character.ctype != "mage") {
          send_cm("Firenus", "teleport");
        } else {
          use_skill("blink", [coords.x, coords.y]);
        }
        // This executes when we reach our destination
        parent.socket.emit("interaction", {
          type: "xmas_tree",
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
  AriaHarper: ["bigbird"],
  Geoffriel: ["bigbird"],
  Rael: ["bigbird"],
  Malthael: ["bee"],
  CuteBurn: ["ent"],
  Raelina: ["bigbird"],
};
game_log("---Script Start---");
//Put monsters you want to kill in here
//If your character has no target, it will travel to a spawn of the first monster in the list below.
let monster_targets = targets[character_name],
  state = "farm",
  group = ["Geoffriel", "Rael", "Raelina"], // The group our character operates in. This generally forms a chain.
  to_party = ["Rael", "Geoffriel", "Raelina"],
  party_leader = "Rael",
  grey_list = ["Moebius"], // Characters we trust, but are willing to nullify if needed be (and are in PVP)
  chain = group.slice(0).reverse(), // How is the chain structured?
  follow = group.indexOf(character_name) != 0, // Should we be following someone?
  follow_distance = 10, // How far should we be from the person we are following?
  merchant = "AriaHarper",
  priest = "Geoffriel",
  warrior_tank = true,
  need_priest = false,
  mage = "Firenus",
  min_potions = 18000, //The number of potions at which to do a resupply run.
  target;

let mana = ["Geoffriel", "Malthael"].includes(character.name)
    ? "mpot1"
    : "mpot0",
  health = "hpot0",
  potion_types = [health, mana]; //The types of potions to keep supplied.
// /*
//The mtype of the event mob we want to kill.
let event_mob_names = ["mrpumpkin"];

//What monsters do we want to farm in between snowman spawns?
var farm_types = [];
const _accept_magiport = {
  name: mage,
};
parent.socket.on("magiport", (data) => {
  if (group.includes(data.name) || to_party.includes(data.name)) {
    parent.socket.emit("magiport", _accept_magiport);
  }
});
//Where do we want to go in between snowman spawns?
var home_location = {
  x: -471,
  y: -692,
  map: "halloween",
};

let switched = false;
//The following variables are assigned while the script is running.

//The map the event mob spawned on
const events = [];
const cachedEvents = new Map();
//Holds the event mob entity if we find it.
let wabbit = null;
let curEvent = null;

function next_event(curEvent) {
  let data = parent.socket.server_data ?? {};
  if(curEvent == null) {
    if(data.mrpumpkin?.live) {
      return {
          x: data.mrpumpkin.x ?? 0,
          y: data.mrpumpkin.y ?? 0,
          name: "mrpumpkin",
          map: data.mrpumpkin.map,
      }
    } else {
      if(data.mrgreen?.live) {
        return {
          x: data.mrgreen.x ?? 0,
          y: data.mrgreen.y ?? 0,
          name: "mrgreen",
          map: data.mrgreen.map,
        }
      }
    }
  } else {
    if(data[curEvent.name]?.live) {
      return {
          x: data[curEvent.name].x ?? 0,
          y: data[curEvent.name].y ?? 0,
          name: curEvent.name,
          map: data[curEvent.name].map,
      }
    } else {
      return next_event(null);
    }
  }
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
          map: character.map,
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
// */
let NULL_ITEM = {
  name: null,
  level: null,
};
let warping = false;
let request_luck = true;
let to_sell = new Set([
  "wshoes",
  "wattire",
  "wbreeches",
  "wgloves",
  "wcap",
  "hpbelt",
  "intring",
  "dexring",
  "strring",
  "vitring",
  "wbook0",
  "intearring",
  "dexearring",
  "vitearring",
  "strearring",
  "intbelt",
  "dexbelt",
  "strbelt",
  "quiver",
  "ringsj",
  "hpamulet",
  "intamulet",
  "dexamulet",
  "stramulet",
]);
let to_send = new Set([
  "glitch",
  "svenom",
  "gphelmet",
  "goldenegg",
  "essenceofnature",
  "greenenvelope",
  "monstertoken",
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
  "essenceoffrost",
  "candypop",
  "redenvelopev2",
  "candy0v3",
  "candy1v3",
  "gem0",
  "seashell",
  "lostearring",
  "mistletoe",
  "candycane",
  "ornament",
  "vitscroll",
  "sshield",
  "woodensword",
  "candy0",
  "candy1",
  "ascale",
  "pleather",
  "leather",
  "phelmet",
  "molesteeth",
  "gemfragment",
  "helmet",
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
    character.items.forEach((item) => {
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
if (character.name == "Geoffriel") {
  const BOOSTER_FILTER = new ItemFilter()
    .names("luckbooster", "goldbooster")
    .build();
  const MIDAS_FILTER = ItemFilter.ofName("handofmidas").build();
  const GOLD_RING_FILTER = ItemFilter.ofName("goldring").build();
  const WANDERER_GLOVE_FILTER = ItemFilter.ofName("wgloves").build();
  const LUCK_RING_FILTER = ItemFilter.ofName("ringofluck").build();
  const RESET_GEAR = () => {
    shift(character.items.findIndex(BOOSTER_FILTER), "luckbooster");
    ensure_equipped(WANDERER_GLOVE_FILTER, "gloves");
    ensure_equipped(LUCK_RING_FILTER, "ring2");
  };
  const LOOT_CHEST = (id) => {
    parent.socket.emit("open_chest", {
      id: id,
    });
  };
  RESET_GEAR();
  parent.socket.on("drop", ({ id, x, y }) => {
    if (distance_to_point(x, y) < 200) {
      let looted = false;
      let switched_midas = false;
      let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
      ensure_equipped(GOLD_RING_FILTER, "ring2");
      ensure_equipped(MIDAS_FILTER, "gloves");
      shift(index_of_booster, "goldbooster");
      setTimeout(LOOT_CHEST, 500, id);
      setTimeout(RESET_GEAR, 1000);
    }
  });
}
setInterval(() => {
  if (num_items(mana) < min_potions) {
    buy(mana, 1000);
  }
  if (num_items(health) < min_potions) {
    buy(health, 1000);
  }
  if (character.name == "Geoffriel") {
    if (!ensure_equipped("elixirluck", "elixir")) {
      buy("elixirluck");
    }
  }
  // send_cm("Geoffrey", { command: "loot", ids: ids })
  if (merchant_near()) {
    let sold = 0,
      max_send = 8;
    let items = character.items;
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      if (item != null) {
        if(to_sell.has(item.name) && (item.level ?? 0) == 0 && item.p == null) {
          sell(i);
        }
        if ((to_send.has(item.name) || item.p != null) && (item.level ?? 0) == 0) {
          send_item(merchant, i);
        }
      }
    }
    if (
      character.ctype == "warrior" &&
      num_items("pumpkinspice") >= 2 &&
      is_elixir_equiped("pumpkinspice")
    ) {
      send_item(merchant, get_index_of_item("pumpkinspice"));
    }
    if (
      character.ctype == "warrior" &&
      num_items("pumpkinspice") <= 1 &&
      !is_elixir_equiped("pumpkinspice")
    ) {
      send_cm(merchant, "yo, I need some pump");
    }
    if (
      character.ctype == "warrior" &&
      num_items("pumpkinspice") >= 2 &&
      !is_elixir_equiped("pumpkinspice")
    ) {
      equip(get_index_of_item("pumpkinspice"));
    }
    
    if (character.gold > 600000) {
      send_gold(merchant, character.gold - 500000);
    }
    if (
      character.ctype == "warrior" &&
      num_items("pumpkinspice") >= 2 &&
      is_elixir_equiped("pumpkinspice")
    ) {
      send_item(merchant, get_index_of_item("pumpkinspice"));
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
          case "blink":
            blink(data.x, data.y);
            break;
          case "magiport":
            magiport(data.name);
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
            command,
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
        y: position.y,
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
    y: entity.real_y + distance * Math.sin(angle),
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

function get_item_name(item) {
  if (item != null) {
    return item.name;
  } else {
    return null;
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
      id: id,
    });
    if (looted++ === 2) break;
  }
}

function get_first_non_null(arr) {
  return arr.find((i) => i != null) || null;
}
if (character.ctype == "warrior") {
  setInterval(() => {
    if (!get_player(priest) || get_player(priest).rip) {
      let targeted = false;
      for (let id in parent.entities) {
        let entity = parent.entities[id];
        if (parent.entities[id].target == character.name) {
          targeted = true;
        }
      }
      if (can_use("scare") && targeted) {
        game_log("well....");
        let item = character.items.findIndex((item) => {
          return item != null && item.name == "jacko";
        });
        game_log(item);
        if (item != -1) {
          equip(item);
          use_skill("scare");
          equip(item);
        }
      }
    }
  }, 1000);
} else if (character.ctype == "priest") {
  setInterval(() => {
    if (!get_player("Rael") || get_player("Rael").rip) {
      let targeted = false;
      for (let id in parent.entities) {
        let entity = parent.entities[id];
        if (parent.entities[id].target == character.name) {
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
      if (can_use("curse") && target && target.hp > character.attack) {
        curse(target);
      }
    }, 500);
  }
}, 100);
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
const needs_energized = (entity) => {
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

//This function contains our logic for when we're farming mobs
function farm(location) {
  let possible_follows = follow
    ? chain.slice(chain.indexOf(character.name) + 1).map(get_player)
    : [];
  let follow_target = get_first_non_null(possible_follows);
  if (follow_target != null) {
    // follow_entity(follow_target, follow_distance);
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
      if (healed) {
        let possible_targets = find_viable_targets() || [];
        let attack_target = (target = Array.isArray(possible_targets)
          ? possible_targets[0]
          : possible_targets);
        if (attack_target) {
          parent.socket.emit("target", { id: attack_target.id });
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
    if(character.ctype == "priest" && can_use("zapperzap")) { // we have zap
      for(let x in parent.entities) {
        if(targeter.ShouldTarget(parent.entities[x], curEvent != null)) {
          if(parent.entities[x].target == null) {
            socket.emit("skill",{name:"zapperzap",id:x});
            break;
          }
        }
      }
    }
    let possible_targets = follow
      ? possible_follows.map(get_target_of).filter((a) => {
          return a && !to_party.includes(a.name);
        })
      : find_viable_targets() || [];
    if (character.ctype == "mage") {
      possible_targets = possible_targets
        .filter((entity) => {
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
      let entity = attack_target;
      if (
        entity.s.burned &&
        ((entity.s.burned.intensity / 5) *
          (1 / 0.21) *
          (new Date() - new Date(entity.s.burned.last))) /
          100 >
          entity.hp
      ) {
        return;
      }
      let targets = null;
      if (!group.includes(attack_target.id)) {
        if (parent.distance(attack_target, character) < character.range + 10) {
          if (can_use("attack")) {
            if (character.ctype === "rogue" && can_use("invis")) {
              use_skill("invis");
            }
            if (character.ctype === "warrior") {
              if (can_use("warcry") && !character.s.warcry) {
                use_skill("warcry");
              }
            }
            if (character.ctype === "priest") {
              if (!attack_target.cooperative &&
                attack_target.target != character.name &&
                attack_target.hp > 4000
              ) {
                use_skill("absorb", attack_target.target);
              }
              if (
                can_use("darkblessing") &&
                !character.s.darkblessing &&
                character.s.warcry
              ) {
                use_skill("darkblessing");
              }
            }
            if (character.ctype === "ranger" && can_use("huntersmark")) {
              let markable = viable_targets.find((entity) => {
                return !("marked" in entity.s);
              });
              if (markable) {
                parent.socket.emit("skill", {
                  name: "huntersmark",
                  id: markable.id,
                });
              }
            }
            if (character.ctype == "mage" && can_use("cburst") && false) {
              parent.socket.emit("skill", {
                name: "cburst",
                targets: viable_targets
                  .slice(0, 2)
                  .filter((entity) => {
                    return (
                      parent.distance(entity, character) < character.range + 10
                    );
                  })
                  .map(({ id, hp }) => [id, 1]),
              });
            } else if (
              character.ctype === "ranger" &&
              true &&
              character.mp >= 300 &&
              viable_targets
                .slice(0, 5)
                .filter((entity) => {
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
                  .filter((entity) => {
                    return (
                      parent.distance(entity, character) < character.range + 10
                    );
                  })
                  .map(({ id }) => id)).length >= 5 &&
                character.level >= 75 &&
                false
              ) {
                parent.socket.emit("skill", {
                  name: "5shot",
                  ids: targets,
                });
                targets.forEach((id) => ThreeShotTargets.add(id));
              } else if (
                character.mp > 300 &&
                (targets = find_viable_targets()
                  .slice(0, 3)
                  .filter((entity) => {
                    return (
                      parent.distance(entity, character) < character.range + 10
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
                    ids: targets,
                  });
                  targets.forEach((id) => ThreeShotTargets.add(id));
                }
              }
            } else if (
              character.ctype == "priest" ||
              character.ctype == "ranger"
            ) {
              if (need_priest) {
                if (false) {
                  let warrior_char = get_player("Rael");
                  if (
                    warrior_char &&
                    !warrior_char.rip &&
                    attack_target.target === "Geoffriel" &&
                    distance_to_point(warrior_char.x, warrior_char.y) <
                      character.range
                  ) {
                    attack(attack_target);
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
        if (!tree) {
          if (
            parent.distance(attack_target, character) >
            character.range * range_multiplier
          ) {
            move_to({
              x: attack_target.real_x,
              y: attack_target.real_y,
              map: attack_target.map,
            });
            parent.socket.emit("target", { id: attack_target.id });
          }
        }
      }
    } else {
      if (!smart.moving && (curEvent != null || !follow_target)) {
        move_to(
          location ?? {
            map: "main",
            x: 1343,
            y: 248,
          }
        );
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
    s: spawn,
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
let avoidMobs = (function () {
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
    "Malthael",
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
            y: character.real_y,
          },
          {
            x: monster.real_x,
            y: monster.real_y,
            radius: monsterRange,
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
      y: circle.y + circle.radius * -Math.cos(t),
    };

    t = b + a;
    var tb = {
      x: circle.x + circle.radius * -Math.sin(t),
      y: circle.y + circle.radius * Math.cos(t),
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
  var npc = G.maps[character.map].npcs.filter((npc) => npc.id == name);

  if (npc.length > 0) {
    return npc[0];
  }

  return null;
}

//Returns the distance of the character to a point in the world.
function distance_to_point(x, y) {
  return Math.sqrt((character.real_x - x) ** 2 + (character.real_y - y) ** 2);
}

var targeter = new Targeter(monster_targets, [...to_party, ...group], {
  RequireLOS: false,
  TagTargets: character.name == "Geoffriel",
  Solo: false,
});
var targeter2 = new Targeter(monster_targets, [...to_party, ...group], {
  RequireLOS: false,
  TagTargets: character.name == "Geoffriel",
  Solo: false,
});

setInterval(function () {
  if (targets && !parent.no_graphics) {
    var targets = targeter.GetPriorityTarget(3);
    clear_drawings();
    for (var id in targets) {
      var target = targets[id];
      draw_circle(target.real_x, target.real_y, 20);
    }
  }
}, 100);

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
  if (curEvent == null) {
    return targeter.GetPriorityTarget(5) || [];
  } else {
    return targeter.GetPriorityTarget(1, false, false, true) || [];
  }
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
