setInterval(() => {
  if (character.map === "jail") {
    parent.socket.emit("leave");
  }
  parent.ping();
}, 500);
let monster_targets = ["porcupine"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const {
  Lazy,
  Adapter,
  Targeter,
  Skills: {
    hardshell,
    taunt,
    warcry,
    curse,
    darkblessing,
    absorb,
    cleave,
    zap,
  },
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
function num_items(name) {
  let total = 0;
  for (let i = 0; i < character.items.length; i++) {
    let item = character.items[i];
    if (item != null && item.name == name) {
      total += item.q ?? 1;
    }
  }
  return total;
}
let mana = "mpot1",
  health = "hpot1",
  min_potions = 9000;
setInterval(() => {
  if (num_items(mana) < min_potions) {
    buy(mana, 1000);
  }
  if (num_items(health) < min_potions) {
    buy(health, 1000);
  }
}, 1000);
function needs_mp(entity) {
  return entity.mp / entity.max_mp < 0.75;
}

function needs_hp(entity) {
  return entity.hp / entity.max_hp < 0.75;
}
async function use_mp() {
  for (let i = 0; i < character.isize; i++) {
    let item = character.items[i];
    if (item != null && item.name.startsWith("mpot1")) {
      try {
        await equip(i);
      } catch (e) {
        console.log("wth");
      }
      break;
    }
  }
}
async function use_hp() {
  for (let i = 0; i < character.isize; i++) {
    if (character.items[i]?.name?.startsWith?.("hpot1")) {
      try {
        await equip(i);
      } catch (e) {
        console.log("wth");
      }
      break;
    }
  }
}
setTimeout(async () => {
  while (true) {
    if (needs_mp(character)) {
      await use_mp();
      await sleep(2000);
    } else if (needs_hp(character)) {
      await use_hp();
      await sleep(2000);
    } else {
      await sleep(100);
    }
  }
}, 100);

parent.socket.emit("interaction", { key: "A" });
parent.socket.emit("move", { m: -1, key: ["uuddlrlrB"] });
parent.socket.emit("interaction", { key: "A" });
let NOW = performance.now();

const LOOP = async () => {
  while (true) {
    NOW = performance.now();
    await farm();
    NOW = performance.now();

    await sleep(Math.ceil(ms_until("attack", NOW)));
  }
};

setTimeout(LOOP, 100, true);

let MAINHAND_FILTER_A = null;
let OFFHAND_FILTER_A = null;
let MAINHAND_FILTER_B = null;
let OFFHAND_FILTER_B = null;
if (character.name == "Rael") {
  MAINHAND_FILTER_A = ItemFilter.ofName("glolipop").level("10", "==").build();
  OFFHAND_FILTER_A = ItemFilter.ofName("glolipop").level("11", "==").build();
  MAINHAND_FILTER_B = ItemFilter.ofName("fireblade")
    .level("10", "==")
    .property(false)
    .build();
  OFFHAND_FILTER_B = ItemFilter.ofName("fireblade")
    .level("10", "==")
    .property("firehazard")
    .build();
} else if (character.name == "Raelina") {
  MAINHAND_FILTER_A = ItemFilter.ofName("vhammer").level("8", "==").build();
  OFFHAND_FILTER_A = ItemFilter.ofName("ololipop").level("9", "==").build();

  MAINHAND_FILTER_B = ItemFilter.ofName("fireblade")
    .level("10", "==")
    .property("firehazard")
    .build();
  OFFHAND_FILTER_B = ItemFilter.ofName("fireblade")
    .level("10", "==")
    .property("firehazard")
    .build();
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
          const index = character.items.findIndex(item_filter);
          if (index == -1) {
            return false;
          }
          parent.socket.emit(
            "equip",
            EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
          );
          let temp = character.items[index];
          character.items[index] = character.slots[slot];
          character.slots[slot] = temp;
        }
      case "string":
        if (character.slots[slot]?.name != item_filter) {
          const index = character.items.findIndex((item) => (item != null && item.name == item_filter));
          if (index == -1) {
            return false;
          }
          parent.socket.emit(
            "equip",
            EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
          );
          let temp = character.items[index];
          character.items[index] = character.slots[slot];
          character.slots[slot] = temp;
        }
    }

    return true;
  };
})();
var targeter = new Targeter(monster_targets, [character.name], {
  RequireLOS: false,
  TagTargets: true,
  Solo: false,
});

function find_viable_target() {
  return targeter.GetPriorityTarget(
    1,
    false,
    /* ignore_fire */ false,
    false,
    false,
    false
  )[0]; // [0];
}
function find_next_viable_target() {
  return targeter.NextNotTargeting(1, false)[0];
}
setInterval(() => {
  loot();
}, 1000);
async function farm() {
  let attack_target = find_viable_target();

  if (attack_target != null) {
    if (distance(attack_target, character) < 120) {
      let OLD = attack_target.target;
      attack_target.target = character.name;
      let next_target = find_next_viable_target();
      attack_target.target = OLD;
      if (next_target != null) {
        let move_point = {
          real_x: (next_target.real_x + attack_target.real_x) / 2,
          real_y: (next_target.real_y + attack_target.real_y) / 2,
          base: character.base,
        };
        if (
          distance(move_point, attack_target) < 120 &&
          !character.moving &&
          character.cc < 150
        ) {
          move(move_point.real_x, move_point.real_y);
        }
      }
      if (character.slots.mainhand.name != "fireblade") {
        ensure_equipped(MAINHAND_FILTER_B, "mainhand");
        ensure_equipped(OFFHAND_FILTER_B, "offhand");
      }
      try {
        let r = Promise.race([
          attack(attack_target, true),
          sleep(character.ping * 4),
        ]);
        ensure_equipped(MAINHAND_FILTER_A, "mainhand");
        ensure_equipped(OFFHAND_FILTER_A, "offhand");
        r = await r;
        if (r != undefined) {
          reduce_cooldown("attack", character.ping ?? 0);
        } else {
          console.log("Attack promise seems to have been dropped");
          parent.resolve_deferred("attack", undefined);
        }
      } catch (e) {
        switch (e.reason) {
          case "too_far":
            console.log("Too far... ", JSON.stringify(e));
            await sleep(10);
            break;
          case "cooldown":
            await sleep(e.ms);
            return;
          case "not_there":
            await sleep(10);
            return;
          default:
            console.log(e);
            await sleep(10);
            break;
        }
      }
    } else {
      move(attack_target.x, attack_target.y);
      await sleep(100);
    }
  } else {
    await sleep(10);
  }
}
