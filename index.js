const babelc = require("babel-core");
const fs = require('fs');
const path = require('path');
var quake = null;

function sourceMapper(options) {
  var idx = 1;
  return function (data) {
    return new Promise(function (res, rej) {
      fs.writeFile(path.join(options.sourceMapDir, idx++ + '.map'), data[1], (err, data) => err ? rej(err) : res(data[0]));
    });
  }
}

function sourceMap(options) {
  if (!options.sourceMap || options.sourceMap === "inline") return null;
  return data => {
    if (Array.isArray(data)) return Promise.all(data.map(sourceMapper(options)));
    return sourceMapper(options)(data);
  };
}

function babel(input, out, options) {
  if (options.sourceMap && options.sourceMap !== "inline" && !options.sourceMapDir) throw new Error("Must provide sourceMapDir");
  if (!quake) throw new Error("babel requires registration. Call quake.register(babel)");
  return [quake.create(out), quake.src(input), function Transform(input, cb) {
    var output;
    if (Array.isArray(input)) {
      output = input.map(v => babelc.transform(v, options)).map(v => options.sourceMap ? [v.code, v.map] : v.code);
    } else {
      output = babelc.transform(input, options);
      if (options.sourceMap) {
        output = [output.code, output.map]
      } else {
        output = output.code;
      }
    }
    cb(null, output);
  }, sourceMap(options), quake.dest(out)].filter(a=>!!a);
}

babel.register = function (q) {
  quake = q;
  return true;
};

module.exports = babel;
