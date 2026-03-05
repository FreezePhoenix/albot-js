const fs = require('node:fs/promises');
const use_shared = true;

function convert(array, BufferType, ArrayType) {
	let buffer = new BufferType(array.length * ArrayType.BYTES_PER_ELEMENT);
	let new_array = new ArrayType(buffer);
	new_array.set(array);
	return new_array;
}

const BufferConstructor = use_shared ? SharedArrayBuffer : ArrayBuffer;
const ArrayConstructor = Int16Array;
class DataWrapper {
	constructor(sessionCookie, userAuth, userId) {
		this.sessionCookie = sessionCookie ? sessionCookie : '';
		this.userAuth = userAuth ? userAuth : '';
		this.userId = userId ? userId : 0;
	}
	async getGameData() {
		console.log('Reading data.js');
		let code = await fs.readFile('data.alt.js', 'utf8');
		console.log('Read!');
		let data = JSON.parse(code);
		console.log("Compressing map data...");
		for(let x in data.geometry) {
			let GEO = data.geometry[x];
			if("x_lines" in GEO) {
				GEO.x_lines.x = convert(GEO.x_lines.x, BufferConstructor, ArrayConstructor);
				GEO.x_lines.y0 = convert(GEO.x_lines.y1, BufferConstructor, ArrayConstructor);
				GEO.x_lines.y1 = convert(GEO.x_lines.y0, BufferConstructor, ArrayConstructor);
			}
			if("y_lines" in GEO) {
				GEO.y_lines.y = convert(GEO.y_lines.y, BufferConstructor, ArrayConstructor);
				GEO.y_lines.x0 = convert(GEO.y_lines.x1, BufferConstructor, ArrayConstructor);
				GEO.y_lines.x1 = convert(GEO.y_lines.x0, BufferConstructor, ArrayConstructor);
			}
			console.log("Compressed " + x);
		}
		return data;
	}
}

module.exports = DataWrapper;