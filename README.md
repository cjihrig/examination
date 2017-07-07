# examination

[![Current Version](https://img.shields.io/npm/v/examination.svg)](https://www.npmjs.org/package/examination)
[![Build Status via Travis CI](https://travis-ci.org/continuationlabs/examination.svg?branch=master)](https://travis-ci.org/continuationlabs/examination)
![Dependencies](http://img.shields.io/david/continuationlabs/examination.svg)

[![belly-button-style](https://cdn.rawgit.com/continuationlabs/belly-button/master/badge.svg)](https://github.com/continuationlabs/belly-button)

Thoroughly examine the state of a Node.js process. `examination` allows a [heap snapshot](https://www.npmjs.com/package/heapdump), [diagnostics report](https://www.npmjs.com/package/node-report), and [core dump](https://www.npmjs.com/package/gencore) to be generated and written to an output directory with a single function call.

## Basic Usage

```javascript
'use strict';
const Examination = require('examination');

// Dump the report, core, and heap snapshot to the __dirname directory.
Examination({
  directory: __dirname,
  heapdump: true,
  report: true,
  core: true
}, (err) => {
  if (err) {
    // Handle error
  }
});

// Alternatively...

// Create a reusable bound function that only writes a heap snapshot and
// diagnostics report to /tmp/foo.
const bound = Examination.bind(null, {
  directory: '/tmp/foo',
  heapdump: true,
  report: true
}, (err) => { /* Ignore error */ });

bound();
```

## API

### examination(options, callback)

  - Arguments
    - `options` (object) - A configuration object supporting the following schema.
      - `directory` (string) - The directory where the output files will be written. If this directory (including any parent directories) does not exist, it will be created.
      - `heapdump` (boolean) - If `true`, a heap snapshot will be written to `directory`. Defaults to `false`.
      - `report` (boolean) - If `true`, a diagnostics report will be written to `directory`. Defaults to `false`.
      - `core` (boolean) - If `true`, an archive containing a core file and all loaded native libraries will be written to `directory`. Defaults to `false`. Note that generating these files in particular will take time and consume considerable disk space.
      - `error` (error) - If an error is included, it is included in the `node-report` diagnostics.
    - `callback` (function) - A function that is called after all artifacts have been created. This function takes the following arguments.
      - `err` (error) - Represents any error that occurs. Note that the artifacts are created in parallel, so it is possible to receive an error here and still have one or more output files written.
  - Returns
    - Nothing
