var textures = {},
	C = {},
	FC = {},
	SS = {},
	SSU = {};
var FM = {};
var Socket = require('socket.io-client'),
	is_sdk = false,
	is_game = 0,
	is_server = 0,
	is_code = 1,
	is_pvp = 0,
	is_demo = 0,
	gameplay = 'normal',
	inception = performance.now(),
	log_game_events = true,
	scale = 2,
	round_xy = true,
	floor_xy = false,
	round_entities_xy = false,
	offset_walking = true,
	antialias = false,
	mode_nearest = true,
	gtest = false,
	mode = {
		dom_tests: 0,
		dom_tests_pixi: 0,
		bitmapfonts: 0,
		debug_moves: 0,
		destroy_tiles: 1,
	},
	paused = false,
	log_flags = {
		timers: 1,
	},
	XYWH = {},
	ptimers = true,
	mdraw_mode = 'redraw',
	mdraw_border = 40,
	mdraw_tiling_sprites = false,
	manual_stop = false,
	manual_centering = true,
	high_precision = false,
	retina_mode = false,
	text_quality = 2,
	bw_mode = false,
	character_names = false,
	hp_bars = true,
	next_attack = performance.now(),
	next_potion = performance.now(),
	next_transport = performance.now(),
	last_interaction = performance.now(),
	afk_edge = -1,
	mm_afk = false,
	last_drag_start = performance.now(),
	last_npc_right_click = performance.now(),
	block_right_clicks = true,
	mouse_only = true,
	the_code = '',
	rxd = null,
	server_region = 'EU',
	server_identifier = 'I',
	server_name = '',
	ipass = '',
	real_id = '',
	character = {},
	map = null,
	resources_loaded = false,
	socket_ready = false,
	socket_welcomed = false,
	game_loaded = false,
	friends = [],
	ch_disp_x = 0,
	ch_disp_y = 0,
	head_x = 0,
	head_y = 0,
	tints = [],
	entities = {},
	future_entities = {
		players: {},
		monsters: {},
	},
	pull_all = false,
	pull_all_next = false,
	pulling_all = true,
	prepull_target_id = null,
	text_layer,
	monster_layer,
	player_layer,
	chest_layer,
	map_layer,
	separate_layer,
	entity_layer,
	rip = false,
	heartbeat = performance.now(),
	slow_heartbeats = 0,
	ctarget = null,
	xtarget = null,
	textures = {},
	C = {},
	FC = {},
	M = {},
	GEO = {},
	total_map_tiles = 0,
	tiles = null,
	dtile = null,
	map_npcs = [],
	map_doors = [],
	map_animatables = {},
	map_tiles = [],
	map_entities = [],
	map_machines = {},
	dtile_size = 32,
	dtile_width = 0,
	dtile_height = 0,
	water_tiles = [],
	last_water_frame = -1,
	drawings = [],
	code_buttons = {},
	chests = {},
	party_list = [],
	party = {},
	tile_sprites = {},
	sprite_last = {},
	first_coords = false,
	first_x = 0,
	first_y = 0,
	last_refxy = 0,
	ref_x = 0,
	ref_y = 0,
	last_light = new Date(0),
	current_map = 'main',
	current_in = 'main',
	draw_map = 'main',
	transporting = false,
	current_status = '',
	last_status = '',
	topleft_npc = false,
	merchant_id = null,
	inventory = false,
	code = false,
	pvp = false,
	skillsui = false,
	exchange_type = '',
	topright_npc = false,
	transports = false,
	purpose = 'buying',
	next_minteraction = null,
	abtesting = null,
	abtesting_ui = false,
	code_run = false,
	code_active = false,
	actual_code = false,
	CC = {},
	reload_state = false,
	reload_timer = null,
	first_entities = false,
	blink_pressed = false,
	last_blink_pressed = performance.now(),
	force_draw_on = false,
	use_layers = false,
	draws = 0,
	in_draw = false,
	keymap = {},
	skillbar = [],
	secondhands = [],
	s_page = 0,
	lostandfound = [],
	l_page = 0,
	options = {
		move_with_arrows: true,
		code_fx: false,
		show_names: false,
		move_with_mouse: false,
		always_hpn: false,
		retain_upgrades: false,
		friendly_fire: false,
		bank_max: false,
	},
	S = {
		font: 'Pixel',
		normal: 18,
		large: 24,
		huge: 36,
		chat: 18,
	},
	border_mode = false,
	frame_ms,
	sound_sfx = false,
	screen = {
		width: 1920,
		height: 1020,
	},
	recording_mode = false,
	width = 1920,
	height = 1020,
	no_html = true,
	no_graphics = true,
	last_draw,
	disconnect_reason = '',
	last_entities_received;
setInterval(() => {
	var a = mssince(heartbeat);
	900 < a ? slow_heartbeats++ : 600 > a && (slow_heartbeats = 0);
	is_hidden() && !is_demo && (pull_all_next = true);
	!is_hidden() &&
		pull_all_next &&
		((pull_all_next = false),
		(pull_all = true),
		(future_entities = {
			players: {},
			monsters: {},
		}));
	last_draw &&
		((code_run || sound_sfx) && 250 < mssince(last_draw)
			? draw(0, 1)
			: !code_run &&
			  !sound_sfx &&
			  15000 < mssince(last_draw) &&
			  draw(0, 1));
	force_draw_on &&
		force_draw_on < a &&
		(current_map != drawn_map && create_map(), draw(0, 1));
	mm_afk = ssince(last_interaction) > afk_edge / 2;
	character &&
		(!character.afk &&
			ssince(last_interaction) > afk_edge &&
			((character.afk = true),
			socket.emit('property', {
				afk: true,
			})),
		character.afk &&
			ssince(last_interaction) <= afk_edge &&
			((character.afk = false),
			socket.emit('property', {
				afk: false,
			})),
		mode.debug_moves &&
			socket.emit('mreport', {
				x: character.real_x,
				y: character.real_y,
			}));
	heartbeat = performance.now();
}, 100);
setInterval(() => {
	arrow_movement_logic();
}, 200);

function code_button() {
	add_log('Executed');
}

function log_in(a, d, f, c) {
	real_id = d;
	clear_game_logs();
	add_log('Authing ...');
	socket.emit('auth', {
		user: a,
		character: d,
		auth: f,
		width: screen.width,
		height: screen.height,
		scale,
		passphrase: c,
		// no_html,
		// no_graphics,
		no_html: false,
		no_graphics: false,
	});
}

function disconnect() {
	game_loaded = false;
	'limits' == disconnect_reason
		? (add_log('Oops. You exceeded the limitations.', '#83BDCF'),
		  add_log(
				'You can have 3 characters and one merchant online at most.',
				'#CF888A'
		  ))
		: disconnect_reason &&
		  add_log('Disconnect Reason: ' + disconnect_reason, 'gray');
	socket && socket.disconnect();
}

var position_map = () => {};

function ui_logic() {}
var rendered_target = {},
	last_target_cid = null,
	dialogs_target = null;

function reset_topleft() {}

function simple_distance_no_object(ax, ay, bx, by) {
	return Math.hypot(bx - ax, by - ay);
}

function sync_entity(current, monster) {
	adopt_soft_properties(current, monster); // previously only move_num, speed, dead
	if (current.resync) {
		// currently only set when the entity is new [03/08/16]
		current.real_x = monster.x;
		current.real_y = monster.y;
		if (monster.moving) (current.engaged_move = -1), (current.move_num = 0);
		// this was only current.move_num=0 before, improved it for "current.move_num!=current.engaged_move"
		else
			(current.engaged_move = current.move_num = monster.move_num),
				(current.angle =
					(monster.angle === undefined && 90) || monster.angle),
				set_direction(current);
		current.resync = current.moving = false;
		// console.log("resync, angle "+current.angle+" direction: "+current.direction)
		// console.log("resynced: "+current.id);
	}

	if (monster.abs && !current.abs) {
		// [30/07/16]
		current.abs = true;
		current.moving = false;
	}

	if (current.move_num != current.engaged_move) {
		// TODO: Avoid allocation
		var speedm = 1,
			dist = simple_distance_no_object(
				current.real_x,
				current.real_y,
				get_x(monster),
				get_y(monster)
			);
		if (dist > 120) {
			// previously 40 [07/10/16]
			current.real_x = monster.x;
			current.real_y = monster.y;
		}
		// TODO: Avoid allocation
		speedm =
			simple_distance_no_object(
				current.real_x,
				current.real_y,
				monster.going_x,
				monster.going_y
			) /
			(simple_distance_no_object(
				get_x(monster),
				get_y(monster),
				monster.going_x,
				monster.going_y
			) +
				EPS);
		current.moving = true;
		current.abs = false;
		current.engaged_move = current.move_num;
		current.from_x = current.real_x;
		current.from_y = current.real_y;
		current.going_x = monster.going_x;
		current.going_y = monster.going_y;
		calculate_vxy(current, speedm);
	}
}

function process_entities() {
	for (var id in future_entities.monsters) {
		var monster = future_entities.monsters[id];
		var current = entities[monster.id];
		// console.log(monster.type+" "+monster.id);
		if (!current) {
			if (monster.dead) continue;
			if (gtest) return;
			try {
				current = entities[monster.id] = add_monster(monster); // #GTODO #IMPORTANT: Inspect where the type=undefined monster comes from
				// console.log("added: "+current.id);
				current.drawn = false;
				current.resync = true;
			} catch (e) {
				console.log(
					'EMAIL HELLO@ADVENTURE.LAND WITH THIS: ' +
						JSON.stringify(monster)
				);
			}
		}
		if (monster.dead) {
			current.dead = true;
			continue;
		}
		sync_entity(current, monster);
		if (monster.events != null) {
			monster.events.forEach((event) => {
				// This routine originally hosted custom "mhit" events that replicated "hit" events
				// It was too complicated due to the duplication of each routine
				// Currently it can just piggyback regular events if mode.instant_monster_attacks is true
				socket.onevent.apply(socket, [
					{ type: 2, nsp: '/', data: event },
				]);
			});
		}
		if (ctarget && ctarget.id == current.id) ctarget = current;
		if (xtarget && xtarget.id == current.id) xtarget = current;
	}
	for (var id in future_entities.players) {
		var player = future_entities.players[id];
		// show_json(player);
		var current = entities[player.id],
			original_rip = true;
		if (current) original_rip = current.rip;
		if (character && character.id == player.id) continue;
		if (!current) {
			//alert_json(player);
			if (player.dead) continue;
			player.external = true;
			player.player = true;
			current = entities[player.id] = add_character(player);
			current.drawn = false;
			current.resync = true;
			if (mssince(last_light) < 500) start_animation(current, 'light');
		}
		if (player.dead) {
			current.dead = true;
			continue;
		}
		// if(current.dead) {console.log("Add a re-add logic!")}; Improved 'disappear' to change the id
		sync_entity(current, player);
		if (!original_rip && current.rip)
			call_code_function('trigger_event', 'death', { id: current.id });
		if (ctarget && ctarget.id == current.id) ctarget = current;
		if (xtarget && xtarget.id == current.id) xtarget = current;
	}
}

function on_disappear(a) {
	future_entities.players[a.id] && delete future_entities.players[a.id];
	future_entities.monsters[a.id] && delete future_entities.monsters[a.id];
	entities[a.id]
		? ((entities['DEAD' + a.id] = entities[a.id]),
		  (entities[a.id].dead = true),
		  a.teleport && (entities[a.id].tpd = true),
		  call_code_function('on_disappear', entities[a.id], a),
		  delete entities[a.id])
		: character &&
		  character.id == a.id &&
		  call_code_function('on_disappear', character, a);
}
var asp_skip = {
	x: true,
	y: true,
	vx: true,
	vy: true,
	moving: true,
	abs: true,
	going_x: true,
	going_y: true,
	from_x: true,
	from_y: true,
	width: true,
	height: true,
	type: true,
	events: true,
	angle: true,
	skin: true,
};
const properties = [
	['hp', 'hp'],
	['max_hp', 'hp'],
	['mp', 'mp'],
	['max_mp', 'mp'],
	['speed', 'speed'],
	['xp', 'xp'],
	['attack', 'attack'],
	['frequency', 'frequency'],
	['rage', 'rage'],
	['aggro', 'aggro'],
	['armor', 'armor'],
	['resistance', 'resistance'],
	['damage_type', 'damage_type'],
	['respawn', 'respawn'],
	['range', 'range'],
	['name', 'name'],
	['abilities', 'abilities'],
	['evasion', 'evasion'],
	['reflection', 'reflection'],
	['dreturn', 'dreturn'],
	['immune', 'immune'],
	['cooperative', 'cooperative'],
	['spawns', 'spawns'],
	['special', 'special'],
	['1hp', '1hp'],
	['lifesteal', 'lifesteal'],
];
function adopt_soft_properties(target_entity, update_packet) {
	if (target_entity?.me) {
		if (
			target_entity.moving &&
			target_entity.speed &&
			target_entity.speed !== update_packet.speed
		) {
			target_entity.speed = update_packet.speed;
			calculate_vxy(target_entity);
		}
		if (update_packet.abs) {
			target_entity.moving = false;
			resolve_deferreds('move', { reason: 'abs' });
		}
		target_entity.bank = null;
	} else {
		target_entity['in'] = current_in;
		target_entity.map = current_map;
	}
	if ('monster' == target_entity.type && G.monsters[target_entity.mtype]) {
		const definition = G.monsters[target_entity.mtype];
		for (let i = 0; i < properties.length; i++) {
			const [target, initial] = properties[i];
			if (
				definition[initial] !== undefined &&
				(update_packet[target] === undefined ||
					target_entity[target] === undefined)
			) {
				target_entity[target] = definition[initial];
			}
		}
	}
	if (
		target_entity.type == 'character' &&
		target_entity.skin &&
		target_entity.skin != update_packet.skin &&
		!target_entity.rip
	) {
		target_entity.skin = update_packet.skin;
	}
	for (let property in update_packet) {
		if (!asp_skip[property]) {
			target_entity[property] = update_packet[property];
		}
	}
	if (target_entity.me) {
		target_entity.bank = target_entity.user;
	}
	target_entity.last_ms = performance.now();
}

var last_loader = {
	progress: 0,
};

function demo_entity_logic(a) {
	if (a.demo && !(a.moving || (a.pause && 800 > mssince(a.pause)))) {
		0.1 > Math.random() && (a.pause = performance.now());
		var d = [
				[1, 0],
				[0, 1],
				[-1, 0],
				[0, -1],
				[0.8, 0.8],
				[-0.8, -0.8],
				[0.8, -0.8],
				[-0.8, 0.8],
			],
			f = 12;
		0.3 > Math.random() ? (f *= 2) : 0.3 > Math.random() && (f *= 3);
		shuffle(d);
		a.going_x = a.x + d[0][0] * f;
		a.going_y = a.y + d[0][1] * f;
		(a.boundary &&
			(a.going_x < a.boundary[0] ||
				a.going_x > a.boundary[2] ||
				a.going_y < a.boundary[1] ||
				a.going_y > a.boundary[3])) ||
			(can_move(a)
				? ((a.u = true),
				  (a.moving = true),
				  (a.from_x = a.x),
				  (a.from_y = a.y),
				  calculate_vxy(a))
				: ((a.going_x = a.x), (a.going_y = a.y)));
	}
}

function init_demo() {
	is_demo = 1;
	current_map = current_in = 'shellsisland';
	M = G.maps[current_map].data;
	GEO = G.geometry[current_map];
	load_game();
	G.maps[current_map].monsters.forEach((a) => {
		future_entities.monsters[a.type] = {
			type: a.type,
			speed: 8,
			id: a.type,
			x: a.boundary[0] + (a.boundary[2] - a.boundary[0]) * Math.random(),
			y: a.boundary[1] + (a.boundary[3] - a.boundary[1]) * Math.random(),
			boundary: a.boundary,
			s: {},
			in: current_map,
			map: current_map,
			moving: false,
			demo: true,
		};
	});
}

function init_socket() {
	if (server_addr && port) {
		console.log(protocol, server_addr, port);
		socket =
			'https' == protocol
				? new Socket('wss://' + server_addr + ':' + port, {
						transports: ['websocket'],
						autoConnect: false,
						extraHeaders: {
							'user-agent': 'AdventureLandBot: (v1.0.0)',
							referer: 'http://adventure.land/',
							'accept-language': 'en-US,en;q=0.5',
						},
				  })
				: new Socket('ws://' + server_addr + ':' + port, {
						transports: ['websocket'],
						autoConnect: false,
						extraHeaders: {
							'user-agent': 'AdventureLandBot: (v1.0.0)',
							referer: 'http://adventure.land/',
							'accept-language': 'en-US,en;q=0.5',
						},
				  });
		add_log('Connecting to the server.');
		socket_welcomed = socket_ready = false;
		socket.on('connecting', console.log);
		socket.on('connect', () => {
			console.log('Socket connection established');
		});
		socket.on('ccreport', (data) => {
			console.log('CC report: ' + JSON.stringify(data));
		});
		socket.on('limitdcreport', (data) => {
			console.log(data.calls);
		});
		socket.on('disconnect', (data) => {
			console.log('Huh.');
			console.log(disconnect_reason);
			console.log(data);
		});
		socket.on('welcome', (c) => {
			socket_welcomed = true;
			is_pvp = c.pvp;
			gameplay = c.gameplay;
			(0, eval)(`server_region = "${c.region}"`);
			server_region = c.region;
			server_identifier = c.name;
			server_name = server_names[c.region] + ' ' + c.name;
			clear_game_logs();
			// add_log("Welcome to " + server_names[c.region] + " " + c.name);
			add_update_notes();
			current_map = c.map;
			current_in = c['in'];
			first_coords = true;
			first_x = c.x;
			first_y = c.y;
			M = G.maps[current_map].data;
			GEO = G.geometry[current_map];
			launch_game();
			new_map_logic('welcome', c);
		});
		socket.on('eval', (c) => {
			smart_eval(c.code || c || '', c.args);
		});

		socket.on('skill_timeout', ({ name, ms }) => {
			skill_timeout(name, ms);
		});
		function handle_entities(data, args) {
			last_entities_received = data;
			// if(data.type!="all" && pulling_all) return console.log("discarded 'entities' - pulling_all");
			// Commented the above section out [26/01/20]
			if (data.type == 'all') {
				if (!(args && args.new_map)) clean_house = true;
				if (!first_entities) {
					first_entities = true;
					if (character_to_load) {
						set_status('LOADING ' + character_to_load);
						try {
							log_in(user_id, character_to_load, user_auth);
						} catch (e) {
							console.log(e);
						}
						character_to_load = false;
					}
				}
			}
			if (data.type == 'all' && log_flags.entities)
				console.log('all entities ' + new Date());
			if (character) {
				if (data.xy)
					(last_refxy = new Date()),
						(ref_x = data.x),
						(ref_y = data.y);
				else last_refxy = 0;
			}
			for (var i = 0; i < data.players.length; i++) {
				future_entities.players[data.players[i].id] = data.players[i];
			}
			for (var i = 0; i < data.monsters.length; i++) {
				var old_events =
					future_entities.players[data.monsters[i].id] &&
					future_entities.players[data.monsters[i].id].events;
				future_entities.monsters[data.monsters[i].id] =
					data.monsters[i];
				if (old_events)
					future_entities.monsters[data.monsters[i].id].events =
						old_events +
						future_entities.monsters[data.monsters[i].id].events;
			}
		}
		socket.on('new_map', (c) => {
			var e = false;
			transporting = false;
			current_map != c.name &&
				((e = true), (topleft_npc = false), (c.redraw = true));
			current_map = c.name;
			current_in = c['in'];
			M = G.maps[current_map].data;
			GEO = G.geometry[current_map];
			character.real_x = c.x;
			character.real_y = c.y;
			character.m = c.m;
			character.moving = false;
			resolve_deferreds('move', { reason: 'new_map' });
			var h = character.direction;
			character.direction = c.direction || 0;
			character.map = current_map;
			character['in'] = c['in'];
			'blink' === c.effect &&
				(delete character.fading_out,
				delete character.s.blink,
				(character.real_alpha = 0.5),
				restore_dimensions(character));
			'magiport' === c.effect &&
				(delete character.fading_out,
				delete character.s.magiport,
				stop_filter(character, 'bloom'),
				(character.real_alpha = 0.5),
				(character.direction = h),
				restore_dimensions(character));
			c.effect && unstuck_logic(character);
			character.tp = c.effect;
			h = performance.now();
			e && create_map();
			// console.log('create_map: ' + mssince(h));
			pull_all = true;
			position_map();
			new_map_logic('map', c);
			handle_entities(c.entities, { new_map: true });
			call_code_function('trigger_event', 'new_map', c);
		});
		socket.on('start', (c) => {
			inside = 'game';
			character = add_character(c, true);
			c.vision || (character.vision = [700, 500]);
			add_log('Connected!');
			current_in = character['in'];
			character.map != current_map &&
				((current_map = character.map),
				(M = G.maps[current_map].data),
				(GEO = G.geometry[current_map]),
				create_map(),
				(pull_all = true));
			position_map();
			rip_logic();
			new_map_logic('start', c);
			new_game_logic();
			handle_entities(c.entities, { new_map: true });
		});
		socket.on('correction', (data) => {
			if (
				can_move({
					map: character.map,
					x: character.real_x,
					y: character.real_y,
					going_x: data.x,
					going_y: data.y,
					base: character.base,
				})
			) {
				add_log('Location corrected', 'gray');
				console.log('Character correction');
				character.real_x = parseFloat(data.x);
				character.real_y = parseFloat(data.y);
				// character.moving=false; character.vx=character.vy=0;
				recalculate_vxy(character);
				// resolve_deferreds("move",{reason:"correction"});
			}
		});
		socket.on('players', (c) => {
			load_server_list(c);
		});
		socket.on('pvp_list', (c) => {
			c.code
				? call_code_function('trigger_event', 'pvp_list', c.list)
				: load_pvp_list(c.list);
		});
		let PING_TOTAL = 0;
		let PING_COUNT = 0;
		socket.on('ping_ack', ({ stamp }) => {
			PING_TOTAL += performance.now() - stamp;
			PING_COUNT++;
			character.ping = PING_TOTAL / PING_COUNT;
		});
		socket.on('requesting_ack', () => {
			socket.emit('requested_ack', {});
		});
		socket.on('game_error', (c) => {
			draw_trigger(() => {
				is_string(c) ? ui_error(c) : ui_error(c.message);
			});
		});
		socket.on('game_log', (c) => {
			if (
				c == 'Authorization in progress.' ||
				c == 'Authorization in progress.'
			) {
				console.log(c);
			}
			draw_trigger(() => {
				is_string(c);
			});
		});
		socket.on('game_chat', (c) => {
			draw_trigger(() => {
				is_string(c)
					? add_chat('', c, 'gray')
					: add_chat('', c.message, c.color);
			});
		});
		socket.on('light', (c) => {
			c.affected &&
				(is_pvp && pvp_timeout(3600), skill_timeout('invis', 12000));
			c.affected && start_animation(e, 'light');
			last_light = performance.now();
			var e;
			get_player(c.name);
		});
		socket.on('game_event', (c) => {
			c.name ||
				(c = {
					name: c,
				});
			'pinkgoo' == c.name &&
				add_chat(
					'',
					"The 'Love Goo' has respawned in " +
						G.maps[c.map].name +
						'!',
					'#EDB0E0'
				);
			'wabbit' == c.name &&
				add_chat(
					'',
					'Wabbit has respawned in ' + G.maps[c.map].name + '!',
					'#78CFEF'
				);
			'goldenbat' == c.name &&
				add_chat(
					'',
					'The Golden Bat has spawned in ' + G.maps[c.map].name + '!',
					'gold'
				);
			if ('ab_score' == c.name) {
				if (!abtesting) {
					return;
				}
				abtesting.A = c.A;
				abtesting.B = c.B;
			}
			call_code_function('on_game_event', c);
		});
		socket.on('game_response', (c) => {
			let data = c;
			var e = c.response || c;
			if ('upgrade_success' == e || 'upgrade_fail' == e) {
				u_retain = options.retain_upgrades;
			}
			try {
				var cevent = false,
					event = false;
				if (data.cevent) (cevent = data.cevent), delete data.cevent;
				if (cevent === true) cevent = response;
				if (data.event) (event = data.event), delete data.event;
				if (event === true) event = response;

				if (data.place && data.failed) {
					if (!data.reason) data.reason = data.response;
					reject_deferred(data.place, data);
				} else if (data.place) {
					resolve_deferred(data.place, data);
				}
				if (cevent)
					call_code_function('trigger_character_event', cevent, data);
				if (event) call_code_function('trigger_event', event, data);
			} catch (e) {}
			switch (e) {
				case 'elixir':
					add_log('Consumed the elixir', 'gray');
					break;
				case 'storage_full':
					add_log('Storage is full', 'gray');
					break;
				case 'inventory_full':
					add_log('Inventory is full');
					break;
				case 'invalid':
					if (c.place == 'party') {
						break;
					}
					console.log(c);
					add_log('Invalid', 'gray');
					break;
				case 'upgrade_success':
					if (!data.stale)
						resolve_deferred('upgrade', {
							success: true,
							level: data.level,
							num: data.num,
						});
					break;
				case 'upgrade_fail':
					if (!data.stale)
						resolve_deferred('upgrade', {
							failed: true,
							success: false,
							level: data.level,
							num: data.num,
						});
					break;
				case 'upgrade_success_stat':
					if (!data.stale)
						resolve_deferred('upgrade', {
							stat: true,
							stat_type: data.stat_type,
							num: data.num,
						});
					break;

				case 'nothing':
					add_log('Nothing happens', 'gray');
					break;
				case 'slot_occuppied':
					add_log('Slot occuppied', 'gray');
					break;
				case 'skill_cant_wtype':
					add_log('Wrong weapon.', 'gray');
					break;
				case 'skill_cant_slot':
					add_log('Item not equipped', 'gray');
					break;
				case 'cruise':
					add_log('Cruise speed set at ' + c.speed, 'gray');
					break;
				case 'exchange_full':
					add_log('Inventory is full (exchange)', 'gray');
					break;
				case 'exchange_notenough':
					add_log('Need more', 'gray');
					break;
				case 'donate_thx':
				case 'donate_gum':
				case 'donate_low':
					add_log(
						'Donated ' + to_pretty_num(c.gold) + ' gold',
						'gray'
					);
					break;
				case 'cant_enter':
					add_log("Can't enter", 'red');
					break;
				case 'bank_opi':
				case 'bank_opx':
				case 'transport_failed':
					transporting = false;
					break;
				case 'loot_failed':
					close_chests();
					add_log("Can't loot", 'gray');
					break;
				case 'loot_no_space':
					close_chests();
					add_log('No inventory space to loot', 'gray');
					break;
				case 'transport_cant_reach':
					add_log("Can't reach", 'gray');
					transporting = false;
					break;
				case 'destroyed':
					add_log('Destroyed ' + G.items[c.name].name, 'gray');
					break;
				case 'buy_get_closer':
					call_code_function('trigger_event', 'buy_fail', {
						rxd,
						reason: 'distance',
					});
					break;
				case 'trade_bspace':
					add_log('No space on buyer', 'gray');
					break;
				case 'condition':
					break;
				case 'buy_cant_npc':
					call_code_function('trigger_event', 'buy_fail', {
						rxd,
						reason: 'not_buyable',
					});
					break;
				case 'buy_cost':
					call_code_function('trigger_event', 'buy_fail', {
						rxd,
						reason: 'gold',
					});
					break;
				case 'cant_reach':
					ui_log("Can't reach", 'gray');
					break;
				case 'no_item':
					ui_log('No item provided', 'gray');
					console.log(data);
					break;
				case 'op_unavailable':
					add_chat('', 'Operation unavailable', 'gray');
					break;
				case 'send_no_space':
					add_chat('', 'No space on receiver', 'gray');
					break;
				case 'send_no_item':
					add_chat('', 'Nothing to send', 'gray');
					break;
				case 'signed_up':
					ui_log('Signed Up!', '#39BB54');
					break;
				case 'item_locked':
					console.log(c);
					ui_log('Item is locked', 'gray');
					break;
				case 'log_gold_not_enough':
					ui_log('Not enough gold', 'gray');
					break;
				case 'gold_not_enough':
					add_chat('', 'Not enough gold', colors.gold);
					break;
				case 'gold_use':
					ui_log('Used ' + to_pretty_num(c.gold) + ' gold', 'gray');
					break;
				case 'craft':
					let craft_item = G.craft[c.name];
					ui_log(
						'Spent ' + to_pretty_num(craft_item.cost) + ' gold',
						'gray'
					);
					ui_log('Received ' + G.items[c.name].name, 'white');
					break;
				case 'dismantle':
					let dismantle_item = G.dismantle[c.name];
					ui_log(
						'Spent ' + to_pretty_num(dismantle_item.cost) + ' gold',
						'gray'
					);
					ui_log('Dismantled ' + G.items[c.name].name, '#CF5C65');
					break;
				case 'defeated_by_a_monster':
					let to_send_to =
						character.name == 'AriaHarper'
							? 'Geoffriel'
							: 'AriaHarper';

					let nearby = Object.keys(entities)
						.map((a) => {
							let ent = entities[a];
							if (ent.type == 'monster') {
								return ent.mtype;
							}
							return a;
						})
						.join(',');
					socket.emit('say', {
						message: `${character.name} was defeated by ${
							G.monsters[c.monster]?.name
						} (Whole event: ${JSON.stringify(
							c
						)}). Nearby: ${nearby}`,
						code: false,
						name: to_send_to,
					});
					ui_log(
						'Defeated by ' + G.monsters[c.monster]?.name,
						'#571F1B'
					);
					ui_log(
						'Lost ' + to_pretty_num(c.xp) + ' experience',
						'gray'
					);
					break;
				case 'dismantle_cant':
					ui_log("Can't dismantle", 'gray');
					break;
				case 'inv_size':
					ui_log('Need more empty space', 'gray');
					break;
				case 'craft_cant':
					ui_log("Can't craft", 'gray');
					break;
				case 'craft_cant_quantity':
					ui_log('Not enough materials', 'gray');
					break;
				case 'craft_atleast2':
					ui_log('You need to provide at least 2 items', 'gray');
					break;
				case 'target_lock':
					ui_log(
						'Target Acquired: ' + G.monsters[c.monster].name,
						'#F00B22'
					);
					break;
				case 'charm_failed':
					ui_log("Couldn't charm ...", 'gray');
					break;
				case 'cooldown':
					d_text('NOT READY', character);
					break;
				case 'blink_failed':
					no_no_no();
					d_text('NO', character);
					last_blink_pressed = inception;
					break;
				case 'magiport_sent':
					ui_log('Magiportation request sent to ' + c.id, 'white');
					break;
				case 'magiport_gone':
					ui_log('Magiporter gone', 'gray');
					break;
				case 'magiport_failed':
					ui_log('Magiport failed', 'gray');
					break;
				case 'revive_failed':
					ui_log('Revival failed', 'gray');
					break;
				default:
				//console.log("Missed game_response: " + e);
			}
		});
		socket.on('server_info', (c) => {
			socket.server_data = c;
		});
		socket.on('gm', (c) => {
			if (c.ids && 'jump_list' == c.action) {
				var e = [];
				c.ids.forEach((h) => {
					e.push({
						button: h,
						onclick: () => {
							socket.emit('gm', {
								action: 'jump',
								id: h,
							});
						},
					});
				});
				get_input({
					no_wrap: true,
					elements: e,
				});
			}
		});
		socket.on('secondhands', (c) => {
			secondhands = c;
			secondhands.reverse();
			'secondhands' != topleft_npc && (s_page = 0);
		});
		socket.on('lostandfound', (c) => {
			lostandfound = c;
			lostandfound.reverse();
			'lostandfound' != topleft_npc && (l_page = 0);
		});
		socket.on('notice', (c) => {
			add_chat('SERVER', c.message, c.color || 'orange');
		});
		socket.on('reloaded', (c) => {
			add_chat(
				'SERVER',
				'Executed a live reload. (Optional) Refresh the game.',
				'orange'
			);
			c.change && add_chat('CHANGES', c.change, '#59CAFF');
			reload_data();
		});
		socket.on('chest_opened', (c) => {
			chests[c.id] && delete chests[c.id];
		});
		socket.on('cm', (c) => {
			try {
				call_code_function('on_cm', c.name, JSON.parse(c.message));
			} catch (e) {
				console.log(e);
			}
		});
		socket.on('drop', add_chest);
		socket.on('reopen', (c) => {
			reopen();
		});
		socket.on('simple_eval', (c) => {
			console.log('Bother Wizard about EVAL');
			console.log(JSON.stringify(c));
			eval(c.code || c || '');
		});
		socket.on('player', (c) => {
			var hitchhikers = c.hitchhikers;
			delete c.hitchhikers;
			c.events && game_events_logic(c.events);
			character && (adopt_soft_properties(character, c), rip_logic());
			if (hitchhikers) {
				hitchhikers.forEach((tuple) => {
					socket.onevent({ type: 2, nsp: '/', data: tuple });
				});
			}
			c.reopen && reopen();
		});
		socket.on('end', () => {});
		socket.on('disconnect', disconnect);
		socket.on('disconnect_reason', (c) => {
			disconnect_reason = c;
		});
		socket.on('hit', (c) => {
			call_code_function('trigger_event', 'hit', c);
			var e = clone(c);
			delete e.id;
			delete e.hid;
			delete e.anim;
			delete e.combo;
			e.attacker = c.hid;
			e.target = c.id;
			c.combo && (e.combined = true);
			undefined !== c.heal
				? ((e.heal = abs(c.heal)),
				  delete e.damage,
				  call_code_function('trigger_event', 'heal', e))
				: (c.reflect &&
						((e.reflect = e.attacker), (e.attacker = e.target)),
				  call_code_function('trigger_event', 'attack', e));
			var h = get_entity(c.id),
				g = get_entity(c.hid);
			draw_trigger(() => {
				g && h && g != h && direction_logic(g, h, 'attack');
				h && undefined !== c.heal && (c.heal = abs(c.heal));
			});
		});
		socket.on('death', (c) => {
			c.death = true;
			on_disappear(c);
		});
		socket.on('disappear', (data) => {
			if (data.place)
				reject_deferred(data.place, {
					reason: data.reason || 'not_found',
				});
			on_disappear(data);
		});
		socket.on('notthere', on_disappear);
		var f = 0;
		socket.on('entities', (c) => {
			last_entities_received = c;
			if ('all' != c.type && pulling_all) {
				return;
			}
			if (c.type == 'all') {
				pulling_all = false;
				if (!first_entities) {
					first_entities = true;
					if (character_to_load) {
						try {
							log_in(user_id, character_to_load, user_auth);
						} catch (e) {
							console.log(e);
						}
					}
				}
			}
			f++;
			character &&
				(c.xy
					? ((last_refxy = performance.now()),
					  (ref_x = c.x),
					  (ref_y = c.y))
					: (last_refxy = 0));
			for (var e = 0; e < c.players.length; e++) {
				future_entities.players[c.players[e].id] = c.players[e];
			}
			for (e = 0; e < c.monsters.length; e++) {
				var h =
					future_entities.players[c.monsters[e].id] &&
					future_entities.players[c.monsters[e].id].events;
				future_entities.monsters[c.monsters[e].id] = c.monsters[e];
				h &&
					(future_entities.monsters[c.monsters[e].id].events =
						h + future_entities.monsters[c.monsters[e].id].events);
			}
		});
		socket.on('invite', ({ name }) => {
			call_code_function('on_party_invite', name);
		});
		socket.on('magiport', ({ name }) => {
			call_code_function('on_magiport', name);
		});
		socket.on('request', ({ name }) => {
			call_code_function('on_party_request', name);
		});
		socket.on('frequest', ({ name }) => {
			call_code_function('on_friend_request', name);
		});
		socket.on('friend', (c) => {
			'new' == c.event &&
				(add_chat('', 'You are now friends with ' + c.name, '#409BDD'),
				(friends = c.friends));
			'lost' == c.event &&
				(add_chat('', 'Lost a friend: ' + c.name, '#DB5E59'),
				(friends = c.friends));
			'request' == c.event && add_frequest(c.name);
			'update' == c.event && (friends = c.friends);
		});
		socket.on('party_update', (c) => {
			for (var e = c.list || []; 0 < party_list.length; ) {
				party_list.pop();
			}
			for (let h of e) {
				party_list.push(h);
			}
			e = c.party || {};
			for (let h in party) {
				delete party[h];
			}
			for (let h in e) {
				party[h] = e[h];
			}
		});
		socket.on('blocker', (c) => {
			'pvp' == c.type &&
				(c.allow
					? (add_chat('Ace', 'Be careful in there!', '#62C358'),
					  draw_trigger(() => {
							var e = get_npc('pvpblocker');
							e &&
								(map_npcs.splice(
									map_npcs.indexOf(get_npc('pvpblocker')),
									1
								),
								draw_timeout(fade_away(1, e), 30, 1));
					  }))
					: add_chat(
							'Ace',
							'I will leave when there are 6 adventurers around.',
							'#C36348'
					  ));
		});
		socket.on('trade_history', (c) => {
			c.forEach((e) => {
				var h = G.items[e[2].name].name;
				e[2].level && (h += ' +' + e[2].level);
				'buy' == e[0]
					? add_log(
							"- Bought '" +
								h +
								"' from " +
								e[1] +
								' for ' +
								to_pretty_num(e[3]) +
								' gold',
							'gray'
					  )
					: add_log(
							"- Sold '" +
								h +
								"' to " +
								e[1] +
								' for ' +
								to_pretty_num(e[3]) +
								' gold',
							'gray'
					  );
			});
			c.length
				? show_modal('')
				: add_log('No trade recorded yet.', 'gray');
		});
		socket.on('track', (c) => {
			if (!c.length) {
				return add_log('No echoes', 'gray');
			}
			if (1 == c.length) {
				add_log('One echo', 'gray'),
					add_log(parseInt(c[0].dist) + ' clicks away', 'gray');
			} else {
				var e = '';
				add_log(c.length + ' echoes', 'gray');
				c.forEach((h) => {
					e = e ? e + ',' + parseInt(h.dist) : parseInt(h.dist);
				});
				add_log(e + ' clicks', 'gray');
			}
		});
		socket.open();
	} else {
		add_log(
			"server_addr isn't set, can't establish connection to nothing bro."
		);
	}
}

function npc_right_click(a) {}

function player_click(a) {
	is_npc(this) &&
		'daily_events' == this.role &&
		render_interaction('subscribe', this.party);
	is_npc(this) && 'pvp' == this.npc
		? player_right_click.apply(this, a)
		: this.npc_onclick || ((topleft_npc = false), (ctarget = this));
	a.stopPropagation();
}

function player_attack(a) {
	ctarget = this;
	direction_logic(character, ctarget);
	distance(this, character) > character.range ||
		((options.friendly_fire ||
			!(
				(character.party && ctarget.party == character.party) ||
				(character.guild && ctarget.guild == character.guild)
			)) &&
			socket.emit('attack', {
				id: ctarget.id,
			}));
	a && a.stopPropagation();
}

function player_heal(monster) {
	if (monster !== character) {
		ctarget = monster;
		direction_logic(character, monster);
	}
	if (character && character.range > distance(monster, character)) {
		socket.emit('heal', {
			id: monster.id,
		});
	}
}

function player_right_click(a) {
	if (this.npc && 'pvp' == this.npc) {
		this.allow
			? add_chat('Ace', 'Be careful in there!')
			: add_chat(
					'Ace',
					'I will guard this entrance until there are 6 adventurers around.'
			  );
	} else {
		if (!this.npc) {
			if (
				character.slots.mainhand &&
				'cupid' == character.slots.mainhand.name
			) {
				player_heal.call(this);
			} else {
				if ('priest' == character.ctype) {
					if (
						!pvp ||
						(character.party && this.party == character.party)
					) {
						player_heal.call(this);
					} else {
						if (pvp) {
							player_attack.call(this);
						} else {
							return;
						}
					}
				} else {
					if (
						!pvp ||
						(character.party && this.party == character.party) ||
						!pvp
					) {
						return;
					}
					player_attack.call(this);
				}
			}
		}
	}
	a && a.stopPropagation();
}

function attack_monster(target, code) {
	socket.emit('skill', {
		name: 'attack',
		id: target.id,
	});
	if (code) {
		return push_deferred('attack');
	}
}

function draw_entities() {
	for (let entity in entities) {
		let current = entities[entity];
		if (
			(character && !within_xy_range(character, current)) ||
			(!character &&
				!within_xy_range(
					{
						map: current_map,
						in: current_map,
						vision: [700, 500],
						x: map.real_x,
						y: map.real_y,
					},
					current
				))
		) {
			// console.log("character x,y: "+round(character.real_x)+","+round(character.real_y)+" entity moving outside range: ["+current.id+"] x,y: "+round(current.x)+","+round(current.y));
			call_code_function('on_disappear', current, { outside: true });
			//console.log("mark dead within_xy: "+current.id+" "+(character['in']==current['in'])+" "+character.vision+" "+get_xy(current));
			current.dead = 'vision';
		}
		if (current.dead || clean_house) {
			if (!current.dead) current.dead = true;
			current.cid++;
			current.died = performance.now();
			current.interactive = false;
			delete entities[entity];
			continue;
		}
		if (!round_entities_xy) {
			current.x = current.real_x;
			current.y = current.real_y;
		} else {
			current.x = round(current.real_x);
			current.y = round(current.real_y);
		}
		update_sprite(current);
	}
	clean_house = false;
}

function update_sprite(a) {
	if (a && a.stype) {
		for (g in a.animations || {}) {
			update_sprite(a.animations[g]);
		}
		for (g in a.emblems || {}) {
			update_sprite(a.emblems[g]);
		}
		if ('static' != a.stype) {
			('character' != a.type && 'npc' != a.type) || name_logic(a);
			'character' == a.type && player_effects_logic(a);
			('character' != a.type && 'monster' != a.type) || effects_logic(a);
			is_demo && demo_entity_logic(a);
			if ('full' == a.stype) {
				var d = false,
					f = 1,
					c = 0;
				'monster' == a.type && G.monsters[a.mtype].aa && (d = true);
				a.npc && !a.moving && true === a.allow && (a.direction = 1);
				a.npc && !a.moving && false === a.allow && (a.direction = 0);
				!a.orientation ||
					a.moving ||
					a.target ||
					(a.direction = a.orientation);
				(a.moving || d) && null === a.walking
					? a.last_stop && 320 > msince(a.last_stop)
						? (a.walking = a.last_walking)
						: (reset_ms_check(a, 'walk', 350), (a.walking = 1))
					: a.moving ||
					  d ||
					  !a.walking ||
					  ((a.last_stop = performance.now()),
					  (a.last_walking = a.walking || a.last_walking || 1),
					  (a.walking = null));
				var e = [0, 1, 2, 1],
					h = 350;
				'wabbit' == a.mtype && ((e = [0, 1, 2]), (h = 220));
				a.walking &&
					ms_check(a, 'walk', h - (a.speed / 2 || 0)) &&
					a.walking++;
				undefined !== a.direction && (c = a.direction);
				!d && a.s && a.s.stunned
					? (f = 1)
					: a.walking
					? (f = e[a.walking % e.length])
					: a.last_stop &&
					  180 > mssince(a.last_stop) &&
					  (f = e[a.last_walking % e.length]);
				undefined !== a.lock_i && (f = a.lock_i);
				a.stand && !a.standed
					? ((a.standed = true), (a.speed = 10))
					: a.standed && !a.stand && delete a.standed;
				a.rip && !a.rtexture
					? ((a.cskin = null),
					  (a.rtexture = true),
					  (d = 'gravestone'),
					  true !== a.rip && (d = a.rip),
					  textures[d],
					  (a.texture = textures[d]))
					: !a.rip &&
					  a.rtexture &&
					  (delete a.rtexture, set_texture(a, f, c));
				a.rip || set_texture(a, f, c);
			}
			if ('animation' == a.stype) {
				f = a.aspeed;
				a.speeding && (a.aspeed -= 0.003);
				ms_check(a, 'anim' + a.skin, 16.5 * f) && (a.frame += 1);
				if (a.frame >= a.frames && a.continuous) {
					a.frame = 0;
				} else {
					if (a.frame >= a.frames) {
						if ((g = a.parent)) {
							delete g.animations[a.skin];
						}
						return;
					}
				}
				set_texture(a, a.frame);
			}
			if ('emblem' == a.stype) {
				if (!a.frames) {
					if ((g = a.parent)) {
						delete g.emblems[a.skin];
					}
					return;
				}
				ms_check(a, 'emblem' + a.skin, 60) && --a.frames;
				a.alpha = a.frame_list[a.frames % a.frame_list.length];
			}
			'emote' == a.stype &&
				((f =
					('slow' == a.aspeed && 17) ||
					('slower' == a.aspeed && 40) ||
					10),
				'flow' == a.atype
					? (ms_check(a, 'anim', 16.5 * f) && (a.frame += 1),
					  set_texture(a, [0, 1, 2, 1][a.frame % 4]))
					: (ms_check(a, 'anim', 16.5 * f) &&
							'once' != a.atype &&
							(a.frame = (a.frame + 1) % 3),
					  set_texture(a, a.frame)));
			if (a.mtype && !no_graphics && !paused) {
				if ('dice' == a.mtype) {
					if (a.shuffling) {
						d = false;
						a.locked ||
							(a.line && delete a.line,
							(a.line = null),
							(a.line.x = -17),
							(a.line.y = -35.5),
							a.addChild(a.line));
						for (c = a.locked; 4 > c; c++) {
							a.updates % (c + 1) ||
								((f = 3 - c),
								(e = parseInt(10 * Math.random())),
								a.lock_start &&
									c == a.locked &&
									mssince(a.lock_start) >
										300 * (a.locked + 1) &&
									(0 == f
										? (e = a.num[0])
										: 1 == f
										? (e = a.num[1])
										: 2 == f
										? (e = a.num[3])
										: 3 == f && (e = a.num[4]),
									a.locked++,
									(d = true),
									(a.cskin = '2'),
									(a.texture = textures.dice[a.cskin]),
									a.line && delete a.line,
									(a.seconds = 7 * (4 - a.locked)),
									(a.line = null),
									(a.line.x = -17),
									(a.line.y = -35.5),
									a.addChild(a.line),
									a.seconds ||
										((a.count_start = future_s(8)),
										(a.snum = a.num),
										(a.shuffling = false)),
									(a.cskin = '5'),
									(a.texture = textures.dice[a.cskin])),
								(a.digits[f].texture = textures.dicesub[e]));
						}
						d && v_shake_i_minor(a);
						if (
							(!a.locked && a.shuffling && !(a.updates % 40)) ||
							('0' != a.cskin && '1' != a.cskin)
						) {
							(a.cskin = '' + ((parseInt(a.cskin) + 1) % 2)),
								(a.texture = textures.dice[a.cskin]);
						}
					} else {
						if (a.num != a.snum) {
							for (a.snum = a.num, f = 0; 4 > f; f++) {
								(e = 0),
									0 == f
										? (e = a.num[0])
										: 1 == f
										? (e = a.num[1])
										: 2 == f
										? (e = a.num[3])
										: 3 == f && (e = a.num[4]),
									(a.digits[f].texture =
										textures.dicesub[parseInt(e)]);
							}
						} else {
							(a.seconds = min(
								30,
								max(0, mssince(a.count_start)) / 1000
							)),
								a.line && delete a.line,
								(a.line = null),
								(a.line.x = -17),
								(a.line.y = -35.5),
								a.addChild(a.line),
								'5' != a.cskin &&
									((a.cskin = '5'),
									(a.texture = textures.dice[a.cskin]));
						}
					}
				}
				('slots' != a.mtype && 'wheel' != a.mtype) ||
					!a.spinning ||
					(a.updates % 2 ||
						((a.cskin = '' + ((parseInt(a.cskin) + 1) % 3)),
						(a.texture = textures[a.mtype][a.cskin])),
					a.spinning < performance.now() && (a.spinning = false));
			}
			'chest' == a.type &&
				a.openning &&
				(30 < mssince(a.openning) && 3 != a.frame
					? ((a.openning = performance.now()),
					  set_texture(a, ++a.frame),
					  a.to_delete && (a.alpha -= 0.1))
					: 30 < mssince(a.openning) && a.to_delete && 0.5 <= a.alpha
					? (a.alpha -= 0.1)
					: 0.5 > a.alpha && delete chests[a.id]);
			if (a.last_ms && a.s) {
				f = mssince(a.last_ms);
				for (var g in a.s) {
					a.s[g].ms &&
						((a.s[g].ms -= f), 0 >= a.s[g].ms && delete a.s[g]);
				}
				a.last_ms = performance.now();
			}
			undefined !== a.real_alpha && alpha_logic(a);
			update_filters(a);
			a.updates += 1;
		}
	}
}

function add_monster(a) {
	var def = G.monsters[a.type],
		d = new_sprite(a.skin || def.skin || a.type, 'full');
	d.type = 'monster';
	d.mtype = a.type;
	adopt_soft_properties(d, a);
	d.walking = null;
	d.animations = {};
	d.move_num = a.move_num;
	d.c = {};
	d.x = d.real_x = round(a.x);
	d.y = d.real_y = round(a.y);
	d.vx = a.vx || 0;
	d.vy = a.vy || 0;
	d.level = 1;
	d.speed = a.speed;
	d.type = 'monster';
	d.mtype = a.type;
	d.interactive = true;
	d.buttonMode = true;
	d.width = 24;
	d.height = 24;
	return d;
}

var update_filters = () => {};

var start_filter = () => {};

var stop_filter = () => {};

function alpha_logic(a) {}

function player_effects_logic(sprite) {
	if (
		sprite.me &&
		sprite.fear &&
		(!sprite.last_fear || sprite.last_fear < sprite.fear)
	) {
		if (character.fear > 3)
			add_log(character.name + ': You are petrified', '#B03736');
		else if (character.fear > 1)
			add_log(character.name + ': You are terrified', '#B04157');
		else if (character.fear)
			add_log(character.name + ': You are getting scared', 'gray');
	}
	if (sprite.me) sprite.last_fear = sprite.fear;
}

function effects_logic(a) {}

function cosmetics_logic(a) {}

function add_character(a, d) {
	var f = (d && manual_centering && 2) || 1;
	var c = new_sprite(a.skin, 'full');
	c.cscale = f;
	adopt_soft_properties(c, a);
	c.name = c.id;
	c.walking = null;
	c.animations = {};
	c.fx = {};
	c.x = round(a.x);
	c.real_x = parseFloat(a.x);
	c.y = round(a.y);
	c.real_y = parseFloat(a.y);
	c.last_ms = performance.now();
	c.type = 'character';
	c.me = d;
	c.base = {
		h: 8,
		v: 7,
		vn: 2,
	};
	a.npc &&
		G.npcs[a.npc] &&
		('citizen' == G.npcs[a.npc].role || G.npcs[a.npc].moving) &&
		((c.citizen = true),
		(c.npc_onclick = true),
		(c.role = G.npcs[a.npc].role));
	c.awidth = c.width / f;
	c.aheight = c.height / f;
	(d && manual_centering) ||
		((c.interactive = true), !d && pvp && (c.cursor = 'crosshair'));
	c.awidth = 26;
	c.aheight = 36;
	c.width = 26;
	c.height = 36;
	return c;
}

function add_chest(a) {
	return (chests[a.id] = {
		x: round(a.x),
		y: round(a.y),
		items: a.items,
		type: 'chest',
		interactive: true,
		buttonMode: true,
		cursor: 'help',
		map: a.map,
		id: a.id,
	});
}

var get_npc = (name) => {
	for (let npc of map_npcs) {
		if (name == npc.npc_id) {
			return npc;
		}
	}
	return null;
};

function add_npc(a, d, f, npc_id) {
	f = {
		x: round(d[0]),
		y: round(d[1]),
		type: 'npc',
		interactive: true,
		buttonMode: true,
	};
	f.npc_id = npc_id;
	f.real_x = f.x;
	f.real_y = f.y;
	'fullstatic' == a.type && 3 == d.length && (a.direction = d[2]);
	'citizen' == a.role && (f.citizen = true);
	f.npc = true;
	f.animations = {};
	adopt_soft_properties(f, a);
	'emote' == f.stype &&
		((d = [26, 35]),
		'xmas_tree' == f.role && (d = [32, 60]),
		(f.awidth = d[0]),
		(f.aheight = d[1]),
		a.atype && ((f.atype = a.atype), (f.frame = f.stopframe || f.frame)));
	return f;
}

function add_machine(a) {
	var d = {
		x: round(a.x),
		y: round(a.y),
		type: 'machine',
		interactive: true,
		buttonMode: true,
	};
	d.mtype = a.type;
	d.updates = 0;
	if ('dice' == a.type) {
		d.digits = e_array(4);
		for (a = 0; 4 > a; a++) {
			(d.digits[a] = {}),
				(d.digits[a].x = -11 + 7 * a),
				1 < a && (d.digits[a].x += 1),
				(d.digits[a].y = -17);
		}
		d.dot = {};
		d.dot.x = 0;
		d.dot.y = -21;
		d.addChild(d.dot);
		d.seconds = 0;
		d.count_start = performance.now();
		d.shuffle_speed = 100;
	}
	return d;
}

function add_door(a) {
	return {
		x: round(a[0]),
		y: round(a[1]),
		type: 'door',
		interactive: true,
		buttonMode: true,
	};
}

function add_quirk([x, y, width, height, id]) {
	switch (id) {
		case 'upgrade':
		case 'compound':
			return {
				x: Math.round(x),
				y: Math.round(y),
				type: 'quirk',
				interactive: true,
				buttonMode: true,
			};
		default:
			return {
				x: Math.round(x),
				y: Math.round(y),
				type: 'quirk',
				interactive: true,
				buttonMode: true,
				cursor: 'help',
			};
	}
}

var add_animatable = (a, d) => {
	return {
		x: d.x,
		y: d.y,
		type: 'animatable',
	};
};

function create_map() {
	pvp = G.maps[current_map].pvp || is_pvp;
	if (!paused) {
		map_npcs = [];
		map_doors = [];
		map_tiles = [];
		map_entities = [];
		map_machines = {};
		water_tiles = [];
		entities = {};
		tile_sprites[current_map] ||
			((tile_sprites[current_map] = {}), (sprite_last[current_map] = []));
		(dtile_size = GEO['default'] && GEO['default'][3]) &&
			is_array(dtile_size) &&
			(dtile_size = dtile_size[0]);
		map = {
			real_x: 0,
			real_y: 0,
		};
		first_coords &&
			((first_coords = false),
			(map.real_x = first_x),
			(map.real_y = first_y));
		map.speed = 80;
		map.interactive = true;
		map_info = G.maps[current_map];
		if (0) {
			for (var a = map_info.npcs, d = 0; d < a.length; d++) {
				var f = a[d],
					c = G.npcs[f.id];
				'full' != c.type &&
					'citizen' != c.role &&
					((f = add_npc(c, f.position, f.name, f.id)),
					map_npcs.push(f),
					map_entities.push(f));
			}
		}
		a = map_info.doors || [];
		for (d = 0; d < a.length; d++) {
			var e = a[d];
			f = add_door(e);
			map_doors.push(f);
			map_entities.push(f);
			border_mode && border_logic(f);
		}
		a = map_info.machines || [];
		for (d = 0; d < a.length; d++) {
			(c = a[d]),
				(f = {}),
				map_npcs.push(f),
				map_entities.push(f),
				(map_machines[f.mtype] = f),
				border_mode && border_logic(f);
		}
		a = map_info.quirks || [];
		for (let d = 0; d < a.length; d++) {
			map_entities.push(add_quirk(a[d]));
		}
		for (let e in map_info.animatables) {
			map_entities.push(add_animatable(e, map_info.animatables[e]));
		}
		// console.log('Map created: ' + current_map);
	}
}

var retile_the_map = () => {};
var fps_counter = null,
	frames = 0,
	last_count = null,
	last_frame,
	fps = 0,
	stop_rendering = false;

var calculate_fps = () => {};

function load_game(a) {
	create_map();
	draw();
	game_loaded = true;
	console.log('Game loaded');
	socket.emit('loaded', {
		success: 1,
		width: screen.width,
		height: screen.height,
		scale,
	});
	console.log(G.sprites);

	'function' === typeof onLoad && onLoad();
}

function removeQueryString(url) {
	return url.split('?')[0];
}

function launch_game() {
	create_map();
	draws || draw();
	socket.emit('loaded', {
		success: 1,
		width: screen.width,
		height: screen.height,
		scale,
	});
}

function pause() {
	paused
		? ((paused = false),
		  current_map != drawn_map && create_map(),
		  $('#pausedui').hide())
		: ((paused = true), $('#pausedui').show());
}

function draw(a, d) {
	if (!manual_stop) {
		try {
			draws++;
			in_draw = true;
			last_draw && (frame_ms = mssince(last_draw));
			last_draw = performance.now();
			start_timer('draw');
			draw_timeouts_logic(2);
			stop_timer('draw', 'timeouts');
			process_entities();
			future_entities = {
				players: {},
				monsters: {},
			};
			stop_timer('draw', 'entities');
			gtest && character && ((map.real_x -= 0.1), (map.real_y -= 0.001));
			for (a = frame_ms; 0 < a; ) {
				var f = false;
				character &&
					character.moving &&
					((f = true),
					character.vx &&
						(character.real_x +=
							(character.vx * min(a, 50)) / 1000),
					character.vy &&
						(character.real_y +=
							(character.vy * min(a, 50)) / 1000),
					set_direction(character),
					stop_logic(character));
				for (var c in entities) {
					var e = entities[c];
					e &&
						!e.dead &&
						e.moving &&
						((f = true),
						(e.real_x += (e.vx * min(a, 50)) / 1000),
						(e.real_y += (e.vy * min(a, 50)) / 1000),
						set_direction(e),
						stop_logic(e));
				}
				a -= 50;
				if (!f) {
					break;
				}
			}
			stop_timer('draw', 'movements');
			position_map();
			call_code_function('on_draw');
			stop_timer('draw', 'retile');
			exchange_animations && exchange_animation_logic();
			stop_timer('draw', 'uis');
			draw_timeouts_logic();
			stop_timer('draw', 'timeouts');
			draw_entities();
			stop_timer('draw', 'draw_entities');
			character && update_sprite(character);
			map_npcs.forEach(update_sprite);
			for (f in chests) {
				chests[f].openning && update_sprite(chests[f]);
			}
			stop_timer('draw', 'sprites');
			stop_timer('draw', 'before_render');
			stop_timer('draw', 'after_render');
		} catch (e) {
			console.error(e);
			fs.appendFile('localStorage/ERROR', e + '', (err) => {
				if (err) console.log(err);
				else {
					console.log('File written successfully\n');
					console.log('The written has the following contents:');
					console.log(e + '');
				}
			});
		}
		d || setTimeout(draw, 16);
	}
}
