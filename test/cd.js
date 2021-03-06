var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    common = require('../src/common');

shell.config.silent = true;

// save current dir
var cur = shell.pwd();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
shell.cd('/adsfasdf'); // dir does not exist
assert.ok(shell.error());

assert.equal(fs.existsSync('resources/file1'), true); // sanity check
shell.cd('resources/file1'); // file, not dir
assert.ok(shell.error());

shell.cd('-'); // Haven't changed yet, so there is no previous directory
assert.ok(shell.error());

//
// Valids
//

shell.cd(cur);
shell.cd('tmp');
assert.equal(shell.error(), null);
assert.equal(path.basename(process.cwd()), 'tmp');

shell.cd(cur);
shell.cd('/');
assert.equal(shell.error(), null);
assert.equal(process.cwd(), path.resolve('/'));

shell.cd(cur);
shell.cd('/');
shell.cd('-');
assert.equal(shell.error(), null);
assert.equal(process.cwd(), path.resolve(cur));

// cd + other commands

shell.cd(cur);
shell.rm('-f', 'tmp/*');
assert.equal(fs.existsSync('tmp/file1'), false);
shell.cd('resources');
assert.equal(shell.error(), null);
shell.cp('file1', '../tmp');
assert.equal(shell.error(), null);
shell.cd('../tmp');
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('file1'), true);

// Test tilde expansion

shell.cd('~');
assert.equal(process.cwd(), common.getUserHome());
shell.cd('..');
shell.cd('~'); // Change back to home
assert.equal(process.cwd(), common.getUserHome());

// Goes to home directory if no arguments are passed
shell.cd(cur);
shell.cd();
assert.ok(!shell.error());
assert.equal(process.cwd(), common.getUserHome());

shell.exit(123);
