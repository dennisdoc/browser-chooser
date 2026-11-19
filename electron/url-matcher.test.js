const assert = require('node:assert/strict');
const test = require('node:test');
const matches = require('./url-matcher');

test('matches pasted URLs by hostname', () => {
  assert.equal(matches('github.com', 'https://github.com/'), true);
  assert.equal(matches('www.instagram.com', 'https://www.instagram.com/'), true);
});

test('matches domains and their subdomains, but not partial suffixes', () => {
  assert.equal(matches('login.claude.ai', 'claude.ai'), true);
  assert.equal(matches('www.example.com', '*.example.com'), true);
  assert.equal(matches('notexample.com', 'example.com'), false);
});

test('ignores a trailing dot in a hostname', () => {
  assert.equal(matches('example.com.', 'example.com'), true);
});
