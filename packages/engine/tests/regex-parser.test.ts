import { describe, it, expect } from 'vitest';
import { parseRegex } from '../src/regex-parser';

describe('Regex Parser', () => {
  it('should parse single character', () => {
    const ast = parseRegex('a');
    expect(ast).toEqual({ type: 'CHAR', value: 'a' });
  });

  it('should add explicit concatenation', () => {
    const ast = parseRegex('ab');
    expect(ast).toEqual({
      type: 'CONCAT',
      left: { type: 'CHAR', value: 'a' },
      right: { type: 'CHAR', value: 'b' }
    });
  });

  it('should parse union with correct precedence', () => {
    const ast = parseRegex('a|b');
    expect(ast).toEqual({
      type: 'UNION',
      left: { type: 'CHAR', value: 'a' },
      right: { type: 'CHAR', value: 'b' }
    });
  });

  it('should respect parenthesis', () => {
    const ast = parseRegex('(a|b)c');
    expect(ast).toEqual({
      type: 'CONCAT',
      left: {
        type: 'UNION',
        left: { type: 'CHAR', value: 'a' },
        right: { type: 'CHAR', value: 'b' }
      },
      right: { type: 'CHAR', value: 'c' }
    });
  });

  it('should parse star, plus, optional operators', () => {
    const ast = parseRegex('a*b+c?');
    expect(ast).toEqual({
      type: 'CONCAT',
      left: {
        type: 'CONCAT',
        left: {
          type: 'STAR',
          child: { type: 'CHAR', value: 'a' }
        },
        right: {
          type: 'PLUS',
          child: { type: 'CHAR', value: 'b' }
        }
      },
      right: {
        type: 'OPTIONAL',
        child: { type: 'CHAR', value: 'c' }
      }
    });
  });

  it('should throw on unbalanced parenthesis', () => {
    expect(() => parseRegex('(ab')).toThrow('Missing closing parenthesis');
  });

  it('should throw on unexpected operator', () => {
    expect(() => parseRegex('*')).toThrow('Unexpected token');
  });

  it('should support escape characters', () => {
    const ast = parseRegex('a\\*b\\|c\\\\');
    expect(ast).toEqual({
      type: 'CONCAT',
      left: {
        type: 'CONCAT',
        left: {
          type: 'CONCAT',
          left: {
            type: 'CONCAT',
            left: {
              type: 'CONCAT',
              left: { type: 'CHAR', value: 'a' },
              right: { type: 'CHAR', value: '*' }
            },
            right: { type: 'CHAR', value: 'b' }
          },
          right: { type: 'CHAR', value: '|' }
        },
        right: { type: 'CHAR', value: 'c' }
      },
      right: { type: 'CHAR', value: '\\' }
    });
  });
});
