/**
 * Created by nexus on 15/05/17.
 */
// const request = require('request-promise-native');
const fs = require('node:fs/promises');
const https = require('node:https');
const DataWrapper = require('./DataWrapper');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let auth_filter = /auth=([a-zA-Z0-9_]+-[a-zA-Z0-9]+)/;
let auth_type = "auth";
/**
 *
 * @constructor
 */

function httpsPost(path, payload, headers = {}) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'adventure.land',
			port: 443,
			path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
		};

		const req = https.request(options, (res) => {
			let body = '';

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				body += chunk;
			});

			res.on('end', () => {
				resolve({body, headers: res.headers});
			});
		});

		req.on('error', (err) => {
			reject(err);
		});

		req.write(JSON.stringify(payload));
		req.end();
	});
}

function httpsGet(path, headers = {}) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: 'adventure.land',
			port: 443,
			path,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
		};

		const req = https.request(options, (res) => {
			let body = '';

			res.setEncoding('utf8');

			res.on('data', (chunk) => {
				body += chunk;
			});

			res.on('end', () => {
				resolve({body, headers: res.headers});
			});
		});

		req.on('error', (err) => {
			reject(err);
		});

		req.end();
	});
}

class HttpWrapper extends DataWrapper {
	serverList = [];
	lastUpdate = -1;
	constructor(sessionCookie, userAuth, userId) {
		super(sessionCookie, userAuth, userId);
	}
	async getServerList() {
		const {body} = await httpsPost(
			'/api/get_servers',
			{},
			{
				Cookie: auth_type + '=' + this.sessionCookie,
			}
		);

		const data = JSON.parse(body);
		if (data.success) {
			this.serverList.push(...data.servers);
			return this.serverList;
		} else {
			console.log(data);
			throw 'SERVER FETCH FAILURE';
		}
	}
	async getServerInfo(serverIdentifier) {
		await this.updateServerList();
		let [region, name] = serverIdentifier.split(' ');
		for (let server of this.serverList) {
			if (region === server.region && name === server.name) {
				return server;
			}
		}
	}

	async updateServerList() {
		if (this.lastUpdate < new Date().getTime() - 60 * 1000) {
			await this.getServerList();
			this.lastUpdate = new Date().getTime();
		}
	}
	async login(email, password) {
		console.log('Logging in.');
		const {body, headers} = await httpsPost(
			'/api/signup_or_login',
			{
				only_login: true,
				email: email,
				password: password,
			}
		);
		const data = JSON.parse(body);
		let loginSuccessful = false;
		for (const entry of data.infs) {
			if (entry?.type === 'message' && entry?.message === 'Logged In!') {
				console.log('Login successful.');
				loginSuccessful = true;
			}

			if (entry?.type === 'ui_error' && entry?.message === 'Wrong Password') {
				console.log('Login failed.');
				loginSuccessful = false;
			}
		}

		if (loginSuccessful) {
			const cookies = headers['set-cookie'] || "";
			const match = auth_filter.exec(cookies);
			console.log(match);
			if (match) {
				this.sessionCookie = match[1];
				this.userId = match[1].split('-')[0];
			}
			return true;
		} else {
			console.log(':(');
			console.log('Retrying in 10 seconds...');
			await sleep(10000);
			return await this.login(email, password);
		}
	}
	async getGameVersion() {
		const {body} = await httpsGet('/');
		var match = /src="\/js\/game\.js\?v=([0-9]+)"/.exec(body);
		return match[1];
	}
	async getCharacters() {
		const {body} = await httpsPost(
			'/api/servers_and_characters',
			{},
			{
				Cookie: auth_type + '=' + this.sessionCookie,
			}
		);

		const data = JSON.parse(body).infs[0];
		return data.characters;
	}
	async getUserAuth() {
		return (this.userAuth = this.sessionCookie.split("-")[1]);
	}
	async checkLogin() { }
	async fetchGameData() {
		let {body} = await httpsGet('/data.js', { Cookie: auth_type + '=' + this.sessionCookie })
		let code = body;
		console.log('Processing!');
		code = code.substring(6).replace(/;/g, '');
		let orig_length = code.length;
		let G = JSON.parse(code);
		console.log('Stripping tiles and placements for maps');
		for (let x in G.geometry) {
			let geo = G.geometry[x];
			if ('tiles' in geo) {
				geo.tiles = [];
			}
			if ('placements' in geo) {
				geo.placements = [];
			}
			if ('groups' in geo) {
				geo.groups = [];
			}
		}
		code = JSON.stringify(G);
		for (let x in G.geometry) {
			let geo = G.geometry[x];
			if ('x_lines' in geo) {
				geo.x_lines = {
					x: geo.x_lines.map((a) => a[0]),
					y0: geo.x_lines.map((a) => a[1]),
					y1: geo.x_lines.map((a) => a[2]),
				};
			}
			if ('y_lines' in geo) {
				geo.y_lines = {
					y: geo.y_lines.map((a) => a[0]),
					x0: geo.y_lines.map((a) => a[1]),
					x1: geo.y_lines.map((a) => a[2]),
				};
			}
		}
		let code2 = JSON.stringify(G);
		let new_length = code.length;
		console.log(
			`Stripping data tile and placements reduced data.js size by ${Math.trunc(
				(1 - new_length / orig_length) * 100
			)}%`
		);
		let new_length2 = code2.length;
		console.log(
			`Refactoring line data reduced data.js size by a further ${Math.trunc(
				(1 - new_length2 / new_length) * 100
			)}%`
		);
		G = null;
		console.log('Processing. Writing to file.');
		await fs.writeFile('data.raw.js', code);
		await fs.writeFile('data.alt.js', code2);
		console.log('Written to file!');
	}
}

module.exports = HttpWrapper;
