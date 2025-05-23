function num_items(name) {
	var item_count = character.items.reduce(function(a, item) {
		return a + (item != null && item.name == name ? (item.q || 1) : 0);
	}, 0);

	return item_count;
}
if (character.name == "AriaHarper") {
  const whitelist = [
    "hpamulet",
    "hpbelt",
    "ringsj",
    "wcap",
    "wshoes",
    "cclaw",
    "wattire",
    "wgloves",
    "wbreeches",
    "intamulet",
    "dexamulet",
    "stramulet",
    "quiver",
    "ecape",
    "eslippers",
    "epyjamas",
    "eears",
    "carrotsword"
  ];
  setInterval(function() {
    for (let i in character.items) {
      let item = character.items[i];
      if (item && whitelist.includes(item.name) && item.level < 1 && !item.p)
        sell(i);
    }
  }, 5000);
}
setInterval(() => {
  if (character.hp < character.max_hp - 100 && can_use("use_hp")) {
    parent.socket.emit("use", {
      item: "hp"
    });
  }
}, 100);
setInterval(() => {
  if (character.stand) {
    for (let i = 0; i < 30; i++) {
      let slot = character.slots["trade" + i];
      if (slot && slot.name.startsWith("elixir")) {
        let item = slot;
        let counta = item.q;
        let price = item.price;
        let name = item.name;
        let stack = character.items.findIndex(it => {
          return it && it.name == name;
        });
        if (stack != -1) {
          let countb = character.items[stack].q;
          unequip("trade" + i);
          let f_count = countb;
          if (!slot.b) {
            f_count += counta;
          }
          parent.socket.emit("equip", {
            q: f_count,
            slot: "trade" + i,
            num: stack,
            price: price
          });
          break;
        }
      }
    }
  }
}, 1000);
let group = ["Boismon"];
setInterval(() => {
  for (let i = 0; i < group.length; i++) {
    target = parent.entities[group[i]];
    if (target && (!target.s.mluck || target.s.mluck.f != character.name)) {
      use_skill("mluck", group[i]);
      break;
    }
  }
}, 1000);
function distance_to_point(x, y) {
  return Math.sqrt(
    Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2)
  );
}
function guard_post(location) {
  console.log(location);
  setInterval(() => {
    if (!banking) {
      if (
        can_move_to(location.x, location.y) &&
        distance_to_point(location.x, location.y) > 1 &&
        character.map == location.map
      ) {
        move(location.x, location.y);
      } else if (
        !smart.moving &&
        distance_to_point(location.x, location.y) > 1
      ) {
        smart_move(location);
      }
    }
  }, 1000);
}
guard_post({ x: -750, y: -2170, map: "desertland" });

let banking = false;
let should_bank = true;
let to_bank_gold = 10000000;
if (should_bank) {
  // Object<ItemID, [Level | Count, Pack]>
  const deposit_whitelist = {
      suckerpunch: [0, 0],
      seashell: [100, 1],
      gem0: [1, 1],
      crabclaw: [10, 1],
      greenenvelope: [1, 1],
      pvptoken: [1, 1],
      essenceoffire: [1, 1]
    },
    shiny_bank_pack = 5;
  setInterval(function() {
    let local_banking = false;
    if (character.gold > to_bank_gold) {
      local_banking = true;
    } else {
      for (let i = 0; i < 42; i++) {
        let item = character.items[i];
        if (item) {
          if (deposit_whitelist[item.name]) {
            let list_definition = deposit_whitelist[item.name];
            let G_definition = G.items[item.name];
            if (
              G_definition.upgrade ||
              G_definition.compound ||
              G_definition.scroll
            ) {
              if (item.level >= list_definition[0]) {
                local_banking = true;
                break;
              }
            } else {
              if ((item.q || 1) >= list_definition[0]) {
                local_banking = true;
                break;
              }
            }
          } else if (item.p && !item.p.chance) {
            local_banking = true;
            break;
          }
        }
      }
    }
    banking = local_banking;
    if (banking) {
      if (character.map != "bank") {
        if (!smart.moving && !character.moving) {
          smart_move("bank");
        }
      } else {
        if (character.gold > to_bank_gold) {
          parent.socket.emit("bank", {
            operation: "deposit",
            amount: character.gold - (character.gold % to_bank_gold)
          });
        }
        for (let i = 0; i < 42; i++) {
          let item = character.items[i];
          if (item) {
            if (deposit_whitelist[item.name]) {
              let list_definition = deposit_whitelist[item.name];
              let G_definition = G.items[item.name];
              if (
                G_definition.upgrade ||
                G_definition.compound ||
                G_definition.scroll
              ) {
                let bank_pack = list_definition[1];
                if (item.level >= list_definition[0]) {
                  parent.socket.emit("bank", {
                    operation: "swap",
                    inv: i,
                    str: -1,
                    pack: "items" + bank_pack
                  });
                }
              } else {
                if ((item.q || 1) >= list_definition[0]) {
                  let bank_pack = list_definition[1];
                  parent.socket.emit("bank", {
                    operation: "swap",
                    inv: i,
                    str: -1,
                    pack: "items" + bank_pack
                  });
                }
              }
            } else if (item.p && !item.p.chance) {
              parent.socket.emit("bank", {
                operation: "swap",
                inv: i,
                str: -1,
                pack: "items" + shiny_bank_pack
              });
            }
          }
        }
      }
    }
  }, 1000);
}
let luck_targets = ["Firenus", "Boismon"];
let luck_target = 0;
setInterval(() => {
  use_skill(
    "mluck",
    parent.entities[
      luck_targets[(luck_target = ++luck_target % luck_targets.length)]
    ]
  );
  parent.socket.emit("use", {
    item: "mp"
  });
}, 4000);
setInterval(() => {
  	if (num_items("elixirluck") < 3) {
		buy("elixirluck", 1)
	}
}, 1000);
function get_index_of_item(name, max_level) {
  if (!max_level) {
    return character.items.findIndex(item => {
      return item != null && item.name == name;
    });
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
parent.past_cm_handlers = parent.past_cm_handlers || [];
// const socket = parent.socket;
on_cm = function on_cm(name, data) {
	if (group.includes(name)) {
		if (typeof data == "object") {

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