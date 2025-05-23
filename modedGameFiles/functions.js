var auto_api_methods = [],
  base_url = "http://adventure.land",
  sounds = {},
  last_xid_sent = null,
  last_id_sent = null,
  draw_timeouts = [],
  timers = {},
  ping_sent = performance.now(),
  modal_count = 0;

function is_hidden() {
  return false;
}

function push_ping(a) {
  return;
  pings.push(a);
  40 < pings.length && pings.shift();
  character &&
    ((character.ping = 0),
    pings.forEach(function (b) {
      character.ping += b / pings.length;
    }));
}

function restore_dimensions(sprite) {}
last_id_sent = "";

function trade_sell(a, b, c, d) {
  socket.emit("trade_sell", {
    slot: a,
    id: b,
    rid: c,
    q: d || 1,
  });
  $("#topleftcornerdialog").html("");
}

function send_target_logic(a, b) {
  if (a || b) {
    (ctarget = a), (xtarget = b);
  }
  a = false;
  ctarget && last_id_sent != (ctarget.id || "") && (a = true);
  !ctarget && last_id_sent && (a = true);
  xtarget && last_xid_sent != (xtarget.id || "") && (a = true);
  !xtarget && last_xid_sent && (a = true);
  last_id_sent = (ctarget && ctarget.id) || "";
  last_xid_sent = (xtarget && xtarget.id) || "";
  a &&
    socket.emit("target", {
      id: last_id_sent,
      xid: last_xid_sent,
    });
}

function is_npc(a) {
  if (a && (a.npc || "npc" == a.type)) {
    return true;
  }
}

function is_monster(a) {
  if (a && "monster" == a.type) {
    return true;
  }
}

function is_player(a) {
  if (a && "character" == a.type && !a.npc) {
    return true;
  }
}

function is_character(a) {
  return is_player(a);
}

function cfocus(a) {
  var b = $(a);
  $(a + ":focus").length || b.focus();
  b.html(b.html());
}

function ping() {
  socket.emit("ping_trig", {
    stamp: performance.now(),
  });
}

function reset_ms_check(a, b, c) {
  a["ms_" + b] = null;
}

function ms_check(a, b, c) {
  if (!a["ms_" + b]) {
    return (a["ms_" + b] = performance.now()), 0;
  }
  if (a["ms_" + b] && mssince(a["ms_" + b]) < c) {
    return 0;
  }
  a["ms_" + b] = performance.now();
  return true;
}

function cached(a, b, c, d) {
  window.GCACHED || (window.GCACHED = {});
  c && (b += "|_" + c);
  d && (b += "|_" + d);
  if (GCACHED[a] == b) {
    return true;
  }
  GCACHED[a] = b;
  return false;
}

function fade_out_blink(a, b) {
  return function () {};
}

function fade_away_teleport(a, b) {
  return function () {};
}

function fade_away(a, b) {
  return function () {
    20 == a || is_hidden()
      ? destroy_sprite(b, "children")
      : ((b.alpha -= 0.05),
        update_sprite(b),
        draw_timeout(fade_away(a + 1, b), 30, 1));
  };
}

function fade_out_magiport(a, b) {
  return function () {};
}

function show_modal(a, b) {}

function show_json(a) {}

function json_to_html(a) {}

function add_frequest(a) {
  call_code_function("on_friend_request", a);
}

function add_invite(a) {
  call_code_function("on_party_invite", a);
}

function add_request(a) {
  call_code_function("on_party_request", a);
}

function add_frequest(a) {
  call_code_function("on_party_request", a);
}

function add_update_notes() {}
var game_logs = [],
  game_chats = [];

function clear_game_logs() {
  game_logs = [];
}

function add_log(a, b) {
  console.log(a);
}

function add_chat(a, b, c) {
  console.log(a, b, c);
}

function item_position(a) {
  for (var b = 41; 0 <= b; b--) {
    if (character.items[b] && character.items[b].name == a) {
      return b;
    }
  }
}

function ms_until(skill_name, timestamp = performance.now()) {
  if(skill_name in next_skill) {
    return next_skill[skill_name] - timestamp;
  }
  return -Infinity;
}

function can_use(skill_name, timestamp = performance.now()) {
	if (skill_name in next_skill) {
		return timestamp > next_skill[skill_name];
	}
	return true;
}

function send_code_message(a, b) {
  is_array(a) || (a = [a]);
  socket.emit("cm", {
    to: a,
    message: JSON.stringify(b),
  });
}

function get_nearby_hostiles(a) {
  var b = [];
  a || (a = {});
  a.range || (a.range = (character && character.range) || 12000);
  a.limit || (a.limit = 12);
  for (id in parent.entities) {
    var c = parent.entities[id];
    if (
      !(
        c.rip ||
        c.invincible ||
        c.npc ||
        (c.party && character.party == c.party) ||
        (c.guild && character.guild == c.guild) ||
        ("character" == c.type && !is_pvp && !G.maps[character.map].pvp) ||
        in_arr(c.owner, parent.friends)
      )
    ) {
      var d = parent.distance(character, c);
      d < a.range && b.length < a.limit && (b.push(c), (c.c_dist = d));
    }
  }
  b.sort(function (e, f) {
    return e.c_dist > f.c_dist ? 1 : f.c_dist > e.c_dist ? -1 : 0;
  });
  return b;
}

function use_skill(a, b, c) {
  b && b.id && (b = b.id);
  if ("use_hp" == a || "hp" == a) {
    use("hp");
  } else {
    if ("use_mp" == a || "mp" == a) {
      use("mp");
    } else {
      if ("stop" == a) {
        move(character.real_x, character.real_y + 0.00001),
          socket.emit("stop"),
          code_eval_if_r("smart.moving=false");
      } else {
        if ("use_town" == a || "town" == a) {
          character.rip ? socket.emit("respawn") : socket.emit("town");
        } else {
          if ("cburst" == a) {
            if (is_array(b)) {
              socket.emit("skill", {
                name: "cburst",
                targets: b,
              });
            } else {
              a = get_nearby_hostiles({
                range: character.range - 2,
                limit: 12,
              });
              var d = [],
                e = parseInt((character.mp - 200) / a.length);
              a.forEach(function (g) {
                d.push([g.id, e]);
              });
              socket.emit("skill", {
                name: "cburst",
                targets: d,
              });
            }
          } else {
            if ("3shot" == a) {
              if (is_array(b)) {
                socket.emit("skill", {
                  name: "3shot",
                  ids: b,
                });
              } else {
                a = get_nearby_hostiles({
                  range: character.range - 2,
                  limit: 3,
                });
                var f = [];
                a.forEach(function (g) {
                  f.push(g.id);
                });
                socket.emit("skill", {
                  name: "3shot",
                  ids: f,
                });
              }
            } else {
              "5shot" == a
                ? is_array(b)
                  ? socket.emit("skill", {
                      name: "5shot",
                      ids: b,
                    })
                  : ((a = get_nearby_hostiles({
                      range: character.range - 2,
                      limit: 5,
                    })),
                    (f = []),
                    a.forEach(function (g) {
                      f.push(g.id);
                    }),
                    socket.emit("skill", {
                      name: "5shot",
                      ids: f,
                    }))
                : in_arr(
                    a,
                    "invis partyheal darkblessing agitate cleave stomp charge light fishing mining hardshell track warcry mcourage scare".split(
                      " "
                    )
                  )
                ? socket.emit("skill", {
                    name: a,
                  })
                : in_arr(
                    a,
                    "supershot quickpunch quickstab taunt curse burst 4fingers magiport absorb mluck rspeed charm piercingshot".split(
                      " "
                    )
                  )
                ? socket.emit("skill", {
                    name: a,
                    id: b,
                  })
                : "pcoat" == a
                ? ((c = item_position("poison")),
                  void 0 === c
                    ? add_log("You don't have a poison sack", "gray")
                    : socket.emit("skill", {
                        name: "pcoat",
                        num: c,
                      }))
                : "revive" == a
                ? ((c = item_position("essenceoflife")),
                  void 0 === c
                    ? add_log("You don't have an essence", "gray")
                    : socket.emit("skill", {
                        name: "revive",
                        num: c,
                        id: b,
                      }))
                : "poisonarrow" == a
                ? ((c = item_position("poison")),
                  void 0 === c
                    ? add_log("You don't have a poison sack", "gray")
                    : socket.emit("skill", {
                        name: "poisonarrow",
                        num: c,
                        id: b,
                      }))
                : "shadowstrike" == a || "phaseout" == a
                ? ((c = item_position("shadowstone")),
                  void 0 === c
                    ? add_log("You don't have any shadow stones", "gray")
                    : socket.emit("skill", {
                        name: a,
                        num: c,
                      }))
                : "throw" == a
                ? character.items[c]
                  ? socket.emit("skill", {
                      name: a,
                      num: c,
                      id: b,
                    })
                  : add_log("Inventory slot is empty", "gray")
                : "blink" == a
                ? socket.emit("skill", {
                    name: "blink",
                    x: b[0],
                    y: b[1],
                  })
                : "energize" == a
                ? socket.emit("skill", {
                    name: "energize",
                    id: b,
                    mana: c,
                  })
                : "stack" == a
                ? on_skill("attack")
                : add_log("Skill not found: " + a, "gray");
            }
          }
        }
      }
    }
  }
}

function on_skill(a, b) {
  var c = ((a = keymap[a]) && a.name) || a;
  if (a) {
    if ("item" == a.type) {
      b = -1;
      for (i = character.items.length - 1; 0 <= i; i--) {
        if (character.items[i] && character.items[i].name == a.name) {
          b = i;
          break;
        }
      }
      0 <= b
        ? "stand" == G.items[character.items[b].name].type
          ? character.stand
            ? socket.emit("merchant", {
                close: 1,
              })
            : socket.emit("merchant", {
                num: b,
              })
          : socket.emit("equip", {
              num: b,
            })
        : add_log("Item not found", "gray");
    } else {
      "attack" == c
        ? ctarget && ctarget.id
          ? socket.emit("attack", {
              id: ctarget.id,
            })
          : add_log("No target", "gray")
        : "heal" == c
        ? ctarget && ctarget.id
          ? socket.emit("heal", {
              id: ctarget.id,
            })
          : add_log("No target", "gray")
        : "blink" == c
        ? (b && (blink_pressed = true), (last_blink_pressed = performance.now()))
        : "move_up" == c
        ? ((next_minteraction = "up"), setTimeout(arrow_movement_logic, 40))
        : "move_down" == c
        ? ((next_minteraction = "down"), setTimeout(arrow_movement_logic, 40))
        : "move_left" == c
        ? ((next_minteraction = "left"), setTimeout(arrow_movement_logic, 40))
        : "move_right" == c
        ? ((next_minteraction = "right"), setTimeout(arrow_movement_logic, 40))
        : "esc" == c
        ? esc_pressed()
        : "travel" == c
        ? render_travel()
        : "gm" == c
        ? ((b = []),
          b.push({
            button: "Travel",
            onclick: function () {},
          }),
          b.push({
            button: "P Jump",
            onclick: function () {
              socket.emit("gm", {
                action: "jump_list",
              });
            },
          }),
          b.push({
            button: "M Jump",
            onclick: function () {},
          }),
          b.push({
            button: "Invincible",
            onclick: function () {
              socket.emit("gm", {
                action: "invincible",
              });
            },
          }),
          b.push({
            button: "Mute",
            onclick: function () {
              get_input({
                button: "Mute",
                onclick: function () {
                  socket.emit("gm", {
                    action: "mute",
                    id: $(".mglocx").val(),
                  });
                },
                input: "mglocx",
                placeholder: "Name",
                title: "Character",
              });
            },
          }),
          b.push({
            button: "Jail",
            onclick: function () {
              get_input({
                button: "Jail",
                onclick: function () {
                  socket.emit("gm", {
                    action: "jail",
                    id: $(".mglocx").val(),
                  });
                },
                input: "mglocx",
                placeholder: "Name",
                title: "Character",
              });
            },
          }),
          get_input({
            no_wrap: true,
            elements: b,
          }))
        : "interact" == c
        ? npc_focus()
        : "toggle_inventory" == c
        ? render_inventory()
        : "toggle_character" == c
        ? toggle_character()
        : "toggle_stats" == c
        ? toggle_stats()
        : "open_snippet" == c
        ? show_snippet()
        : "toggle_run_code" == c
        ? toggle_runner()
        : "toggle_code" == c
        ? (toggle_code(),
          code &&
            setTimeout(function () {
              try {
                codemirror_render.focus();
              } catch (d) {}
            }, 1))
        : "snippet" == c
        ? code_eval(a.code)
        : "eval" == c || "pure_eval" == c
        ? smart_eval(a.code)
        : "magiport" == c
        ? get_input({
            small: true,
            button: "Engage",
            onclick: function () {
              use_skill("magiport", $(".mglocx").val());
            },
            input: "mglocx",
            placeholder: "Name",
            title: "Magiport",
          })
        : "throw" == c
        ? use_skill(c, ctarget, a.num || 0)
        : use_skill(c, ctarget);
    }
  }
}

function on_skill_up(a) {
  (a = keymap[a]) &&
    "blink" == a &&
    ((blink_pressed = false), (last_blink_pressed = performance.now()));
}

function map_keys_and_skills() {
  skillbar.length ||
    (skillbar =
      "warrior" == character.ctype || "rogue" == character.ctype
        ? ["1", "2", "3", "Q", "R"]
        : "merchant" == character.ctype
        ? ["1", "2", "3", "4", "5"]
        : ["1", "2", "3", "4", "R"]);
  Object.keys(keymap).length ||
    ("warrior" == character.ctype
      ? (keymap = {
          1: "use_hp",
          2: "use_mp",
          3: "cleave",
          4: "stomp",
          5: "agitate",
          Q: "taunt",
          R: "charge",
        })
      : "mage" == character.ctype
      ? (keymap = {
          1: "use_hp",
          2: "use_mp",
          Q: "light",
          R: "burst",
          6: "cburst",
          B: "blink",
          7: "magiport",
        })
      : "priest" == character.ctype
      ? (keymap = {
          1: "use_hp",
          2: "use_mp",
          R: "curse",
          4: "partyheal",
          8: "darkblessing",
          H: "heal",
        })
      : "ranger" == character.ctype
      ? (keymap = {
          1: "use_hp",
          2: "use_mp",
          3: "3shot",
          5: "5shot",
          6: "4fingers",
          R: "supershot",
        })
      : "rogue" == character.ctype
      ? (keymap = {
          1: "use_hp",
          2: "use_mp",
          3: "quickpunch",
          5: "quickstab",
          R: "invis",
          Q: "pcoat",
        })
      : "merchant" == character.ctype &&
        (keymap = {
          1: "use_hp",
          2: "use_mp",
          3: "mluck",
        }),
    (keymap.A = "attack"),
    (keymap.I = "toggle_inventory"),
    (keymap.C = "toggle_character"),
    (keymap.U = "toggle_stats"),
    (keymap.S = "stop"),
    (keymap["\\"] = "toggle_run_code"),
    (keymap["\\2"] = "toggle_run_code"),
    (keymap["-"] = "toggle_code"),
    (keymap[","] = "open_snippet"),
    (keymap.F = "interact"),
    (keymap.UP = "move_up"),
    (keymap.DOWN = "move_down"),
    (keymap.LEFT = "move_left"),
    (keymap.RIGHT = "move_right"),
    (keymap.X = "use_town"),
    (keymap["0"] = {
      name: "snippet",
      code: "say('Hola')",
    }),
    (keymap.L = {
      name: "snippet",
      code: "loot()",
    }),
    (keymap.ESC = "esc"),
    (keymap.T = "travel"),
    (keymap.TAB = {
      name: "pure_eval",
      code: "var list=get_nearby_hostiles(); if(list.length) ctarget=list[0];",
    }),
    (keymap.N = {
      name: "pure_eval",
      code: "options.show_names=!options.show_names;",
    }),
    (keymap.ENTER = {
      name: "pure_eval",
      code: "focus_chat()",
    }),
    (keymap.SPACE = {
      name: "stand0",
      type: "item",
    }));
  for (name in keymap) {
    keymap[name].keycode && (K[keymap[name].keycode] = name);
  }
}
var deferreds = {};
  
class deferred {
	promise = null;
	reject = null;
	resolve = null;
  next = null;
  depth = 0;
	constructor(next) {
    this.next = next;
    this.depth = (next?.depth ?? 0) + 1;
		this.promise = new Promise((resolve, reject) => {
			this.reject = reject;
			this.resolve = resolve;
		});
	}
}
let WARNED_COUNT = 0;
function push_deferred(name) {
  var current = null;
  if(name in deferreds) {
    current = new deferred(deferreds[name]);
  } else {
    current = new deferred(null);
  }
  if(current.depth > 50 && WARNED_COUNT++ < 5) {
    console.log("Potential memory leak in: " + name);
  }
  deferreds[name] = current;
  return current.promise;
}

function push_deferreds(name, count) {
  var deferreds = [];
  for (var i = 0; i < count; i++) deferreds.push(push_deferred(name));
  return deferreds;
}

function resolve_deferreds(name, data) {
  if(name in deferreds) {
    while(deferreds[name] != null) {
      resolve_deferred(name, data);
    }
  }
}

function reject_deferreds(name, data) {
  if(name in deferreds) {
    while(deferreds[name] != null) {
      reject_deferred(name, data);
    }
  }
}

function resolve_deferred(name, data) {
  if (name in deferreds) {
    let current_deferred = deferreds[name];
    if(current_deferred != null) {
      deferreds[name] = current_deferred.next;
      current_deferred.resolve(data);
    }
  }
}

function reject_deferred(name, data) {
  if (name == "skill" && data.skill) {
	data.place = data.skill;
	name = data.skill;
  }
  if (name in deferreds) {
    let current_deferred = deferreds[name];
    if(current_deferred != null) {
      deferreds[name] = current_deferred.next;
      current_deferred.reject(data);
    }
  }
}

var rejecting_promise = Promise.reject.bind(Promise);

var resolving_promise = Promise.resolve.bind(Promise);
var last_move = performance.now();

function move(x, y, code) {
  var map = map,
    move = calculate_move(character, parseFloat(x) || 0, parseFloat(y) || 0);
  // alert(move.x+" "+move.y);
  character.from_x = character.real_x;
  character.from_y = character.real_y;
  character.going_x = move.x;
  character.going_y = move.y;
  character.moving = true;
  calculate_vxy(character);
  // console.log("engaged move "+character.angle);
  var data = {
    x: character.real_x,
    y: character.real_y,
    going_x: character.going_x,
    going_y: character.going_y,
    m: character.m,
  };
  if (next_minteraction)
    (data.key = next_minteraction), (next_minteraction = null);
  socket.emit("move", data);
  last_move = performance.now();
  resolve_deferreds("move", { reason: "interrupted" });
  if (code) return push_deferred("move");
}

function arrow_movement_logic() {}

function get_player(a) {
  if (character && a == character.name) {
    return character;
  }
  let b = entities[a];
  return b && "character" == b.type && b.name == a ? b : null;
}

function get_entity(a) {
  return !character || (a != character.id && a != character.name)
    ? entities[a]
    : character;
}

function target_player(a) {
  var b = null;
  a == character.name && (b = character);
  for (i in entities) {
    "character" == entities[i].type &&
      entities[i].name == a &&
      (b = entities[i]);
  }
  b ? (ctarget = b) : add_log(a + " isn't around", "gray");
}

function travel_p(a) {
  party[a] && party[a]["in"] == party[a].map
    ? call_code_function("smart_move", {
        x: party[a].x,
        y: party[a].y,
        map: party[a].map,
      })
    : add_log("Can't find " + a, "gray");
}

function party_click(a) {
  var b = null;
  a == character.name && (b = character);
  for (i in entities) {
    "character" == entities[i].type &&
      entities[i].name == a &&
      (b = entities[i]);
  }
  b
    ? "priest" == character.ctype
      ? player_heal.call(b)
      : (ctarget = b)
    : add_log(a + " isn't around", "gray");
}

function npc_focus() { }

function locate_item(a) {
  for (var b = 0, c = 0; c < character.items.length; c++) {
    character.items[c] && character.items[c].name == a && (b = c);
  }
  return b;
}

function show_configure() {
  add_log("Coming soon: Settings, Sounds, Music", "gray");
  ping();
}

function list_soon() {
  add_log(
    "Coming soon: Settings, Sounds, Music, PVP (in 1-2 weeks), Trade (Very Soon!)",
    "gray"
  );
}

function transport_to(a, b) {
  character.map == a
    ? add_log("Already here", "gray")
    : "underworld" == a
    ? add_log("Can't reach the underworld. Yet.", "gray")
    : "desert" == a
    ? add_log("Can't reach the desertland. Yet.", "gray")
    : socket.emit("transport", {
        to: a,
        s: b,
      });
}

function show_snippet(a) {}

function eval_character_snippet(a) {
  a = a.toLowerCase();
  character_code_eval(a, window["codemirror_render" + a].getValue());
}

function get_active_characters() {
  var a = {};
  if (!character) {
    return a;
  }
  a[character.name] = "self";
  return a;
}

function character_code_eval(a, b) {}

function character_window_eval(a, b) {}

function code_eval(a) {
  throw Error("code_eval is not supported.");
}

function code_travel(a) {
  "gm" == character.role
    ? socket.emit("transport", {
        to: a,
      })
    : code_eval("smart_move({map:'" + a + "'})");
}

function start_runner(a, b) {}

function stop_runner(a) {}

function toggle_runner() {}

function code_logic() {}

function load_code(a, b) {
  api_call("load_code", {
    name: a,
    run: "",
    log: b,
  });
}

function toggle_code() {}

function start_timer(a) {}

function stop_timer(a, b) {}

function the_door() {}

function h_shake() {
  function a(c) {
    return function () {
      stage.x += c;
      character.real_x -= c;
    };
  }
  var b = 0;
  [-1, 1, -2, 2, -3, 3, -3, 3, -3, 3, -2, 2, -1, 1].forEach(function (c) {
    setTimeout(a(c), 80 * b++);
  });
}

function set_direction(a, b) {
  var c = 70;
  "npc" == b && (c = 45);
  abs(a.angle) < c
    ? (a.direction = 2)
    : abs(abs(a.angle) - 180) < c
    ? (a.direction = 1)
    : 90 > abs(a.angle + 90)
    ? (a.direction = 3)
    : (a.direction = 0);
  "attack" == b &&
    a &&
    !a.me &&
    is_monster(a) &&
    (0 == a.direction
      ? ((a.real_y += 2), (a.y_disp = 2))
      : 3 == a.direction
      ? ((a.real_y -= 2), (a.y_disp = -2))
      : (a.real_x = 1 == a.direction ? a.real_x - 2 : a.real_x + 2),
    setTimeout(function () {
      0 == a.direction
        ? (--a.real_y, --a.y_disp)
        : 3 == a.direction
        ? ((a.real_y += 1), (a.y_disp += 1))
        : 1 == a.direction
        ? (a.real_x += 1)
        : --a.real_x;
    }, 60),
    setTimeout(function () {
      0 == a.direction
        ? (--a.real_y, --a.y_disp)
        : 3 == a.direction
        ? ((a.real_y += 1), (a.y_disp += 1))
        : 1 == a.direction
        ? (a.real_x += 1)
        : --a.real_x;
    }, 60));
}

function free_children(a) {
  if (a.children) {
    for (var b = 0; b < a.children.length; b++) {
      a.children[b].parent = null;
    }
  }
}

function remove_sprite(a) {}

function destroy_sprite(a, b) {}

function trade(a, b, c, d) {
  socket.emit("equip", {
    q: d || 1,
    slot: a,
    num: b,
    value: ("" + c).replace_all(",", "").replace_all(".", ""),
  });
}

function trade_buy(a, b, c, d) {
  socket.emit("trade_buy", {
    slot: a,
    id: b,
    rid: c,
    q: d || 1,
  });
}

function secondhand_buy(a) {
  socket.emit("sbuy", {
    rid: a,
  });
}

function buy_shells(a) {
  (15000000 * a) / 100 > character.gold ||
    socket.emit("buy_shells", {
      gold: (15000000 * a) / 100,
    });
}

function buy(a, b) {
  if (!(100 > mssince(last_npc_right_click))) {
    var c = "buy";
    G.items[a].cash && (c = "buy_with_cash");
    socket.emit(c, {
      name: a,
      quantity: b,
    });
  }
}

function sell(a, b) {
  b || (b = 1);
  socket.emit("sell", {
    num: a,
    quantity: b,
  });
}

function call_code_function(a, b, c, d) {
  try {
    get_code_function(a)(b, c, d);
  } catch (e) {
    add_log(a + " " + e, "#E13758");
  }
}

function get_code_function(a) {
  return (
    (code_active &&
      self.executor &&
      self.executor.callbacks &&
      self.executor.callbacks[a]) ||
    function () {}
  );
}

function private_say(a, b, c) {
  socket.emit("say", {
    message: b,
    code: c,
    name: a,
  });
}

function party_say(a, b) {
  socket.emit("say", {
    message: a,
    code: b,
    party: true,
  });
}
var last_say = "normal";

function say(a, b) {
  if (a && a.length) {
    if (((last_say = "normal"), "/" == a[0])) {
      a = a.substr(1, 2000);
      b = a.split(" ");
      a = b.shift();
      var c = b.join(" ");
      "help" == a || "list" == a || "" == a
        ? (add_chat("", "/list"),
          add_chat("", "/uptime"),
          add_chat("", "/guide"),
          add_chat("", "/invite NAME"),
          add_chat("", "/request NAME"),
          add_chat("", "/friend NAME"),
          add_chat("", "/leave"),
          add_chat("", "/whisper NAME MESSAGE"),
          add_chat("", "/p MESSAGE"),
          add_chat("", "/ping"),
          add_chat("", "/pause"),
          add_chat("", "/eval CODE"),
          add_chat("", "/snippet"),
          add_chat("", "/start CHARACTERNAME"),
          add_chat("", "/stop CHARACTERNAME"),
          add_chat("", "/stop"),
          add_chat("", "/stop invis"),
          add_chat("", "/stop teleport"),
          add_chat("", "/disconnect"),
          add_chat("", "/disconnect CHARACTERNAME"),
          is_electron && add_chat("", "/new_window"))
        : !is_electron ||
          ("new_window" != a && "window" != a && "newwindow" != a)
        ? "start" == a
          ? ((c = c.split(" ")), (b = c.shift()) && start_character_runner(b))
          : "leave" == a
          ? socket.emit("party", {
              event: "leave",
            })
          : "stop" == a
          ? ((c = c.split(" ")),
            (b = c.shift()) && "teleport" != b
              ? "invis" == b
                ? socket.emit("stop", {
                    action: "invis",
                  })
                : stop_character_runner(b)
              : use_skill("stop"))
          : "disconnect" == a
          ? ((c = c.split(" ")),
            (b = c.shift())
              ? api_call("disconnect_character", {
                  name: b,
                })
              : (window.location = base_url))
          : "p" == a
          ? party_say(c)
          : "pause" == a
          ? pause()
          : "eval" == a || "execute" == a
          ? code_eval(c)
          : "w" == a || "whisper" == a || "pm" == a
          ? ((c = c.split(" ")),
            (b = c.shift()),
            (c = c.join(" ")),
            b && c
              ? private_say(b, c)
              : add_chat("", "Format: /w NAME MESSAGE"))
          : "savecode" == a
          ? ((c = c.split(" ")),
            (a = c.shift()),
            (b = c.join(" ")),
            a.length && !parseInt(a)
              ? (add_chat("", "/savecode NUMBER NAME"),
                add_chat("", "NUMBER can be from 1 to 100"))
              : (a || (a = 1),
                api_call("save_code", {
                  code: codemirror_render.getValue(),
                  slot: a,
                  name: b,
                })))
          : "loadcode" == a || "runcode" == a
          ? ((c = c.split(" ")),
            (b = c.shift()) || (b = 1),
            api_call("load_code", {
              name: b,
              run: ("runcode" == a && "1") || "",
            }))
          : "ping" == a
          ? ping()
          : "whisper" == a
          ? !ctarget || ctarget.me || ctarget.npc || "character" != ctarget.type
            ? add_chat("", "Target someone to whisper")
            : private_say(ctarget.name, c)
          : "party" == a || "invite" == a
          ? ((c = c.split(" ")),
            (b = c.shift()) && b.length
              ? socket.emit("party", {
                  event: "invite",
                  name: b,
                })
              : !ctarget ||
                ctarget.me ||
                ctarget.npc ||
                "character" != ctarget.type
              ? add_chat("", "Target someone to invite")
              : socket.emit("party", {
                  event: "invite",
                  id: ctarget.id,
                }))
          : "friend" == a &&
            ((c = c.split(" ")),
            (b = c.shift()) && b.length
              ? socket.emit("friend", {
                  event: "request",
                  name: b,
                })
              : !ctarget ||
                ctarget.me ||
                ctarget.npc ||
                "character" != ctarget.type
              ? add_chat("", "Target someone to friend")
              : socket.emit("friend", {
                  event: "request",
                  name: ctarget.name,
                }))
        : window.open(base_url, "", {
            width: $(window).width(),
            height: $(window).height(),
          });
    } else {
      socket.emit("say", {
        message: a,
        code: b,
      });
    }
  }
}

function activate(a) {
  socket.emit("booster", {
    num: a,
    action: "activate",
  });
}

function shift(a, b) {
  socket.emit("booster", {
    num: a,
    action: "shift",
    to: b,
  });
}

function open_merchant(a) {
  socket.emit("merchant", {
    num: a,
  });
}

function close_merchant() {
  socket.emit("merchant", {
    close: 1,
  });
}

function upgrade(a, b, c, d) {
  null == a || (null == b && null == c)
    ? d_text("INVALID", character)
    : socket.emit("upgrade", {
        item_num: a,
        scroll_num: b,
        offering_num: c,
        clevel: character.items[a].level || 0,
        calculate: d
      });
    return push_deferred("upgrade");
}

function deposit(a) {
  G.maps[current_map].mount
    ? ((a = a.replace_all(",", "").replace_all(".", "")),
      socket.emit("bank", {
        operation: "deposit",
        amount: parseInt(a),
      }))
    : add_log("Not in the bank.", "gray");
}

function withdraw(a) {
  G.maps[current_map].mount
    ? socket.emit("bank", {
        operation: "withdraw",
        amount: parseInt(a),
      })
    : add_log("Not in the bank.", "gray");
}
var exchange_animations = false,
  last_excanim = performance.now(),
  exclast = 0,
  exccolors1 =
    "#f1c40f #f39c12 #e74c3c #c0392b #8e44ad #9b59b6 #2980b9 #3498db #1abc9c".split(
      " "
    ),
  exccolorsl = ["#CD6F1A", "#A95C15"],
  exccolorsg = ["#EFD541", "#9495AC"],
  exccolorsc = ["#C82F17", "#EBECEE"],
  exccolorssea = ["#24A7CB", "#EBECEE"];

function exchange_animation_logic() {
  in_arr(exchange_type, ["mistletoe", "ornament", "candycane"]);
  300 < mssince(last_excanim) && ((last_excanim = performance.now()), exclast++);
}

function exchange(index, is_code) {
  if(character.q.exchange) {
		d_text("WAIT",character);
		return rejecting_promise({reason:"in_progress"});
	} else {
    socket.emit("exchange",{item_num:index,q:character.items[index].q});
    if(is_code) {
      return push_deferred("exchange");
    }
  }
}

function compound(a, b, c, d, e) {
  null == d ||
  "undefined" === typeof a ||
  "undefined" === typeof b ||
  "undefined" === typeof c
    ? console.log("INVALID")
    : socket.emit("compound", {
        items: [a, b, c],
        scroll_num: d,
        offering_num: e,
        clevel: character.items[a].level || 0,
      });
}

function craft(a, b, c, d, e, f, g, h, k) {
  a = [a, b, c, d, e, f, g, h, k];
  b = false;
  for (c = 0; 9 > c; c++) {
    if (cr_items[c] || 0 === cr_items[c]) {
      (b = true), a.push([c, cr_items[c]]);
    }
  }
  b
    ? socket.emit("craft", {
        items: a,
      })
    : d_text("INVALID", character);
}

function dismantle() {
  socket.emit("dismantle", {
    num: ds_item,
  });
}

function reopen() {
  u_scroll = c_scroll = e_item = null;
  draw_trigger(function () {
    "upgrade" == rendered_target
      ? render_upgrade_shrine()
      : "compound" == rendered_target
      ? render_compound_shrine()
      : "exchange" == rendered_target
      ? render_exchange_shrine(exchange_type)
      : "gold" == rendered_target
      ? render_gold_npc()
      : "items" == rendered_target
      ? render_items_npc()
      : "crafter" == rendered_target && render_crafter();
    inventory && reset_inventory();
    exchange_animations && (exchange_animations = false);
  });
}

function esc_pressed() {
  throw Error("esc_pressed is not supported.");
}

function toggle_stats() {
  throw Error("toggle_stats is not supported.");
}

function reset_inventory() {
  throw Error("reset_inventory is not supported.");
}

function open_chest(a) {
  var b = chests[a];
  (b.openning && 5 > ssince(b.openning)) ||
    socket.emit("open_chest", {
      id: a,
    });
}

function generate_textures(name, stype) {
	// console.log("generate_textures "+name+" "+stype);
	if (in_arr(stype, ["full", "wings", "body", "armor", "skin", "upper", "tail", "character"])) {
		var d = XYWH[name], 
			width = d[2], 
			height = d[3], 
			dx = 0, 
			dy = 0, 
			prefix = "", 
			dyh = 0, 
			col_num = 3;
		if (stype == "upper") prefix = "upper", dyh = 8;
		var a = G.dimensions[name];
		if (a) {
			width = a[0]; height = a[1];
			dx = round((d[2] - width) / 2.0 + (a[2] || 0));
			dy = round(d[3] - height); // +(a[3]||0) height-disp was never used, removed to simplify [20/07/18]
		}
		textures[prefix + name] = [
			[null, null, null, null],
			[null, null, null, null],
			[null, null, null, null]
		];
		if (stype == "tail") {
			col_num = 4;
			textures[prefix + name].push([null, null, null, null]);
		}
		var rectangle = { width: width, height: height - dyh };
		if (offset_walking && !a) rectangle.y += 2, rectangle.height -= 2;
		for (var i = 0; i < col_num; i++)
			for (var j = 0; j < 4; j++) {
				textures[prefix + name][i][j] = rectangle;
			}
	}
}

function set_texture(sprite,i,j)
{
	var c=i+""+j;
	sprite.i=i;
	sprite.j=j;
	if(sprite.cskin==c) return;
	sprite.cskin=c;
}

function new_sprite(skin,stype,n)
{
	if(in_arr(stype,["full","wings","body","armor","skin","tail","character"]))
	{
		if(n=="renew")
		{
			var sprite=skin;
		}
		else
		{
			var sprite={};
		}
		sprite.cskin="10"; sprite.i=1; sprite.j=0;
	}
  
	sprite.skin=skin;
	sprite.stype=stype;
	sprite.updates=0;
	return sprite;
}

function recreate_dtextures() {
  (window.dtextures || []).forEach(function (c) {
    c && c.destroy();
  });
  dtile_width = max(width, screen.width);
  dtile_height = max(height, screen.height);
  for (var a = 0; 3 > a; a++) {
    var b = new PIXI.extras.TilingSprite(
      M["default"][5 + a] || M["default"][5],
      dtile_width / scale + 3 * dtile_size,
      dtile_height / scale + 3 * dtile_size
    );
    dtextures[a] = PIXI.RenderTexture.create(
      dtile_width + 4 * dtile_size,
      dtile_height + 4 * dtile_size,
      PIXI.SCALE_MODES.NEAREST,
      1
    );
    renderer.render(b, dtextures[a]);
    b.destroy();
  }
  console.log("recreated dtextures");
  dtile && (dtile.texture = dtextures[water_frame()]);
}

function water_frame() {
  return [0, 1, 2, 1][round(draws / 30) % 4];
}

function new_map_tile(a) {
  total_map_tiles++;
  if (8 == a.length) {
    var b = new PIXI.Sprite(a[5]);
    b.textures = [a[5], a[6], a[7]];
    return b;
  }
  return new PIXI.Sprite(a[5]);
}

function assassin_smoke(a, b, c) {}

function confetti_shower(a, b) {}
function egg_splash() {}
function firecrackers() {}

function start_animation(a, b, c) {}

function stop_animation(a, b) {}

function set_base_rectangle(a) {}

function dirty_fix(a) {}

function restore_base(a) {}

function rotate(a, b) {}

function rotated_texture(a, b, c) {}

function draw_timeouts_logic(a) {
  for (var b = performance.now(), c = [], d = 0; d < draw_timeouts.length; d++) {
    var e = draw_timeouts[d];
    if ((!a || 2 != a || 2 == e[2]) && b >= e[1]) {
      c.push(d);
      let f = null;
      try {
        try {
          e[0]();
        } catch (g) {
          (f = g),
            console.log(
              "draw_timeout_error (" + character.name + "): " + g.stack
            );
        }
      } catch (g) {
        console.log("Charname error:", f);
      }
    }
  }
  c && delete_indices(draw_timeouts, c);
}

function draw_timeout(a, b, c) {
  draw_timeouts.push([a, future_ms(b), c]);
}

function draw_trigger(a) {
  draw_timeouts.push([a, performance.now(), 2]);
}

function tint_logic() {}

function use(a) {
  for (var b = false, c = character.items.length - 1; 0 <= c; c--) {
    var d = character.items[c];
    if (d) {
      if (b) {
        break;
      }
      (G.items[d.name].gives || []).forEach(function (e) {
        e[0] == a &&
          (socket.emit("equip", {
            num: c,
          }),
          (b = 1));
      });
    }
  }
  b ||
    socket.emit("use", {
      item: a,
    });
}
var tint_c = {
  a: 0,
  p: 0,
  t: 0,
};

function attack_timeout(a) {
  next_attack = future_ms(a);
}

function pot_timeout(a) {
  next_potion = future_ms(a);
  skill_timeout("use_hp", a);
  skill_timeout("use_mp", a);
}

function pvp_timeout(a, b) {
  next_transport = future_ms(a);
  skill_timeout("use_town", a);
  b ||
    draw_trigger(function () {
      for (var c = 1; 10 > c; c++) {
        draw_timeout(
          (function (d, e, f) {
            return function () {};
          })(200 - 15 * c, 50 - 3 * c, 20 - c),
          600 * c
        );
      }
    });
}

function pvp_timeout(a, b) {
  next_transport = future_ms(a);
  skill_timeout("use_town", a);
}
var next_skill = {};
function skill_timeout_singular(name, ms) {
  if (ms <= 0) ms = 0;
  var skids = [];
  if (
    ms === undefined &&
    (G.skills[name].cooldown || G.skills[name].reuse_cooldown) !== undefined
  )
    ms = G.skills[name].cooldown || G.skills[name].reuse_cooldown;
  else if (ms === undefined && G.skills[name].share)
    ms =
      G.skills[G.skills[name].share].cooldown *
      (G.skills[name].cooldown_multiplier || 1);
  else if (name == "attack" && ms === undefined)
    ms = 1000.0 / character.frequency;
  next_skill[name] = future_ms(ms || 0);
  if (name == "attack") next_attack = next_skill[name];
  //add_tint(".hpui",{ms:ms,color:"#9A9A9A",reverse:1});
  //add_tint(".mpui",{ms:ms,color:"#9A9A9A",reverse:1});
  // add_tint(".ptint",{ms:ms,color:"#5F346E",reverse:1});
  //var original=$(".ptint").css("background");
}
function skill_timeout(name, ms) {
  if (G.skills[name].share) {
    skill_timeout_singular(G.skills[name].share, ms);
    for (var s in G.skills)
      if (G.skills[s].share == G.skills[name].share)
        skill_timeout_singular(s, ms);
  } else if (
    (G.skills[name].cooldown || G.skills[name].reuse_cooldown) !== undefined ||
    name == "attack"
  )
    skill_timeout_singular(name, ms);
}

function disappearing_circle(a, b, c, d) {}

function empty_rect(a, b, c, d, e, f) {}

function draw_line(a, b, c, d, e, f) {}

function draw_circle(a, b, c, d) {}

function add_border(a, b, c) {}

function player_rclick_logic(a) {}

function border_logic(a) {}

function rip_logic() {
  character.rip &&
    !rip &&
    ((rip = true),
    (character.moving = false),
    skill_timeout("use_town", 12000),
    reopen());
  !character.rip && rip && (rip = false);
}

function name_logic(a) {}

function add_name_tag(a) {}

function add_name_tag_large(a) {}

function add_name_tag_experimental(a) {}

function hp_bar_logic(a) {}

function add_hp_bar(a) {}

function test_bitmap(a, b, c) {}

function d_line(a, b, c) {}

function d_text(a, b, c, d) {}

function api_call(a, b, c) {
  b || (b = {});
  c || (c = {});
  var d = c.disable;
  b.ui_loader && ((c.r_id = randomStr(10)), delete b.ui_loader);
  b.callback && ((c.callback = b.callback), delete b.callback);
  d && d.addClass("disable");
  data = {
    method: a,
    arguments: JSON.stringify(b),
  };
  c.r_id && show_loader(c.r_id);
}

function api_call_l(a, b, c) {
  b || (b = {});
  b.ui_loader = true;
  return api_call(a, b, c);
}
var warned = {},
  map_info = {};

function new_map_logic(a, b) {
  map_info = b.info || {};
  "abtesting" != current_map ||
    abtesting ||
    ((abtesting = {
      A: 0,
      B: 0,
    }),
    (abtesting_ui = true),
    (abtesting.end = future_s(G.events.abtesting.duration)));
  "abtesting" != current_map &&
    abtesting_ui &&
    (abtesting_ui = abtesting = false);
  "resort" == current_map &&
    add_log("Resort is a prototype with work in progress", "#ADA9E4");
  "tavern" == current_map &&
    add_log("Tavern is a prototype with work in progress", "#63ABE4");
  !is_pvp ||
    ("start" != a && "welcome" != a) ||
    add_log("This is a PVP Server. Be careful!", "#E1664C");
  "map" != a ||
    is_pvp ||
    !G.maps[current_map].pvp ||
    warned[current_map] ||
    ((warned[current_map] = 1),
    add_log("This is a PVP Zone. Be careful!", "#E1664C"));
}

function new_game_logic() {
  "hardcore" == gameplay && hardcore_logic();
}

function ui_log(a, b) {
  add_log(a, b);
}

function ui_error(a) {
  add_log(a, "red");
}

function ui_success(a) {
  add_log(a, "green");
}
var code_list = {};

function load_code_s(a) {}

function save_code_s() {}

function handle_information(a) {
  for (let info of a) {
    switch (info.type) {
      case "reload":
        future_s(10);
        break;
      case "ui_log":
      case "message":
        info.color ? add_log(info.message, info.color) : ui_log(info.message);
        break;
      case "code":
        codemirror_render.setValue(info.code);
        break;
      case "gcode":
        break;
      case "chat_message":
        add_chat("", info.message, info.color);
        break;
      case "ui_error":
      case "error":
        if ("message" != inside) {
          ui_error(info.message);
        }
        break;
      case "success":
        if ("message" != inside) {
          ui_success(info.message);
        }
        break;
      case "eval":
        smart_eval(info.code);
        break;
      case "func":
        smart_eval(window[info.func], info.args);
        break;
    }
  }
}

function add_alert(a) {
  console.log("caught exception: " + a);
}

function init_music() {}
var current_music = null;

function gprocess_game_data() {
  if ("undefined" != typeof no_graphics && no_graphics) {
    for (var a in G.geometry) {
      var b = G.geometry[a];
      b.data &&
        ((b.data.tiles = []), (b.data.placements = []), (b.data.groups = []));
    }
  }
  process_game_data();
}
var BACKUP = {};

function reload_data() {
  BACKUP.maps = G.maps;
  prop_cache = {};
}

function apply_backup() {
  G.maps = BACKUP.maps;
  process_game_data();
  BACKUP = {};
}

function bc(a, b) {
  return $(a).hasClass("disabled") ? 1 : 0;
}

function btc(a, b) {
  stpr(a);
}

function show_loader() {}

function hide_loader() {}

function alert_json(a) {
  alert(JSON.stringify(a));
}

function game_stringify(a, b) {
  var c = [];
  try {
    return JSON.stringify(
      a,
      function (d, e) {
        if (
          !in_arr(
            d,
            "transform parent displayGroup vertexData animations tiles placements default children".split(
              " "
            )
          ) &&
          -1 == d.indexOf("filter_") &&
          "_" != d[0]
        ) {
          if (null != e && "object" == typeof e) {
            if (0 <= c.indexOf(e)) {
              return;
            }
            c.push(e);
          }
          return e;
        }
      },
      b
    );
  } catch (d) {
    return "safe_stringify_exception";
  }
}

function syntax_highlight(a) {
  a = a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return a.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (b) {
      var c = "shnumber";
      /^"/.test(b)
        ? (c = /:$/.test(b) ? "shkey" : "shstring")
        : /true|false/.test(b)
        ? (c = "shboolean")
        : /null/.test(b) && (c = "shnull");
      return '<span class="' + c + '">' + b + "</span>";
    }
  );
}

function stpr(a) {
  try {
    "manual" != a && a.stopPropagation();
  } catch (b) {}
}
