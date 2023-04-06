#!/usr/bin/env node

const fs = require('fs');


let args = process.argv.slice(2);
let start;
let end;
let mode;
let key;

args.forEach(arg => {
  const [param, value] = arg.split('=');
  if (param === '-s' || param === '--start') {
    start = value;
  }
  else if (param === '-e' || param === '--end') {
    end = value;
  }
  else if (param === '-m' || param === '--mode') {
    mode = value;
  }
  else if (param === '-k' || param === '--key') {
    key = value;
  } else {
    console.log(`Unknown param "${param}". Use --start [-s], --end [-e], --mode [-m], --key [-k]`);
  }
})

try {
  fs.readFile(`${__dirname}/env-template`, 'utf-8', (readErr, contents) => {
    if (readErr) {
      return console.error(readErr);
    }
    let updated = contents;

    if (mode) {
      updated = contents.replace(/MODE='default'/gi, `MODE='${mode}'`)
    }
    if (key) {
      updated = contents.replace(/SCANNER_SCAN_KEY='test'/gi, `SCANNER_SCAN_KEY='${key}'`)
    }
    if (start) {
      updated += `\r\nSTART_BLOCK=${start}`
    }
    if (end) {
      updated += `\r\nEND_BLOCK=${end}`
    }

    fs.writeFile('.env', updated, 'utf-8', writeErr => {
      if (writeErr) {
        console.log(writeErr)
      }
    })
  });
} catch (err) {
  process.exit(1);
}
