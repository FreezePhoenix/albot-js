const max = Math.max;
const min = Math.min;
if (parent.distance_sq == null) {
	parent.distance_sq = function distance_sq(_a, _b, in_check) {
	// https://discord.com/channels/238332476743745536/1025784763958693958
	if (!_a || !_b) return 99999999;
	if ("in" in _a && "in" in _b && _a.in != _b.in) return 99999999;
	if ("map" in _a && "map" in _b && _a.map != _b.map) return 99999999;

	const a_x = _a.x
	const a_y = _a.y
	const b_x = _b.x
	const b_y = _b.y
  
	const a_w2 = _a.width / 2
	const a_h = _a.height
	const b_w2 = _b.width / 2
	const b_h = _b.height

	// Check if they're just 2 points
	if(a_w2 == 0 && a_h == 0 && b_w2 == 0 && b_h == 0) {
    let dx = a_x - b_x;
    let dy = a_y - b_y;
    return dx * dx + dy * dy;
  }

	// Check overlap
	if ((a_x - a_w2) <= (b_x + b_w2)
		&& (a_x + a_w2) >= (b_x - b_w2)
		&& (a_y) >= (b_y - b_h) 
		&& (a_y - a_h) <= (b_y) ) return 0

	let min = 99999999;
	let a_x1 = a_x + a_w2;
	let a_x2 = a_x - a_w2;
	let b_x1 = b_x + b_w2;
	let b_x2 = b_x - b_w2;
	let a_y1 = a_y;
	let a_y2 = a_y - a_h;
	let b_y1 = b_y;
	let b_y2 = b_y - b_h;
    let minX = Math.min(
    	Math.abs(a_x1 - b_x1), 
    	Math.abs(a_x1 - b_x2),
    	Math.abs(a_x2 - b_x1), 
    	Math.abs(a_x2 - b_x2)
    );
    let minY = Math.min(
    	Math.abs(a_y1 - b_y1),
    	Math.abs(a_y1 - b_y2),
    	Math.abs(a_y2 - b_y1), 
    	Math.abs(a_y2 - b_y2)
    );
    return minX * minX + minY * minY;
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
const sort = (a, b) => {
	if (a.priority > b.priority) {
		return 1;
	} else if (a.priority < b.priority) {
		return -1;
	} else if (a.targeting > b.targeting) {
		return -1;
	} else if (b.targeting > a.targeting) {
		return 1;
	} else if (b.targeting == a.targeting) {
		if (a.distance > b.distance) {
			return 1;
		} else if (a.distance < b.distance) {
			return -1;
		}
	} else if (a.distance > b.distance) {
		return -1;
	} else if (a.distance < b.distance) {
		return 1;
	} else {
		return -1;
	}
};
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
				(entity.cooperative && entity.target != null || entity.mtype == "wabbit")
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
				if (!this.#RequireLOS || can_move_to(entity.real_x, entity.real_y)) {
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
		optimize_high = false
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
					if (!this.#RequireLOS || can_move_to(entity.real_x, entity.real_y)) {
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
		} else {
			const potentialTargets = [];
			for (let id in parent.entities) {
				let entity = parent.entities[id];
				if (this.ShouldTarget(entity, event)) {
					if (!this.#RequireLOS || can_move_to(entity.real_x, entity.real_y)) {
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
module.exports = Targeter;
