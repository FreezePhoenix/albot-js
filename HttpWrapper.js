/**
 * Created by nexus on 15/05/17.
 */
const request = require('request-promise-native');
const fs = require('node:fs/promises');
const DataWrapper = require('./DataWrapper');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/**
 *
 * @constructor
 */
class HttpWrapper extends DataWrapper {
	serverList = [];
	lastUpdate = -1;
	constructor(sessionCookie, userAuth, userId) {
		super(sessionCookie, userAuth, userId);
	}
	async getServerList() {
		var options = {
			url: 'http://adventure.land/api/servers_and_characters',
			method: 'POST',
			headers: {
				cookie: 'auth=' + this.sessionCookie,
			},
			form: {
				// Use for HTTP:
				method: 'servers_and_characters',
				// Use for HTTPS:
				// method: "get_servers"
			},
		};
		this.serverList.length = 0;
		let raw = await request(options);
		let data = JSON.parse(raw);
		if (data[0].type === 'success') {
			this.serverList.push(...data[0].message);
			return this.serverList;
		} else {
			if (data[0].rewards) {
				for (let server of data[0].servers) {
					this.serverList.push({
						pvp: server.name == 'PVP' ? true : '',
						name: server.name,
						ip: server.addr,
						region: server.region,
						gameplay: 'normal',
						port: server.port,
					});
				}
			} else {
				console.log(data);
				throw 'SERVER FETCH FAILURE';
			}
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
	login(email, password) {
		console.log('Logging in.');
		var self = this;
		return new Promise(async (resolve, reject) => {
			try {
				await request({ url: 'http://adventure.land' });
			} catch (err) {
				reject('could not fetch index.html on login.' + err);
			}
			try {
				await request.post(
					{
						url: 'http://adventure.land/api/signup_or_login',
						form: {
							arguments:
								'{"only_login": true, "email":"' +
								email +
								'","password":"' +
								password +
								'"}',
							method: 'signup_or_login',
						},
						headers: {
							Accept: 'application/json, text/javascript, */*; q=0.01',
						},
					},
					(err, response, html) => {
						var data = JSON.parse(html);
						var loginSuccessful = false;
						for (let i = 0; i < data.length; i++) {
							if (typeof data[i].type === 'string') {
								if (data[i].type === 'message') {
									if (typeof data[i].message === 'string') {
										if (data[i].message === 'Logged In!') {
											console.log('Login successful.');
											loginSuccessful = true;
										}
									}
								} else if (data[i].type === 'ui_error') {
									if (typeof data[i].message === 'string') {
										if (
											data[i].message === 'Wrong Password'
										) {
											console.log('Login failed.');
											loginSuccessful = false;
										}
									}
								}
							}
						}
						if (loginSuccessful) {
							let cookies = response.headers['set-cookie'];
							for (let i = 0; i < cookies.length; i++) {
								var match = /auth=([0-9]+-[a-zA-Z0-9]+)/g.exec(
									cookies[i]
								);
								if (match) {
									self.sessionCookie = match[1];
									self.userId = match[1].split('-')[0];
								}
							}
							resolve(loginSuccessful);
						} else {
							console.log(':(');
							console.log(data);
							console.log("Retrying in 10 seconds");
							setTImeout(async () => {
								resolve(await this.login(email, password))
							}, 10000);
						}
					}
				);
			} catch (e) {
				reject(e);
			}
		});
	}
	async getGameVersion() {
		var html = await request({
			url: 'http://adventure.land/',
			headers: {
				Accept: 'application/json, text/javascript, */*; q=0.01',
				cookie: 'auth=' + this.sessionCookie,
			},
		});
		var match = /src="\/js\/game\.js\?v=([0-9]+)"/.exec(html);
		return match[1];
	}
	async getCharacters() {
		var html = await request.post({
			url: 'http://adventure.land/api/servers_and_characters',
			headers: { cookie: 'auth=' + this.sessionCookie },
			form: { method: 'servers_and_characters', arguments: '{}' },
		});
		let data = JSON.parse(html)[0];
		return data.characters;
	}
	async getUserAuth() {
		var html = await request({
			url: 'http://adventure.land/',
			headers: { cookie: 'auth=' + this.sessionCookie },
		});
		var match = /user_auth="([a-zA-Z0-9]+)"/.exec(html);
		return (this.userAuth = match[1]);
	}
	async checkLogin() {}
	async fetchGameData() {
		var self = this;
		try {
			let code = await request({
				url: 'http://adventure.land/data.js',
				headers: {
					Accept: 'application/json, text/javascript, */*; q=0.01',
					cookie: 'auth=' + self.sessionCookie,
				},
			});
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
			// return code;
		} catch (e) {
			console.log(e);
			console.log('Could not retrieve game data');
			console.log('Retrying in 25 seconds.');
			await sleep(25000);
			return await this.fetchGameData();
		}
	}
}

module.exports = HttpWrapper;
