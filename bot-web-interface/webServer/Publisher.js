/**
 * Created by Nexus on 16.08.2017.
 */

var DataExchanger = require('./DataExchanger');
var dataSourcesCount = 0;

class Publisher {
	constructor(server) {
		this.structuremap = new Map();
		this.structure = [];
		this.dataList = [];
		this.dataSources = [];
		this.server = server;
	}
	flush(id, modifications) {
		this.server.flush(id, modifications);
	}
	createInterface() {
		let dataSource = new DataExchanger(this, dataSourcesCount++, this.structuremap);
		this.dataSources.push(dataSource);
		this.server.createInterface(dataSource);
		this.dataList.push(dataSource.getData());
		return dataSource;
	}
	removeInterface(dataExchanger) {
		this.server.removeInterface(dataExchanger);

		for (let i = 0; i < this.dataSources.length; i++) {
			if (this.dataSources[i].id == dataExchanger.id) {
				this.dataSources.splice(i, 1);
				this.dataList.splice(i, 1);
				break;
			}
		}
	}
	removeInterfaces() {
		let copy = [...this.dataSources];
		for (let i = 0; i < copy.length; i++) {
			this.removeInterface(copy[i]);
		}
	}
	setStructure(structure) {
		this.structure = structure;
		this.structuremap.clear();
		for(let i = 0; i < structure.length; i++) {
			this.structuremap.set(structure[i].name, i);
		}
	}
}

module.exports = Publisher;
