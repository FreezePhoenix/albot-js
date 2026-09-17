
function ms_until(skill_name, timestamp = new Date()) {
	if (skill_name in parent.next_skill) {
		return parent.next_skill[skill_name] - timestamp;
	}
	return -Infinity;
};
(async () => {
	function CompleteAdapter(...properties) {
		return Function(
			`const object = { ${properties
			.map((initial) => `${initial}: null`)
			.join(", ")} };\nreturn (${properties.join(",")}) => {\n${properties
			.map((initial) => `\tobject.${initial} = ${initial};`)
			.join("\n")}\n\treturn object;\n}`
		)();
	}
	function Adapter(...properties) {
		return Function("object", ...properties, properties.map((initial) => {
			return "\tobject." + initial + " = " + initial + ";" 
		}).join("\n") + "return object");
	}
	let CACHE = new Map();

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	function is_string(obj)
	{ try{
		return Object.prototype.toString.call(obj) == '[object String]';
	} catch(e){} return false; }


	let FILTERS = [];

	const EXCHANGE_ADAPTABLE = CompleteAdapter('item_num', 'q');

	let min_mp = 300;

	const DISMANTLE_ADAPTER = CompleteAdapter("num");
	const dismantle_items = new Set();
	setInterval(() => {
		for(let i = 0; i < 42; i++) {
			let item = character.items[i];
			if(item != null && dismantle_items.has(item.name) && item.p == null && (item.level ?? 0) == 0) {
				parent.socket.emit("dismantle", DISMANTLE_ADAPTER(i));
				break;
			}
		}
	}, 1000);
	Dismantle = (item_name) => {
		dismantle_items.add(item_name);
	}

	class ItemFilter {
		#level = -1;
		#levelMode = '==';
		#names = [];
		#property = true;
		level(level, mode = '==') {
			this.#level = level;
			this.#levelMode = mode;
			return this;
		}
		toString() {
			let parts = [];
			if (this.#names.length == 1) {
				parts.push(`name='${this.#names[0]}'`);
			} else if (this.#names.length > 1) {
				parts.push(`name=['${this.#names.join("','")}']`);
			}
			if (this.#level != -1) {
				parts.push(`level${this.#levelMode}${this.#level}`);
			}
			if (this.#property == false) {
				parts.push('property=null');
			} else if (this.#property != true) {
				parts.push(`property='${this.#property}'`);
			}
			return `ItemFilter(${parts.join(',')})`;
		}
		property(name) {
			this.#property = name;
			return this;
		}
		name(name) {
			if (!this.#names.includes(name) && typeof name == 'string') {
				this.#names.push(name);
			}
			return this;
		}
		names(...names) {
			for (let name of names) {
				this.name(name);
			}
			return this;
		}
		#propertyFilter() {
			if (this.#property === true) {
				return 'true';
			}
			if (this.#property === false) {
				return '(item?.p == null)';
			}
			return `(item?.p == "${this.#property}")`;
		}
		#levelFilter() {
			if (this.#level == -1) {
				return 'true';
			}
			return `(item?.level ${this.#levelMode} ${this.#level})`;
		}
		#nameFilter() {
			if (this.#names.length == 0) {
				throw new Error('ItemFilter.names must not be empty');
			}
			return `(${this.#names
				.map((name) => `item?.name == "${name}"`)
				.join(' || ')})`;
		}
		build() {
			let parts = [
				this.#levelFilter(),
				this.#nameFilter(),
				this.#propertyFilter(),
			].filter((str) => str != 'true');
			let result = Function(`return (item) => ${parts.join(' && ')};`)();
			result.looking = this.#names;
			return result;
		}
		static ofName(name) {
			return new ItemFilter().name(name);
		}
		static toFilter(object) {
			if (object instanceof Function) {
				return object;
			}
			if (object instanceof String) {
				return ofName(object).build();
			}
			return null;
		}
	}

	// for skills of form { name }
	const NAME_ADAPTER = CompleteAdapter("name");
	// for skills of form { name, id }
	const NAME_ID_ADAPTER = CompleteAdapter("name", "id");

	curse = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("curse", id));

	zap = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("zapperzap", id));

	taunt = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("taunt", id));

	absorb = (id) => parent.socket.emit("skill", NAME_ID_ADAPTER("absorb", id));

	warcry = () => parent.socket.emit("skill", NAME_ADAPTER("warcry"));

	cleave = () => parent.socket.emit("skill", NAME_ADAPTER("cleave"));

	hardshell = () => parent.socket.emit("skill", NAME_ADAPTER("hardshell"));

	darkblessing = () => parent.socket.emit("skill", NAME_ADAPTER("darkblessing"));
	class Lazy {
		#iterable = null;
		#functions = [];
		#conditionals = [];
		#takeCount = Infinity;
		#triage = null;
		constructor(iterable) {
			this.#iterable = iterable;
		}
		take(quantity) {
			this.#takeCount = quantity;
			return this;
		}
		filter(predicate) {
			this.#functions.push({
				value: predicate,
				type: "filter"
			});
			return this;
		}
		map(consumer) {
			this.#functions.push({
				value: consumer,
				type: "map"
			});
			return this;
		}
		while(conditional) {
			this.#conditionals.push(conditional);
			return this;
		}
		*[Symbol.iterator]() {
			let iterator = this.#iterable[Symbol.iterator]();
			let found = 0;
			let current = iterator.next();
			while (!current.done && found < this.#takeCount) {
				let value = current.value;
				for (let i = 0; i < this.#conditionals.length; i++) {
					let condition = this.#conditionals[i];
					if (!condition()) {
						return null;
					}
				}
				let filter_failed = false;
				for (let i = 0, len = this.#functions.length; i < len; i++) {
					let func = this.#functions[i];
					if (func.type === "filter") {
						if (func.value(value)) {
							continue;
						}
						filter_failed = true;
						break;
					} else if (func.type === "map") {
						value = func.value(value);
					}
				}
				if (!filter_failed) {
					found++;
					yield value;
				}
				current = iterator.next();
			}
			return null;
		}
		forEach(consumer) {
			let iter = this[Symbol.iterator](),
				current = iter.next(),
				cont = true;
			while (!current.done && cont) {
				cont = consumer(current.value);
				current = iter.next();
			}
		}
		/**
   *
   */
		find(filter) {
			let iterator = this.#iterable[Symbol.iterator]();
			let found = 0;
			let current = iterator.next();
			while (!current.done && found < this.#takeCount) {
				let value = current.value;
				for (let i = 0; i < this.#conditionals.length; i++) {
					let condition = this.#conditionals[i];
					if (!condition()) {
						return null;
					}
				}
				let filter_failed = false;
				for (let i = 0, len = this.#functions.length; i < len; i++) {
					let func = this.#functions[i];
					if (func.type === "filter") {
						if (func.value(value)) {
							continue;
						}
						filter_failed = true;
						break;
					} else if (func.type === "map") {
						value = func.value(value);
					}
				}
				if (!filter_failed && filter(value)) {
					found++;
					return value;
				}
				current = iterator.next();
			}
			return null;
		}
		/**
   * For full functionality, it is recommended to use the iterator instead of ._value(). However, both exhibit Lazy behavior.
   */
		value() {
			if (this.#takeCount < 1) {
				return null;
			} else if (this.#takeCount == 1) {
				return this[Symbol.iterator]().next().value;
			}
			return [...this];
		}
		/**
   *
   */
		first() {
			return this[Symbol.iterator]().next().value;
		}
	}
	const max = Math.max;
	const min = Math.min;
	if (parent.distance_sq == null) {
		parent.distance_sq = function distance_sq(a, b) {
			// https://discord.com/channels/238332476743745536/1025784763958693958
			if (!a || !b) return 99999999;
			if ("in" in a && "in" in b && a.in != b.in) return 99999999;
			if ("map" in a && "map" in b && a.map != b.map) return 99999999;

			const a_x = a.real_x ?? a.x;
			const a_y = a.real_y ?? a.y;
			const b_x = b.real_x ?? b.x;
			const b_y = b.real_y ?? b.y;

			const aHalfWidth = (a.width ?? 0) / 2;
			const aHeight = (a.height ?? 0);
			const bHalfWidth = (b.width ?? 0) / 2;
			const bHeight = (b.height ?? 0);

			// Compute bounds of each rectangle
			const aLeft = a_x - aHalfWidth;
			const aRight = a_x + aHalfWidth;
			const aTop = a_y - aHeight;
			const aBottom = a_y;

			const bLeft = b_x - bHalfWidth;
			const bRight = b_x + bHalfWidth;
			const bTop = b_y - bHeight;
			const bBottom = b_y;

			const dx = Math.max(bLeft - aRight, aLeft - bRight, 0);
			const dy = Math.max(bTop - aBottom, aTop - bBottom, 0);

			return dx * dx + dy * dy;
		}
	}
	function damage_multiplier(defense) {
		// [10/12/17]
		return min(
			1.32,
			max(
				0.05,
				1 -
				(max(0, min(100, defense)) * 0.001 +
				 max(0, min(100, defense - 100)) * 0.001 +
				 max(0, min(100, defense - 200)) * 0.00095 +
				 max(0, min(100, defense - 300)) * 0.0009 +
				 max(0, min(100, defense - 400)) * 0.00082 +
				 max(0, min(100, defense - 500)) * 0.0007 +
				 max(0, min(100, defense - 600)) * 0.0006 +
				 max(0, min(100, defense - 700)) * 0.0005 +
				 max(0, defense - 800) * 0.0004) +
				max(0, min(50, 0 - defense)) * 0.001 + // Negative's / Armor Piercing
				max(0, min(50, -50 - defense)) * 0.00075 +
				max(0, min(50, -100 - defense)) * 0.0005 +
				max(0, -150 - defense) * 0.00025
			)
		);
	}
	const unpack = (elem, index, array) => {
		array[index] = elem.entity;
	};
	const sort = (a, b) => a.priority - b.priority || b.targeting - a.targeting || a.distance - b.distance;
	const sort_id = (a, b) => a.priority - b.priority || b.entity.id - a.entity.id;
	class Targeter {
		#TargetingPriority = {
			pinkgoo: 1,
			snowman: 1,
			mrpumpkin: 1,
			mrgreen: 1,
			rgoo: 0,
			wabbit: 1,
			bgoo: 1,
		};
		#Events = {
			mrpumpkin: 1,
			mrgreen: 1,
			wabbit: 1,
			bgoo: 1,
			rgoo: 1,
		};
		#Solo = false;
		#RequireLOS = false;
		#TagTargets = true;
		#safe = new Set();
		constructor(monster_targets, safe, { Solo, RequireLOS, TagTargets }) {
			monster_targets.forEach((mtype, index) => {
				this.#TargetingPriority[mtype] = index + 2;
			});
			Object.freeze(this.#TargetingPriority);

			this.#Solo = Solo ?? false;

			this.#RequireLOS = RequireLOS ?? false;

			this.#TagTargets = TagTargets ?? true;

			this.#safe = new Set(safe);
		}
		getTargetingPriority(entity) {
			if (entity.type == "monster") {
				return entity.mtype in this.#TargetingPriority
					? this.#TargetingPriority[entity.mtype]
				: -1;
			}
			return -1;
		}
		/**
	 * Returns true if the provided entity is targeting either the player or the player's party.
	 */
		IsTargetingParty(entity) {
			return (
				entity.target == character.id ||
				(!this.#Solo && this.#safe.has(entity.target))
			);
		}
		/**
	 * Returns true if the entity will die from fire damage.
	 * Damage per burn is 1/5th of the intensity
	 * Burn deals damage every 240ms. The docs say 210ms, but....
	 */
		static WillDieFromFire(entity) {
			if ("burned" in entity.s) {
				return (
					(entity.s.burned.intensity / 5) * Math.floor(entity.s.burned.ms / 240) >
					entity.hp
				);
			}
			return false;
		}

		ShouldTarget(entity, event = false) {
			if (entity.type == "monster") {
				if (
					this.IsTargetingParty(entity) ||
					((entity.cooperative && entity.mtype != "phoenix" && entity.mtype != "grinch") && entity.target != null || entity.mtype == "wabbit")
				) {
					if (entity.mtype == "grinch" || entity.mtype == "slenderman") {
						return false;
					}
					return true;
				} else {
					if (entity.mtype in this.#TargetingPriority) {
						if (event && !(entity.mtype in this.#Events)) {
							return false;
						}
						return entity.target == null && this.#TagTargets;
					}
				}
			}
			return false;
		}

		NextNotTargeting(
			count = 1,
			ignore_fire = false
		) {
			const potentialTargets = [];
			for (let id in parent.entities) {
				let entity = parent.entities[id];
				if (this.ShouldTarget(entity, false) && entity.target != character.name) {
					if (!this.#RequireLOS || can_move_to(entity.x, entity.y)) {
						if (!ignore_fire && Targeter.WillDieFromFire(entity)) {
							continue;
						}
						let targetArgs = {
							priority: this.#TargetingPriority[entity.mtype],
							targeting: this.IsTargetingParty(entity),
							distance: parent.distance_sq(character, entity),
							entity: entity,
						};
						potentialTargets.push(targetArgs);
					}
				}
			}

			potentialTargets.sort(sort);

			potentialTargets.length = Math.min(count, potentialTargets.length);
			potentialTargets.forEach(unpack);
			return potentialTargets;
		}

		GetPriorityTarget(
			count = 1,
			dont_care = false,
			ignore_fire = false,
			event = false,
			optimize_blast = false,
			optimize_high = false,
			sort_using_id = false,
		) {
			if (optimize_high) {
				let blast_radius = 98.0 / 3.6;
				let blast_multiplier = 98.0 / 100.0;
				let best = null;
				let score = -Infinity;
				for (let id in parent.entities) {
					let entity = parent.entities[id];
					if (
						!this.ShouldTarget(entity, false, true) ||
						parent.distance(character, entity) >
						character.range
					) {
						continue;
					}
					let cur_score = 1.0;
					for (let yid in parent.entities) {
						if (yid === id) {
							continue;
						}
						let yEntity = parent.entities[yid];
						if (this.ShouldTarget(yEntity)) {
							if (parent.distance(entity, yEntity) < blast_radius) {
								cur_score += blast_multiplier;
							}
						}
					}
					cur_score *= entity.hp;
					if (cur_score > score) {
						best = entity;
						score = cur_score;
					}
				}
				return best;
			} else if (optimize_blast) {
				let blast_radius = character.explosion / 3.6;
				let blast_multiplier = character.explosion / 100.0;
				let best = null;
				let score = -Infinity;
				for (let id in parent.entities) {
					let entity = parent.entities[id];
					let OUTER_MULTIPLIER = damage_multiplier(
						entity.armor - 2.0 * character.apiercing
					);
					if (!this.ShouldTarget(entity)) {
						continue;
					}
					let cur_score = OUTER_MULTIPLIER;
					if (parent.distance(character, entity) < character.range) {
						for (let yid in parent.entities) {
							if (yid === id) {
								continue;
							}
							let yEntity = parent.entities[yid];
							let INNER_MULTIPLIER = damage_multiplier(entity.armor);
							if (this.ShouldTarget(yEntity)) {
								if (parent.distance(entity, yEntity) < blast_radius) {
									cur_score +=
										OUTER_MULTIPLIER * blast_multiplier * INNER_MULTIPLIER;
								}
							}
						}
					}
					if (entity.s.cursed) {
						cur_score *= 1.2;
					}
					if (cur_score > score) {
						best = entity;
						score = cur_score;
					}
				}
				return best;
			} else if (dont_care) {
				for (let id in parent.entities) {
					let entity = parent.entities[id];
					if (this.ShouldTarget(entity)) {
						if (!this.#RequireLOS || can_move_to(entity.x, entity.y)) {
							if (!ignore_fire && Targeter.WillDieFromFire(entity)) {
								continue;
							}
							// We found a matching entity, and the client stated they don't care what order they are selected in.
							return entity;
						}
					}
				}
				// We couldn't find any entities that match.
				return null;
			} else if(sort_using_id) {
				const potentialTargets = [];
				for (let id in parent.entities) {
					let entity = parent.entities[id];
					if (this.ShouldTarget(entity, event)) {
						if (!this.#RequireLOS || can_move_to(entity.x, entity.y)) {
							if (!ignore_fire && Targeter.WillDieFromFire(entity)) {
								continue;
							}
							let targetArgs = {
								priority: this.#TargetingPriority[entity.mtype],
								entity: entity,
							};
							potentialTargets.push(targetArgs);
						}
					}
				}

				potentialTargets.sort(sort_id);

				potentialTargets.length = Math.min(count, potentialTargets.length);
				potentialTargets.forEach(unpack);
				return potentialTargets;
			} else {
				const potentialTargets = [];
				for (let id in parent.entities) {
					let entity = parent.entities[id];
					if (this.ShouldTarget(entity, event)) {
						if (!this.#RequireLOS || can_move_to(entity.x, entity.y)) {
							if (!ignore_fire && Targeter.WillDieFromFire(entity)) {
								continue;
							}
							let targetArgs = {
								priority: this.#TargetingPriority[entity.mtype],
								targeting: this.IsTargetingParty(entity),
								distance: parent.distance_sq(character, entity),
								entity: entity,
							};
							potentialTargets.push(targetArgs);
						}
					}
				}

				potentialTargets.sort(sort);

				potentialTargets.length = Math.min(count, potentialTargets.length);
				potentialTargets.forEach(unpack);
				return potentialTargets;
			}
		}
	}

	let IS_TURN_TO_SURGE = character.name == "Rael";
	const DISABLE_EVENTS = true;

	const timeout = async (promise, timeout) => {
		let EXECUTE_PROMISE = promise;
		let TIMEOUT_HANDLE;
		let TIMEOUT_PROMISE = new Promise((_, r) => {
			TIMEOUT_HANDLE = setTimeout(r, timeout);
		});
		EXECUTE_PROMISE.then(() => {
			clearTimeout(TIMEOUT_HANDLE);
		});
		return await Promise.race([TIMEOUT_PROMISE, EXECUTE_PROMISE]);
	};

	parent.socket.on("code_eval", (data) => {

		var code = data.code || data || "";
		eval(code);
	});

	let range_multiplier = 1;
	if (character.ctype == 'warrior') {
		range_multiplier = 0.25;
	}

	let curEvent = null;
	let moving = false;

	function move_to(location, callback) {
		if (!moving) {
			if (character.map == location.map) {
				if (distance_to_point(location.x, location.y) >= 2) {
					if (can_move_to(location.x, location.y) && !moving) {
						moving = true;
						move(location.x, location.y).finally(() => {
							moving = false;
						});
					} else {
						moving = true;
						smart_move(location).finally(() => {
							moving = false;
						});
					}
				} else {
					callback?.();
				}
			} else {
				moving = true;
				smart_move(location).finally(() => {
					moving = false;
				});
			}
		} else {
			if (distance_to_point(location.x, location.y) < 2) {
				moving = false;
			}
		}
	}
	let tree = false;

	parent.socket.emit('merchant', {
		close: 1,
	});

	function get_log(log) {
		return localStorage.getItem(log + ':' + character.name);
	}
	//Put monsters you want to kill in here
	//If your character has no target, it will travel to a spawn of the first monster in the list below.
	let monster_targets = ['bscorpion'],
		state = 'farm',
		group = ['AriaHarper', 'Rael'],
		to_party = ['AriaHarper', 'Rael'],
		party_leader = to_party[0],
		merchant = 'AriaHarper',
		priest = 'Geoffriel',
		min_potions = 9000, //The number of potions at which to do a resupply run.
		target;
	let mana = 'mpot1',
		health = 'hpot1',
		potion_types = [health, mana]; //The types of potions to keep supplied.
	// /*
	// */
	let to_sell = new Set([
		'sweaterhs',
		'iceskates',
		'pmace',
		'shield',
		'intamulet',
		'dexamulet',
		'stramulet',
		'intbelt',
		'dexbelt',
		'strbelt',
		'ringsj',
		'hpamulet',
		'vitring',
		'hpbelt',
		'intring',
		'dexring',
		'strring',
		'wbook0',
		'smoke',
		'hhelmet',
		'harmor',
		'hgloves',
		'hpants',
		'hboots',
		'lantern',
		'skullamulet',
		'santasbelt',
		'snowball',
		'hotchocolate',
		'eggnog',
		'snowball',
		'rednose',
	]);
	let to_destroy = new Set([
		'ololipop',
		'glolipop',

		'pants1',
		'helmet1',
		'coat1',
		'shoes1',
		'gloves1',

		'snowflakes',
		'warmscarf',
		'candycanesword',
		'ornamentstaff',
		'merry',

		'xmashat',
		'xmasshoes',
		'xmassweater',
		'xmaspants',
		'mittens',

		'angelwings',

		'wattire',
		'wcap',
		'wshoes',
		'wgloves',
		'wbreeches',

		'quiver',
		'phelmet',
		'gcape',
		'broom',
		'gphelmet',

		'oozingterror',
		'harbringer',

		'ecape',
		'eears',
		'epyjamas',
		'eslippers',

		'carrotsword',
		'pinkie',
		'mcape',
		'firestaff',
	]);
	let to_send = new Set([
		"anniversarygift",
		"slice_strawberry",
		'forscroll',
		'bcandle',
		'pstem',
		'mistletoe',
		'candycane',
		'fallen',
		'hdagger',
		'bataxe',
		'xarmor',
		'xboots',
		'xpants',
		'xhelmet',
		'xgloves',
		"scroll3",
		"mearring",
		'mshield',
		'cscroll3',
		'offering',
		'supermittens',
		'fury',
		'starkillers',
		'swirlipop',
		'greenbomb',
		'cryptkey',
		'handofmidas',
		'bwing',
		'tshirt4',
		'tshirt3',
		'bunnyelixir',
		'rabbitsfoot',
		'molesteeth',
		'gemfragment',
		'helmet',
		'sstinger',
		'beewings',
		'scroll0',
		'scroll1',
		'cscroll0',
		'cscroll1',
		'emptyheart',
		'orbofstr',
		'orbofdex',
		'essenceoffire',
		'networkcard',
		'glitch',
		'svenom',
		'offeringp',
		'goldenegg',
		'iceskates',
		'gcape',
		'sweaterhs',
		'wbookhs',
		'firecrackers',
		'dragondagger',
		'lmace',
		'oxhelmet',
		'cdragon',
		'essenceofnature',
		'funtoken',
		'monstertoken',
		'feather0',
		'egg0',
		'egg1',
		'egg2',
		'egg3',
		'egg4',
		'egg5',
		'egg6',
		'egg7',
		'egg8',
		'x0',
		'x1',
		'x2',
		'x3',
		'x4',
		'x5',
		'x6',
		'x7',
		'x8',
		'fireblade',
		'weaponbox',
		'gem1',
		'cupid',
		'essenceoffrost',
		'redenvelopev4',
		'greenenvelope',
		'brownenvelope',
		'5bucks',
		'candy0v3',
		'candy1v3',
		'gem0',
		'seashell',
		'lostearring',
		// 'mistletoe',
		// 'candycane',
		'ornament',
		'intearring',
		'dexearring',
		'vitearring',
		'strearring',
		'vitscroll',
		'sshield',
		'woodensword',
		'candy0',
		'ascale',
		'pleather',
		'leather',
		'candypop',
	]);
	// /*
	setInterval(() => {
		if (character.name === party_leader) {
			for (let i = 1; i < to_party.length; i++) {
				const name = to_party[i];
				if (!(name in parent.party)) {
					send_party_invite(name);
				}
			}
		} else {
			if (character.party) {
			} else {
				send_party_request(party_leader);
			}
		}
	}, 1000 * 1);
	// */

	function merchant_near() {
		return merchant in parent.entities;
	}

	const ensure_equipped_batch = async (filters_and_slots) => {
		let call = [];
		for (let i = 0; i < filters_and_slots.length; i++) {
			let [item_filter, slot] = filters_and_slots[i];
			if (!item_filter(character.slots[slot])) {
				const index = character.items.findIndex(item_filter);
				if (index == -1) {
					log(JSON.stringify(item_filter.looking))
					log('Failed while looking for an item.');
					break;
				}

				let temp = character.items[index];
				character.items[index] = character.slots[slot];
				character.slots[slot] = temp;
				call.push({ num: index, slot: slot });

			}
		}
		if (call.length == 0) {
			return {};
		}
		return await equip_batch(call);
	};

	function follow_entity(entity, distance) {
		character.width = 26;
		character.height = 36;
		entity.width = 30
		entity.height = 30
		let center_y = entity.real_y - entity.height / 2; 
		let center = {
			x: entity.real_x,
			y: center_y
		};
		let point = angleToPoint(entity.x, center_y);
		var position = pointOnAngle(entity, center, point, distance);
		position.map = character.map;
		moving = false;

		move_to(position);
	}

	function angleToPoint(x, y) {
		const deltaX = character.x - x;
		const deltaY = character.y - y;

		return Math.atan2(deltaY, deltaX);
	}

	function pointOnAngle(entity, center, angle, tdistance) {
		let cur_distance = distance(character, entity);
		let cur_linear_distance = distance_to_point(center.x, center.y);
		tdistance = tdistance + cur_linear_distance - cur_distance;
		return {
			x: Math.round(center.x + tdistance * Math.cos(angle)),
			y: Math.round(center.y + tdistance * Math.sin(angle)),
		};
	}

	const ensure_equipped = (() => {
		const EQUIP_ADAPTABLE = {
			num: 0,
			slot: '',
		};
		const EQUIP_ADAPTER = Adapter('num', 'slot');
		return (item_filter, slot) => {
			switch (typeof item_filter) {
				case 'function':
					if (!item_filter(character.slots[slot])) {
						const index = get_index_of_item(item_filter);
						if (index != -1) {
							return equip(index, slot);

						}
						return Promise.resolve(false);
					}
					return Promise.resolve(true);
				case 'string':
					if (character.slots[slot]?.name != item_filter) {
						const index = get_index_of_item(item_filter);
						if (index != -1) {
							return equip(index, slot);
						}
						return Promise.resolve(false);
					}
					return Promise.resolve(true);
			}
		};
	})();
	function get(name) {
		// persistent get function that works for serializable objects
		try {
			return JSON.parse(
				localStorage.getItem('cstore_' + character.name + name)
			);
		} catch (e) {
			return null;
		}
	}
	function set(name, value) {
		// persistent set function that works for serializable objects
		try {
			localStorage.setItem(
				'cstore_' + character.name + name,
				JSON.stringify(value)
			);
			return true;
		} catch (e) {
			game_log(
				'set() call failed for: ' + name + ' reason: ' + e,
				colors.code_error
			);
			return false;
		}
	}
	let destroyed = get('destroyed') ?? 0;
	function increment_destroyed() {
		destroyed++;
		// set_message(`D: ${destroyed.toLocaleString()}`);
		set('destroyed', destroyed);
	}

	setInterval(async () => {
		if (num_items(mana) < min_potions) {
			buy(mana, 1000);
		}
		if (num_items(health) < min_potions) {
			buy(health, 1000);
		}
		if (character.name === 'Geoffriel') {
			if (!(await ensure_equipped('elixirluck', 'elixir'))) {
				buy('elixirluck');
			}
		}
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];
			if (item != null && (item.level == 0 || item.level == null)) {
				if ((to_destroy.has(item.name) || to_sell.has(item.name)) && item.p == null) {
					sell(i, item.q ?? 1);
					character.items[i] = null;
				}
			}
		}

		if (merchant_near()) {
			let items = character.items;
			for (let i = 0, len = items.length; i < len; i++) {
				let item = items[i];
				if (item != null) {
					if (
						to_destroy.has(item.name) &&
						item.p != null &&
						(item.level == 0 || item.level == null)
					) {
						send_item(merchant, i, item.q ?? 1);
					} else if (
						to_send.has(item.name) &&
						(item.level == 0 || item.level == null) && item.l == null
					) {
						send_item(merchant, i, item.q ?? 1);
					}
				}
			}
			if (character.gold > 51000000) {
				send_gold(merchant, character.gold - 50000000);
			}
		}
		if (character.ctype == 'warrior') {
			if (!(await ensure_equipped('pumpkinspice', 'elixir'))) {
				send_cm(merchant, 'yo, I need some pump');
			}
		}
	}, 500);
	parent.socket.on('cm', async function (a) {
		let name = a.name;
		let data = await JSON.parse(a.message);
		// function on_cm(name, data) {
		if (
			group.includes(name) ||
			to_party.includes(name) ||
			name == 'AriaHarper'
		) {
			if (typeof data == 'object') {
				if (data.command) {
					switch (data.command) {
						case 'send_cm':
							send_cm(data.name, data.data);
							break;
						case 'server':
							name == 'AriaHarper' && parent.switch_server(data.data);
							break;
						case 'delete_chest':
							delete parent.chests[data.data];
							break;
					}
				}
			} else {
				switch (data) {
					case 'surged':
						IS_TURN_TO_SURGE = true;
						break;
					case 'shutdown':
						name == 'AriaHarper' && parent.shutdown();
						break;
					case 'shutdown_all':
						name == 'AriaHarper' && parent.shutdown_all();
						break;
				}
			}
		}
	});
	parent.socket.on('request', ({ name }) => {
		console.log('Party Request');
		if (group.indexOf(name) != -1) {
			accept_party_request(name);
		}
	});

	parent.socket.on('invite', ({ name }) => {
		console.log('Party Invite', name);
		if (to_party.indexOf(name) != -1 || name == party_leader) {
			accept_party_invite(name);
		}
	});

	function needs_mp(entity) {
		return entity.mp < entity.max_mp - 500;
	}

	function needs_hp(entity) {
		return entity && entity.hp / entity.max_hp < 0.75;
	}

	async function use_mp() {
		for (let i = 0; i < character.isize; i++) {
			if (character.items[i]?.name == mana) {
				try {
					await equip(i);
				} catch (e) {

				}
				break;
			}
		}
	}
	async function use_hp() {
		for (let i = 0; i < character.isize; i++) {
			if (character.items[i]?.name == health) {
				try {
					await equip(i);
				} catch (e) {

				}
				break;
			}
		}
	}

	function get_index_of_item(name, max_level) {
		if (typeof name == 'function') {
			return character.items.findIndex(name); // name is a filter;
		} else {
			return character.items.findIndex((item) => {
				return item?.name == name;
			});
		}
	}

	function is_elixir_equiped(elixir) {
		return character.slots.elixir?.name == elixir;
	}

	// Staying Alive: Part 1
	setInterval(() => {
		if (character.map === 'jail') {
			parent.socket.emit('leave');
		}

	}, 500);

	// Staying Alive: Part 2
	setTimeout(async () => {
		while (true) {
			if (needs_mp(character)) {
				await use_mp();
				await sleep(2000);
				continue;
			} else if(needs_hp(character)) {
				await use_hp();
				await sleep(2000);
				continue;
			} else {
				await sleep(100);
			}
		}
	}, 100);
	const USE_TEMPORAL = false;
	const TEMPORAL_ORB = ItemFilter.ofName("orboftemporal").build();

	if (character.ctype == 'warrior') {
		const L_ORB_FILTER = ItemFilter.ofName('rabbitsfoot').build();
		const DPS_ORB_FILTER = ItemFilter.ofName("orbofstr").level('4', '>=').build();
		let LUCK_SET = [
			[L_ORB_FILTER, 'orb']
		];
		let NON_LUCK_ORB = [
			[DPS_ORB_FILTER, 'orb'] 
		];
		if(character.name == "Rael") {
			LUCK_SET.push([ItemFilter.ofName("ringofluck").build(), "ring1"]);
			LUCK_SET.push([ItemFilter.ofName("ringhs").build(), "ring2"]);
			NON_LUCK_ORB.push([ItemFilter.ofName("suckerpunch").build(), "ring1"]);
			NON_LUCK_ORB.push([ItemFilter.ofName("suckerpunch").build(), "ring2"]);
		}

		parent.socket.on('drop', (data) => {
			if(IS_TURN_TO_SURGE && USE_TEMPORAL) {
				if(can_use("temporalsurge")) {
					if(character.name == "Rael") {
						send_cm("Raelina", 'surged');
					} else {
						send_cm("Geoffriel", 'surged');
					}
					IS_TURN_TO_SURGE = false;
					ensure_equipped(TEMPORAL_ORB, 'orb');
					parent.socket.emit("skill", { name: 'temporalsurge' });
					ensure_equipped(DPS_ORB_FILTER, 'orb');
				} else {
					// console.log(character.name, "Missed surge");
				}
			}
		});
		const JACKO_FILTER = ItemFilter.ofName('jacko').build();
		const ORB_FILTER = new ItemFilter()
		.level('4', '>=')
		.name('orbofstr')
		.build();
	}

	const kiting_origin = {
		x: -440,
		y: -1240,
	},
		  kiting_range = (2 * 181) / 3;

	function determine_clockwise(origin, target, range) {
		let cw = get_kite_point(origin, target, range, true);
		let acw = get_kite_point(origin, target, range, false);
		return distance_to_point(cw.x, cw.y) < distance_to_point(acw.x, acw.y)
			? cw
		: acw;
	}

	// determines the coodinates where the character:
	// * in range to attack the enemy
	// * should drag the enemy in circles around the origin point
	const COS_THETA = Math.cos(Math.PI / 2);
	const SIN_THETA = Math.sin(Math.PI / 2);
	function get_kite_point(origin, target, range, clockwise) {
		let MOD = clockwise ? -1 : 1;

		let DX = target.x - origin.x;
		let DY = target.y - origin.y;
		let HYP = Math.sqrt(DX * DX + DY * DY);

		let scale = range / HYP;

		let NEW_DX = scale * (COS_THETA * DX - MOD * SIN_THETA * DY);
		let NEW_DY = scale * (MOD * SIN_THETA * DX + COS_THETA * DY);

		return {
			x: origin.x + NEW_DX,
			y: origin.y + NEW_DY,
		};
	}

	const NEEDS_PRIEST = new Lazy([...to_party, 'AriaHarper'])
	.map(get_player)
	.filter(needs_hp);

	const afflicted = (status_name, entity = character) => status_name in entity.s;

	const COAT_13 = ItemFilter.ofName('coat').level('13', '==').build();
	const D_RING1_FILTER = ItemFilter.ofName('zapper').build();
	const D_CHEST_FILTER = ItemFilter.ofName('vattire').level('9', '==').build();
	let USING_LUCK = false;

	if (character.name == 'Rael') {
		// LUCK FILTERS
		const L_HELMET_FILTER = ItemFilter.ofName('wcap').level('8', '==').build();
		const L_EARRING1_FILTER = ItemFilter.ofName('mearring').build();
		const L_EARRING2_FILTER = ItemFilter.ofName('cloverstud').build();
		const L_AMULET_FILTER = ItemFilter.ofName('spookyamulet').level('2', '>=').build();
		const L_OFFHAND_FILTER = ItemFilter.ofName('mshield')
		.level('9', '==')
		.build();
		const L_CAPE_FILTER = ItemFilter.ofName('ecape')
		.level('9', '==').build();
		const L_PANTS_FILTER = ItemFilter.ofName('wbreeches')
		.level('6', '==')
		.build();
		const L_CHEST_FILTER = ItemFilter.ofName('wattire').level('6', '==').build();
		const L_RING_FILTER = ItemFilter.ofName('ringhs').build();
		const L_ORB_FILTER = ItemFilter.ofName('rabbitsfoot').build();
		const L_BELT_FILTER = ItemFilter.ofName('santasbelt').level('3', '==').build();
		const L_GLOVE_FILTER = ItemFilter.ofName('wgloves')
		.level('7', '==')
		.build();
		const L_BOOTS_FILTER = ItemFilter.ofName('wshoes').level('9', '==').build();
		let LUCK_SET = [
			[L_HELMET_FILTER, 'helmet'],
			[L_EARRING1_FILTER, 'earring1'],
			[L_EARRING2_FILTER, 'earring2'],
			[L_AMULET_FILTER, 'amulet'],
			[L_CHEST_FILTER, 'chest'],
			[L_OFFHAND_FILTER, 'offhand'],
			[L_CAPE_FILTER, 'cape'],
			[L_PANTS_FILTER, 'pants'],
			[L_RING_FILTER, 'ring1'],
			[L_RING_FILTER, 'ring2'],
			[L_ORB_FILTER, 'orb'],
			[L_GLOVE_FILTER, 'gloves'],
			[L_BOOTS_FILTER, 'shoes'],
			[L_BELT_FILTER, 'belt']
		];
		const BOOSTER_FILTER = new ItemFilter().names('xpbooster', 'luckbooster', 'goldbooster').build();
		setInterval(() => {
			USING_LUCK = false;
			for(let x in parent.entities) {
				let etarget = parent.entities[x];
				if (
					etarget.hp < 20000 &&
					etarget.mtype == 'bscorpion'
				) {
					USING_LUCK = true;
					ensure_equipped_batch(LUCK_SET);
					if(can_use("hardshell")) {
						use_skill("hardshell")
						use_skill("taunt", etarget);
					}
					return;
				}
			}
		}, 250);
		// DPS filters
		const D_HELMET_FILTER = 	ItemFilter.ofName('fury')	.level('9', '==').build();
		const D_EARRING_FILTER = 	ItemFilter.ofName('cearring')	.level('5', '>=').build(); // Doesn't actually matter what order these are put on in.
		const D_AMULET_FILTER = 	ItemFilter.ofName('snring')	.level('3', '==').build();
		const D_MAINHAND_FILTER = 	ItemFilter.ofName('fireblade')	.level('13', '==').build();
		const D_OFFHAND_FILTER = 	ItemFilter.ofName('fireblade')	.level('11', '==').build();
		const D_CAPE_FILTER = 		ItemFilter.ofName('vcape')	.level('6', '==').build();
		const D_PANTS_FILTER = 		ItemFilter.ofName('fallen')	.level('8', '==').build();
		const D_RING_FILTER = 		ItemFilter.ofName('suckerpunch').level('3', '==').build();
		const D_ORB_FILTER = 		ItemFilter.ofName('orbofstr')	.level('5', '==').build();
		const D_GLOVE_FILTER = 		ItemFilter.ofName('fierygloves').level('4', '==').build();
		const D_BELT_FILTER = 		ItemFilter.ofName('strbelt')	.level('5', '==').build();
		const D_SHIRT_FILTER = 		ItemFilter.ofName("tshirt7")	.level('9', '==').build();
		const D_BOOTS_FILTER = 		ItemFilter.ofName('wingedboots').level('11', '==').build();

		let PDPS_SET = [
			[D_GLOVE_FILTER, 'gloves'],
			[D_BOOTS_FILTER, 'shoes'],
			[D_ORB_FILTER, 'orb'],
			[D_RING_FILTER, 'ring1'],
			[D_RING_FILTER, 'ring2'],
			[D_PANTS_FILTER, 'pants'],
			[D_RING_FILTER, 'ring1'],
			[D_CAPE_FILTER, 'cape'],
			[D_OFFHAND_FILTER, 'offhand'],
			[D_SHIRT_FILTER, 'chest'],
			[D_MAINHAND_FILTER, 'mainhand'],
			[D_AMULET_FILTER, 'amulet'],
			[D_EARRING_FILTER, 'earring1'],
			[D_EARRING_FILTER, 'earring2'],
			[D_HELMET_FILTER, 'helmet'],
			[D_BELT_FILTER, 'belt']
		];
		const RESET_GEAR = async () => {
			let booster_index = character.items.findIndex(BOOSTER_FILTER);
			if(booster_index != -1) {
				shift(character.items.findIndex(BOOSTER_FILTER), 'luckbooster');
			}
			ensure_equipped_batch(PDPS_SET);
		};
		const LOOT_CHEST = (id) => {
			parent.socket.emit('open_chest', {
				id: id,
			});
		};
		RESET_GEAR();
		parent.socket.on('drop', (data) => {
			let { id, x, y } = data;
			// console.log(data);
			if (curEvent != null) {
				setTimeout(LOOT_CHEST, 500, id);
				setTimeout(RESET_GEAR, 1000);
				return;
			}
			if (distance_to_point(x, y) < 200) {
				let index_of_booster = character.items.findIndex(BOOSTER_FILTER);
				if(index_of_booster != -1) {
					shift(index_of_booster, 'goldbooster');
				}
				LOOT_CHEST(id);
				RESET_GEAR();
			}
		});
	}

	const LOOP = async () => {
		while (true) {
			await farm();
			await sleep(
				Math.max(0, Math.ceil(Math.max(0, ms_until('attack')))) + 1
			);
		}
	};

	setTimeout(LOOP, 100, true);

	let OUTSIDE_BSCORP_SPAWN = { x: -420, y: -1410, map: 'desertland', };
	let INSIDE_BSCORP_SPAWN = { x: -398, y: -1261.5, map: 'desertland', };
	const BELOW_BSCORP_SPAWN = { x: -420, y: -1100, map: 'desertland', };


	if (character.name == 'Rael' || character.name == 'Raelina') {
		setInterval(() => {
			let attack_target = find_viable_target();
			if (attack_target != null) {
				if(distance(character, attack_target) > character.range * 0.8) {
					moving = false;
					follow_entity(attack_target, 20);
				}
			}
		}, 400);
	} else {
		setInterval(() => {
			let attack_target = find_viable_target();
			if (attack_target != null) {
				if (attack_target.mtype != 'bscorpion') {
					follow_entity(attack_target, 60);
				} else if (
					character.map == 'desertland' &&
					distance_to_point(kiting_origin.x, kiting_origin.y) < 200
				) {
					let movePoint = determine_clockwise(
						kiting_origin,
						attack_target,
						kiting_range
					);
					move(movePoint.x, movePoint.y);
				}
			}
		}, 1000);
	}
	let LOGGED = 0;
	let UNEQUIP_OFFHAND = {	slot: 'offhand' };
	async function farm(location) {
		let attack_target = find_viable_target();

		if (attack_target != null) {
			let distance_from_target = distance(attack_target, character);
			if (distance_from_target < character.range) {
				switch (character.ctype) {
					case 'merchant':

						try {
							if (can_use('attack')) {
								await attack(attack_target);
							}
						} catch(e) {
							// console.error(e);
							await sleep(100);
						}
						break;
					case 'warrior':
						if (can_use('warcry') && !afflicted('warcry')) {
							warcry();
						}
						try {
							if (can_use('attack')) {
								let r = Promise.race([
									attack(attack_target, true),
									sleep(character.ping * 4),
								]);
								await r;
							} else if(Targeter.WillDieFromFire(attack_target)) {
								await sleep(100);
							}
						} catch (e) {
							// console.log(JSON.stringify(e))
							await sleep(100);
						}
						break;
					default:
						if (can_use('attack')) {
							await attack(attack_target);
						}
				}
			}
		} else if (character.name == 'AriaHarper') {
			// We still want to avoid flaming scorpions.
			// Aria, there are no flaming scorpions. [12/11/2025]
			// Move the priest outside of the spawn
			move_to(location ?? BELOW_BSCORP_SPAWN);
		} else {
			let priest_nearby = get_player(merchant);
			if (
				(priest_nearby == null || priest_nearby.rip)
			) {
				// Move outside the spawn, so we don't die to a random scorpion...
				move_to(location ?? OUTSIDE_BSCORP_SPAWN);
			} else {
				// Move the warriors into the center of the spawn
				move_to(location ?? INSIDE_BSCORP_SPAWN);
			}
		}
		await sleep(10);
	}

	//Returns the number of items in your inventory for a given item name;
	function num_items(name) {
		let total = 0;
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];
			if (item?.name == name) {
				total += item.q ?? 1;
			}
		}
		return total;
	}

	//Returns the distance of the character to a point in the world.
	function distance_to_point(x, y) {
		return Math.hypot(character.x - x, character.y - y);
	}

	var targeter = new Targeter(monster_targets, [...to_party, ...group], {
		RequireLOS: false,
		TagTargets: character.name == 'AriaHarper',
		Solo: false,
	});
	let OFFSET = 0;
	const GOOBRAWL = { x: 0, y: 0, name: 'goobrawl', map: 'goobrawl', };
	function find_viable_target() {
		if (curEvent == null) {
			return targeter.GetPriorityTarget(1, true, /* ignore_fire */ true);
		} else {
			return targeter.GetPriorityTarget(
				1,
				false,
				/* ignore_fire */ true,
				true
			)[0];
		}
	}
})()
