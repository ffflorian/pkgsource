import {expect, test} from 'vitest';

import {cleanUrl} from '../src/RepositoryParser';

test('cleanUrl normalizes git+ repository URLs', () => {
  expect(cleanUrl('git+https://github.com/foo/bar.git')).toBe('https://github.com/foo/bar');
});

test('cleanUrl normalizes git:// repository URLs', () => {
  expect(cleanUrl('git://github.com/foo/bar.git')).toBe('https://github.com/foo/bar');
});

test('cleanUrl normalizes ssh:// repository URLs', () => {
  expect(cleanUrl('ssh://gitlab.com/foo/bar.git')).toBe('https://gitlab.com/foo/bar');
});

test('cleanUrl preserves http protocol for non-known SSL hosts', () => {
  expect(cleanUrl('http://example.com/foo/bar.git')).toBe('http://example.com/foo/bar');
});

test('cleanUrl returns null for invalid URLs', () => {
  expect(cleanUrl('not-a-valid-url')).toBeNull();
});
