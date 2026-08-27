import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { createTracker } from '../src/ui/analytics';

describe('the GA4 tracker', () => {
  it('sends outcomes as events through gtag when a measurement id is configured', () => {
    const gtag = vi.fn();
    const track = createTracker('G-TEST', () => gtag);
    track('run_died', { mile: 212, day: 14 });
    expect(gtag).toHaveBeenCalledWith('event', 'run_died', { mile: 212, day: 14 });
  });
  it('is silent with no id, and silent when gtag never loaded (blocked)', () => {
    const gtag = vi.fn();
    createTracker('', () => gtag)('run_died');
    expect(gtag).not.toHaveBeenCalled();
    expect(() => createTracker('G-TEST', () => null)('run_finished')).not.toThrow();
  });
  it('never carries personal or unknown fields: only approved keys and enum values go out', () => {
    const gtag = vi.fn();
    const track = createTracker('G-TEST', () => gtag);
    track('memorial_posted', {
      status: 'visible',
      epitaph: 'SHORT',
      name: 'Dana',
      email: 'dana@example.com',
      mile: 5,
      unknownNumber: 9,
    } as never);
    expect(gtag.mock.calls[0]![2]).toEqual({ status: 'visible', mile: 5 });
  });
  it('allows only the three post-game surfaces', () => {
    const gtag = vi.fn();
    const track = createTracker('G-TEST', () => gtag);
    track('trail_product_click', { surface: 'victory' });
    track('trail_product_click', { surface: 'Dana' } as never);
    expect(gtag.mock.calls[0]![2]).toEqual({ surface: 'victory' });
    expect(gtag.mock.calls[1]![2]).toEqual({});
  });
});

describe('index.html', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  it('loads the GA4 tag only after stored or explicit consent, with IP anonymised and Google signals off', () => {
    expect(html).toContain('%VITE_GA4_ID%');
    expect(html).toMatch(/googletagmanager\.com\/gtag\/js/);
    expect(html).toContain("8wt.analytics-consent.v1");
    expect(html).toContain("consent === 'granted'");
    expect(html).toContain('Accept analytics');
    expect(html).toContain('No thanks');
    expect(html).toMatch(/anonymize_ip['"]?\s*:\s*true/);
    expect(html).toMatch(/allow_google_signals['"]?\s*:\s*false/);
  });
  it('keeps consent and third-party tags out of offline mode', () => {
    expect(html).toContain("if (ga && ga.indexOf('%') < 0 && !offline)");
    expect(html).toContain("if (ts && ts.indexOf('%') < 0 && !offline)");
  });
  it('loads the Turnstile script only when the build has a site key', () => {
    expect(html).toContain('%VITE_TURNSTILE_SITE_KEY%');
    expect(html).toContain('https://challenges.cloudflare.com/turnstile/v0/api.js');
  });
});
