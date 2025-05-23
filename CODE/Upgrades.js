let doUpgrades = false;
if (doUpgrades) {
	setTimeout(async function () {
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
		function swap(a, b) {
			// inventory move/swap
			parent.socket.emit('imove', { a: a, b: b });
			return parent.push_deferred('imove');
		}
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
		let scrolls = [1, 2, 2, 2, 2, 2, 2, 2, 2];
		let offering = [0, 0, 0, 1, 1, 1, 1, 2, 2];
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
			if (num_items(PRODUCED_FILTER) >= 8) {
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
					await buy('blade');
					continue;
				}
				parent.socket.emit('craft', {
					items: [
						[0, fire_index],
						[1, blade_index],
					],
				});
				await sleep(200);
				continue;
			}
			let level = character.items[fb_i].level;
			let scroll_i = get_index_of_item(getScrollFilter(scrolls[level]));
			if (scroll_i == -1) {
				await buy(`scroll${scrolls[level]}`);
				continue;
			}
			let offeringInd = get_index_of_item(
				getOfferingFilter(offering[level])
			);
			if (offeringInd == -1) {
				if (offering[level] == 1) {
					// Can't do stuff without primlings, wait for one to come in.
					await sleep(100);
					continue;
				}
				if (offering[level] == 2) {
					await buy('offering');
					continue;
				}
			}
			let chance = await upgrade(fb_i, scroll_i, offeringInd, true);
			if (chance.chance * 100 >= chances[level] || level < 4) {
				console.log(
					`Attempting upgrade: ${level} -> ${
						level + 1
					} with chance ${(chance.chance * 100).toFixed(2)}`
				);
				if (fb_i != 0) {
					if (scroll_i == 0) {
						scroll_i = fb_i;
					}
					if (offeringInd == 0) {
						offeringInd = fb_i;
					}
					await swap(fb_i, 0);
					fb_i = 0;
				}

				if (level > 4) {
					parent.socket.emit('skill', { name: 'massproductionpp' });
				} else {
					parent.socket.emit('skill', { name: 'massproduction' });
				}
				let result = await upgrade(fb_i, scroll_i, offeringInd, false);
				console.log(`Success: ${result.success}`);
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
						await buy(
							`scroll${failstack_scrolls[failstack_level]}`
						);
						continue;
					}
					if (
						can_use('mp') &&
						character.mp + 500 < character.max_mp
					) {
						use_skill('mp');
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
					continue;
				}
				let failstack_item_index = get_index_of_item(
					failstack_offering_filters[level]
				);
				if (failstack_item_index == -1) {
					await buy('helmet');
					continue;
				}
				let failstack_level =
					character.items[failstack_item_index].level ?? 0;
				let failstack_scroll_index = get_index_of_item(
					getScrollFilter(failstack_scrolls[failstack_level])
				);
				if (failstack_scroll_index == -1) {
					await buy(`scroll${failstack_scrolls[failstack_level]}`);
					continue;
				}
				/* game_log(
					`Building failstack to raise chance from ${(
						chance.chance * 100
					).toFixed(2)} to ${chances[level]}`
				); // */
				game_log(
					`Attempting failstack: ${failstack_level} -> ${
						failstack_level + 1
					}`
				);
				if (can_use('mp') && character.mp + 500 < character.max_mp) {
					await use_skill('mp');
				}
				if (failstack_level > 4) {
					parent.socket.emit('skill', { name: 'massproductionpp' });
				} else {
					parent.socket.emit('skill', { name: 'massproduction' });
				}
				if (failstack_level == level) {
					if (failstack_item_index == 0) {
						if (failstack_scroll_index == 1) {
							failstack_scroll_index = 0;
						}
						await swap(0, 1);
						failstack_item_index = 1;
					}
				} else {
					if (failstack_item_index != 0) {
						if (failstack_scroll_index == 0) {
							failstack_scroll_index = failstack_item_index;
						}
						await swap(0, failstack_item_index);
						failstack_item_index = 0;
					}
				}
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
		}
	}, 0);
}
