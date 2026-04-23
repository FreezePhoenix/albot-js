/* @ts-self-types="./alpathfinder.d.ts" */
import * as fs from "fs";
import * as alpathfinder_bg from "./alpathfinder_bg.mjs";
let wasm = await fs.promises.readFile("./alpathfinder/alpathfinder_bg.wasm");
wasm = (await WebAssembly.instantiate(wasm, {
    "./alpathfinder_bg.js": alpathfinder_bg
})).instance.exports;
alpathfinder_bg.__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    canWalkPath, getPath, prepare, clear
} from "./alpathfinder_bg.mjs";
