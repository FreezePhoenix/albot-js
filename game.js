/**
 * Created by nexus on 03/04/17.
 */
const {
	Worker, isMainThread, parentPort, workerData
} = require('worker_threads');
var LocalStorage = require('node-localstorage').LocalStorage;
var DataWrapper = require('./DataWrapper');
localStorage = new LocalStorage('./localStorage');
var Game = function (
	ip,
	port,
	characterId,
	script,
	botKey,
	G,
	dataWrapper,
	process_index,
	name
) {
	this.name = name;
	this.ip = ip;
	this.port = port;
	this.userId = dataWrapper.userId;
	this.characterId = characterId;
	this.socketAuth = dataWrapper.userAuth;
	this.dataWrapper = dataWrapper;
	this.script = script;
	this.botKey = botKey;
	this.excutor = null;
	this.interface = null;
	this.events = {};
	this.socket = null;
	this.executor = null;
	this.G = G;
	this.pathfinding = null;
};

Game.prototype.init = async function () {
    var parent = {};
	let self = this;
	var fs = require('node:fs/promises');
	var G = this.G;
	var Executor = require('./Executor');
	var character_to_load;
	var first_entities = false;
	var inside = 'selection';
	var user_id, user_auth;
	var server_names = {
		US: 'Americas',
		EU: 'Europas',
		ASIA: 'Eastlands',
	};
	var perfect_pixels = '';
	var cached_map = '1',
		scale = '2';
	var d_lines = '1';
	var sd_lines = '1';
	var c_enabled = '1',
		stripe_enabled = '';
	var auto_reload = 'auto',
		reload_times = '0',
		code_to_load = null,
		mstand_to_load = null;
	var EPS = 1e-16;
	var no_graphics = true;
	var first_coords = false,
		first_x = 0,
		first_y = 0;
	var protocol = 'http';

	var code_active = false;
	var current_map = '';
	var pull_all_next = false;
	var pull_all = false;
	var heartbeat = new Date();
	var slow_heartbeats = 0;
	var game_loaded = false;
	var prepull_target_id = null;
	var is_pvp = false;
	var server_region = '';
	var server_identifier = '';
	var server_name = '';
	var socket;
	var server_addr, port;
	var last_draw = new Date();
	var M;
	var GMO;
	var entities = {};
	var future_entities = {
		players: {},
		monsters: {},
	};
	var pings = 0;
	var pingc = 0;
	var pingts = {};
	var S = {};
	var character;

	var game = null;

	var dataWrapper = this.dataWrapper;
	var script = this.script;
	var botKey = this.botKey;
	var sandbox;
	var lostandfound;

	game = this;

	server_addr = this.ip;
	port = this.port;
	user_id = this.userId;
	character_to_load = this.characterId;
	user_auth = this.socketAuth;
	function no_no_no() {}
	var onLoad = function () {
		log_in(user_id, character_to_load, user_auth);
	};
    eval(await fs.readFile('modedGameFiles/common_functions.js', 'utf8'));
    eval(await fs.readFile('modedGameFiles/functions.js', 'utf8'));
	eval(await fs.readFile('modedGameFiles/game.js', 'utf8'));
	gprocess_game_data();
	init_socket();
	this.socket = socket;
	var on_cm_handler = function () {};
	/*
    game.pathfinding = require("./PathFinding/pathFinding");
    game.pathfinding.initialize(this.G);
    */
	var glob = Object.create(
		global,
		Object.getOwnPropertyDescriptors({
			push_deferred: push_deferred,
			resolve_deferred: resolve_deferred,
			resolve_deferreds: resolve_deferreds,
			trade_sell: trade_sell,
			calculate_item_value: calculate_item_value,
			localStorage: localStorage,
			gameplay: gameplay,
			get is_pvp() {
				return is_pvp;
			},
			distance_sq: distance_sq,
			ping: ping,
			get server_region() {
				return server_region;
			},
			get server_identifier() {
				return server_identifier;
			},
			G: G,
			get S() {
				return S;
			},
			get lostandfound() {
				return lostandfound;
			},
			get party() {
				return party;
			},
			activate: activate,
			shift: shift,
			performance: performance,
			use_skill: use_skill,
			donate: function donate(a) {
				socket.emit('donate', { gold: a });
			},
			ms_until: ms_until,
			can_use: can_use,
			socket: socket,
			current_map: current_map,
			server_addr: server_addr,
			add_log: add_log,
			ctarget: ctarget,
			xtarget: xtarget,
			eval: eval,
			get next_skill() {
				return next_skill;
			},
			send_target_logic: send_target_logic,
			distance: distance,
			is_disabled: is_disabled,
			transporting: transporting,
			player_attack: player_attack,
			attack_monster: attack_monster,
			player_heal: player_heal,
			buy: buy,
			set_on_cm_handler: function () {
				on_cm_handler = arguments[0];
			},
			name: this.name,
			no_graphics: true,
			sell: sell,
			trade: trade,
			trade_buy: trade_buy,
			upgrade: upgrade,
			compound: compound,
			exchange: exchange,
			say: say,
			calculate_move: calculate_move,
			chests: chests,
			entities: entities,
			calculate_vxy: calculate_vxy,
			show_json: show_json,
			next_potion: next_potion,
			send_code_message: function send_code_message(a, b) {
				if (!is_array(a)) {
					a = [a];
				}
				console.log(a, b);
				parentPort.postMessage({
					event: 'cm',
					names: a,
					message: b,
				});
			},
			drawings: drawings,
			move: move,
			show_modal: show_modal,
			prop_cache: prop_cache,
			next_attack: next_attack,
			bot_mode: true,
			botKey: botKey,
			game: this,
			get code_active() {
				return code_active;
			},
			set code_active(value) {
				code_active = Boolean(value);
			},
			get sandbox() {
				return sandbox;
			},
			set sandbox(value) {
				sandbox = value;
			},
		})
	);
  glob.shutdown_all = function() {
    parentPort.postMessage({
			type: 'shutdown'
		});
  }
	glob.hrtime = function () {
		return process.hrtime.bigint();
	};
	glob.skill_timeout = function skill_timeout(c, b) {
		if (b <= 0) {
			return;
		}
		var a = [];
		if (!b) {
			b = G.skills[c].cooldown;
		}
		if (b == '1X') {
			b = (1000 * 100) / character.speed;
		}
		next_skill[c] = future_ms(b);
	};
	glob.switch_server = function (server) {
		parentPort.postMessage({
			action: 'server',
			data: server,
		});
		glob.socket.emit('say', {
			message: `Switching servers!`,
			code: 0,
		});
		parentPort.postMessage({
			type: 'status',
			status: 'disconnected'
		});
	};
	glob.switch_script = function (script) {
		parentPort.postMessage({
			event: 'script_switch',
			value: script,
		});
		glob.socket.emit('say', {
			message: `Switching scripts!`,
			code: 0,
		});
		parentPort.postMessage({
			type: 'status',
			status: 'disconnected'
		});
	};
	Object.defineProperty(glob, 'entities', {
		get: function () {
			return entities;
		},
	});
	Object.defineProperty(glob, 'code_active', {
		get: function () {
			return code_active;
		},
		set: function (value) {
			code_active = value;
		},
	});
	Object.defineProperty(glob, 'sandbox', {
		get: function () {
			return sandbox;
		},
		set: function (value) {
			sandbox = value;
		},
	});
	Object.defineProperty(glob, 'character', {
		get: function () {
			return character;
		},
	});
	Object.defineProperty(glob, 'map', {
		get: function () {
			return map;
		},
	});
	Object.defineProperty(glob, 'M', {
		get: function () {
			return M;
		},
	});
    
	var damage = 0;
	var burnDamage = 0;
	var blastDamage = 0;
	var cleaveDamage = 0;
	var baseDamage = 0;
	var entBurnDamage = 0;
	var entBlastDamage = 0;
	var entBaseDamage = 0;
	var baseHeal = 0;
	var baseHealPotion = 0;
	var baseLifesteal = 0;
	var baseMana = 0;
	var baseManasteal = 0;
	var timeFrame = 60 * 5;
	var item = 0;

	socket.on('game_response', (event) => {
		if (event.response == 'item_received') {
			if (event.item == 'offeringp') {
				item += event.q ?? 1;
			}
		}
	});

	socket.on('disappearing_text', (data) => {
		if (data.id && character && data.id == character.id) {
			if (data.args) {
				if (data.args.c == 'mp') {
					baseMana += parseInt(data.message);
				} else if (data.args.c == 'hp') {
					baseHealPotion += parseInt(data.message);
				}
			}
		}
	});
	socket.on('hit', (data) => {
		if (data.hid && character) {
			if (data.hid == character.id) {
				damage += data.damage ?? 0;
				if (data.lifesteal) {
					baseLifesteal += data.lifesteal ?? 0;
				}
				if (data.manasteal) {
					baseManasteal += data.manasteal ?? 0;
				}
				if (data.source == 'cleave') {
					cleaveDamage += data.damage;
				} else if (data.source == 'burn') {
					if (entities[data.id]?.mtype == 'ent') {
						entBurnDamage += data.damage;
					}
					burnDamage += data.damage;
				} else if (data.splash) {
					if (entities[data.id]?.mtype == 'ent') {
						entBlastDamage += data.damage;
					}
					blastDamage += data.damage;
				} else {
					if (entities[data.id]?.mtype == 'ent') {
						entBaseDamage += data.damage;
					}
					baseDamage += data.damage ?? 0;
				}
			}
			if (data.id == character.id) {
				if (data.heal) {
					baseHeal += data.heal ?? 0;
				}
			}
		}
	});
	parentPort.on('message', (message) => {
		if (message.event == 'cm_fail') {
			send_code_message(message.name, message.message);
		} else if (message.event == 'cm') {
			socket.listeners('cm').forEach((listener) => {
				listener({
					name: message.sender,
					message: JSON.stringify(message.message),
				});
			});
		} else if (
			socket.connected &&
			character != null &&
			character.name == message.name
		) {
			if (message.admin) {
				if (message.action == 'move_item') {
					socket.emit('imove', {
						a: message.a,
						b: message.b,
					});
				}
			} else {
				if (message.action == 'get_items') {
					parentPort.postMessage({
						type: 'socket_response',
						value: character.items,
						client: message.client,
					});
				}
			}
		}
	});
	socket.on('start', () => {
		var METER_START = performance.now();
		let bank = {
				gold: 'N/A',
			},
			maxGPH = 1;
		let found_gold = 0;
		parent.prev_handlersgoldmeter = [];

		function getGold(elapsed) {
			var sumGold = found_gold;

			var goldPerSecond = sumGold / (elapsed / 1000);

			return Math.floor(goldPerSecond * 60 * 60);
		}

		function register_goldmeterhandler(event, handler) {
			parent.prev_handlersgoldmeter.push([event, handler]);
			socket.on(event, handler);
		}

		function goldMeterGameResponseHandler(event) {
			if (event.response == 'gold_received') {
				found_gold += event.gold;
			}
		}

		function goldMeterGameLogHandler(event) {
			if (event.color == 'gold') {
				var gold = parseInt(
					event.message
						.replace(' gold', '')
						.replace(',', '')
						.replace('Received ', '')
				);
				found_gold += gold;
			}
		}
		let _count = 0;
		let _needed = 1;
		var tracker = {};
		socket.on('achievement_progress', (data) => {
			_count = data.count;
			_needed = data.needed;
			// socket.emit("say",{message:"AP["+data.name+"]: "+to_pretty_num(data.count)+"/"+to_pretty_num(data.needed),code:false,party:true});
		});
		socket.on('tracker', (t) => {
			tracker = t;
			tracker.tables = null;
			tracker.maps = null;
			tracker.drops = null;
		});
		var last_xp_checked_minutes = character.xp;
		var last_xp_checked_kill = character.xp;
		// lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)
		let last = [0, 0];

		function update_xptimer(time) {
			if (character.xp == last_xp_checked_kill) return last;
			if (time < 1) return last; // 1s safe delay
			
            let xp_rate = Math.round(
				(character.xp - last_xp_checked_minutes) / time
			);
			last_xp_checked_kill = character.xp;

			let xp_missing = G.levels[character.level] - character.xp;
			let seconds = Math.round(xp_missing / xp_rate);
			let minutes = Math.floor(seconds / 60);
			let hours = Math.floor(minutes / 60);
			let days = Math.floor(hours / 24);
			let counter = `${days}d ${hours % 24}h ${minutes % 60}min`;
            last[0] = xp_rate;
            last[1] = counter;
            return last;
		}

		register_goldmeterhandler('game_log', goldMeterGameLogHandler);
		register_goldmeterhandler(
			'game_response',
			goldMeterGameResponseHandler
		);
		let cpu_usage;
		// setInterval(() => {
		//   socket.emit("tracker");
		// }, 5000);
		function send_bwi_flush() {
			parentPort.postMessage({
				type: 'bwiUpdate',
				command: 'flush',
			});
		}
		function send_bwi_update(name, value) {
			parentPort.postMessage({
				type: 'bwiUpdate',
				data: {
					name,
					value,
				},
			});
		}
		socket.on('ui', function (data) {
			switch (data.type) {
				case 'level_up':
					if (data.name == character.name) {
						send_bwi_update('level', character.level);
						break;
					}
			}
		});
		setImmediate(() => {
			send_bwi_update('level', character.level);

            send_bwi_update(
                'server',
                glob.server_region + ' ' + glob.server_identifier
            );
            
			var cpu_last_check = performance.eventLoopUtilization();
			setInterval(() => {
				let ELAPSED = performance.now() - METER_START;
				let ELAPSED_S = ELAPSED / 1000;
				cpu_check = performance.eventLoopUtilization();
				cpu_usage = performance.eventLoopUtilization(cpu_last_check, cpu_check).utilization * 100;
				cpu_last_check = cpu_check;
				var targetName = 'nothing';
				if (character.target && entities[character.target]) {
					if (entities[character.target].player) {
						targetName = entities[character.target].id;
					} else {
						targetName =
							entities[character.target].mtype +
							' +' +
							(entities[character.target].level || 1);
					}
				}
				let itempd = Math.floor((item * 1000 * 60 * 60 * 24) / ELAPSED);
				let dps = Math.floor(damage / ELAPSED_S);
				let burnDps = Math.floor(burnDamage / ELAPSED_S);
				let blastDps = Math.floor(blastDamage / ELAPSED_S);
				let cleaveDps = Math.floor(cleaveDamage / ELAPSED_S);
				let baseDps = Math.floor(baseDamage / ELAPSED_S);

				let entBurnDps = Math.floor(entBurnDamage / ELAPSED_S);
				let entBlastDps = Math.floor(entBlastDamage / ELAPSED_S);
				let entBaseDps = Math.floor(entBaseDamage / ELAPSED_S);

				let hps = Math.floor(baseHeal / ELAPSED_S);
				let healpotionps = Math.floor(baseHealPotion / ELAPSED_S);
				let lifestealps = Math.floor(baseLifesteal / ELAPSED_S);
				let mps = Math.floor(baseMana / ELAPSED_S);
				let manastealps = Math.floor(baseManasteal / ELAPSED_S);
				let goldph = getGold(ELAPSED);

				if (goldph > maxGPH) {
					maxGPH = goldph;
				}

				function num_items(name) {
					let count = 0;
					let i = character.items.length;
					while (i-- > 0) {
						let item = character.items[i];
						item && item.name == name && (count += item.q || 1);
					}
					return count;
				}
				let [xpPS, remaining] = update_xptimer(ELAPSED_S);
				let memory = process.memoryUsage();
				send_bwi_update('gold', character.gold.toLocaleString());
				send_bwi_update(
					'inv',
					character.isize - character.esize + ' / ' + character.isize
				);
				send_bwi_update(
					'xp',
					~~((character.xp * 10000) / character.max_xp) / 100
				);
				send_bwi_update(
					'health',
					~~((character.hp * 10000) / character.max_hp) / 100
				);
				send_bwi_update(
					'mana',
					~~((character.mp * 10000) / character.max_mp) / 100
				);
				send_bwi_update(
					'target',
					targetName
				);
				// send_bwi_update("status", character.rip ? "DEAD" : "ALIVE");
				send_bwi_update('map', character.map);
				send_bwi_update('cpu', [
					~~(cpu_usage * 100) / 100,
					Math.trunc(cpu_usage * 100) / 100,
				]);
				send_bwi_update('heap', [
					(~~((memory.heapUsed + memory.arrayBuffers) / 1024 ** 2 * 100) / 100).toFixed(2) + 'MB',
          100
				]);
				send_bwi_update('itempd', itempd);
				send_bwi_update('tilLevelUp', remaining);
				// send_bwi_update("activity", [activity_state, activity_fill]);
				send_bwi_update('goldh', [
					goldph.toLocaleString('en'),
					~~((goldph / maxGPH) * 100),
				]);
				send_bwi_update('dps', [baseDps, burnDps, blastDps, cleaveDps]);
				send_bwi_update('edps', [entBaseDps, entBurnDps, entBlastDps]);
				send_bwi_update('hps', [hps, healpotionps, lifestealps]);
				send_bwi_update('mps', [mps, manastealps]);
				send_bwi_update('ping', ~~character.ping);
				send_bwi_update('xpPH', (xpPS * 60 * 60).toLocaleString());
				switch (character.ctype) {
					case 'priest':
						send_bwi_update('mp', num_items('mpot1'));
						break;
					case 'warrior':
						send_bwi_update('mp', num_items('mpot1'));
						break;
					default:
						send_bwi_update('mp', 'N/A');
				}
				send_bwi_update('cc', ~~((character.cc * 100) / 1.8) / 100);
				send_bwi_update('acc', [_count, (_count / _needed) * 100]);
				send_bwi_flush();
			}, 1000);

			self.executor = new Executor(glob, script);
			self.executor.execute();
			code_active = false;
		});
	});
	socket.on('ccreport', function (data) {
		console.log(JSON.stringify(data));
	});
	socket.on('limitdcreport', function (data) {
		fs.writeFile(
			'localStorage/' + game.name,
			JSON.stringify(data),
			() => {}
		);
	});
	socket.on('disconnect', function () {
		self.emit('disconnected', 'nothing');
		parentPort.postMessage({
			type: 'status',
			status: 'disconnected',
		});
		self.stop();
	});
	function send_bwi_flush() {
		parentPort.postMessage({
			type: 'bwiUpdate',
			command: 'flush',
		});
	}
	function send_bwi_update(name, value) {
		parentPort.postMessage({
			type: 'bwiUpdate',
			data: {
				name,
				value,
			},
		});
	}
	socket.on('game_error', function (data) {
		send_bwi_update('status', '' + data);
		if ('Failed: ingame' == data) {
			setTimeout(function () {
				console.log('Retrying for ' + character_to_load);
				log_in(user_id, character_to_load, user_auth);
			}, 30 * 1000);
		} else if (/Failed: wait_(\d+)_seconds/g.exec(data) != null) {
			let time = /Failed: wait_(\d+)_seconds/g.exec(data)[1];
			setTimeout(function () {
				console.log('Retrying for ' + character_to_load);
				log_in(user_id, character_to_load, user_auth);
			}, time * 1000 + 1000);
		}
	});
};
/**
 * Register's an event in the game
 * @param event string the name f the event
 * @param callback function the function to be called
 */
Game.prototype.on = function (event, callback) {
	if (typeof event == 'string' && typeof callback == 'function') {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(callback);
	} else {
		if (typeof event != 'string')
			throw new Error('Event has to be a string');
		if (typeof callback == 'function')
			throw new Error('Callback has to be a function');
	}
};
Game.prototype.trigger = function (event, args) {
	var to_delete = [];
	for (var i = 0; i < game.listeners.length; i++) {
		var l = game.listeners[i];
		if (l.event == event || l.event == 'all') {
			try {
				if (l.event == 'all') l.f(event, args);
				else l.f(args, event);
			} catch (e) {
				game_log(
					'Listener Exception (' + l.event + ') ' + e,
					colors.code_error
				);
			}
			if (l.once || (l.f && l.f.delete)) to_delete.push(l.id);
		}
	}
};

Game.prototype.emit = function (event, arguments) {
	if (typeof event == 'string') {
		if (this.events[event]) {
			this.events[event].forEach(function (current) {
				current.apply(Array.from(arguments).slice(1));
			});
		}
	}
};

Game.prototype.stop = function () {
	if (this.socket) this.socket.close();
};
async function main() {
	try {
		let args = workerData.args;
		let dataWrapper = new DataWrapper(args[0], args[1], args[2]);
		let gameData = workerData.data;
		let game = new Game(
			args[3],
			args[4],
			args[5],
			args[6],
			args[7],
			gameData,
			dataWrapper,
			parseInt(args[8]),
			args[9]
		);
		await game.init();
	} catch (e) {
		console.log(e);
	}
}

main();
