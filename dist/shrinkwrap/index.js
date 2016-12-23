"use strict";
const lib = require("../lib");
function exec(program) {
    const bowerJson = lib.readBowerJson(program["path"]);
    console.log(bowerJson.dependencies);
}
exports.exec = exec;
