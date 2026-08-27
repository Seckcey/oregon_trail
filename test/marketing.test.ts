import { describe, expect, test } from 'vitest';
import { PRODUCT_BRIDGE_COPY, outcomeSurface, workflowUrl } from '../src/ui/marketing';

describe('the post-game product bridge', () => {
  test('uses the approved copy and only three bounded surfaces', () => {
    expect(PRODUCT_BRIDGE_COPY).toBe('See how 8 West IT 365 keeps alerts, tickets, time, and invoices moving.');
    expect(['victory', 'dead', 'leaderboard'].map(outcomeSurface)).toEqual(['victory', 'dead', 'leaderboard']);
    expect(outcomeSurface('title')).toBeNull();
    expect(outcomeSurface('Dana')).toBeNull();
  });

  test.each(['victory', 'dead', 'leaderboard'] as const)('builds a fixed campaign URL for %s', (surface) => {
    const url = new URL(workflowUrl(surface));
    expect(url.origin + url.pathname).toBe('https://8westit.com/trail/');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_id: '8w365-ft-2026-09',
      utm_source: '8wt',
      utm_medium: 'game',
      utm_campaign: 'founding_trail_sep_2026',
      utm_source_platform: '8wt',
      utm_content: `postgame_${surface}`,
    });
    expect(url.hash).toBe('#workflow');
  });

  test('keeps only bounded incoming campaign fields, including the originating creative', () => {
    const url = new URL(
      workflowUrl(
        'victory',
        '?utm_id=launch_01&utm_source=linkedin&utm_medium=cpc&utm_campaign=august-launch&utm_source_platform=linkedin&utm_term=managed_it&utm_content=attacker&seed=secret&name=Dana&email=dana@example.com&epitaph=hello&referrer=partner',
      ),
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_id: 'launch_01',
      utm_source: 'linkedin',
      utm_medium: 'cpc',
      utm_campaign: 'august-launch',
      utm_source_platform: 'linkedin',
      utm_term: 'managed_it',
      utm_content: 'attacker',
    });
  });

  test('drops invalid, oversized, and free-text attribution values', () => {
    const tooLong = 'a'.repeat(65);
    const url = new URL(workflowUrl('dead', `?utm_source=LinkedIn&utm_medium=PAID_SOCIAL&utm_campaign=${tooLong}&utm_term=x%2Fy&name=dana`));
    expect(Object.fromEntries(url.searchParams)).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'paid_social',
      utm_id: '8w365-ft-2026-09',
      utm_campaign: 'founding_trail_sep_2026',
      utm_source_platform: '8wt',
      utm_content: 'postgame_dead',
    });
  });
});
