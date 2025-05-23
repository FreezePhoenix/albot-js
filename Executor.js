/**
 * Created by Nexus on 26.07.2017.
 */
const fs = require("node:fs/promises");
const vm = require("vm");

const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

class Executor {
  constructor(glob, file) {
    this.file = file;
    this.glob = glob;
    this.log_header = `(${this.glob.name})[${this.file}]: `;
    this.err_header = `REJECTION: ${this.glob.name}`;
  }
  async execute() {
    this.glob.load_code = () => {};
    this.glob.module = module;
    this.glob.require = require;  
    let log = (message) => {
      console.log(this.log_header + message);
    }
    process.on("unhandledRejection", (error, promise) => {
      console.log(this.err_header, error);
    });
    log("Executing " + this.file);
    try {
      let CONTEXT = {
        process,
        localStorage,
        active: false,
        catch_errors: true,
        is_code: 0,
        is_server: 0,
        is_game: 0,
        setTimeout,
        setInterval,
        clearTimeout,
        clearInterval,
        console: console,
        module,
        fetch,
        require,
        G: this.glob.G,
        character: this.glob.character,
        performance: this.glob.performance,
        log,
        parent: this.glob,
      };
      CONTEXT.parent.eval = eval;
      vm.createContext(CONTEXT);
      log("Loading injections");
      let injections = await fs.readFile("LIB/Injects.js", "utf8");
      log("Loading common functions");
      let common_functions = await fs.readFile("modedGameFiles/common_functions.js", "utf8");
      log("Loading runner functions");
      let runner_functions = await fs.readFile("modedGameFiles/runner_functions.js", "utf8");
      log("Finally executing " + this.file);
      CONTEXT.character = this.glob.character;
      let script = await fs.readFile("CODE/" + this.file, "utf8");
      let final_code =
        "(async () => {" +
        injections +
        "\n" +
        common_functions +
        "\n" +
        runner_functions +
        "\n" +
        script +
        "})()";
      let source_module;
      try {
        source_module = new vm.Script(final_code, {
          filename: this.glob.name + ":Combined.js",
        });
      } catch (err) {
        console.log(this.glob.name);
        throw err;
      }
      await source_module.runInContext(CONTEXT);
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = Executor;
