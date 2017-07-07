'use strict';
const Path = require('path');
const Fse = require('fs-extra');
const Gencore = require('gencore');
const Heapdump = require('heapdump');
const Insync = require('insync');
const NodeReport = require('node-report/api');


function examination (options, callback) {
  if (options === null || typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }

  const now = Date.now();
  const fns = [];

  function setup (cb) {
    if (typeof options.directory !== 'string') {
      throw new TypeError('directory must be a string');
    }

    Fse.ensureDir(options.directory, cb);
  }

  function heapdump (cb) {
    const file = Path.join(options.directory, `heapdump-${now}.heapsnapshot`);

    Heapdump.writeSnapshot(file, cb);
  }

  function nodereport (cb) {
    const file = Path.join(options.directory, `node-report-${now}.txt`);
    const report = NodeReport.getReport(options.error);

    Fse.writeFile(file, report, cb);
  }

  function gencore (cb) {
    Gencore.collectCore(function onCore (err, filename) {
      if (err) {
        return cb(err);
      }

      const destination = Path.join(options.directory, `core-${now}.tar.gz`);

      Fse.move(filename, destination, { overwrite: true }, cb);
    });
  }

  if (options.heapdump === true) {
    fns.push(heapdump);
  }

  if (options.report === true) {
    fns.push(nodereport);
  }

  if (options.core === true) {
    fns.push(gencore);
  }

  if (fns.length > 0) {
    fns.unshift(setup);
  }

  Insync.parallel(fns, function done (err) {
    callback(err);
  });
}

module.exports = examination;
