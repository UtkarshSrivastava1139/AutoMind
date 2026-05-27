import type { Automaton } from '@automind/schemas';
import canonicalCache from './canonical-cache.json';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s01ab]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Perform a cache lookup for common TAFL problems.
 * If found, remaps the canonical automaton to the requested alphabet.
 */
export function lookupCanonicalCache(query: string, alphabet: string[]): Automaton | null {
  const normQuery = normalizeText(query);
  const cache: any[] = canonicalCache;

  for (const entry of cache) {
    const isMatch = entry.variants.some((v: string) => {
      const normV = normalizeText(v);
      return normQuery.includes(normV) || normV.includes(normQuery);
    });

    if (isMatch) {
      // Create a deep copy of the automaton to modify
      const automaton: Automaton = JSON.parse(JSON.stringify(entry.automaton));

      // Remap alphabet if necessary
      if (entry.target) {
        // e.g., 'a' in {a,b}. We need to find the equivalent target in the new alphabet.
        // If the user's query mentioned '0', map target 'a' to '0'.
        let mappedTarget = alphabet[0];
        if (normQuery.includes('0') && alphabet.includes('0')) mappedTarget = '0';
        else if (normQuery.includes('1') && alphabet.includes('1')) mappedTarget = '1';
        else if (normQuery.includes('a') && alphabet.includes('a')) mappedTarget = 'a';
        else if (normQuery.includes('b') && alphabet.includes('b')) mappedTarget = 'b';
        
        const otherCanonicalSymbol = entry.automaton.alphabet.find((s: string) => s !== entry.target) || entry.target;
        const otherMappedSymbol = alphabet.find(s => s !== mappedTarget) || mappedTarget;

        automaton.alphabet = alphabet;
        for (const t of automaton.transitions) {
          if (t.symbol === entry.target) {
            t.symbol = mappedTarget;
          } else if (t.symbol === otherCanonicalSymbol) {
            t.symbol = otherMappedSymbol;
          }
        }
      } else {
        // If no specific target, just replace alphabet symbols directly if they differ
        // This is safe for things like divisibility by 3 over {0,1} where it exactly matches.
        if (alphabet.length === automaton.alphabet.length) {
          const map = new Map();
          automaton.alphabet.forEach((s, i) => map.set(s, alphabet[i]));
          automaton.alphabet = alphabet;
          for (const t of automaton.transitions) {
            t.symbol = map.get(t.symbol) || t.symbol;
          }
        }
      }

      return automaton;
    }
  }

  return null;
}
