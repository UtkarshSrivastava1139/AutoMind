import type { RegexToken, RegexTokenType, RegexASTNode } from '@automind/schemas';

export function tokenizeRegex(pattern: string): RegexToken[] {
  const tokens: RegexToken[] = [];
  
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern[i];
    
    let type: RegexTokenType;
    if (char === '|') type = 'UNION';
    else if (char === '*') type = 'STAR';
    else if (char === '+') type = 'PLUS';
    else if (char === '?') type = 'OPTIONAL';
    else if (char === '(') type = 'LPAREN';
    else if (char === ')') type = 'RPAREN';
    else if (char === 'ε') type = 'EPSILON';
    else {
      // Any other char is just a character literal
      type = 'CHAR';
    }
    
    tokens.push({ type, value: char, position: i });
  }

  // Pre-processing step: insert explicit concatenation tokens.
  // Concatenation happens between:
  // - CHAR/EPSILON and CHAR/EPSILON
  // - CHAR/EPSILON and LPAREN
  // - RPAREN/STAR/PLUS/OPTIONAL and CHAR/EPSILON
  // - RPAREN/STAR/PLUS/OPTIONAL and LPAREN
  
  const processedTokens: RegexToken[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    processedTokens.push(token);
    
    if (i < tokens.length - 1) {
      const next = tokens[i + 1];
      const isCurrentConcatable = ['CHAR', 'EPSILON', 'RPAREN', 'STAR', 'PLUS', 'OPTIONAL'].includes(token.type);
      const isNextConcatable = ['CHAR', 'EPSILON', 'LPAREN'].includes(next.type);
      
      if (isCurrentConcatable && isNextConcatable) {
        processedTokens.push({ type: 'CONCAT', value: '.', position: token.position });
      }
    }
  }

  return processedTokens;
}

export function parseRegex(pattern: string): RegexASTNode {
  if (!pattern) throw new Error("Empty regex pattern");
  
  const tokens = tokenizeRegex(pattern);
  let current = 0;

  function peek() {
    return tokens[current];
  }

  function consume() {
    return tokens[current++];
  }

  function parseRegexExpr(): RegexASTNode {
    let node = parseTerm();
    
    while (current < tokens.length && peek().type === 'UNION') {
      consume(); // consume '|'
      const right = parseTerm();
      node = { type: 'UNION', left: node, right: right };
    }
    
    return node;
  }

  function parseTerm(): RegexASTNode {
    let node = parseFactor();
    
    while (current < tokens.length && peek().type === 'CONCAT') {
      consume(); // consume concat
      const right = parseFactor();
      node = { type: 'CONCAT', left: node, right: right };
    }
    
    return node;
  }

  function parseFactor(): RegexASTNode {
    let node = parseBase();
    
    while (current < tokens.length && ['STAR', 'PLUS', 'OPTIONAL'].includes(peek().type)) {
      const op = consume().type as 'STAR' | 'PLUS' | 'OPTIONAL';
      node = { type: op, child: node };
    }
    
    return node;
  }

  function parseBase(): RegexASTNode {
    if (current >= tokens.length) {
      throw new Error("Unexpected end of pattern");
    }
    
    const token = consume();
    
    if (token.type === 'CHAR') {
      return { type: 'CHAR', value: token.value };
    } else if (token.type === 'EPSILON') {
      return { type: 'EPSILON' };
    } else if (token.type === 'LPAREN') {
      const node = parseRegexExpr();
      if (current >= tokens.length || peek().type !== 'RPAREN') {
        throw new Error(`Missing closing parenthesis for '(' at position ${token.position}`);
      }
      consume(); // consume RPAREN
      return node;
    } else {
      throw new Error(`Unexpected token '${token.value}' at position ${token.position}`);
    }
  }

  const ast = parseRegexExpr();
  
  if (current < tokens.length) {
    throw new Error(`Unexpected trailing characters starting at position ${tokens[current].position}`);
  }
  
  return ast;
}
