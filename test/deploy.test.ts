import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const has = (bin: string) => {
  try {
    execFileSync(bin, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

describe('docker-compose.yml', () => {
  const compose = read('docker-compose.yml');
  it('runs the API as a second service with no published port, the data folder bind-mounted, and the secrets from .env', () => {
    expect(compose).toMatch(/^\s+eight-west-api:\s*$/m);
    const api = compose.slice(compose.indexOf('eight-west-api:'));
    expect(api).toMatch(/dockerfile:\s*server\/Dockerfile/);
    expect(api).toMatch(/context:\s*\./);
    expect(api).toMatch(/\.\/data:\/data/);
    expect(api).toMatch(/env_file/);
    expect(api).not.toMatch(/ports:/);
    expect(api).toMatch(/restart:\s*unless-stopped/);
  });
  it('builds the game with the API base and the public keys', () => {
    expect(compose).toMatch(/VITE_8WT_API:\s*\/api/);
    expect(compose).toMatch(/VITE_TURNSTILE_SITE_KEY/);
    expect(compose).toMatch(/VITE_GA4_ID/);
  });
  it.skipIf(!has('docker'))('parses with docker compose config', () => {
    execFileSync('docker', ['compose', '-f', 'docker-compose.yml', 'config', '-q'], { stdio: 'ignore' });
  });
});

describe('deploy/nginx.conf', () => {
  const conf = read('deploy/nginx.conf');
  it('proxies /api/ to the API container with the client IP, small bodies, and no access log', () => {
    const block = /location \/api\/ \{([\s\S]*?)\n\s*\}/.exec(conf)?.[1] ?? '';
    expect(block).toMatch(/proxy_pass\s+http:\/\/eight-west-api:3000/);
    expect(block).toMatch(/access_log\s+off/);
    expect(block).toMatch(/client_max_body_size\s+4k/);
    expect(block).toMatch(/proxy_set_header\s+X-Forwarded-For\s+\$http_cf_connecting_ip/);
    expect(block).toMatch(/proxy_set_header\s+CF-Connecting-IP\s+\$http_cf_connecting_ip/);
  });
  it('proxies /unsubscribe/ to the API (4B) with no access log', () => {
    const block = /location \/unsubscribe\/ \{([\s\S]*?)\n\s*\}/.exec(conf)?.[1] ?? '';
    expect(block).toMatch(/proxy_pass\s+http:\/\/eight-west-api:3000\/unsubscribe\//);
    expect(block).toMatch(/access_log\s+off/);
  });
  it('serves /privacy as a page', () => {
    expect(conf).toMatch(/location = \/privacy \{[\s\S]*?privacy\.html/);
  });
  it.skipIf(!has('nginx'))('passes nginx -t', () => {
    execFileSync('nginx', ['-t', '-c', new URL('../deploy/nginx.conf', import.meta.url).pathname], { stdio: 'ignore' });
  });
});

describe('the game Dockerfile', () => {
  it('takes the public build args', () => {
    const df = read('Dockerfile');
    for (const arg of ['VITE_8WT_API', 'VITE_TURNSTILE_SITE_KEY', 'VITE_GA4_ID']) {
      expect(df).toMatch(new RegExp(`ARG ${arg}`));
      expect(df).toContain(`ENV ${arg}=$${arg}`);
    }
  });
});

describe('.env.example', () => {
  it('names the two secrets and nothing else secret-shaped', () => {
    const env = read('.env.example');
    expect(env).toMatch(/^TURNSTILE_SECRET=$/m);
    expect(env).toMatch(/^IP_HASH_SECRET=$/m);
  });
});
