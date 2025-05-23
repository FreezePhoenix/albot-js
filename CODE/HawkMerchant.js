const { Mover, Exchange, Dismantle } = await proxied_require("Mover.js", "Exchange.js", "Dismantle.js");
	Exchange("redenvelopev4");
	Dismantle("bowofthedead", "swordofthedead", "staffofthedead", "daggerofthedead", "maceofthedead", "spearofthedead");
	Mover.init(smart, G, smart_move);
	let purchase_amount = 1000;
	function num_items(name) {
		let item_count = 0;
		for (let i = 0; i < character.isize; i++) {
			let item = character.items[i];
			item_count += item?.name === name ? item.q ?? 1 : 0;
		}

		return item_count;
	}
const tree_exists = G.maps.main.npcs.find(({ id }) => id == "newyear_tree");
	setInterval(() => {
		if (character.moving && character.stand) {
			parent.socket.emit("merchant", { close: 1 });
		} else if(!character.moving && !character.stand) {
			parent.socket.emit("merchant",{num:41});
		}
	}, 250);
	if (character.name == "AriaHarper") {
		const whitelist = [
			"hpamulet",
			"hpbelt",
			"gloves1",
			"smoke",
			"broom",
			"xmaspants",
			"xmashat",
			"candycanesword",
			"xmasshoes",
			"warmscarf",
			"rednose",
			"xmassweater",
			"merry",
			// "ornamentstaff",
			"pants1",
			"skullamulet",
			"coat1",
			"shoes1",
			"helmet1",
			// "mittens",
			"ringsj",
			"phelmet",
			"throwingstars",
			"snowball",
			"wcap",
			"wshoes",
			"cclaw",
			"wattire",
			"wgloves",
			"carrotsword",
			"wbreeches",
			"intamulet",
			"dexamulet",
			"stramulet",
			"quiver",
			"ecape",
			"eslippers",
			"epyjamas",
			"eears",
			"pinkie"
		];
		setInterval(() => {
			for (let i = 0, len = character.isize; i < len; i++) {
				let item = character.items[i];
				if (whitelist.includes(item?.name) && (item?.level ?? 0) < 1 && !item?.p) {
					sell(i, item?.q ?? 1);
			}
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
	proxied_require("restock.js").then(({ restock }) => {
		restock({
			sell: {
				feather0: [200000, 999, -1],
				strring: [125000000, 1, 4],
				offeringp: [4000000, 100, -1],
				mittens: [30000, 1, 0],
				ornamentstaff: [700000, 1, 5]
			}
		});
	});

	let group = ["Raelina", "Rael", "Geoffriel"];
	setInterval(() => {
		for (let i = 0; i < group.length; i++) {
			let target = parent.entities[group[i]];
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
	let STATE = "guard";
	function state_detector() {
		if (tree_exists && !character.s.holidayspirit) {
			STATE = "tree";
		} else if(can_use("fishing")) {
			STATE = "fishing";
		} else if(can_use("mining")) {
			STATE = "mining";
		} else {
			STATE = "guard";
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
		} else if (!moving &&
				   distance_to_point(location.x, location.y) > 1
				  ) {
			moving = true;
			Mover.move_by_path(location, () => {
				moving = false;
			});
		}
		if(character.map == location.map && distance_to_point(location.x, location.y) < 1) {
			callback?.();
		}
	}
	function ensure_equipped(item_name, slot) {
		if(character.slots[slot]?.name != item_name) {
		   let index = get_index_of_item(item_name);
		equip(index);
	}
} 
 function go_fishing() {
	if(!character.c.fishing) {
		use_skill("fishing");
	}
}
function go_mining() {
	if(!character.c.mining) {
		use_skill("mining");
	}
}
setInterval(state_detector, 1000);

const sell_location = { x: -100, y: -100, map: "main" };
const guard_location = { x: -500, y: -1415, map: "desertland" };
const fishing_location = { x: -1365, y: -15, map: "main" };
const mining_location = { x: 279, y: -105, map: "tunnel" };
setInterval(() => {
	if (!banking) {
		if(character.targets > 0) {
			if(can_use("scare")) {
				ensure_equipped("jacko", "orb");
				use_skill("scare");
			}
		} else {
			ensure_equipped("ftrinket", "orb");
		}
		switch(STATE) {
			case "tree":
				ensure_equipped("broom", "mainhand");
				happy_holidays();
				break;
			case "guard":
				ensure_equipped("broom", "mainhand");
				move_to({ x: 1370, y: 115, map: "main" });
				break;
			case "fishing":
				ensure_equipped("rod", "mainhand");
				move_to(fishing_location, go_fishing);
				break;
			case "mining":
				ensure_equipped("pickaxe", "mainhand");
				move_to(mining_location, go_mining);
				break;
		}
	} else {
		ensure_equipped("broom", "mainhand");
	}
}, 1000);

let banking = false;
let should_bank = true;
let to_bank_gold = 100000000000;
if (should_bank) {
	// Object<ItemID, [Level | Count, Pack]>
	const deposit_whitelist = {
		suckerpunch: [0, 0],
		crabclaw: [10, 1],
		lantern: [0, 2],
		oozingterror: [0, 4],
		harbringer: [0, 4],
		greenenvelope: [1, 1],
		pvptoken: [1, 1],
		// ornamentstaff: [5, 9, "bank_b"]
	},
		  shiny_bank_pack = 5;

	["str", "dex", "vit", "int"].forEach((statType) => {
		for(let i = 0; i < 3; i++) {
			let item_name = "elixir" + statType + i;
			deposit_whitelist[item_name] = [1, 0];
		}
	});
	setInterval(function() {
		let local_banking = false;
		if (character.gold > to_bank_gold) {
			local_banking = "bank";
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
								local_banking = list_definition[2] ?? "bank";
								break;
							}
							} else {
								if ((item.q || 1) >= list_definition[0]) {
									local_banking = list_definition[2] ?? "bank";
									break;
								}
								}
							} else if (item.p && !item.p.chance) {
								local_banking = "bank";
								break;
							}
						}
					}
				}
				banking = local_banking;
				if (banking) {
					if (character.map != local_banking) {
						if (!smart.moving && !character.moving) {
							smart_move(local_banking);
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
		let luck_targets = ["Rael", "Raelina", "Geoffriel"];
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
				buy("elixirluck", 1);
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
						parent.shutdown();
					} else if (data == "yo, I need some luck") {
						let player = get_player(name);
						if (player != null) {
							send_item(
								name,
								character.items.findIndex(item => {
									return item != null && item.name == "elixirluck";
								}),
								1
							);
							if (
								can_use("mluck") &&
								distance_to_point(player.real_x, player.real_y) <
								G.skills.mluck.range
							) {
								use_skill("mluck", player);
							}
						}
					} else if (data == "yo, I need some pump") {
						let player = get_player(name);
						if (player != null) {
							send_item(
								name,
								character.items.findIndex(item => {
									return item != null && item.name == "pumpkinspice";
								}),
								1
							);
							if (
								can_use("mluck") &&
								distance_to_point(player.real_x, player.real_y) <
								G.skills.mluck.range
							) {
								use_skill("mluck", player);
							}
						}
					} else if (data == "yo, I need some bunny") {
						let player = get_player(name);
						if (player != null) {
							send_item(
								name,
								character.items
								.map(item => (item || {}).name)
								.indexOf("bunnyelixir"),
								1
							);
							if (
								can_use("mluck") &&
								distance_to_point(player.real_x, player.real_y) <
								G.skills.mluck.range
							) {
								use_skill("mluck", player);
							}
						}
					} else if (data == "yo, I need some dex") {
						let player = get_player(name);
						if (player != null) {
							send_item(
								name,
								character.items
								.map(item => (item || {}).name)
								.indexOf("elixirdex1"),
								1
							);
							if (
								can_use("mluck") &&
								distance_to_point(player.real_x, player.real_y) <
								G.skills.mluck.range
							) {
								use_skill("mluck", player);
							}
						}
					} else if (data == "yo, I need some gold") {
						send_gold(name, 20000);
					} else if (data == "yo, I need some MP") {
						if (name == "Firenus" || name == "Geoffriel") {
							if (num_items("mpot1") > 0) {
								send_item(name, get_index_of_item("mpot1"), 1000);
							} else {
								buy("mpot1", purchase_amount);
							}
						} else {
							if (num_items("mpot0") > 0) {
								send_item(name, get_index_of_item("mpot0"), 1000);
							} else {
								buy("mpot0", purchase_amount);
							}
						}
					} else if (data == "yo, I need some HP") {
						if (num_items("hpot0") > 0) {
							send_item(name, get_index_of_item("hpot0"), 1000);
						} else {
							buy("hpot0", purchase_amount);
						}
					}
				}
			}
		};
		let handler;
		parent.socket.on(
			"cm",
			(handler = function(a) {
				let name = a.name;
				let data = JSON.parse(a.message);
				on_cm(name, data);
			})
		);
		function on_destroy() {
			parent.socket.off("cm");
		}
		parent.past_cm_handlers.push(handler);
		let upgrade_items = function(filter, level, gold_limit, quantity) {
			if (typeof filter == "string") {
				let name = filter;
				filter = a => a.name == name;
			}
			let target = {
				name: filter,
				level: level
			};
			// Only items in the whitelists will be upgraded, items not in the list or above the required level are ignored.
			//Courtesy of: Mark

			var en = true; //Enable Upgrading of items = true, Disable Upgrading of items = false
			var emaxlevel = target.level;
			var whitelist = filter;
			// Upgrading [enhancing] [will only upgrade items that are in your inventory & in the whitelist] //

			setInterval(function() {
				if (en && character.bank == null) {
					upgrade(emaxlevel);
				}
			}, 1000 / 2); // Loops every 30 seconds.
			function upgrade(level) {
				let num_made = character.items.reduce((ret, value) => {
					return (
						(value != null && whitelist(value) && value.level == emaxlevel) + ret
					);
				}, 0);
				let item = character.items.find(item => {
					if (item !== null) {
						if (whitelist(item)) {
							if (G.items[item.name].upgrade) {
            					if (item.level < emaxlevel && !item.p) {
									return true;
								}
							}
						}
					}
					return false;
				});
				if (item != null && !character.q.upgrade) {
					let c = item;
					if (character.gold > gold_limit && num_made < quantity) {
						if (c && whitelist(c) && c.level < level) {
							let grades = parent.G.items[c.name].grades
							let scrollname;
							if (c.level < grades[0]) scrollname = "scroll1";
							else if (c.level < grades[1]) scrollname = "scroll1";
							else scrollname = "scroll2";

							let [scroll_slot, scroll] = find_item(i => i.name == scrollname);
							if (!scroll) {
								parent.buy(scrollname);
								return;
							}
							parent.socket.emit("upgrade", {
								item_num: character.items.indexOf(c),
								scroll_num: scroll_slot,
								offering_num: null,
								clevel: c.level
							});
							return;
						}
					}
				} else if (num_made < quantity) {
					// buy(whitelist[0])
				}
			}

			// Returns the item slot and the item given the slot to start from and a filter.
			function find_item(filter) {
				for (let i = 0; i < character.items.length; i++) {
					let item = character.items[i];

					if (item && filter(item)) return [i, character.items[i]];
				}

				return [-1, null];
			}
		};
		(function() {
			// Auto Compounding
			// Courtesy of: Mark
			var cf = true;
			var cp = true; //Set to true in order to allow compounding of items
			var whitelist = ['jacko', 'skullamulet'];
			var use_better_scrolls = true; //240,000 Gold Scroll = true [only will use for +2 and higher], 6,400 Gold Scroll = false [will only use base scroll no matter what]
			var maxLevel = 2;
			//compound settings

			setInterval(function() {
				//Compound Items
				if (cp) {
					compound_items();
				}

			}, 1000 / 4); // Loops every 1/4 seconds.
			function compound_items() {
				let to_compound = character.items.reduce((collection, item, index) => {
					if (item && item.level < maxLevel && whitelist.includes(item.name)) {
						let key = item.name + item.level;
						!collection.has(key) ? collection.set(key, [item.level, index, item]) : collection.get(key).push(index, item);
					}
					return collection;
				}, new Map());
				if(!character.q.compound) {
					for (var c of to_compound.values()) {
						let scroll_name;
						try {
							scroll_name = calculate_item_grade(G.items[c[2].name], c[2]) ? 'cscroll1' : 'cscroll0';
							for (let i = 1; i + 5 < c.length; i += 6) {
								console.log(c)
								let [scroll, _] = find_item(i => i.name == scroll_name);
								if (scroll == -1) {
									parent.buy(scroll_name);
									return;
								}
								parent.socket.emit('compound', {
									items: [c[i], c[i + 2], c[i + 4]],
									scroll_num: scroll,
									offering_num: null,
									clevel: c[0]
								});
							}
						} catch (e) {
							console.log(e)
						}
					}
				}
			}

			function find_item(filter) {
				for (let i = 0; i < character.items.length; i++) {
					let item = character.items[i];

					if (item && filter(item))
						return [i, character.items[i]];
				}

				return [-1, null];
			}
		})();
		upgrade_items("ornamentstaff", 5, 0, 19);
		// upgrade_items("harbringer", 5, 0, 19);