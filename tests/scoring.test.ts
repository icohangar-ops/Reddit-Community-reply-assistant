import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterAndSort, scoreThread } from '../src/lib/scorer.ts';
import type { ScoringConfig, ScoredThread } from '../src/lib/scorer.ts';
import type { RedditPost } from '../src/lib/reddit.ts';

/**
 * Evidence tests for the README scoring claims (evidence/matrix.yaml C003, C004).
 *
 * Runs with Node's built-in type stripping and NO third-party dependencies:
 * src/lib/scorer.ts has no runtime imports, so this suite is executed directly
 * by scripts/verify_scoring_claims.sh inside the evidence-matrix CI gate,
 * before any dependency installation.
 */

function makePost(overrides: Partial<RedditPost> = {}): RedditPost {
  return {
    id: 't1_evidence',
    title: '',
    author: 'researcher',
    selftext: '',
    url: 'https://www.reddit.com/r/smallbusiness/comments/t1_evidence/',
    score: 0,
    num_comments: 0,
    subreddit: 'smallbusiness',
    created_utc: Date.now() / 1000,
    permalink: '/r/smallbusiness/comments/t1_evidence/',
    ...overrides,
  };
}

const CONFIG: ScoringConfig = {
  keywords: ['invoice', 'cash flow', 'budget'],
  competitors: ['quickbooks', 'xero'],
  weightComments: 25,
  weightUpvotes: 25,
  weightRecency: 25,
  weightKeywords: 25,
};

describe('scoreThread 0-100 bounds (README: "Scores each thread 0-100")', () => {
  it('keeps totalScore within 0-100 for a viral post', () => {
    const viral = scoreThread(
      makePost({ title: 'hot thread', score: 1_000_000, num_comments: 50_000 }),
      CONFIG,
    );
    assert.ok(viral.totalScore >= 0, `totalScore ${viral.totalScore} must be >= 0`);
    assert.ok(viral.totalScore <= 100, `totalScore ${viral.totalScore} must be <= 100`);
    assert.ok(viral.totalScore > 0, 'a viral post must score above the floor');
  });

  it('keeps totalScore within 0-100 for a zero-engagement post', () => {
    const quiet = scoreThread(makePost(), CONFIG);
    assert.ok(quiet.totalScore >= 0, `totalScore ${quiet.totalScore} must be >= 0`);
    assert.ok(quiet.totalScore <= 100, `totalScore ${quiet.totalScore} must be <= 100`);
  });

  it('clamps buyingIntentScore to 100 when many signals fire at once', () => {
    const post = makePost({
      title: 'Invoice help',
      selftext:
        'I need invoice help with quickbooks and xero. My cash flow and budget ' +
        'are a mess. Looking for a better recommendation — has anyone tried ' +
        'alternatives? The cost and pricing are a problem and we want to replace ' +
        'our workflow instead of struggling on.',
    });
    const result = scoreThread(post, CONFIG);
    assert.ok(
      result.buyingIntentScore <= 100,
      `buyingIntentScore ${result.buyingIntentScore} must be clamped to <= 100`,
    );
    assert.equal(result.buyingIntentScore, 100);
  });
});

describe('buying-intent signal detection (README: "Uses AI to detect buying-intent signals")', () => {
  it('flags asking for recommendations', () => {
    const result = scoreThread(
      makePost({ title: 'Can anyone recommend an approach here?' }),
      CONFIG,
    );
    assert.ok(result.intentSignals.includes('Asking for recommendations'));
  });

  it('flags comparing options', () => {
    const result = scoreThread(
      makePost({ title: 'What is the better option for invoicing?' }),
      CONFIG,
    );
    assert.ok(result.intentSignals.includes('Comparing options'));
  });

  it('flags expressed frustration (pain point)', () => {
    const result = scoreThread(
      makePost({ title: 'This spreadsheet is a problem', selftext: 'We cannot keep up.' }),
      CONFIG,
    );
    assert.ok(result.intentSignals.includes('Pain point expressed'));
  });
});

describe('filterAndSort (README: "surface the most valuable conversations")', () => {
  it('sorts by totalScore descending and drops threads below minScore', () => {
    const thread = (total: number): ScoredThread => ({
      post: makePost(),
      engagementScore: total,
      buyingIntentScore: 0,
      totalScore: total,
      matchedKeywords: [],
      matchedCompetitors: [],
      intentSignals: [],
    });
    const ranked = filterAndSort([thread(60), thread(40), thread(80)], 50);
    assert.deepEqual(ranked.map(t => t.totalScore), [80, 60]);
  });
});
