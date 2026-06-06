import {beforeEach, describe, expect, it, vi} from 'vitest';

const mockedPackageJson = vi.hoisted(() => ({
  packageJsonMock: vi.fn(),
}));

const mockedErrors = vi.hoisted(() => ({
  PackageNotFoundError: class PackageNotFoundError extends Error {},
  VersionNotFoundError: class VersionNotFoundError extends Error {},
}));

vi.mock('package-json', () => ({
  default: mockedPackageJson.packageJsonMock,
  PackageNotFoundError: mockedErrors.PackageNotFoundError,
  VersionNotFoundError: mockedErrors.VersionNotFoundError,
}));

import {cleanUrl, getPackageUrl, ParseStatus} from '../src/RepositoryParser.js';

describe('cleanUrl', () => {
  it('normalizes git+ repository URLs', () => {
    expect(cleanUrl('git+https://github.com/foo/bar.git')).toBe('https://github.com/foo/bar');
  });

  it('normalizes git:// repository URLs', () => {
    expect(cleanUrl('git://github.com/foo/bar.git')).toBe('https://github.com/foo/bar');
  });

  it('normalizes ssh:// repository URLs', () => {
    expect(cleanUrl('ssh://gitlab.com/foo/bar.git')).toBe('https://gitlab.com/foo/bar');
  });

  it('strips query and hash from URLs', () => {
    expect(cleanUrl('https://example.com/foo/bar.git?x=1#readme')).toBe('https://example.com/foo/bar.git');
  });

  it('preserves http protocol for non-known SSL hosts', () => {
    expect(cleanUrl('http://example.com/foo/bar.git')).toBe('http://example.com/foo/bar');
  });

  it('returns null for invalid URLs', () => {
    expect(cleanUrl('not-a-valid-url')).toBeNull();
  });
});

describe('getPackageUrl', () => {
  beforeEach(() => {
    mockedPackageJson.packageJsonMock.mockReset();
  });

  it('returns invalid package name status for malformed names', async () => {
    const result = await getPackageUrl('@@@', 'latest');

    expect(result).toEqual({status: ParseStatus.INVALID_PACKAGE_NAME});
    expect(mockedPackageJson.packageJsonMock).not.toHaveBeenCalled();
  });

  it('returns version not found status', async () => {
    mockedPackageJson.packageJsonMock.mockRejectedValueOnce(new mockedErrors.VersionNotFoundError('no version'));

    await expect(getPackageUrl('lodash', 'does-not-exist')).resolves.toEqual({
      status: ParseStatus.VERSION_NOT_FOUND,
    });
  });

  it('returns package not found status', async () => {
    mockedPackageJson.packageJsonMock.mockRejectedValueOnce(new mockedErrors.PackageNotFoundError('no package'));

    await expect(getPackageUrl('some-missing-package', 'latest')).resolves.toEqual({
      status: ParseStatus.PACKAGE_NOT_FOUND,
    });
  });

  it('returns server error status for unexpected failures', async () => {
    mockedPackageJson.packageJsonMock.mockRejectedValueOnce(new Error('boom'));

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.SERVER_ERROR,
    });
  });

  it('prefers repository URL when available', async () => {
    mockedPackageJson.packageJsonMock.mockResolvedValueOnce({
      repository: {url: 'git+https://github.com/user/repo.git'},
      time: {},
    });

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.SUCCESS,
      url: 'https://github.com/user/repo',
    });
  });

  it('falls back to homepage URL when repository is missing', async () => {
    mockedPackageJson.packageJsonMock.mockResolvedValueOnce({
      homepage: 'https://example.com/project',
      time: {},
    });

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.SUCCESS,
      url: 'https://example.com/project',
    });
  });

  it('falls back to url field when repository and homepage are missing', async () => {
    mockedPackageJson.packageJsonMock.mockResolvedValueOnce({
      time: {},
      url: 'https://example.com/project-url',
    });

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.SUCCESS,
      url: 'https://example.com/project-url',
    });
  });

  it('returns no url found status when package metadata has no URL fields', async () => {
    mockedPackageJson.packageJsonMock.mockResolvedValueOnce({time: {}});

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.NO_URL_FOUND,
    });
  });

  it('returns invalid URL status when URL cannot be normalized', async () => {
    mockedPackageJson.packageJsonMock.mockResolvedValueOnce({
      homepage: 'definitely-not-a-url',
      time: {},
    });

    await expect(getPackageUrl('left-pad', 'latest')).resolves.toEqual({
      status: ParseStatus.INVALID_URL,
    });
  });
});
