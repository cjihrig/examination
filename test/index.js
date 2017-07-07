'use strict';
const Path = require('path');
const Fse = require('fs-extra');
const Gencore = require('gencore');
const Lab = require('lab');
const StandIn = require('stand-in');
const Examination = require('../lib');

const lab = exports.lab = Lab.script();
const expect = Lab.expect;
const describe = lab.describe;
const it = lab.it;

const tmpDir = Path.join(__dirname, 'tmp');


describe('Examination', () => {
  lab.before((done) => {
    Fse.ensureDir(tmpDir, done);
  });

  lab.after((done) => {
    Fse.remove(tmpDir, done);
  });

  it('works with an empty options object', (done) => {
    Examination({}, (err) => {
      expect(err).to.not.exist();
      expect(Fse.readdirSync(tmpDir)).to.equal([]);
      done();
    });
  });

  it('writes files to an output directory', (done) => {
    const directory = Path.join(tmpDir, 'full-run');

    StandIn.replaceOnce(Gencore, 'collectCore', (stand, callback) => {
      const mockCore = 'core-000.tar.gz';

      Fse.writeFileSync(mockCore, '');
      callback(null, mockCore);
    });

    Examination({
      directory,
      heapdump: true,
      report: true,
      core: true
    }, (err) => {
      expect(err).to.not.exist();

      const files = Fse.readdirSync(directory);

      expect(files.length).to.equal(3);
      expect(files[0]).to.match(/^core-\d+\.tar\.gz$/);
      expect(files[1]).to.match(/^heapdump-\d+\.heapsnapshot$/);
      expect(files[2]).to.match(/^node-report-\d+\.txt$/);
      done();
    });
  });

  it('reports errors', (done) => {
    const directory = Path.join(tmpDir, 'error-run');
    const mockError = new Error('foo');

    StandIn.replaceOnce(Gencore, 'collectCore', (stand, callback) => {
      callback(mockError);
    });

    Examination({
      directory,
      heapdump: true,
      report: true,
      core: true
    }, (err) => {
      expect(err).to.shallow.equal(mockError);
      done();
    });
  });

  it('throws if options is not an object', (done) => {
    [undefined, null, 0, 1, true, false, 'fo', Symbol('a')].forEach((value) => {
      expect(() => {
        Examination(value, () => {});
      }).to.throw(TypeError, 'options must be an object');
    });

    done();
  });

  it('throws if directory option is not a string', (done) => {
    [undefined, null, 0, 1, true, false, {}, Symbol('a')].forEach((value) => {
      expect(() => {
        Examination({ directory: value, report: true }, () => {});
      }).to.throw(TypeError, 'directory must be a string');
    });

    done();
  });
});
