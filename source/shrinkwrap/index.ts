/**
 * Dependencies
 */
import * as program from "commander";
import * as lib from "../lib";

export function exec(program: program.IExportedCommand) {
  const bowerJson = lib.readBowerJson(program["path"]);
  console.log(bowerJson.dependencies);
}