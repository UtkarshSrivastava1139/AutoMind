/**
 * Bounded test string generator
 *
 * Generates all possible strings over a given alphabet up to a maximum length.
 * Used to augment LLM-provided examples with exhaustive short-string coverage.
 */

/**
 * Generate all strings over the given alphabet up to maxLength (inclusive).
 * Returns strings in order of increasing length.
 *
 * @example
 * generateTestStrings(['0', '1'], 2)
 * // → ['', '0', '1', '00', '01', '10', '11']
 */
export function generateTestStrings(alphabet: string[], maxLength: number = 6): string[] {
  if (alphabet.length === 0) return [''];
  if (maxLength < 0) return [];

  const results: string[] = [''];  // Always include empty string
  const queue: string[] = [''];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.length >= maxLength) continue;

    for (const symbol of alphabet) {
      const next = current + symbol;
      results.push(next);
      if (next.length < maxLength) {
        queue.push(next);
      }
    }
  }

  return results;
}

/**
 * Generate a targeted set of test strings that are likely to reveal
 * edge cases for common constraint types.
 */
export function generateEdgeCaseStrings(
  alphabet: string[],
  constraints: Array<{ type: string; target?: string; value?: number }>
): string[] {
  const edgeCases = new Set<string>();

  // Always test empty string
  edgeCases.add('');

  // Single-character strings
  for (const sym of alphabet) {
    edgeCases.add(sym);
  }

  for (const constraint of constraints) {
    const target = constraint.target || '';
    const value = constraint.value || 0;

    switch (constraint.type) {
      case 'starts_with':
        edgeCases.add(target);
        edgeCases.add(target + (alphabet[0] || ''));
        // Something that doesn't start with target
        if (target.length > 0 && alphabet.length > 1) {
          const other = alphabet.find((s) => s !== target[0]) || alphabet[0];
          edgeCases.add(other + target);
        }
        break;

      case 'ends_with':
        edgeCases.add(target);
        edgeCases.add((alphabet[0] || '') + target);
        if (target.length > 0 && alphabet.length > 1) {
          const other = alphabet.find((s) => s !== target[target.length - 1]) || alphabet[0];
          edgeCases.add(target + other);
        }
        break;

      case 'contains':
        edgeCases.add(target);
        edgeCases.add((alphabet[0] || '') + target + (alphabet[0] || ''));
        break;

      case 'not_contains':
        // Build a string without the target substring
        if (alphabet.length > 0) {
          const safe = alphabet.find((s) => !target.includes(s)) || alphabet[0];
          edgeCases.add(safe.repeat(Math.max(3, target.length)));
        }
        break;

      case 'length_exact':
        if (value > 0 && alphabet.length > 0) {
          edgeCases.add(alphabet[0].repeat(value));
          edgeCases.add(alphabet[0].repeat(value - 1)); // Too short
          edgeCases.add(alphabet[0].repeat(value + 1)); // Too long
        }
        break;

      case 'count_exact':
      case 'count_min':
      case 'count_max':
        if (target && value >= 0 && alphabet.length > 0) {
          const other = alphabet.find((s) => s !== target) || target;
          edgeCases.add(target.repeat(value));
          if (value > 0) edgeCases.add(target.repeat(value - 1) + other);
          edgeCases.add(target.repeat(value + 1));
        }
        break;

      case 'divisibility':
        if (alphabet.length > 0 && value > 0) {
          // Generate strings of various lengths around multiples
          for (let i = 0; i <= value * 3; i++) {
            edgeCases.add(alphabet[0].repeat(i));
          }
        }
        break;
    }
  }

  return Array.from(edgeCases);
}
