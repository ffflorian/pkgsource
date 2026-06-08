import 'reflect-metadata';
import {NestExpressApplication} from '@nestjs/platform-express';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {ServerConfig} from '../src/config.js';
import {ParseStatus} from '../src/RepositoryParser.js';
import * as repositoryParser from '../src/RepositoryParser.js';
import {createApp} from '../src/Server.js';

const defaultConfig: ServerConfig = {
  CACHE_DURATION_SECONDS: 300,
  COMPRESS_LEVEL: 6,
  COMPRESS_MIN_SIZE: 500,
  DEVELOPMENT: true,
  DIST_DIR: '.',
  ENVIRONMENT: 'test',
  PORT_HTTP: 0,
  RATE_LIMIT_MAX_REQUESTS: 10_000,
  RATE_LIMIT_WINDOW_SECONDS: 60,
  VERSION: '1.0.0-test',
};

async function startApp(
  overrides: Partial<ServerConfig> = {}
): Promise<{app: NestExpressApplication; baseUrl: string}> {
  const app = await createApp({...defaultConfig, ...overrides});
  await app.listen(0);

  const address = app.getHttpServer().address();
  if (!address || typeof address === 'string') {
    throw new Error('Could not get HTTP server port');
  }

  return {
    app,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

describe('server routes', () => {
  let app: NestExpressApplication;
  let baseUrl: string;

  beforeEach(async () => {
    const started = await startApp();
    app = started.app;
    baseUrl = started.baseUrl;
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.close();
  });

  it('serves health endpoint', async () => {
    const response = await fetch(`${baseUrl}/_health`);

    expect(response.status).toBe(200);
  });

  it('serves info endpoint', async () => {
    const response = await fetch(`${baseUrl}/_info`);
    const body = (await response.json()) as {code: number; commit: string; version?: string};

    expect(response.status).toBe(200);
    expect(body.code).toBe(200);
    expect(body.commit).toBeDefined();
  });

  it('redirects main route to repository', async () => {
    const response = await fetch(`${baseUrl}/`, {redirect: 'manual'});

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://github.com/ffflorian/pkgsource');
  });

  it('returns raw main route payload', async () => {
    const response = await fetch(`${baseUrl}/?raw=true`);
    const body = (await response.json()) as {code: number; url: string};

    expect(response.status).toBe(200);
    expect(body).toEqual({
      code: 200,
      url: 'https://github.com/ffflorian/pkgsource',
    });
  });

  it('supports unpkg mode on main route', async () => {
    const response = await fetch(`${baseUrl}/?unpkg=true`, {redirect: 'manual'});

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://unpkg.com/browse/pkgsource@latest/');
  });

  it('serves robots and favicon endpoints', async () => {
    const robots = await fetch(`${baseUrl}/robots.txt`);
    const favicon = await fetch(`${baseUrl}/favicon.ico`);

    expect(await robots.text()).toBe('User-agent: *\nDisallow: /');
    expect(favicon.status).toBe(404);
  });

  it('returns json not found via global exception filter', async () => {
    const response = await fetch(`${baseUrl}/not-a-scope/unknown-package`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(404);
    expect(body).toEqual({
      code: 404,
      message: 'Not found',
    });
  });

  it('returns 422 for invalid package names', async () => {
    const response = await fetch(`${baseUrl}/!invalid`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(422);
    expect(body.message).toBe('Invalid package name');
  });

  it('supports unpkg mode for package endpoints', async () => {
    const response = await fetch(`${baseUrl}/lodash@4.17.21?unpkg=true`, {redirect: 'manual'});

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://unpkg.com/browse/lodash@4.17.21/');
  });

  it('returns package url as raw payload on success', async () => {
    vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.SUCCESS,
      url: 'https://github.com/lodash/lodash',
    });

    const response = await fetch(`${baseUrl}/lodash?raw=true`);
    const body = (await response.json()) as {code: number; url: string};

    expect(response.status).toBe(200);
    expect(body).toEqual({
      code: 200,
      url: 'https://github.com/lodash/lodash',
    });
  });

  it('maps parser not found statuses to 404', async () => {
    vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.NO_URL_FOUND,
    });

    const response = await fetch(`${baseUrl}/left-pad`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(404);
    expect(body.message).toContain('No source URL found');
  });

  it('maps parser package not found status to 404', async () => {
    vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.PACKAGE_NOT_FOUND,
    });

    const response = await fetch(`${baseUrl}/definitely-missing-package`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(404);
    expect(body.message).toBe('Package not found');
  });

  it('maps parser version not found status to 404', async () => {
    vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.VERSION_NOT_FOUND,
    });

    const response = await fetch(`${baseUrl}/lodash@0.0.0-does-not-exist`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(404);
    expect(body.message).toBe('Version not found');
  });

  it('maps parser server errors to 500', async () => {
    vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.SERVER_ERROR,
    });

    const response = await fetch(`${baseUrl}/problematic-package`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(500);
    expect(body.message).toBe('Internal server error');
  });

  it('handles scoped package routes and propagates version parsing', async () => {
    const getPackageUrlSpy = vi.spyOn(repositoryParser, 'getPackageUrl').mockResolvedValueOnce({
      status: ParseStatus.SUCCESS,
      url: 'https://github.com/example/pkg',
    });

    const response = await fetch(`${baseUrl}/%40scope/pkg@1.2.3?raw=true`);
    const body = (await response.json()) as {code: number; url: string};

    expect(response.status).toBe(200);
    expect(body.url).toBe('https://github.com/example/pkg');
    expect(getPackageUrlSpy).toHaveBeenCalledWith('@scope/pkg', '1.2.3');
  });

  it('returns 404 for invalid scoped route', async () => {
    const response = await fetch(`${baseUrl}/scope/pkg`);
    const body = (await response.json()) as {code: number; message: string};

    expect(response.status).toBe(404);
    expect(body).toEqual({
      code: 404,
      message: 'Not found',
    });
  });
});

describe('rate limiting', () => {
  it('returns 429 after the configured request budget is exhausted', async () => {
    const started = await startApp({
      RATE_LIMIT_MAX_REQUESTS: 1,
      RATE_LIMIT_WINDOW_SECONDS: 60,
    });

    const firstResponse = await fetch(`${started.baseUrl}/_health`);
    const secondResponse = await fetch(`${started.baseUrl}/_health`);
    const body = (await secondResponse.json()) as {code: number; message: string};

    await started.app.close();

    expect([200, 429]).toContain(firstResponse.status);
    expect(secondResponse.status).toBe(429);
    expect(body).toEqual({
      code: 429,
      message: 'Too many requests',
    });
  });
});
