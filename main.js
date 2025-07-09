require('dotenv').config();
process.on('uncaughtException', function (exception) {
	console.log(exception);
	console.log(exception.stack);
});

const {
	Worker,
	isMainThread,
	parentPort,
	workerData,
} = require('worker_threads');

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

let child_process = require('child_process'),
	HttpWrapper = require('./HttpWrapper'),
	httpWrapper = new HttpWrapper(),
	BotWebInterface = require('./bot-web-interface'),
	fs = require('fs'),
	http = require('http'),
	userData = require('./userData.js'),
	login = userData.login,
	bots = userData.bots;

BotWebInterface.startOnPort(userData.config.botWebInterface.port);

let gameData = null;
async function main() {
	var result = await httpWrapper.login(login.email, login.password),
		characters = await httpWrapper.getCharacters(),
		userAuth = await httpWrapper.getUserAuth();
	if (!result) {
		throw new Error('Login failed');
	}

	if (userData.config.fetch) {
		console.log('Populating config file with data.');
		userData.bots = [];
		for (let i = 0, len = characters.length; i < len; i++) {
			userData.bots[i] = {
				characterName: characters[i].name,
				characterId: characters[i].id,
				runScript: 'default.js',
				server: 'EU I',
			};
		}
		userData.config.fetch = false;
		userData.login.password = userData.login.email = 'not_saved';

		fs.writeFile(
			'./userData.json',
			JSON.stringify(userData, null, 4),
			() => {
				process.exit();
			}
		);
	}
  let true_bots = bots();

	//Checking for mistakes in userData.json
	if (!true_bots) {
		console.error('Missing field "bots" in userData.json');
	}

	for (let i = 0; i < true_bots.length; i++) {
		if (
			!(
				true_bots[i] &&
				(true_bots[i].characterId || true_bots[i].characterName) &&
				true_bots[i].runScript &&
				true_bots[i].server
			)
		) {
			throw new Error(
				'One or more necessary fields are missing from userData.json \n The following fields need to be present for a working executor:\n characterId or characterName\n runScript\n server\n'
			);
		}
	}

	//Reverse lookup name to characterId, names can't be used for starting a bot.
	for (let i = 0; i < true_bots.length; i++) {
		if (!true_bots[i].characterId) {
			for (let j = 0; j < characters.length; j++) {
				if (true_bots[i].characterName === characters[j].name) {
					true_bots[i].characterId = characters[j].id;
				}
			}
		}
	}

	//Check that ids are unique, we don't want to start a bot twice.
	for (let i = 0, len = true_bots.length; i < len; i++) {
		if (true_bots[i]) {
			for (let j = i + 1; j < len; j++) {
				if (true_bots[j]) {
					if (true_bots[i].characterId === true_bots[j].characterId) {
						console.error(
							'Duplicate characterId ' +
								true_bots[i].characterId +
								' ignoring second declaration.'
						);
						true_bots[j] = null;
					}
				}
			}
		}
	}

	let serverList = await httpWrapper.getServerList();
	if (userData.config.botWebInterface.start) {
		BotWebInterface.SocketServer.getPublisher().setStructure([
			{ name: 'name', type: 'text', label: 'name' },
			{ name: 'inv', type: 'text', label: 'Inventory' },
			{ name: 'level', type: 'text', label: 'Level' },
			{
				name: 'xp',
				type: 'progressBar',
				label: 'Experience',
				options: { color: 'green' },
			},
			{
				name: 'health',
				type: 'progressBar',
				label: 'Health',
				options: { color: 'red' },
			},
			{
				name: 'mana',
				type: 'progressBar',
				label: 'Mana',
				options: { color: 'blue' },
			},
			{
				name: 'goldh',
				type: 'outOfMax',
				label: 'Gold/H',
				options: { color: 'gold' },
			},
			{
				name: 'edps',
				type: 'breakdownBar',
				label: 'Ent DPS',
				options: {
					colors: ['darkblue', 'orange', 'red'],
					labels: ['NORMAL', 'BURN', 'BLAST'],
				},
			},
			{
				name: 'dps',
				type: 'breakdownBar',
				label: 'DPS',
				options: {
					colors: ['darkblue', 'orange', 'red', 'darkgreen'],
					labels: ['NORMAL', 'BURN', 'BLAST', 'CLEAVE'],
				},
			},
			{
				name: 'hps',
				type: 'breakdownBar',
				label: 'HPS',
				options: {
					colors: ['lightgreen', 'red', 'darkred'],
					labels: ['HEALS', 'POTIONS', 'LIFESTEAL'],
				},
			},
			{
				name: 'mps',
				type: 'breakdownBar',
				label: 'MPS',
				options: {
					colors: ['darkblue', 'lightblue'],
					labels: ['POTION', 'MANASTEAL'],
				},
			},
			// {
			//   name: "activity",
			//   type: "outOfMax",
			//   label: "Next Activity",
			//   options: { color: "purple" }
			// },
			{ name: 'cc', type: 'progressBar', label: 'Code Cost' },
			{ name: 'target', type: 'text', label: 'Target' },
			{ name: 'status', type: 'text', label: 'Status' },
			{ name: 'gold', type: 'text', label: 'Gold' },
			{ name: 'server', type: 'text', label: 'Server' },
			{ name: 'mp', type: 'text', label: 'Mana potions' },
			{ name: 'acc', type: 'outOfMax', label: 'AP' },
			{ name: 'itempd', type: 'text', label: 'Item/D' },
			{ name: 'xpPH', type: 'text', label: 'XP/H' },
			{ name: 'tilLevelUp', type: 'text', label: 'ETLU' },
			{ name: 'inventory', type: 'object' },
			{ name: 'script', type: 'text', label: 'Script' },
			{ name: 'ping', type: 'text', label: 'Ping' },
			{ name: 'map', type: 'text', label: 'Map' },
			{ name: 'cpu', type: 'outOfMax', label: 'CPU' },
			{ name: 'heap', type: 'outOfMax', label: 'memory' },
		]);
	}
	console.log('Everything passed...');
	console.log('Checking game version...');
	let oldVersion = await fs.promises.readFile('version');
	let gameVersion = await httpWrapper.getGameVersion();
	if (oldVersion != gameVersion) {
		console.log('Game UPDATE!');
		console.log('Fetching data.js');
		await fs.promises.writeFile('version', gameVersion);
		await httpWrapper.fetchGameData();
		console.log('Fetched!');
	} else {
		console.log('No update detected. Using old data.js');
	}
	//Checks are done, starting bots.
	// console.log(httpWrapper.serverList);
	let index = 0;
	gameData = await httpWrapper.getGameData();
	for (let bot of true_bots) {
		let serverInfo = await httpWrapper.getServerInfo(bot.server);
		if (serverInfo == null) {
			console.log(`Server not found: ${bot.server}`);
			process.exit();
		}
		let { ip, port } = serverInfo;

		let args = [
			httpWrapper.sessionCookie,
			httpWrapper.userAuth,
			httpWrapper.userId,
			ip,
			port,
			bot.characterId,
			bot.runScript,
			userData.config.botKey,
			index++,
			bot.characterName,
		];
		await startGame(args, bot.characterName, httpWrapper.serverList);
	}
}

const processes = new Map();

function shutdown_all(exit_self = true) {
	[...processes.values()].forEach((p) => {
		p.terminate();
	});
  processes.clear();
  if(exit_self) {
	  process.exit(0);
  }
}

exec("git remote add origin https://github.com/FreezePhoenix/albot-js.git").then(data => {
	console.log(JSON.stringify(data));
});

BotWebInterface.SocketServer.on("command", async (data) => {
	if(data.admin) {
		if(data.command == "toggle_merch") {
			shutdown_all(false);
			BotWebInterface.SocketServer.getPublisher().removeInterfaces();
			userData.toggleMerch();
			main();
		} else if(data.command == "toggle_all") {
			shutdown_all(false);
			BotWebInterface.SocketServer.getPublisher().removeInterfaces();
			userData.toggleAll();
			main();
		} else if(data.command == "pull") {
			shutdown_all(false);
			BotWebInterface.SocketServer.getPublisher().removeInterfaces();
			let result = await exec("git checkout main");
			console.log(JSON.stringify(result));
			let result2 = await exec("git pull origin main");
			console.log(JSON.stringify(result2));
			main();
		}
	}
});

process.on('SIGTERM', function () {
	console.log('SIGTERM received, cleaning up...');
	shutdown_all();
});

async function startGame(args, characterName, serverList, botinterface) {
	if (botinterface == undefined) {
		botinterface =
			BotWebInterface.SocketServer.getPublisher().createInterface();
		botinterface.pushData('name', characterName);
	}
	botinterface.pushData('script', args[6]);
	botinterface.pushData('status', 'LOGGING_IN');
	let worker = new Worker('./game', {
		workerData: {
			args: args,
			data: gameData,
		},
	});

	processes.set(characterName, worker);

	let closed = false;

	botinterface.flush();
	worker.on('message', async (m) => {
		if (m.type === 'status' && m.status === 'disconnected' && !closed) {
			worker.terminate();
			startGame(args, characterName, serverList, botinterface);
			closed = true;
		} else if (m.type === 'shutdown') {
			shutdown_all(false);
		} else if (m.type === 'bwiUpdate') {
			if (m.command == 'flush') {
				botinterface.flush();
			} else {
				botinterface.pushData(m.data.name, m.data.value);
			}
		} else if (m.action == 'server') {
			let serverInfo = await httpWrapper.getServerInfo(m.data);
			if (serverInfo == null) {
				console.log(`Server not found: ${m.data}`);
			}
			let { ip, port } = serverInfo;

			args[3] = ip;
			args[4] = port;
		} else if (m.event == 'cm') {
			m.names.forEach((name) => {
				if (processes.has(name)) {
					try {
						processes
							.get(name)
							.postMessage({
								event: 'cm',
								message: m.message,
								sender: characterName,
							});
					} catch (e) {
						console.error(
							new Error(
								'send_cm re-route failed, falling back to socket.'
							)
						);
						console.error(e);
						worker.postMessage({
							event: 'cm_fail',
							name: name,
							message: m.message,
						});
					}
				} else {
					worker.postMessage({
						event: 'cm_fail',
						name: name,
						message: m.message,
					});
				}
			});
		} else if (m.event == 'script_switch') {
			switch (m.value) {
				case 'jr':
					args[6] = 'Jr.js';
					break;
				case 'solo':
					args[6] = 'Solo.js';
					break;
				case 'dracul':
					args[6] = 'Dracul.js';
					break;
				case 'rat':
					args[6] = 'Rat.js';
					break;
				case 'prat':
					args[6] = 'Prat.js';
					break;
				case 'skeletor':
					args[6] = 'Skeletor.js';
					break;
				case 'xscorpion':
					args[6] = 'XScorpion.js';
					break;
				case 'stoneworm':
					args[6] = 'StoneWorm.js';
					break;
				case 'boar':
					args[6] = 'Boar.js';
					break;
				case 'hawk':
					args[6] = 'Hawk.js';
					break;
				case 'crab':
					args[6] = 'Crab.js';
					break;
				case 'bbpompom':
					args[6] = 'BBPomPom.js';
					break;
				default:
					break;
			}
		}
	});
}

const sleep = async (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

main();
