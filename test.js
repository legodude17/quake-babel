const q = require("quake-task");
const quake = q.make("update");
const babel = require(".");

quake.register(babel);

quake.add("Compilee", babel("target.js", "target.es.js", {plugins: "transform-es2015-modules-commonjs"}));

quake.start("Compilee");
