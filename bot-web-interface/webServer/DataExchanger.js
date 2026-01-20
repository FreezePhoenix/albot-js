const util = require("util");
/**
 * Created by Nexus on 16.08.2017.
 */

class DataExchanger {
    constructor(publisher, id, structuremap) {
        this.publisher = publisher;
        this.id = id;
        this.dataSource = {}
        this.modifications = [];
        this.structuremap = structuremap;
    }
    getData() {
        return this.dataSource;
    };
    pushData(name, value) {
        if(!util.isDeepStrictEqual(this.dataSource[name], value)) {
            this.modifications.push([this.structuremap.get(name), value]);
            this.dataSource[name] = value;
        }
    };
    flush() {
        if(this.modifications.length > 0) {
          this.publisher.flush(this.id, this.modifications);
          this.modifications.length = 0;
        }
    };
} 

module.exports = DataExchanger;