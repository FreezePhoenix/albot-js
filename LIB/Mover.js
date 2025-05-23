/**
 * @typedef {Object} character
 * @property {number} x
 * @property {number} y
 * @property {string} map
 */

// smart_move_logic
// if(node.town) {
//   use("town");
// } else {
//   if(node.transport) {
//     parent.socket.emit("transport", {
//       to: node.map,
//       s: node.s
//     });
//   } else if(character.map == node.map && can_move_to(node.x, node.y)) {
//     move(node.x, node.y);
//   } else {
//     smart_move({
//       map: smart.map,
//       x: smart.x,
//       y: smart.y,
//     }, smart.on_done);
//   }
// }

// A very helpful function to turn a Mover path into a smart_move plot
function convert(path, starting_map) {
  let plot = [];
  let current_map = starting_map;
  for(let i = 0; i < path.length; i++) {
    let node = path[i];
    switch(node.action) {
      case "Town":
        plot.push({ town: true, map: current_map, x: node.x, y: node.y });
        i++;
        break;
      case "Teleport":
        plot.push({ transport: true, map: node.action_target, s: node.target_spawn,x : node.x, y: node.y });
        current_map = node.action_target;
        break;
      case "Move":
        plot.push({ x: node.x, y: node.y, map: current_map });
        break;
    }
  }
  return plot;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function is_string(obj)
{ try{
  return Object.prototype.toString.call(obj) == '[object String]';
} catch(e){} return false; }

/**
 * A class that handles moving the character from position A to position B.
 *
 * Note: All public methods in this class are asynchronous!
 *
 * @version 2021-10-04
 */
class Mover {
  /**
   * Should errors/messages be logged to the console (Game Inspector)?
   * @type {boolean}
   * @static
   * @default true
   */
  static logToConsole = true;
  static smart = {};
  static smart_move = {};
  static G = {};

  /**
   * Should errors/messages be displayed in the window?
   * @type {boolean}
   * @static
   * @default false
   */
  static logToWindow = false;

  /**
   * The unique key you have been given by Zinal#5950.
   * @static
   * @see NOT IN USE
   * @since 2021-10-04
   * @type {string}
   */
  static ApiKey = "bad4f410269432a4a496a99dfbff9cb6002d17cfb862ed8669ba9e6577cdc9da";

  /**
   * The position of the potion shop on the winter map.
   * @private
   * @static
   * @since 2021-10-04
   * @type {{x: number, y: number, map: string}}
   */
  static #winterPotionsPosition = { x: -84, y: -173, map: "winter_inn" };

  /**
   * A collection of custom positions, based on the list from smart_move.
   * @private
   * @static
   * @since 2021-10-04
   * @type {{halloween: {potions: {x: number, y: number, map: string}}, winter_cave: {potions: {x: number, y: number, map: string}}, winter_inn: {potions: {x: number, y: number, map: string}}, winterland: {potions: {x: number, y: number, map: string}}, any: {scrolls: {x: number, y: number, map: string}, upgrade: {x: number, y: number, map: string}, potions: {x: number, y: number, map: string}, exchange: {x: number, y: number, map: string}, compound: {x: number, y: number, map: string}}}}
   */
  static #customPositions = {
    any: {
      upgrade: { x: -204, y: -129, map: "main" },
      compound: { x: -204, y: -129, map: "main" },
      exchange: { x: -26, y: -432, map: "main" },
      potions: { x: 56, y: -122, map: "main" },
      scrolls: { x: -465, y: -71, map: "main" }
    },
    halloween: {
      potions: { x: 149, y: -182, map: "halloween" }
    },
    winterland: {
      potions: Mover.#winterPotionsPosition
    },
    winter_inn: {
      potions: Mover.#winterPotionsPosition
    },
    winter_cave: {
      potions: Mover.#winterPotionsPosition
    }
  };

  /**
   * Move the character to a destination using the pathfinder service, if applicable.
   * Falls back to smart_move if an error occurred.
   * @static
   * @param {{x: number, y: number, map: string}|string} destination
   * @returns {Promise<void>}
   */
  static async move_by_path(destination, callback, tries = 0) {
    let data = null;
    try {
      data = await Mover.get_path(
        {
          x: Math.round(character.real_x),
          y: Math.round(character.real_y),
          map: character.map
        },
        destination
      );
    } catch(e) {
      console.log(e);
      data = null;
    }

    if (data == null || data === false || data.path == null) {
      console.error(`Failed to get path: Invalid response: ${JSON.stringify(data)}`);
      console.error(`Falling back to smart_move: ${JSON.stringify(destination)}`)
      await Mover.smart_moveX(destination);
      callback?.(false);
      return;
    }

    if (data.error) {
      console.error("Failed to get path: ", data.error);
      console.log(destination);
			console.trace();
      await Mover.smart_moveX(destination);
      callback?.(false);
      return;
    }

    // Mover.#log(`Path calculation took ${data.time}ms`);

    this.smart.plot = convert(data.path, character.map);
    this.smart.start_x = character.real_x;
    this.smart.start_y = character.real_y;  
    this.smart.map = destination.map;
    this.smart.x = destination.x;
    this.smart.y = destination.y;
    this.smart.found = true;
    this.smart.searching = true;
    this.smart.use_town = true;
    this.smart.flags.map = true;
    this.smart.try_exact_spot = true;
    this.smart.moving = true;
    let promise = parent.push_deferred("Mover.move");
    this.smart.on_done = () => {
      callback?.(true);
      parent.resolve_deferred("Mover.move", true);
    };
    return await promise;
  }

  /**
   * Get a path from [start] to [destination] using the pathfinder service.
   * @static
   * @param {{x: number, y: number, map: string}} start
   * @param {{x: number, y: number, map: string}|string|{to: string}} destination
   * @returns {Promise<{[path]: object[], [time]: number, error: string|null}>}
   */
  static async get_path(start, destination, tries = 0) {
    if (is_string(destination)) destination = { to: destination };

    let startPos = start;
    let endPos = null;

    if (typeof start != "object") return { error: `Start is not an object` };

    if ("x" in destination)
      endPos = {
        x: Math.round(destination.x),
        y: Math.round(destination.y),
        map: destination.map || character.map
      };
    else if ("to" in destination || "map" in destination) {
      if (destination.to == "town") destination.to = "main";
      if (this.G.monsters[destination.to]) {
        let locations = [],
          theone;
        for (let name in this.G.maps) {
          (this.G.maps[name].monsters || []).forEach(function(pack) {
            if (
              pack.type != destination.to ||
              this.G.maps[name].ignore ||
              this.G.maps[name].instance
            )
              return;
            if (pack.boundaries) {
              pack.last = pack.last || 0;
              let boundary =
                pack.boundaries[pack.last % pack.boundaries.length];
              pack.last++;
              locations.push([
                boundary[0],
                (boundary[1] + boundary[3]) / 2,
                (boundary[2] + boundary[4]) / 2
              ]);
            } else if (pack.boundary) {
              let boundary = pack.boundary;
              locations.push([
                name,
                (boundary[0] + boundary[2]) / 2,
                (boundary[1] + boundary[3]) / 2
              ]);
            }
          });
        }

        if (locations.length) {
          theone = random_one(locations);
          endPos = { x: theone[1], y: theone[2], map: theone[0] };
        }
      } else if (this.G.maps[destination.to || destination.map]) {
        let mapName = destination.to || destination.map;
        endPos = {
          x: this.G.maps[mapName].spawns[0][0],
          y: this.G.maps[mapName].spawns[0][1],
          map: mapName
        };
      } else if (
        (character.map in Mover.#customPositions &&
          destination.to in Mover.#customPositions[character.map]) ||
        destination.to in Mover.#customPositions.any
      ) {
        if (
          character.map in Mover.#customPositions &&
          destination.to in Mover.#customPositions[character.map]
        )
          endPos = Mover.#customPositions[character.map][destination.to];
        else endPos = Mover.#customPositions.any[destination.to];
      } else if (find_npc(destination.to)) {
        var l = find_npc(destination.to);
        endPos = { x: l.x, y: l.y + 15, map: l.map };
      }
    }

    if (!endPos) return { error: "Unrecognized location" };
    
    // return null;
    
    let res = await fetch("https://almapper.zinals.dev/FindPath/", {
            method: "POST",
            mode: "cors",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + Mover.ApiKey
            },
            body: JSON.stringify({
                fromMap: startPos.map,
                fromX: startPos.x,
                fromY: startPos.y,
                toMap: endPos.map,
                toX: endPos.x,
                toY: endPos.y,
                optimizePath: true,
                useTown: false,
            })
        });
    // let result = await res.json();
    let result = await res.text();
    // console.log(result);
    /*
    console.log({
        fromMap: startPos.map,
        fromX: startPos.x,
        fromY: startPos.y,
        toMap: endPos.map,
        toX: endPos.x,
        toY: endPos.y,
        useTown: true,
        optimisePath: true,
        apiKey: Mover.ApiKey
      }); // */
    try {
        let temp = JSON.parse(result);
        result = temp;
    } catch(e) {
	console.log("Query: ");
	console.log({
                fromMap: startPos.map,
                fromX: startPos.x,
                fromY: startPos.y,
                toMap: endPos.map,
                toX: endPos.x,
                toY: endPos.y,
                optimizePath: true,
                useTown: true,
            });
	console.log("Response: ");
        console.log(result);
        throw e;
    }
    if (result == null || typeof result != "object") {
	console.log({
        fromMap: startPos.map,
        fromX: startPos.x,
        fromY: startPos.y,
        toMap: endPos.map,
        toX: endPos.x,
        toY: endPos.y,
        useTown: true,
        optimisePath: true,
        apiKey: Mover.ApiKey
      });
      console.log(await res.text());
      return { error: "Invalid response" };
    }
    return result;
  }

  /**
   * Emulates the standard move command, but ensures that the character doesn't get stuck in the same position.
   * @static
   * @param {number | {x: number, y: number, map: string}} x
   * @param {number} [y]
   * @returns {Promise<boolean>}
   */
  static async moveX(x, y) {
    if (typeof x == "object") {
      let err = Mover._ensureRequiredFields(["x", "y"], [x]);
      if (err != null) {
        Mover._log(err);
        return false;
      } else {
        y = x.y;
        x = x.x;
      }
    }

    if (x == Math.Round(character.x) && y == Math.Round(character.y))
      return true;

    let tries = 0;
    let pos = [character.x, character.y, character.map];
    while (true) {
      if (tries >= 5) return false;

      await move(x, y);
      await sleep(5);
      if (
        Math.round(character.x) == pos[0] &&
        Math.round(character.y) == pos[1] &&
        character.map == pos[2]
      ) {
        if (x == pos[0] && y == pos[1]) return true;
        tries++;

        await sleep(250);
      } else break;
    }

    return true;
  }

  /**
   * Emulates the standard smart_move command, but ensures that the character has stopped before continuing.
   * @static
   * @param {{x: number, y: number, map: string} | string} position
   * @returns {Promise<void>}
   */
  static async smart_moveX(position) {
    let done = false;

    this.smart_move(position, function(result) {
      console.log("Done: " + result);
      done = true;
    })

    while (!done) await sleep(250);
  }

  /**
   * Pathfinder logging method
   * @static
   * @private
   * @returns {void}
   */
  static #log() {
    if (Mover.logToConsole) console.log.apply(this, arguments);

    if (Mover.logToWindow) {
      let str = "";
      for (let i in arguments) {
        let arg = arguments[i];
        if (typeof arg == "object") str += JSON.stringify(arg);
        else str += arg;
      }
      console.log(str);
    }
  }

  /**
   * Sleep/Wait for a specific amount of milliseconds.
   * @static
   * @param {number} ms
   * @private
   * @returns {Promise<void>}
   */
  static #sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  static init(smart, G, smart_move) {
    parent.resolve_deferreds("Mover.move");
    this.smart = smart;
    this.G = G;
    this.smart_move = smart_move;
  }
}
module.exports = Mover;
