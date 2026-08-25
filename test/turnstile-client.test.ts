import { afterEach, describe, expect, it, vi } from 'vitest';
import { turnstileToken, type TurnstileApi } from '../src/ui/net/turnstile';

afterEach(() => {
  vi.useRealTimers();
});

function fakeApi(behaviour: 'ok' | 'error' | 'silent'): TurnstileApi & { rendered: unknown[] } {
  const rendered: unknown[] = [];
  return {
    rendered,
    render(_el, opts) {
      rendered.push(opts);
      if (behaviour === 'ok') setTimeout(() => opts.callback('tok-123'), 0);
      if (behaviour === 'error') setTimeout(() => opts['error-callback']?.(), 0);
      return 'w1';
    },
    remove() {},
  };
}

const host = () => ({}) as HTMLElement;

describe('the Turnstile client', () => {
  it('with no site key there is no widget and the token is null', async () => {
    const api = fakeApi('ok');
    expect(await turnstileToken('', () => api, host)).toBeNull();
    expect(api.rendered).toHaveLength(0);
  });
  it('renders a managed, interaction-only widget and resolves the token', async () => {
    const api = fakeApi('ok');
    expect(await turnstileToken('site', () => api, host)).toBe('tok-123');
    expect(api.rendered[0]).toMatchObject({ sitekey: 'site', appearance: 'interaction-only' });
  });
  it('an error or a missing script is null', async () => {
    expect(await turnstileToken('site', () => fakeApi('error'), host)).toBeNull();
    expect(await turnstileToken('site', () => null, host)).toBeNull();
  });
  it('a widget that never answers is null after the timeout', async () => {
    vi.useFakeTimers();
    const p = turnstileToken('site', () => fakeApi('silent'), host);
    await vi.advanceTimersByTimeAsync(15_001);
    expect(await p).toBeNull();
  });
});
