const fs = require('node:fs/promises');
const use_shared = true;
class DataWrapper {
	constructor(sessionCookie, userAuth, userId) {
    this.BufferConstructor = use_shared ? SharedArrayBuffer : ArrayBuffer;
    this.ArrayConstructor = Int16Array;
		this.sessionCookie = sessionCookie ? sessionCookie : '';
		this.userAuth = userAuth ? userAuth : '';
		this.userId = userId ? userId : 0;
	}
	async getGameData() {
		console.log('Reading data.js');
		let code = await fs.readFile('data.alt.js', 'utf8');
		console.log('Read!');
		let data = JSON.parse(code);
		for(let x in data.geometry) {
			let GEO = data.geometry[x];
			if("x_lines" in GEO) {
				let x_buffer = new this.BufferConstructor(GEO.x_lines.x.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let x_array = new this.ArrayConstructor(x_buffer);
				x_array.set(GEO.x_lines.x);
				GEO.x_lines.x = x_array;
				
				let y0_buffer = new this.BufferConstructor(GEO.x_lines.y0.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let y0_array = new this.ArrayConstructor(y0_buffer);
				y0_array.set(GEO.x_lines.y0);
				GEO.x_lines.y0 = y0_array;
				
				let y1_buffer = new this.BufferConstructor(GEO.x_lines.y1.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let y1_array = new this.ArrayConstructor(y1_buffer);
				y1_array.set(GEO.x_lines.y1);
				GEO.x_lines.y1 = y1_array;
			}
			if("y_lines" in GEO) {
				let y_buffer = new this.BufferConstructor(GEO.y_lines.y.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let y_array = new this.ArrayConstructor(y_buffer);
				y_array.set(GEO.y_lines.y);
				GEO.y_lines.y = y_array;

				let x0_buffer = new this.BufferConstructor(GEO.y_lines.x0.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let x0_array = new this.ArrayConstructor(x0_buffer);
				x0_array.set(GEO.y_lines.x0);
				GEO.y_lines.x0 = x0_array;
				
				let x1_buffer = new this.BufferConstructor(GEO.y_lines.x1.length * this.ArrayConstructor.BYTES_PER_ELEMENT);
				let x1_array = new this.ArrayConstructor(x1_buffer);
				x1_array.set(GEO.y_lines.x1);
				GEO.y_lines.x1 = x1_array;
			}
		}
		return data;
	}
}

module.exports = DataWrapper;