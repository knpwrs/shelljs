var shell = require('..');
var common = require('../src/common');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

//
// Invalids
//

shell.chmod('blah');  // missing args
assert.ok(shell.error());
shell.chmod('893', 'resources/chmod');  // invalid permissions - mode must be in octal
assert.ok(shell.error());

//
// Valids
//

// On Windows, chmod acts VERY differently so skip those tests for now
if (common.platform === 'win')
    shell.exit(123);

// Test files - the bitmasking is to ignore the upper bits.
shell.chmod('755', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('755', 8));
shell.chmod('644', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

shell.chmod('o+x', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('007', 8), parseInt('005', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('+x', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('755', 8));
shell.chmod('644', 'resources/chmod/file1');

// Test setuid
shell.chmod('u+s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('4000', 8), parseInt('4000', 8));
shell.chmod('u-s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

// according to POSIX standards at http://linux.die.net/man/1/chmod,
// setuid is never cleared from a directory unless explicitly asked for.
shell.chmod('u+s', 'resources/chmod/c');
shell.chmod('755', 'resources/chmod/c');
assert.equal(fs.statSync('resources/chmod/c').mode & parseInt('4000', 8), parseInt('4000', 8));
shell.chmod('u-s', 'resources/chmod/c');

// Test setgid
shell.chmod('g+s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('2000', 8), parseInt('2000', 8));
shell.chmod('g-s', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));

// Test sticky bit
shell.chmod('+t', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8), parseInt('1000', 8));
shell.chmod('-t', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('777', 8), parseInt('644', 8));
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('1000', 8), 0);

// Test directories
shell.chmod('a-w', 'resources/chmod/b/a/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('555', 8));
shell.chmod('755', 'resources/chmod/b/a/b');

// Test recursion
shell.chmod('-R', 'a+w', 'resources/chmod/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('777', 8));
shell.chmod('-R', '755', 'resources/chmod/b');
assert.equal(fs.statSync('resources/chmod/b/a/b').mode & parseInt('777', 8), parseInt('755', 8));

// Test symbolic links w/ recursion  - WARNING: *nix only
fs.symlinkSync('resources/chmod/b/a', 'resources/chmod/a/b/c/link', 'dir');
shell.chmod('-R', 'u-w', 'resources/chmod/a/b');
assert.equal(fs.statSync('resources/chmod/a/b/c').mode & parseInt('700', 8), parseInt('500', 8));
assert.equal(fs.statSync('resources/chmod/b/a').mode & parseInt('700', 8), parseInt('700', 8));
shell.chmod('-R', 'u+w', 'resources/chmod/a/b');
fs.unlinkSync('resources/chmod/a/b/c/link');

// Test combinations
shell.chmod('a-rwx', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('000', 8), parseInt('000', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('a-rwx,u+r', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('400', 8), parseInt('400', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('a-rwx,u+rwx', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('700', 8), parseInt('700', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('000', 'resources/chmod/file1');
shell.chmod('u+rw', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('000', 'resources/chmod/file1');
shell.chmod('u+wx', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('300', 8), parseInt('300', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('000', 'resources/chmod/file1');
shell.chmod('u+r,g+w,o+x', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('421', 8), parseInt('421', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('000', 'resources/chmod/file1');
shell.chmod('u+rw,g+wx', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('630', 8), parseInt('630', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('700', 'resources/chmod/file1');
shell.chmod('u-x,g+rw', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('660', 8), parseInt('660', 8));
shell.chmod('644', 'resources/chmod/file1');

shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
shell.chmod('a-rwx,u+rw', 'resources/chmod/file1');
assert.equal(fs.statSync('resources/chmod/file1').mode & parseInt('600', 8), parseInt('600', 8));
shell.chmod('644', 'resources/chmod/file1');

// Support capital X ("entry" permission aka directory-only execute)

shell.chmod('744', 'resources/chmod/xdir');
shell.chmod('644', 'resources/chmod/xdir/file');
shell.chmod('744', 'resources/chmod/xdir/deep');
shell.chmod('644', 'resources/chmod/xdir/deep/file');
shell.chmod('-R', 'a+X', 'resources/chmod/xdir');

assert.equal(fs.statSync('resources/chmod/xdir').mode & parseInt('755', 8), parseInt('755', 8));
assert.equal(fs.statSync('resources/chmod/xdir/file').mode & parseInt('644', 8), parseInt('644', 8));
assert.equal(fs.statSync('resources/chmod/xdir/deep').mode & parseInt('755', 8), parseInt('755', 8));
assert.equal(fs.statSync('resources/chmod/xdir/deep/file').mode & parseInt('644', 8), parseInt('644', 8));

shell.exit(123);
