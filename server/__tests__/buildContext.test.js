import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, findRelevantHorses, findRelevantRaces } from '../data/buildContext.js';

describe('buildSystemPrompt', () => {
  const prompt = buildSystemPrompt();

  it('is deterministic, so the cached prefix stays stable', () => {
    expect(buildSystemPrompt()).toBe(prompt);
  });

  it('states the assistant identity and the data it can see', () => {
    expect(prompt).toContain('HorseLLM');
    expect(prompt).toMatch(/horse profiles/i);
  });

  it('contains no em dash', () => {
    // The style rule names the character, so check the rest of the prompt.
    const withoutRule = prompt.replace(/WRITING STYLE:.*/s, '');
    expect(withoutRule).not.toContain('—');
  });
});

describe('findRelevantHorses', () => {
  it('returns nothing when no horse is named', () => {
    expect(findRelevantHorses('what is ground loss?')).toEqual([]);
  });

  it('is case insensitive when a horse is named', () => {
    const [name] = ['A P M Notion'];
    const lower = findRelevantHorses(`tell me about ${name.toLowerCase()}`);
    const upper = findRelevantHorses(`tell me about ${name.toUpperCase()}`);
    expect(lower.length).toBe(upper.length);
  });
});

describe('findRelevantRaces', () => {
  it('returns an array for an unrelated question', () => {
    expect(Array.isArray(findRelevantRaces('how do I bake bread?'))).toBe(true);
  });

  it('finds races when a track is named', () => {
    const byName = findRelevantRaces('any races at Aqueduct this week?');
    expect(Array.isArray(byName)).toBe(true);
    if (byName.length) expect(byName.join(' ')).toMatch(/Aqueduct/i);
  });
});
