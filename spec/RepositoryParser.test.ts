import {strict as assert} from 'node:assert';
import test from 'node:test';

import {cleanUrl} from '../src/RepositoryParser';

test('cleanUrl normalizes git+ repository URLs', () => {
  assert.equal(cleanUrl('git+https://github.com/foo/bar.git'), 'https://github.com/foo/bar');
});

test('cleanUrl normalizes git:// repository URLs', () => {
  assert.equal(cleanUrl('git://github.com/foo/bar.git'), 'https://github.com/foo/bar');
});

test('cleanUrl normalizes ssh:// repository URLs', () => {
  assert.equal(cleanUrl('ssh://gitlab.com/foo/bar.git'), 'https://gitlab.com/foo/bar');
});

test('cleanUrl preserves http protocol for non-known SSL hosts', () => {
  assert.equal(cleanUrl('http://example.com/foo/bar.git'), 'http://example.com/foo/bar');
});

test('cleanUrl returns null for invalid URLs', () => {
  assert.equal(cleanUrl('not-a-valid-url'), null);
});
