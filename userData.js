const SCRIPT = "BScorpionPriest.js"
const SERVER = "US I";
let RUN_MERCH = process.env.runmerch == "true";
module.exports = {
    "config": {
        "fetch": false,
        "botKey": 1,
        "botWebInterface": {
            "start": true,
            "port": 3000
        }
    },
    "login": {
        "email": process.env.username,
        "password": process.env.password
    },
    "bots": [
        {
            "characterName": "AriaHarper",
            "characterId": "5513766260178944",
            "runScript": "BScorpAngyMerch.js",
            "server": "US II"
        }, // */
        {
            "characterName": "Rael",
            "characterId": "6011174247202816",
            "runScript": SCRIPT, 
            "server": SERVER
        }, // */
        {
            "characterName": "Geoffriel",
            "characte rId": "5178085749030912",
            "runScript": SCRIPT,
            "server": SERVER
        }, // */
        {
            "characterName": "Raelina",
            "characterId": "5931316711784448",
            "runScript": SCRIPT,
            "server": RUN_MERCH ? "US II" : SERVER
        }, // */
        /* {
            "characterName": "Anony",
            "characterId": "5130368149094400",
            "runScript": SCRIPT,
            "server": SERVER
        }, // */
        /* {
            "characterName": "Malthael",
            "characterId": "5678553665896448",
            "runScript": SCRIPT,
            "server": SERVER
        }, // */
        /* {
            "characterName": "Boismon",
            "characterId": "5760997546524672",
            "runScript": "DarkHound.js",
            "server": "US I"
        }, // */
        /* {
            "characterName": "Firenus",
          "characterId": "6389196039127040",
            "runScript": "Crab.js",
            "server": "EU II"
        }, // */
        /* {
            "characterName": "Malthael",
            "characterId": "5678553665896448",
            "runScript": "CrabZap.js",
            "server": "US I"
        }, // */
        /* {
            "characterName": "Daedulaus",
            "characterId": "5826105459081216",
            "runScript": "Crab.js",
            "server": "EU II"
        }, // */
        /* {
            "characterName": "Mage40",
            "characterId": "5541032182153216",
            "runScript": "default.js",
            "server": "EU I"
        } // */
    ]
}
if(!RUN_MERCH) {
  module.exports.bots.shift();
}
