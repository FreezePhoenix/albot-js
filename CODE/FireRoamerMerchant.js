const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const {
	restock,
	Mover,
	Exchange,
	Dismantle,
	ItemFilter,
	Adapter,
	EntityPresenceFilter,
} = await proxied_require(
	'Mover.js',
	'Exchange.js',
	'Dismantle.js',
	'restock.js',
	'ItemFilter.js',
	'Adapter.js',
	'EntityPresenceFilter.js'
);

function get(name)
{
	// persistent get function that works for serializable objects
	try{
		return JSON.parse(localStorage.getItem("cstore_"+name));
	}catch(e){
		return null;
	}
}
	function set(name,value)
{
	// persistent set function that works for serializable objects
	try{
		localStorage.setItem("cstore_"+name,JSON.stringify(value));
		return true;
	}catch(e){
		game_log("set() call failed for: "+name+" reason: "+e,colors.code_error);
		return false;
	}
}
	let destroyed = get("destroyed") ?? 0;
	set_message(`D: ${destroyed.toLocaleString()}`); 
	function increment_destroyed() {
		destroyed++;
		// set_message(`D: ${destroyed.toLocaleString()}`); 
		set("destroyed", destroyed);
	}


setInterval(() => {
	if (character.party != undefined && character.party != 'earthWar') {
		parent.socket.emit('party', { event: 'leave' });
	}
	if (character.party != 'earthWar') {
		parent.socket.emit('party', { event: 'request', name: 'earthWar' });
	}
}, 30000);
restock({
	sell: {
		bataxe: [10000000, -1, -1],
		// pinkie: [300000, -1, -1],
		// offeringp: [2000000, 100, -1],
		offeringp: [
			2500000,
			100,
			-1,
			EntityPresenceFilter(
				'cclair',
				'fathergreen',
				'kakaka',
				'kouin',
				'mule0',
				'piredude',
				'mule2',
				'mule1',
				'mule3',
				'mule5',
				'mule6',
				'mule10',
				'mule8',
				'bataxedude',
				'mule7',
				'mule9',
				'kekeke',
				'yezzir',
				'testmule',
				'kikiki',
				'kokoko',
				'kukuku',
				'HardcoreS',
				'mule4',
				'muledebt',
				'qaqaqa',
				'mulekek',
				'mulelul',
				'mulexd',
				'muleharper',
				'mule69',
				'sapinotte'
			),
		],
	},
	buy: {},
});

parent.socket.on('game_response', (data) => {
	if (data.response == 'item_received') {
		if (data.item == 'mysterybox') {
			if (data.q > 8) {
				parent.socket.emit('say', {
					message:
						"Please contact AriaHarper on discord to respond. Sorry, I couldn't code something up this fast.",
					code: false,
					name: data.name,
				});
				parent.socket.emit('mail', {
					to: 'AriaHarper',
					subject: `${data.name} sent ${data.q} mystery boxes`,
					message: '',
					item: false,
				});
			} else {
				let prim_response = 125 * (data.q ?? 1);
				let prim_index = character.items.findIndex(
					(item) =>
						item != null &&
						item.name == 'offeringp' &&
						item.q >= prim_response
				);
				if (prim_index != -1) {
					send_item(data.name, prim_index, prim_response);
				} else {
					parent.socket.emit('say', {
						message:
							'Please contact AriaHarper on discord to respond. We are out of primlings, and cannot send you enough.',
						code: false,
						name: data.name,
					});
					parent.socket.emit('mail', {
						to: 'AriaHarper',
						subject: `${data.name} sent ${data.q} mystery boxes`,
						message: '',
						item: false,
					});
				}
			}
		}
	}
});

parent.socket.emit('respawn');

const group = ['Raelina', 'Rael', 'Geoffriel'];

const tree_exists = G.maps.main.npcs.find(({ id }) => id == 'newyear_tree');
// Dismantle(
// );
Exchange('candy1');
Exchange('gem1');
Exchange('weaponbox');
Exchange('armorbox');
Exchange('greenenvelope');
Mover.init(smart, G, smart_move);
let tree = false;
let purchase_amount = 1000;
function num_items(name) {
	let item_count = 0;
	if (typeof name == 'function') {
		for (let i = 0; i < character.isize; i++) {
			let item = character.items[i];
			item_count += name(item) ? item.q ?? 1 : 0;
		}
	} else {
		for (let i = 0; i < character.isize; i++) {
			let item = character.items[i];
			item_count += item?.name === name ? item.q ?? 1 : 0;
		}
	}

	return item_count;
}
setInterval(() => {
	if (num_items('mpot1') < 5000) {
		buy('mpot1', 5000);
	}
}, 1000);
function happy_holidays() {
	G.maps.main.npcs.find(({ id }) => id === 'newyear_tree').return = true;
	// If first argument of "smart_move" includes "return"
	// You are placed back to your original point
	tree = true;
	let xmas_tree = G.maps.main.npcs.find(({ id }) => id === 'newyear_tree');
	if (!smart.moving) {
		if (character.map == 'main') {
			use_skill('use_town');
		}
		let coords = {
			x: character.x,
			y: character.y,
		};
		smart_move(
			{
				x: xmas_tree.position[0],
				y: xmas_tree.position[1] - 100,
				map: 'main',
			},
			function () {
				tree = false;
				if (character.ctype != 'mage') {
					send_cm('Firenus', 'teleport');
				} else {
					use_skill('blink', [coords.x, coords.y]);
				}
				// This executes when we reach our destination
				parent.socket.emit('interaction', {
					type: 'newyear_tree',
				});
				say('Happy Holidays!');
			}
		);
	}
}
setInterval(() => {
	if (character.moving && character.stand) {
		parent.socket.emit('merchant', { close: 1 });
	} else if (!character.moving && !character.stand) {
		parent.socket.emit('merchant', { num: 41 });
	}
}, 250);
const whitelist = [
  'hpot1',
	'whiteegg',
	'beewings',
	'lspores',
	'rfangs',
	'wbook0',
	'dexring',
	'intring',
	'strring',
	'vitring',
	'dexearring',
	'intearring',
	'strearring',
	// "spookyamulet",
	'hpamulet',
	'hpbelt',
	'smoke',
	'broom',
	'ringsj',
	'wshield',
	'snowball',
	'intbelt',
	'dexbelt',
	'strbelt',
	'intamulet',
	'dexamulet',
	'stramulet',
	'ecape',
	'lantern',
	'eslippers',
	'epyjamas',
	'eears',
	'skullamulet',
	'gcape',
	'sweaterhs',
	// "pinkie",
	'xmassweater',
	'carrotsword',
	'xmasshoes',
	'mittens',
	'merry',
	'rednose',
	'warmscarf',
	'xmaspants',
	'xmashat',
	'ornamentstaff',
	'candycanesword',
];
let destroy = [
  'cupid',
  'firestaff',
  'fireblade',
	'sword',
	'helmet',
	'gloves',
	'pants',
	'shoes',
	'coat',
	'gloves1',
	'pants1',
	'coat1',
	'shoes1',
	'helmet1',
  'vgloves',
  'vboots',
	'bowofthedead',
	'swordofthedead',
	'staffofthedead',
	'daggerofthedead',
	'maceofthedead',
	'spearofthedead',
	'quiver',
	'wshoes',
	'gphelmet',
	'wattire',
	'throwingstars',
	'woodensword',
	'wcap',
	'cclaw',
	'sshield',
	'phelmet',
	'wgloves',
	'wbreeches',
	'tshirt2',
	'tshirt0',
  'oozingterror',
	'tshirt1',
  
		"pmace",
		"dagger",
		"sword",
		"t2bow",
		"basher",
		"swifty",
		"spear",
		"broom",
		"gcape",
		"pouchbow",
	// "tshirt3",
	// "tshirt4"
];
setInterval(() => {
	for (let i = 0, len = character.isize; i < len; i++) {
		let item = character.items[i];
		if (
			destroy.includes(item?.name) &&
			(item?.level ?? 0) < 1 &&
			!item?.p
		) {
			parent.socket.emit('destroy', { num: i, q: 1, statue: true });
      increment_destroyed();
			continue;
		}
		if (
			whitelist.includes(item?.name) &&
			(item?.level ?? 0) < 1 &&
			!item?.p
		) {
			sell(i);
		}
	}
}, 5000);

const distance_to_point = (x, y) => {
	return Math.sqrt(
		Math.pow(character.real_x - x, 2) + Math.pow(character.real_y - y, 2)
	);
};
let STATE = 'guard';
function state_detector() {
	STATE = 'guard';
	return;
	if (banking && ensure_equipped(BROOM_FILTER, 'mainhand') && false) {
		STATE = 'banking';
	} else if (
		tree_exists &&
		!character.s.holidayspirit &&
		ensure_equipped(BROOM_FILTER, 'mainhand')
	) {
		STATE = 'tree';
	} else if (can_use('fishing') && ensure_equipped(ROD_FILTER, 'mainhand')) {
		STATE = 'fishing';
	} else if (can_use('mining') && ensure_equipped('pickaxe', 'mainhand')) {
		STATE = 'mining';
	} else if (ensure_equipped(BROOM_FILTER, 'mainhand')) {
		STATE = 'guard';
	} else {
		STATE = 'guard';
		return;
		throw new Error('Could not determine state');
	}
}

let moving = false;
function move_to(location, callback) {
	if (
		can_move_to(location.x, location.y) &&
		distance_to_point(location.x, location.y) > 1 &&
		character.map == location.map
	) {
		move(location.x, location.y);
	} else if (!moving && distance_to_point(location.x, location.y) > 2) {
		moving = true;
		Mover.move_by_path(location, () => {
			moving = false;
		});
	}
	if (
		character.map == location.map &&
		distance_to_point(location.x, location.y) < 1
	) {
		callback?.();
	}
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
						parent.socket.emit(
							'equip',
							EQUIP_ADAPTER(EQUIP_ADAPTABLE, index, slot)
						);
						return true;
					}
					return false;
				}
				return true;
			case 'string':
				if (character.slots[slot]?.name != item_filter) {
					const index = get_index_of_item(item_filter);
					if (index != -1) {
						parent.socket.emit(
							'equip',
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
const go_fishing = () => {
	if (!character.c.fishing) {
		use_skill('fishing');
	}
};
const go_mining = () => {
	if (!character.c.mining) {
		use_skill('mining');
	}
};
setInterval(state_detector, 1000);
const JACKO_FILTER = ItemFilter.ofName('jacko').build();
const TIGER_FILTER = ItemFilter.ofName('tigerstone').build();
const T_OFFHAND_FILTER = ItemFilter.ofName('wshield').level('13', '==').build();
const K_OFFHAND_FILTER = ItemFilter.ofName('t2quiver').build();
// const guard_location = { x: 115, y: -1915, map: "desertland" };
const guard_location = { x: 365, y: -885, map: 'desertland' };
// const guard_location = { x: 1337, y: 420, map: "main" }
const fishing_location = { x: -1367, y: -15, map: 'main' };
const mining_location = { x: 279, y: -105, map: 'tunnel' };
const ORBIT_SPEED = 60;
const ORBIT_DISTANCE = 30;
const ORBIT_TARGET = { real_x: 243, real_y: -870 };
function cruise(speed) {
	parent.socket.emit('cruise', speed);
}
function hr_time() {
	if (parent.hrtime) {
		return Number(parent.hrtime() / 1_000_000n);
	} else {
		return Number(performance.now());
	}
}
const TWO_PI = 2 * Math.PI;
let angle = Math.asin(ORBIT_SPEED / 2 / ORBIT_DISTANCE);
const ORBIT_TIME = (TWO_PI / angle) * 1000;
const PARTY_OFFSET = 0.5;
function orbit() {
	const TIME_OFFSET = hr_time() / ORBIT_TIME;
	const OFFSET = (PARTY_OFFSET + TIME_OFFSET) % 1.0;
	const ORBIT_ANGLE = OFFSET * TWO_PI;
	const DEST_X = ORBIT_TARGET.real_x + ORBIT_DISTANCE * Math.cos(ORBIT_ANGLE);
	const DEST_Y = ORBIT_TARGET.real_y + ORBIT_DISTANCE * Math.sin(ORBIT_ANGLE);
	move(DEST_X, DEST_Y);
}
setInterval(() => {
	let ents = 0;
	let selected_tree = null;
	for (let id in parent.entities) {
		let entity = parent.entities[id];
		if (entity.type === 'monster' && entity.mtype == 'ent') {
			ents++;
			if (entity.target == character.name) {
				selected_tree = entity;
			}
		}
	}
	if (selected_tree == null) {
		let max_level = 0;
		for (let id in parent.entities) {
			let entity = parent.entities[id];
			if (entity.type === 'monster' && entity.mtype == 'ent') {
				if (entity.level > max_level && (entity.target != "Rael" && entity.target != "Raelina")) {
					selected_tree = entity;
					max_level = entity.level;
				}
			}
		}
	}
	ensure_equipped(JACKO_FILTER, 'orb');
	ensure_equipped(K_OFFHAND_FILTER, 'offhand');
  if (distance_to_point(guard_location.x, guard_location.y) < 10 || true) {
		if (ents >= 1 || true) {
			move_to(guard_location);
		} else {
			move_to({ x: -420, y: -1900, map: 'desertland' });
		}
	} else if (selected_tree) {
		move_to(guard_location);
		let dist = distance(character, selected_tree);
		if (dist > 150) {
			if (can_use('attack')) {
				attack(selected_tree);
			}
		} else if (dist < 100 && selected_tree.target == character.name) {
			use_skill('scare');
		}
	} else if(!moving) {
    move_to(guard_location);
  }
}, 500);

let banking = false;
let should_bank = true;
let to_bank_gold = 100_000_000_000;
// Object<ItemID, [Level | Count, Pack]>
const deposit_whitelist = {
		suckerpunch: [0, 0],
		crabclaw: [10, 1],
		lantern: [0, 2],
		oozingterror: [0, 4],
		harbringer: [0, 4],
		// greenenvelope: [1, 1],
		pvptoken: [1, 1],
	},
	shiny_bank_pack = 5;
setInterval(() => {
	return;
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
				} else if (item.p && !item.p.chance && false) {
					local_banking = true;
					break;
				}
			}
		}
	}
	banking = local_banking;
	if (banking) {
		if (character.map != 'bank') {
			if (!moving && !smart.moving && !character.moving) {
				moving = true;
				Mover.move_by_path({ x: 0, y: 0, map: 'bank' }, () => {
					moving = false;
				});
			}
		} else {
			if (character.gold > to_bank_gold) {
				parent.socket.emit('bank', {
					operation: 'deposit',
					amount: character.gold - (character.gold % to_bank_gold),
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
								parent.socket.emit('bank', {
									operation: 'swap',
									inv: i,
									str: -1,
									pack: 'items' + bank_pack,
								});
							}
						} else {
							if ((item.q || 1) >= list_definition[0]) {
								let bank_pack = list_definition[1];
								parent.socket.emit('bank', {
									operation: 'swap',
									inv: i,
									str: -1,
									pack: 'items' + bank_pack,
								});
							}
						}
					} else if (item.p && !item.p.chance) {
						parent.socket.emit('bank', {
							operation: 'swap',
							inv: i,
							str: -1,
							pack: 'items' + shiny_bank_pack,
						});
					}
				}
			}
		}
	}
}, 1000);
let luck_targets = ['Rael', 'Raelina', 'Geoffriel', 'AriaHarper'];
let luck_target = 0;
setInterval(() => {
	if (!smart.moving) {
		use_skill(
			'mluck',
			parent.entities[
				luck_targets[
					(luck_target = ++luck_target % luck_targets.length)
				]
			] ?? character
		);
	}
}, 4000);
const get_index_of_item = (filter) => {
	if (filter == null) {
		return null;
	}
	switch (typeof filter) {
		case 'function':
			return character.items.findIndex(filter);
		case 'string':
			return character.items.findIndex((item) => {
				return item?.name == filter;
			});
	}
};
// const socket = parent.socket;

const check_present = (name) => name in parent.entities;

const cm_handler = (() => {
	return ({ name, message: data }) => {
		if (group.includes(name)) {
			if (typeof data == 'object') {
			} else {
				try {
					data = JSON.parse(data);
				} catch (e) {}
				switch (data) {
					case 'shutdown':
						parent.shutdown();
						break;
					case 'yo, I need some pump':
						if (check_present(name)) {
							send_item(
								name,
								get_index_of_item(PUMPKIN_FILTER),
								1
							);
						}
						break;
					case 'yo, I need some bunny':
						if (check_present(name)) {
							send_item(name, get_index_of_item(BUNNY_FILTER), 1);
						}
						break;
					case 'yo, I need some gold':
						send_gold(name, 20000);
						break;
				}
			}
		}
	};
})();
function needs_mp(entity) {
	return entity.mp / entity.max_mp < 0.75;
}
async function use_mp() {
	for (let i = 0; i < character.isize; i++) {
		if (character.items[i]?.name?.startsWith?.('mpot1')) {
			try {
				await equip(i);
			} catch (e) {
				console.log('wth', e);
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
		} else {
			await sleep(100);
		}
	}
}, 100);
(function () {
	// Auto Compounding
	// Courtesy of: Mark
	var cf = true;
	var cp = true; //Set to true in order to allow compounding of items
	var whitelist = ['jacko', 'talkingskull', 'orbofstr', 'orbofdex', 'cearring', 'cring'];
	var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
	var maxLevel = 2;
	//compound settings

	setInterval(function () {
		//Compound Items
		if (cp) {
			compound_items();
		}
	}, 1000 / 4); // Loops every 1/4 seconds.
	function compound_items() {
		let to_compound = character.items.reduce((collection, item, index) => {
			if (
				item &&
				item.level < maxLevel &&
				whitelist.includes(item.name)
			) {
				let key = item.name + item.level;
				!collection.has(key)
					? collection.set(key, [item.level, index, item])
					: collection.get(key).push(index, item);
			}
			return collection;
		}, new Map());
		if (!character.q.compound) {
			for (var c of to_compound.values()) {
				let scroll_name;
				try {
					scroll_name = calculate_item_grade(G.items[c[2].name], c[2])
						? 'cscroll1'
						: 'cscroll0';
          if(c[2].name != "orbofdex") {
						scroll_name = 'cscroll1';
					}
					for (let i = 1; i + 5 < c.length; i += 6) {
						console.log(c);
						let [scroll, _] = find_item(
							(i) => i.name == scroll_name
						);
						if (scroll == -1) {
							parent.buy(scroll_name);
							return;
						}
						parent.socket.emit('compound', {
							items: [c[i], c[i + 2], c[i + 4]],
							scroll_num: scroll,
							offering_num: null,
							clevel: c[0],
						});
					}
				} catch (e) {
					console.log(e);
				}
			}
		}
	}

	function find_item(filter) {
		for (let i = 0; i < character.items.length; i++) {
			let item = character.items[i];

			if (item && filter(item)) return [i, character.items[i]];
		}

		return [-1, null];
	}
})();

parent.socket.on('cm', (data) => {
	cm_handler(data);
});
function on_destroy() {
	parent.socket.off('cm');
}
let doUpgrades = false;
if (doUpgrades) {
	setTimeout(async function () {
		const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
		const LUCKY_BLADE = ItemFilter.ofName('fireblade')
			.level('4', '<=')
			.property('lucky')
			.build();
		const SHINY_BLADE = ItemFilter.ofName('fireblade')
			.level('4', '<=')
			.property('shiny')
			.build();
		const PRODUCED_FILTER = ItemFilter.ofName('fireblade')
			.level('9', '==')
			.build();
		const BLADE_FILTER = ItemFilter.ofName('blade').build();
		const FIREBLADE_FILTER = ItemFilter.ofName('fireblade')
			.level('8', '<=')
			.property(false)
			.build();
		const FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property(false)
			.build();
		const SHINY_FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property('shiny')
			.build();
		const LUCKY_FIREESSENCE_FILTER = ItemFilter.ofName('essenceoffire')
			.property('lucky')
			.build();
		const GREED_FILTER = ItemFilter.ofName('essenceofgreed').build();
		const T0_SCROLL = ItemFilter.ofName('scroll0').build();
		const T1_SCROLL = ItemFilter.ofName('scroll1').build();
		const T2_SCROLL = ItemFilter.ofName('scroll2').build();
		const PRIMLING_FILTER = ItemFilter.ofName('offeringp').build();
		const PRIMORDIAL_FILTER = ItemFilter.ofName('offering').build();

		let chances = [99.99, 99.99, 99.99, 92.0, 94.0, 74.0, 60.0, 42.0, 9.79];
		// let chances = [99.99, 97.00, 94.00, 92.00, 82.00, 62.00, 60.00, 42.00, 9.79];
		let failstack_offering_filters = [];
		let failstack_offering_filters_exact = [];
		for (let i = 0; i < chances.length + 1; i++) {
			failstack_offering_filters[i] = ItemFilter.ofName('helmet')
				.level(i, '<=')
				.build();
			failstack_offering_filters_exact[i] = ItemFilter.ofName('helmet')
				.level(i, '==')
				.build();
		}
		let failstack_scrolls = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2];
		let gains = [0, 0, 0, 0, 0, 1, 3.58, 3.92, 2.06, 0.29];
		// let scrolls =  [1, 2, 2, 2, 2, 2, 2, 2, 2];
		// let offering = [0, 0, 0, 1, 1, 1, 1, 1, 2];
		let scrolls = [1, 1, 1, 1, 1, 1, 1, 2, 2];
		let offering = [0, 0, 0, 0, 0, 0, 0, 1, 2];
		const getScrollFilter = (level) => {
			if (level == 0) {
				return T0_SCROLL;
			}
			if (level == 1) {
				return T1_SCROLL;
			}
			if (level == 2) {
				return T2_SCROLL;
			}
		};
		const getOfferingFilter = (level) => {
			if (level == 0) {
				return null;
			}
			if (level == 1) {
				return PRIMLING_FILTER;
			}
			if (level == 2) {
				return PRIMORDIAL_FILTER;
			}
		};
		while (true) {
			let pblade = get_index_of_item(LUCKY_BLADE);
			if (pblade == -1) {
				pblade = get_index_of_item(SHINY_BLADE);
			}
			if (pblade != -1) {
				parent.socket.emit('dismantle', { num: pblade });
			}
			if (num_items(PRODUCED_FILTER) >= 4) {
				break;
			}
			// Check if we have a FireBlade
			let fb_i = get_index_of_item(FIREBLADE_FILTER);
			if (fb_i == -1) {
				// In this branch, we don't have a FireBlade... unfortunate.
				// Check if we have fire essence.
				let fire_index = get_index_of_item(FIREESSENCE_FILTER);
				if (fire_index == -1) {
					// We don't have any fire essence. Abort.
					return;
				}
				let blade_index = get_index_of_item(BLADE_FILTER);
				if (blade_index == -1) {
					// Buy a blade, and then go to the next iteration of the loop.
					buy('blade');
					await sleep(1000);
					continue;
				}
				parent.socket.emit('craft', {
					items: [
						[0, fire_index],
						[1, blade_index],
					],
				});
				await sleep(1000);
				continue;
			}
			let level = character.items[fb_i].level;
			let scroll_i = get_index_of_item(getScrollFilter(scrolls[level]));
			if (scroll_i == -1) {
				buy(`scroll${scrolls[level]}`);
				await sleep(1000);
				continue;
			}
			let offeringInd = get_index_of_item(
				getOfferingFilter(offering[level])
			);
			if (offeringInd == -1) {
				if (offering[level] == 1) {
					// Can't do stuff without primlings, wait for one to come in.
					await sleep(1000);
					continue;
				}
				if (offering[level] == 2) {
					buy('offering');
					await sleep(1000);
					continue;
				}
			}
			let chance = await upgrade(fb_i, scroll_i, offeringInd, true);
			if (chance.chance * 100 >= chances[level] || true) {
				console.log(
					`Attempting upgrade: ${level} -> ${
						level + 1
					} with chance ${(chance.chance * 100).toFixed(2)}`
				);
				let result = await upgrade(fb_i, scroll_i, offeringInd, false);
				console.log(`Success: ${result.success}`);
				await sleep(250);
			} else {
				let num_failable = num_items(
					failstack_offering_filters_exact[level + 1]
				);
				if (
					num_failable * gains[level + 1] + chance.chance * 100 >=
					chances[level]
				) {
					let failstack_item_index = get_index_of_item(
						failstack_offering_filters_exact[level + 1]
					);
					let failstack_level =
						character.items[failstack_item_index].level ?? 0;
					let failstack_scroll_index = get_index_of_item(
						getScrollFilter(failstack_scrolls[failstack_level])
					);
					if (failstack_scroll_index == -1) {
						buy(`scroll${failstack_scrolls[failstack_level]}`);
						await sleep(1000);
						continue;
					}
					parent.socket.emit('skill', { name: 'massproduction' });
					console.log(
						`We have enough failstack items of level ${
							level + 1
						} to fail to get from ${(chance.chance * 100).toFixed(
							2
						)} to ${chances[level]}`
					);
					console.log(
						`Attempting failstack: ${failstack_level} -> ${
							failstack_level + 1
						}`
					);
					let result = await upgrade(
						failstack_item_index,
						failstack_scroll_index,
						null,
						false
					);
					console.log(`Failstack success: ${!result.success}`);
					await sleep(250);
					continue;
				}
				let failstack_item_index = get_index_of_item(
					failstack_offering_filters[level]
				);
				if (failstack_item_index == -1) {
					buy('helmet');
					await sleep(1000);
					continue;
				}
				let failstack_level =
					character.items[failstack_item_index].level ?? 0;
				let failstack_scroll_index = get_index_of_item(
					getScrollFilter(failstack_scrolls[failstack_level])
				);
				if (failstack_scroll_index == -1) {
					buy(`scroll${failstack_scrolls[failstack_level]}`);
					await sleep(1000);
					continue;
				}
				console.log(
					`Building failstack to raise chance from ${(
						chance.chance * 100
					).toFixed(2)} to ${chances[level]}`
				);
				console.log(
					`Attempting failstack: ${failstack_level} -> ${
						failstack_level + 1
					}`
				);
				parent.socket.emit('skill', { name: 'massproduction' });
				let result = await upgrade(
					failstack_item_index,
					failstack_scroll_index,
					null,
					false
				);
				if (failstack_level == level) {
					console.log(`Failstack success: ${!result.success}`);
				} else {
					console.log(`Failstack success: ${result.success}`);
				}
			}
			await sleep(250);
		}
	}, 0);
}
