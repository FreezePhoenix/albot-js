function reduce_cooldown(a, b) {
  parent.next_skill[a] &&
    parent.skill_timeout(a, -mssince(parent.next_skill[a]) - b);
}
var G = parent.G,
  safeties = true;
let server = {
    mode: parent.gameplay,
    pvp: parent.is_pvp,
    region: parent.server_region,
    id: parent.server_identifier,
  },
  game = {
    platform: (parent.is_electron && "electron") || "web",
    graphics: !parent.no_graphics,
    html: !parent.no_html,
  };

function start_character(a, b) {
  parent.start_character_runner(a, b);
}

function stop_character(a) {
  parent.stop_character_runner(a);
}

function command_character(a, b) {
  parent.character_code_eval(a, b);
}

function get_active_characters() {
  return parent.get_active_characters();
}

function is_pvp() {
  return G.maps[character.map].pvp || server.is_pvp;
}

function is_npc(a) {
	return a?.type == "npc" || a?.npc;
}

function is_monster(a) {
	return a?.type == "monster";
}

function is_player(a) {
  return a?.type == "character" && !a.npc;
}

function is_character(a) {
  return is_player(a);
}

function activate(a) {
  parent.activate(a);
}

function shift(a, b) {
  parent.shift(a, b);
}



function ms_until(n, s) {
  return parent.ms_until(n, s);
}

function can_use(n, s) {
  return parent.can_use(n, s);
}

function use(a, b) {
  isNaN(a) ? (b || (b = get_target()), parent.use_skill(a, b)) : equip(a);
}

function use_skill(a, b) {
  parent.use_skill(a, b ?? get_target());
}

function item_properties(a) {
  return a && a.name ? calculate_item_properties(G.items[a.name], a) : null;
}

function item_grade(a) {
  return a && a.name ? calculate_item_grade(G.items[a.name], a) : -1;
}

function item_value(a) {
  return a && a.name ? calculate_item_value(a) : 0;
}

function is_paused() {
  return true;
}

function pause() {}

function get_socket() {
  return parent.socket;
}

function get_map() {
  return parent.G.maps[parent.current_map];
}

function set_message(a, b) {}

function game_log(a, b) {
  parent.add_log(a);
}

function get_target_of(a) {
  return a && a.target
    ? character.id == a.target
      ? character
      : parent.entities[a.target] || null
    : null;
}

function get_target() {
  return parent.ctarget && !parent.ctarget.dead ? parent.ctarget : null;
}

function get_targeted_monster() {
  return parent.ctarget &&
    !parent.ctarget.dead &&
    "monster" == parent.ctarget.type
    ? parent.ctarget
    : null;
}

function change_target(a, b) {
  parent.ctarget = a;
  b || (parent.last_id_sent = a ? a.id : "");
  parent.send_target_logic();
}

function can_move_to(a, b) {
  is_object(a) && ((b = a.real_y), (a = a.real_x));
  return can_move({
    map: character.map,
    x: character.real_x,
    y: character.real_y,
    going_x: a,
    going_y: b,
    base: character.base,
  });
}

function xmove(a, b) {
  can_move_to(a, b)
    ? move(a, b)
    : smart_move({
        x: a,
        y: b,
      });
}

function in_attack_range(a) {
  return a
    ? parent.distance(character, a) <= character.range + character.xrange
      ? true
      : false
    : false;
}

function can_attack(a) {
  return a
    ? !parent.is_disabled(character) &&
      in_attack_range(a) &&
      performance.now() >= parent.next_attack
      ? true
      : false
    : false;
}

function can_heal(a) {
  return is_monster(a) ? false : can_attack(a);
}

function is_moving(a) {
  return (a.me && smart.moving) || a.moving ? true : false;
}

function is_transporting(entity) {
  if (entity.c.town) return true;
  if (entity.me && parent.transporting) return true;
  return false;
}

function attack(target, code) {
	if(target==character) target=parent.character;
	if(!target) {
		game_log("Nothing to attack()","gray");
    if(code) {
		  return rejecting_promise({reason:"not_found"});
    }
	}
	if(target.type=="character") {
    return parent.player_attack.call(target,null,code);
  } else {
    return parent.attack_monster(target, code);
  }
}

function heal(a) {
  if (safeties && mssince(last_attack) > 400) {
    parent.player_heal(a);
    last_attack = performance.now();
  }
  // safeties && 400 > mssince(last_attack) || (a ? (parent.player_heal.call(a), last_attack = new Date) : game_log("No one to heal()", "gray"));
}

function buy(a, b) {
  parent.buy(a, b);
  return parent.push_deferred("buy");
}

function sell(a, b) {
  parent.sell(a, b);
}

function equip(a) {
  parent.socket.emit("equip", {
    num: a,
  });
  return parent.push_deferred("equip");
}

function unequip(a) {
  parent.socket.emit("unequip", {
    slot: a,
  });
  return parent.push_deferred("unequip");
}

function trade(a, b, d) {
  parent.trade("trade" + b, a, d);
}

function trade_buy(a, b) {
  parent.trade_buy(b, a.id, a.slots[b].rid);
}

function upgrade(a, b, d, e) {
  return parent.upgrade(a, b, d, e);
}

function compound(a, b, d, c, g) {
  parent.compound(a, b, d, c, g);
}

function craft(a, b, d, c, g, h, f, k, l) {
  parent.craft(a, b, d, c, g, h, f, k, l);
}

function exchange(a) {
  parent.exchange(a, 1);
}

function say(a) {
  parent.say(a, 1);
}

function pm(a, b) {
  parent.private_say(a, b, 0);
}

function move(x,y)
{
	if(!can_walk(character)) return false;
	return parent.move(x,y,true);
}

function show_json(a) {
  parent.show_json(parent.game_stringify(a, 2));
}

function get_player(a) {
  var b = null,
    d = parent.entities;
  a == character.name && (b = character);
  return b || d[a];
}

function get_nearest_monster(a) {
  var b = 999999,
    d = null;
  a || (a = {});
  a && a.target && a.target.name && (a.target = a.target.name);
  a &&
    "monster" == a.type &&
    game_log(
      "You used monster.type, which is always 'monster', use monster.mtype instead"
    );
  for (let id in parent.entities) {
    var c = parent.entities[id];
    if (
      !(
        "monster" != c.type ||
        c.dead ||
        (a.type && c.mtype != a.type) ||
        (a.min_xp && c.xp < a.min_xp) ||
        (a.max_att && c.attack > a.max_att) ||
        (a.target && c.target != a.target) ||
        (a.no_target && c.target && c.target != character.name) ||
        (a.path_check && !can_move_to(c))
      )
    ) {
      var g = parent.distance(character, c);
      g < b && ((b = g), (d = c));
    }
  }
  return d;
}

function get_nearest_hostile(a) {
  var b = 999999,
    d = null;
  a || (a = {});
  void 0 === a.friendship && character.owner && (a.friendship = true);
  for (let id in parent.entities) {
    var c = parent.entities[id];
    if (
      !(
        "character" != c.type ||
        c.rip ||
        c.invincible ||
        c.npc ||
        (c.party && character.party == c.party) ||
        (c.guild && character.guild == c.guild) ||
        (a.friendship && in_arr(c.owner, parent.friends)) ||
        (a.exclude && in_arr(c.name, a.exclude))
      )
    ) {
      var g = parent.distance(character, c);
      g < b && ((b = g), (d = c));
    }
  }
  return d;
}

function use_hp_or_mp() {
  if (!(safeties && performance.now() - last_potion < min(200, 3 * character.ping))) {
    var a = false;
    performance.now() < parent.next_skill.use_hp ||
      (0.2 > character.mp / character.max_mp
        ? (use_mp(), (a = true))
        : 0.75 > character.hp / character.max_hp
        ? (use_hp(), (a = true))
        : 0.75 > character.mp / character.max_mp
        ? (use_mp(), (a = true))
        : character.hp < character.max_hp
        ? (use_hp(), (a = true))
        : character.mp < character.max_mp && (use_mp(), (a = true)),
      a && (last_potion = performance.now() - character.ping));
  }
}

function loot(a) {
  a && console.log("Commander looting is not supported in this version");
  a = 0;
  if (!(safeties && 200 > mssince(last_loot))) {
    for (let id in ((last_loot = performance.now()), parent.chests)) {
      var b = parent.chests[id];
      if (
        !safeties ||
        !(
          b.items > character.esize ||
          (b.last_loot && 1600 > mssince(b.last_loot))
        )
      ) {
        if (
          ((b.last_loot = last_loot),
          parent.socket.emit("open_chest", {
            id,
          }),
          a++,
          2 == a)
        ) {
          break;
        }
      }
    }
  }
}

function send_gold(a, b) {
  if (!a) {
    return game_log("No receiver sent to send_gold");
  }
  a.name && (a = a.name);
  parent.socket.emit("send", {
    name: a,
    gold: b,
  });
}

function send_item(a, b, d) {
  if (!a) {
    return game_log("No receiver sent to send_item");
  }
  a.name && (a = a.name);
  parent.socket.emit("send", {
    name: a,
    num: b,
    q: d || 1,
  });
}

function destroy_item(a) {
  parent.socket.emit("destroy", {
    num: a,
  });
}

function send_party_invite(a, b) {
  is_object(a) && (a = a.name);
  parent.socket.emit("party", {
    event: (b && "request") || "invite",
    name: a,
  });
}

function send_party_request(a) {
  send_party_invite(a, 1);
}

function accept_party_invite(a) {
  parent.socket.emit("party", {
    event: "accept",
    name: a,
  });
}

function accept_party_request(a) {
  parent.socket.emit("party", {
    event: "raccept",
    name: a,
  });
}

function respawn() {
  parent.socket.emit("respawn");
}

function handle_command(a, b) {
  return -1;
}

function send_cm(a, b) {
  parent.send_code_message(a, b);
}

function on_cm(a, b) {
  game_log("Received a code message from: " + a);
}

function on_disappear(a, b) {}

function on_combined_damage() {}

function on_party_invite(a) {}

function on_party_request(a) {}

function on_draw() {}

function on_game_event(a) {}

function draw_line(a, b, d, c, g, h) {}

function draw_circle(a, b, d, c, g) {}

function clear_drawings() {}

function add_top_button(a, b, d) {}

function add_bottom_button(a, b, d) {}

function set_button_value(a, b) {}

function set_button_color(a, b) {}

function set_button_onclick(a, b) {
  buttons[a].fn = b;
}

function clear_buttons() {}

function auto_reload(a) {}
game.listeners = [];
game.all = function (a) {
  a = {
    f: a,
    id: randomStr(30),
    event: "all",
  };
  game.listeners.push(a);
  return a.id;
};
game.on = function (a, b) {
  a = {
    f: b,
    id: randomStr(30),
    event: a,
  };
  game.listeners.push(a);
  return a.id;
};
game.once = function (a, b) {
  a = {
    f: b,
    id: randomStr(30),
    event: a,
    once: true,
  };
  game.listeners.push(a);
  return a.id;
};
game.remove = function (a) {
  for (var b = 0; b < game.listeners.length; b++) {
    if (game.listeners[b].id == a) {
      game.listeners.splice(b, 1);
      break;
    }
  }
};
game.trigger = function (a, b) {
  for (var d = [], c = 0, g = game.listeners.length; c < g; c++) {
    var h = game.listeners[c];
    if (h.event == a || "all" == h.event) {
      try {
        "all" == h.event ? h.f(a, b) : h.f(b, a);
      } catch (f) {
        game_log("Listener Exception (" + h.event + ") " + f, code_color);
      }
      (h.once || (h.f && h.f.delete)) && d.push(h.id);
    }
  }
};

function trigger_event(a, b) {
  game.trigger(a, b);
}

function preview_item(a, b) {}

function load_code(a, b) {}
var smart = {
  moving: false,
  map: "main",
  x: 0,
  y: 0,
  on_done: function () {},
  plot: null,
  edge: 20,
  use_town: false,
  prune: {
    smooth: true,
    map: true,
  },
  flags: {},
};

function smart_move(a, b) {
  if (character) {
    smart.map = "";
    is_string(a) &&
      (a = {
        to: a,
      });
    is_number(a) &&
      ((a = {
        x: a,
        y: b,
      }),
      (b = null));
    if ("x" in a) {
      (smart.map = a.map || character.map), (smart.x = a.x), (smart.y = a.y);
    } else {
      if ("to" in a || "map" in a) {
        if (("town" == a.to && (a.to = "main"), G.monsters[a.to])) {
          for (var d in G.maps) {
            (G.maps[d].monsters || []).forEach(function (f) {
              if (f.type == a.to && !G.maps[d].ignore && !G.maps[d].instance) {
                if (f.boundaries) {
                  f.last = f.last || 0;
                  var k = f.boundaries[f.last % f.boundaries.length];
                  f.last++;
                  smart.map = k[0];
                  smart.x = (k[1] + k[3]) / 2;
                  smart.y = (k[2] + k[4]) / 2;
                } else {
                  f.boundary &&
                    ((k = f.boundary),
                    (smart.map = d),
                    (smart.x = (k[0] + k[2]) / 2),
                    (smart.y = (k[1] + k[3]) / 2));
                }
              }
            });
          }
        } else {
          G.maps[a.to || a.map]
            ? ((smart.map = a.to || a.map),
              (smart.x = G.maps[smart.map].spawns[0][0]),
              (smart.y = G.maps[smart.map].spawns[0][1]))
            : "upgrade" == a.to || "compound" == a.to
            ? ((smart.map = "main"), (smart.x = -204), (smart.y = -129))
            : "exchange" == a.to
            ? ((smart.map = "main"), (smart.x = -26), (smart.y = -432))
            : "potions" == a.to && "halloween" == character.map
            ? ((smart.map = "halloween"), (smart.x = 149), (smart.y = -182))
            : "potions" == a.to &&
              in_arr(character.map, ["winterland", "winter_inn", "winter_cave"])
            ? ((smart.map = "winter_inn"), (smart.x = -84), (smart.y = -173))
            : "potions" == a.to
            ? ((smart.map = "main"), (smart.x = 56), (smart.y = -122))
            : "scrolls" == a.to &&
              ((smart.map = "main"), (smart.x = -465), (smart.y = -71));
        }
      }
    }
    if (smart.map) {
      if (
        ((smart.moving = true),
        (smart.plot = []),
        (smart.flags = {}),
        (smart.searching = smart.found = false),
        a.return)
      ) {
        var c = character.real_x,
          g = character.real_y,
          h = character.map;
        smart.on_done = function () {
          b && b();
          smart_move({
            map: h,
            x: c,
            y: g,
          });
        };
      } else {
        smart.on_done = b;
      }
    } else {
      game_log("Unrecognized", "#CF5B5B");
    }
  }
}

function stop(a) {
  if (a && "move" != a) {
    "invis" == a
      ? parent.socket.emit("stop", {
          action: "invis",
        })
      : "teleport" == a &&
        parent.socket.emit("stop", {
          action: "teleport",
        });
  } else {
    if (smart.moving) {
      smart.on_done?.(false);
    }
    smart.moving = false;
    move(character.real_x, character.real_y);
  }
}
var queue = [],
  visited = {},
  start = 0,
  best = null,
  moves = [
    [0, 15],
    [0, -15],
    [15, 0],
    [-15, 0],
  ];

function plot(a) {
	if(a != -1) {
		plot(queue[a].i);
		smart.plot.push(queue[a]);
	}
}

function qpush(a) {
  (smart.prune.map && smart.flags.map && a.map != smart.map) ||
    visited.has(a.map + "-" + a.x + "-" + a.y) ||
    (a.i || (a.i = start),
    queue.push(a),
    visited.set(a.map + "-" + a.x + "-" + a.y, true));
}

function smooth_path() {
  for (var a = 0; a < smart.plot.length; ) {
    for (
      ;
      a + 2 < smart.plot.length &&
      smart.plot[a].map == smart.plot[a + 1].map &&
      smart.plot[a].map == smart.plot[a + 1].map &&
      (!smart.plot[a + 2] || !smart.plot[a + 2].transport) &&
      can_move({
        map: smart.plot[a].map,
        x: smart.plot[a].x,
        y: smart.plot[a].y,
        going_x: smart.plot[a + 2].x,
        going_y: smart.plot[a + 2].y,
        base: character.base,
      });

    ) {
      smart.plot.splice(a + 1, 1);
    }
    a++;
  }
}

function bfs()
{
	var timer=performance.now(),result=null,optimal=true;

	while(start<queue.length)
	{
		var current=queue[start];
		// game_log(current.x+" "+current.y);
		var map=G.maps[current.map];
		var c_moves=moves,qlist=[];
		if(current.map==smart.map)
		{
			var c_dist=abs(current.x-smart.x)+abs(current.y-smart.y);
			var s_dist=abs(current.x-smart.start_x)+abs(current.y-smart.start_y);
			smart.flags.map=true;
			if(c_dist<smart.baby_edge || s_dist<smart.baby_edge || map.small_steps) c_moves=baby_steps;
			if(c_dist<smart.edge)
			{
				result=start;
				break;
			}
			else if(best===null || abs(current.x-smart.x)+abs(current.y-smart.y)<abs(queue[best].x-smart.x)+abs(queue[best].y-smart.y))
			{
				best=start;
			}
		}
		else if(current.map!=smart.map)
		{
			if(smart.prune.map && smart.flags.map) {start++; continue;}
			map.doors.forEach(function(door){
				// if(simple_distance({x:map.spawns[door[6]][0],y:map.spawns[door[6]][1]},{x:current.x,y:current.y})<30)
				if(smart.map!="bank" && door[4]=="bank" && !G.maps[current.map].mount || door[8]=="complicated") return; // manually patch the bank shortcut
				if(is_door_close(current.map,door,current.x,current.y) && can_use_door(current.map,door,current.x,current.y))
					qlist.push({map:door[4],x:G.maps[door[4]].spawns[door[5]||0][0],y:G.maps[door[4]].spawns[door[5]||0][1],transport:true,s:door[5]||0});
			});
			map.npcs.forEach(function(npc){
				if(npc.id=="transporter" && simple_distance({x:npc.position[0],y:npc.position[1]},{x:current.x,y:current.y})<75)
				{
					for(var place in G.npcs.transporter.places)
					{
						qlist.push({map:place,x:G.maps[place].spawns[G.npcs.transporter.places[place]][0],y:G.maps[place].spawns[G.npcs.transporter.places[place]][1],transport:true,s:G.npcs.transporter.places[place]});
					}
				}
			});
		}

		if(smart.use_town) qpush({map:current.map,x:map.spawns[0][0],y:map.spawns[0][1],town:true}); // "town"

		shuffle(c_moves);
		c_moves.forEach(function(m){
			var new_x=current.x+m[0],new_y=current.y+m[1];
			// game_log(new_x+" "+new_y);
			// utilise can_move - game itself uses can_move too - smart_move is slow as can_move checks all the lines at each step
			if(can_move({map:current.map,x:current.x,y:current.y,going_x:new_x,going_y:new_y,base:character.base}))
				qpush({map:current.map,x:new_x,y:new_y});
		});
		qlist.forEach(function(q){qpush(q);}); // So regular move's are priotised

		start++;
		if(mssince(timer)>40) return;
	}
	
	if(result===null)
	{
		result=best,optimal=false;
		game_log("Path not found!","#CF575F");
		smart.moving=false;
		smart.on_done(false,"failed");
	}
	else
	{
		plot(result);
		if(1) // [08/03/19] - to attempt and move to the actual coordinates
		{
			var last=smart.plot[smart.plot.length-1]; if(!last) last={map:character.map,x:character.real_x,y:character.real_y};
			if(smart.x!=last.x || smart.y!=last.y)
			{
				smart.try_exact_spot=true;
				smart.plot.push({map:last.map,x:smart.x,y:smart.y});
			}
		}
		smart.found=true;
		if(smart.prune.smooth) smooth_path();
		if(optimal) game_log("Path found!","#C882D1");
		else game_log("Path found~","#C882D1");
		// game_log(queue.length);
		// parent.d_text("Yes!",character,{color:"#58D685"});
	}
}

function start_pathfinding() {
  smart.searching = true;
  queue = [];
  visited = new Map();
  start = 0;
  best = null;
  qpush({
    x: character.real_x,
    y: character.real_y,
    map: character.map,
    i: -1,
  });
  bfs();
}
function is_on_cooldown(skill) {
  if (G.skills[skill] && G.skills[skill].share)
    return is_on_cooldown(G.skills[skill].share);
  if (parent.next_skill[skill] && performance.now() < parent.next_skill[skill])
    return true;
  return false;
}
function smart_move_logic() {
	if(!smart.moving) return;
	if(!smart.searching && !smart.found)
	{
		start_pathfinding();
	}
	else if(!smart.found && game.cli) { /* Just wait */ }
	else if(!smart.found)
	{
		if(Math.random()<0.1)
		{
			// move(character.real_x+Math.random()*0.0002-0.0001,character.real_y+Math.random()*0.0002-0.0001);
			// parent.d_text(shuffle(["Hmm","...","???","Definitely left","No right!","Is it?","I can do this!","I think ...","What If","Should be","I'm Sure","Nope","Wait a min!","Oh my"])[0],character,{color:shuffle(["#68B3D1","#D06F99","#6ED5A3","#D2CF5A"])[0]});
		}
		bfs();
	}
	else if(!character.moving && can_walk(character) && !is_transporting(character))
	{
		if(!smart.plot.length)
		{
			smart.moving=false;
			smart.on_done(true);
			return;
		}
		var current=smart.plot[0];
		smart.plot.splice(0,1);
		// game_log(JSON.stringify(current));
		if(current.town)
		{
			use("town");
		}
		else if(current.transport)
		{
			parent.socket.emit("transport",{to:current.map,s:current.s});
			parent.push_deferred("transport")
			// use("transporter",current.map);
		}
		else if(character.map==current.map && (smart.try_exact_spot && !smart.plot.length || can_move_to(current.x,current.y))) 
		{
			// game_log("S "+current.x+" "+current.y);
			move(current.x,current.y);
		}
		else
		{
			game_log("Lost the path...","#CF5B5B");
			if(smart.on_fail) {
				smart.on_fail({map:smart.map,x:smart.x,y:smart.y}, smart.on_done);
			} else {
				smart_move({map:smart.map,x:smart.x,y:smart.y},smart.on_done);
			}
		}
	}
}
setInterval(function () {
  smart_move_logic();
}, 80);
setInterval(function () {
  parent.character &&
    !Reflect.isPrototypeOf.call(parent.character, character) &&
    Reflect.setPrototypeOf(character, parent.character);
}, 100);

function proxy(a) {
  in_arr(a, character.properties) ||
    (character.properties.push(a),
    Object.defineProperty(character, a, {
      get: function () {
        return parent.character[a];
      },
      set: function (b) {
        delete this[a];
        character.read_only.includes(a)
          ? game_log(
              "You attempted to change the character." +
                a +
                " value manually. You have to use the provided functions to control your character!",
              colors.code_error
            )
          : (parent.character[a] = b);
      },
      enumerable: true,
    }));
}

Object.defineProperty(character,'x',{get:function(){return parent.character.real_x;},set:function(){game_log("You can't set coordinates manually, use the move(x,y) function!");},enumerable:true});
Object.defineProperty(character,'y',{get:function(){return parent.character.real_y;},set:function(){game_log("You can't set coordinates manually, use the move(x,y) function!");},enumerable:true});

function performance_trick() {}

function doneify(a, b, d) {
  return function (c, g, h, f, k, l) {
    var m = randomStr(30);
    parent.rxd = m;
    a(c, g, h, f, k, l);
    return {
      done: function (p) {
        game.once(b, function (n) {
          n.rxd == m && (p(true, n), (this.delete = true), (parent.rxd = null));
        });
        game.once(d, function (n) {
          n.rxd == m &&
            (p(false, n), (this.delete = true), (parent.rxd = null));
        });
      },
    };
  };
}
var last_loot = performance.now(),
  last_attack = performance.now(),
  last_potion = performance.now(),
  last_transport = performance.now();
