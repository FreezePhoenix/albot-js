let { CompleteAdapter } = await require('CompleteAdapter.js');

let FILTERS = [];

const EXCHANGE_ADAPTABLE = CompleteAdapter('item_num', 'q');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function P_EXCHANGE(item_num) {
	if (character.q.exchange) {
		return Promise.resolve({
			success: false,
			in_progress: true,
			num: character.q.exchange.num,
			response: 'data',
			place: 'exchange',
		});
	} else {
		if(character.mp > 300) {
			parent.socket.emit('skill', {name: "massexchangepp"});
		} else if(character.mp > 50) {
			parent.socket.emit('skill', {name: "massexchange"});
		}
		parent.socket.emit('exchange', EXCHANGE_ADAPTABLE(item_num, character.items[item_num].q));
		return parent.push_deferred('exchange');
	}
}

async function EXCHANGE(item_num) {
	var call = await P_EXCHANGE(item_num),
		num = undefined,
		name = undefined;
	if (!call.in_progress) return call;
	if (character.q.exchange) num = character.q.exchange.num;
	while (
		character.q.exchange ||
		(character.items[num] && character.items[num].name == 'placeholder')
	)
		await sleep(1);
	if (character.items[num]) name = character.items[num].name;
	else num = undefined;
	return { success: true, reward: name, num: num };
}

function swap(a, b) {
	parent.socket.emit('imove', { a: a, b: b });
	return parent.push_deferred('imove');
}

let enabled = true;
(async () => {
	main: while (true) {
		if (enabled && character.map != "bank" && character.map != "bank_b" && character.esize) {
			for (let i = 0; i < FILTERS.length; i++) {
				let [name, quantity, keep] = FILTERS[i];

				let first_index = -1;
				for (let i = 0; i < 42; i++) {
					if (character.items[i]?.name == name) {
						if (character.items[i].q >= quantity + keep) {
							await EXCHANGE(i);
							continue main;
						} else if (first_index == -1) {
							first_index = i;
						} else {
							await swap(first_index, i);
							continue main;
						}
					}
				}
			}
		}
		await sleep(1000);
	}
})();

module.exports = (name, quantity = 1, keep = 0) => {
	FILTERS.push([name, quantity, keep]);
};

module.exports.reset = () => {
	FILTERS.length = 0;
};

module.exports.toggle = () => {
	enabled = !enabled;
};
