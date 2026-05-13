## Module 9: Question-to-Automaton Converter (Natural Language Problem Solver)

### 9.1 Feature overview

#### What the feature does

The Question-to-Automaton Converter allows a student to paste a natural-language Theory of Automata question and receive a complete, formally verified solution including the automaton diagram, transition table, construction explanation, and test cases. The system uses AI for interpreting the question and extracting formal constraints, but relies entirely on the deterministic engine for correctness.

#### Why it matters

Students typically encounter automata problems as written question statements, not as ready formulas. The gap between "Design a DFA that accepts all binary strings ending in 01" and a correct transition diagram is exactly where students struggle. This feature bridges that gap with verified automation.

#### Why it is unique

Unlike chatbot-style tools that output unverified automata diagrams, this system treats the LLM as an interpreter and the formal engine as the source of truth. Every output shown as "correct" has passed deterministic verification. This is the core differentiator: AI-assisted interpretation with engine-guaranteed correctness.

#### Primary user value

- Students get verified solutions to textbook-style problems instantly.
- The solution is inspectable: test cases, construction steps, and assumptions are visible.
- Ambiguous or unsupported questions trigger clarification instead of hallucinated output.
- Results can be exported directly to the Automata Lab simulator for further exploration.

#### Example student workflow

1. Student pastes: "Design an NFA that accepts all strings over {a,b} that contain the substring 'aba'."
2. System classifies the task as "build NFA from language description."
3. System extracts: alphabet = {a,b}, constraint = "contains substring aba", target = NFA.
4. System generates a candidate NFA using the engine.
5. Engine verifies the candidate against positive examples (aba, aaba, baba) and negative examples (ab, ba, aab).
6. System renders the verified NFA diagram, transition table, construction explanation, and test cases.
7. Student clicks "Open in Simulator" to explore the machine interactively.

#### Example question inputs

| Input question | Expected task type |
|---|---|
| "Build a DFA for binary strings divisible by 3" | build_dfa |
| "Design an NFA that accepts strings ending in 'ab'" | build_nfa |
| "Write a regex for strings over {0,1} with at least two 0s" | build_regex |
| "Convert (a|b)*abb to an NFA" | regex_to_nfa |
| "Convert the following NFA to a DFA: ..." | nfa_to_dfa |
| "What language does the regex (01)* describe?" | explain_regex |
| "Design a PDA for balanced parentheses" | unsupported (graceful rejection) |

---

### 9.2 Scope

#### MVP scope

- Accept natural-language questions about regular languages, DFA, NFA, and regex.
- Classify the task type automatically.
- Extract formal constraints (alphabet, language properties, target formalism).
- Generate candidate formal solutions using the deterministic engine.
- Verify candidates against extracted constraints and generated test cases.
- Render the verified result with diagram data, transition table, explanation, and test cases.
- Allow export to the Automata Lab workspace.

#### Supported question types (MVP)

1. Build DFA from language description
2. Build NFA from language description
3. Build regex from language description
4. Convert a regex described in words into formal regex notation
5. Convert regex to NFA (direct conversion)
6. Convert NFA to DFA (direct conversion)
7. Detect unsupported or ambiguous prompts

#### Outputs generated

- Recognized task type and confidence
- Extracted alphabet and language summary
- Assumptions and ambiguity warnings
- Verified automaton or regex
- State diagram data (compatible with React Flow)
- Transition table
- Construction explanation in plain language
- Auto-generated positive and negative test strings
- Counterexamples for rejected candidates
- Export-ready payload for simulator

#### Explicit non-goals for MVP

- Context-free grammar problem solving
- PDA or Turing Machine construction from natural language
- Multi-step proof generation
- Equivalence proofs between two user-provided automata
- Image/handwriting input parsing
- Conversational multi-turn refinement beyond one clarification round

#### Deferred to later phases

- CFG/PDA/TM natural language solving (Phase 3+)
- Adaptive problem generation from question patterns
- Batch question solving
- Integration with quiz engine for auto-grading constructed answers
- Voice input support

---

### 9.3 Problem types supported

#### Tier 1: Fully supported in MVP

| Category | Example | Engine method |
|---|---|---|
| Build DFA from language description | "DFA for strings with even number of 0s" | Constraint-to-DFA generator + verification |
| Build NFA from language description | "NFA accepting strings containing 'aba'" | Constraint-to-NFA generator + verification |
| Language description to regex | "Regex for strings starting with 1 and ending with 0" | Constraint-to-regex builder + verification |
| Verbal regex to formal regex | "a followed by zero or more b then c" | LLM structured extraction + regex parser validation |
| Regex to NFA | "Convert (a|b)*abb to NFA" | Thompson Construction (existing engine) |
| NFA to DFA | "Convert this NFA to DFA" (with provided transition table) | Subset Construction (existing engine) |
| DFA minimization | "Minimize this DFA" (with provided structure) | Hopcroft Algorithm (existing engine) |

#### Tier 2: Detected but gracefully rejected in MVP

| Category | Response |
|---|---|
| CFG construction | "This question involves context-free grammars, which is not yet supported. Try a DFA, NFA, or regex question." |
| PDA construction | Same graceful rejection with category label |
| Turing Machine questions | Same graceful rejection |
| Proof questions | "Formal proofs are not supported yet. Try a construction or conversion question." |
| Ambiguous/unparseable | "I couldn't extract enough formal constraints. Please rephrase or add details." |

---

### 9.4 User flow

#### Primary flow

```text
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│ User pastes  │────▶│ Task Classifier  │────▶│ Constraint Extractor│
│ question     │     │ (AI via OpenRouter│     │ (AI via OpenRouter) │
└──────────────┘     └──────────────────┘     └─────────┬───────────┘
                                                        │
                                              ┌─────────▼───────────┐
                                              │ Ambiguity Detector  │
                                              │ (AI + rules)        │
                                              └─────────┬───────────┘
                                                        │
                                    ┌───────────────────┤
                                    │ ambiguous?         │ clear
                                    ▼                    ▼
                          ┌─────────────────┐  ┌────────────────────┐
                          │ Clarification   │  │ Candidate Generator│
                          │ Panel (user)    │  │ (deterministic     │
                          └────────┬────────┘  │  engine)           │
                                   │           └────────┬───────────┘
                                   │                    │
                                   │           ┌────────▼───────────┐
                                   └──────────▶│ Formal Verifier    │
                                               │ (deterministic)    │
                                               └────────┬───────────┘
                                                        │
                                               ┌────────▼───────────┐
                                               │ Solution Renderer  │
                                               │ + Export to Lab    │
                                               └────────────────────┘
```

#### Edge flows

**Ambiguous question**: System displays extracted constraints with highlighted uncertainty. Shows clarification options (e.g., "Did you mean strings of length exactly 3, or at least 3?"). User selects or types clarification. Pipeline re-runs with updated constraints.

**Unsupported question**: System classifies as unsupported, returns a clear message with the detected category and a suggestion to try a supported question type.

**Low confidence extraction**: System shows a warning banner: "I'm not confident about some constraints. Please review the assumptions below before accepting the solution." Assumptions are listed with edit controls.

**Multiple valid interpretations**: System generates candidates for each interpretation, verifies all, and presents them as tabs: "Interpretation A: ... | Interpretation B: ..." with the user choosing the intended one.

---

### 9.5 Detailed outputs

The final response payload for a solved question must include:

| Field | Type | Description |
|---|---|---|
| taskType | enum | Recognized task (build_dfa, build_nfa, build_regex, regex_to_nfa, nfa_to_dfa, minimize_dfa) |
| confidence | number (0-1) | Overall confidence in the extraction |
| alphabet | string[] | Extracted alphabet |
| languageSummary | string | Human-readable summary of the recognized language |
| assumptions | string[] | Assumptions made during extraction |
| ambiguityWarnings | string[] | Detected ambiguities |
| automaton | Automaton | Verified automaton structure (states, transitions, start, accept) |
| regex | string | null | Final regex if applicable |
| transitionTable | object | Tabular representation of transitions |
| diagramData | object | React Flow compatible nodes and edges |
| explanation | string | Step-by-step construction explanation |
| positiveTests | string[] | Strings that should be accepted |
| negativeTests | string[] | Strings that should be rejected |
| counterexamples | string[] | Strings that caused candidate rejection (if any) |
| verificationStatus | enum | verified, partial, unverified |
| candidatesEvaluated | number | How many candidates were tested |

---

### 9.6 Core product principle

**The LLM is not the formal source of truth.**

This principle governs the entire module:

1. The LLM interprets the question and extracts structured constraints. It does not construct the final automaton.
2. The deterministic engine generates candidate automata from structured constraints.
3. The deterministic engine verifies candidates against test cases and constraint rules.
4. If no candidate passes verification, the system asks for clarification or returns "unable to verify" — it does not show an unverified result as correct.
5. The LLM generates human-readable explanations of verified results. It does not explain unverified artifacts.
6. Every output displayed with a "verified" badge has passed deterministic checks.

---

### 9.7 System architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend UI Layer                        │
│  QuestionInput → ExtractionPreview → ClarificationPanel →       │
│  DiagramPanel → TransitionTable → TestCasePanel → ExportButton  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                     Orchestrator Service                         │
│  Coordinates pipeline stages, manages state, handles retries    │
└──┬──────────┬──────────┬──────────┬──────────┬──────────┬───────┘
   │          │          │          │          │          │
   ▼          ▼          ▼          ▼          ▼          ▼
┌──────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Task  │ │Constr. │ │Ambig.  │ │Candid. │ │Formal  │ │Explan. │
│Class.│ │Extract.│ │Detect. │ │Gener.  │ │Verif.  │ │Builder │
│(AI)  │ │(AI)    │ │(AI+Det)│ │(Det.)  │ │(Det.)  │ │(AI)    │
└──────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
   │          │          │                                │
   └──────────┴──────────┘                                │
              │                                           │
     ┌────────▼────────┐                         ┌────────▼────────┐
     │  OpenRouter API  │                         │  OpenRouter API  │
     │  (LLM calls)     │                         │  (LLM calls)     │
     └──────────────────┘                         └──────────────────┘
```

Pipeline: `Question Input → Task Classifier → Constraint Extractor → Ambiguity Detector → Candidate Generator → Formal Verifier → Counterexample Generator → Solution Renderer`

---

### 9.8 Technical architecture details

| Subservice | Responsibility | Uses AI? | Package |
|---|---|---|---|
| questionClassifier | Classify task type from natural language | Yes | packages/prompts |
| constraintExtractor | Extract alphabet, language properties, constraints | Yes | packages/prompts |
| ambiguityResolver | Detect conflicting or missing constraints | Yes + rules | packages/prompts + packages/engine |
| candidateGenerator | Build automaton/regex from structured constraints | No | packages/engine |
| verifier | Test candidate against positive/negative examples, structural rules | No | packages/engine |
| counterexampleGenerator | Generate strings that distinguish correct from incorrect candidates | No | packages/engine |
| explanationBuilder | Generate human-readable construction explanation | Yes | packages/prompts |
| solutionRenderer | Format verified result for UI consumption | No | apps/web |
| exportService | Convert solution to simulator-compatible format | No | apps/web |

---

### 9.9 Structured intermediate representation

All LLM outputs must be parsed into this strongly typed schema and validated with Zod before use by the engine.

```ts
interface QuestionParseResult {
  taskType: 'build_dfa' | 'build_nfa' | 'build_regex' | 'regex_to_nfa' | 'nfa_to_dfa' | 'minimize_dfa' | 'explain' | 'unsupported';
  targetFormalism: 'DFA' | 'NFA' | 'REGEX' | 'TRANSITION_TABLE';
  alphabet: string[];
  languageDescription: string;
  atomicConstraints: AtomicConstraint[];
  positiveExamples: string[];
  negativeExamples: string[];
  assumptions: string[];
  ambiguityFlags: AmbiguityFlag[];
  confidence: number;
  requestedOutputFormat: string[];
  notes: string;
}

interface AtomicConstraint {
  type: 'starts_with' | 'ends_with' | 'contains' | 'not_contains' | 'length_exact' | 'length_min' | 'length_max' | 'count_min' | 'count_max' | 'count_exact' | 'divisibility' | 'parity' | 'pattern' | 'custom';
  target?: string;      // e.g. the symbol or substring
  value?: number;        // e.g. count or length
  description: string;   // human-readable
}

interface AmbiguityFlag {
  field: string;
  issue: string;
  suggestions: string[];
}
```

---

### 9.10 Prompting strategy

#### Task classification prompt template

```text
You are a formal language question classifier for an automata theory learning platform.

Given a student's question, classify it into exactly one of these categories:
- build_dfa: The question asks to construct a DFA
- build_nfa: The question asks to construct an NFA
- build_regex: The question asks to write a regular expression
- regex_to_nfa: The question provides a regex and asks for NFA conversion
- nfa_to_dfa: The question provides an NFA and asks for DFA conversion
- minimize_dfa: The question asks to minimize a DFA
- explain: The question asks to explain a concept or language
- unsupported: The question involves CFG, PDA, Turing Machines, proofs, or topics beyond regular languages

Rules:
- Output ONLY valid JSON matching the schema provided.
- If the question is ambiguous, still classify your best guess and set confidence below 0.6.
- Do NOT attempt to solve the problem. Only classify it.
- Do NOT claim any formal result is correct.

Output schema: { "taskType": string, "confidence": number, "reasoning": string }
```

#### Constraint extraction prompt template

```text
You are a formal constraint extractor for automata theory questions.

Given a classified question about regular languages, extract:
1. The alphabet (set of symbols)
2. A precise language description
3. Atomic constraints (e.g., "ends with 01", "has even number of a's")
4. Positive example strings that should be accepted
5. Negative example strings that should be rejected
6. Any assumptions you are making
7. Any ambiguities you detect

Rules:
- Output ONLY valid JSON matching the provided schema.
- Be conservative: if a constraint is unclear, flag it as ambiguous rather than guessing.
- Do NOT construct or claim correctness of any automaton or regex.
- Separate clearly between what the question states and what you infer.

Output schema: { QuestionParseResult as defined above }
```

#### Ambiguity detection prompt template

```text
You are an ambiguity detector for formal language problem statements.

Given extracted constraints from a student's automata question, check for:
1. Conflicting constraints (e.g., "starts with 0" and "starts with 1")
2. Missing information (e.g., alphabet not specified)
3. Multiple valid interpretations
4. Vague quantifiers (e.g., "few", "some", "many")
5. Implicit assumptions that should be made explicit

Rules:
- Output ONLY valid JSON.
- For each ambiguity, suggest 2-3 possible resolutions.
- Do NOT resolve ambiguities yourself. Surface them for user decision.
```

#### Explanation generation prompt template

```text
You are AutoMind Tutor explaining a verified automata construction.

You are given:
- The original question
- The extracted constraints
- The verified automaton (states, transitions, start state, accept states)
- Test case results

Generate a clear, step-by-step explanation of:
1. How the constraints map to states
2. Why each transition exists
3. Why the start and accept states were chosen
4. How the test cases confirm correctness

Rules:
- Explain ONLY the verified result provided to you.
- Do NOT invent additional states, transitions, or claims.
- Use precise TAFL terminology but keep language student-friendly.
- Reference specific states and transitions in your explanation.
```

---

### 9.11 OpenRouter integration design

#### API client abstraction

```ts
// packages/prompts/src/openrouter-client.ts
interface OpenRouterConfig {
  apiKey: string;                    // OPENROUTER_API_KEY
  baseUrl: string;                   // OPENROUTER_BASE_URL (default: https://openrouter.ai/api/v1)
  primaryModel: string;              // e.g. "google/gemini-2.0-flash-exp:free"
  fallbackModels: string[];          // e.g. ["meta-llama/llama-3.1-8b-instruct:free"]
  timeoutMs: number;                 // default: 30000
  maxRetries: number;                // default: 2
  retryDelayMs: number;              // default: 1000
}

interface OpenRouterRequest {
  model: string;
  models?: string[];                 // OpenRouter fallback chain
  messages: Array<{ role: string; content: string }>;
  response_format?: { type: 'json_object' };
  temperature?: number;
  max_tokens?: number;
}
```

#### Request flow

1. Build request with `model` set to primary model and `models` set to fallback chain.
2. Set `response_format: { type: 'json_object' }` for all structured extraction calls.
3. Send POST to `${OPENROUTER_BASE_URL}/chat/completions`.
4. On timeout (30s default), retry up to `maxRetries` times with exponential backoff.
5. On final failure, return structured error with `model_failure` status.
6. Log the `model` field from the response to track which model actually served the request.
7. Track latency, token usage, and cost per request for telemetry.

#### Environment variables

```env
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_PRIMARY_MODEL=google/gemini-2.0-flash-exp:free
OPENROUTER_FALLBACK_MODELS=meta-llama/llama-3.1-8b-instruct:free,qwen/qwen-2.5-7b-instruct:free
OPENROUTER_TIMEOUT_MS=30000
OPENROUTER_MAX_RETRIES=2
```

#### Telemetry

Track per request:
- request_id
- selected_model (from response)
- latency_ms
- input_tokens / output_tokens
- cost (if returned by OpenRouter)
- success / failure / timeout / fallback_used
- pipeline_stage (classify, extract, explain)

---

### 9.12 APIs

#### POST `/api/question/parse`

Purpose: Classify the question and extract structured constraints.

Request body:
```json
{
  "questionText": "Design a DFA that accepts all binary strings divisible by 3",
  "projectId": "optional-project-id"
}
```

Response body:
```json
{
  "requestId": "uuid",
  "taskType": "build_dfa",
  "confidence": 0.92,
  "alphabet": ["0", "1"],
  "languageSummary": "Binary strings whose decimal value is divisible by 3",
  "constraints": [...],
  "assumptions": ["Alphabet is {0,1}", "Empty string represents 0, which is divisible by 3"],
  "ambiguities": [],
  "positiveExamples": ["", "0", "11", "110", "1001"],
  "negativeExamples": ["1", "10", "100"]
}
```

Uses OpenRouter: Yes (classify + extract stages).

#### POST `/api/question/clarify`

Purpose: Re-run extraction with user-provided clarification.

Request body:
```json
{
  "requestId": "uuid-from-parse",
  "clarifications": [
    { "field": "alphabet", "resolution": "{a, b}" }
  ]
}
```

Response: Same shape as `/parse` with updated constraints.

Uses OpenRouter: Yes.

#### POST `/api/question/solve`

Purpose: Generate, verify, and rank candidate solutions.

Request body:
```json
{
  "requestId": "uuid-from-parse",
  "parseResult": { ... }
}
```

Response body:
```json
{
  "requestId": "uuid",
  "status": "verified",
  "automaton": { ... },
  "transitionTable": { ... },
  "diagramData": { "nodes": [...], "edges": [...] },
  "positiveTests": [...],
  "negativeTests": [...],
  "counterexamples": [],
  "candidatesEvaluated": 2,
  "verificationDetails": { ... }
}
```

Uses OpenRouter: No (deterministic engine only).

#### POST `/api/question/explain`

Purpose: Generate human-readable explanation of a verified solution.

Request body:
```json
{
  "requestId": "uuid",
  "questionText": "...",
  "parseResult": { ... },
  "solution": { ... }
}
```

Response body:
```json
{
  "explanation": "Step-by-step construction explanation...",
  "model": "google/gemini-2.0-flash-exp:free",
  "latencyMs": 2340
}
```

Uses OpenRouter: Yes.

#### POST `/api/question/export`

Purpose: Export verified solution to simulator workspace.

Request body:
```json
{
  "requestId": "uuid",
  "solutionId": "uuid",
  "targetProjectId": "optional-existing-project"
}
```

Response: Project ID of the created/updated simulator workspace.

Uses OpenRouter: No.

#### Error cases (all endpoints)

| Error | HTTP code | Body |
|---|---|---|
| Invalid input | 400 | `{ "error": "validation_error", "details": [...] }` |
| Unsupported question type | 422 | `{ "error": "unsupported_question", "detectedType": "cfg" }` |
| Model timeout | 504 | `{ "error": "model_timeout", "retried": true }` |
| No verified candidate | 422 | `{ "error": "no_verified_candidate", "reason": "..." }` |
| Rate limited | 429 | `{ "error": "rate_limited", "retryAfter": 30 }` |

---

### 9.13 Database design

#### New entities

**QuestionRequest**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| userId | uuid | FK to User |
| projectId | uuid? | FK to Project (optional) |
| questionText | text | Raw question input |
| status | enum | pending, parsed, solving, solved, failed, clarification_needed |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**QuestionParseResult**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| requestId | uuid | FK to QuestionRequest |
| version | int | Incremented on re-parse after clarification |
| taskType | enum | build_dfa, build_nfa, etc. |
| confidence | float | |
| alphabet | json | |
| languageSummary | text | |
| constraints | json | AtomicConstraint[] |
| assumptions | json | string[] |
| ambiguities | json | AmbiguityFlag[] |
| positiveExamples | json | string[] |
| negativeExamples | json | string[] |
| rawLlmResponse | json | Full LLM response for debugging |
| modelUsed | string | Which model served the request |
| latencyMs | int | |
| createdAt | timestamp | |

**QuestionSolutionCandidate**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| requestId | uuid | FK to QuestionRequest |
| parseResultId | uuid | FK to QuestionParseResult |
| candidateIndex | int | 0-indexed |
| automaton | json | Full automaton structure |
| regex | text? | If applicable |
| generationMethod | string | e.g. "constraint_to_dfa_v1" |
| createdAt | timestamp | |

**QuestionVerificationRun**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| candidateId | uuid | FK to QuestionSolutionCandidate |
| passed | boolean | |
| positiveResults | json | { input, expected, actual, passed }[] |
| negativeResults | json | { input, expected, actual, passed }[] |
| counterexamples | json | string[] |
| rejectionReason | text? | If failed |
| createdAt | timestamp | |

**QuestionSolution**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| requestId | uuid | FK to QuestionRequest |
| candidateId | uuid | FK to winning candidate |
| verificationId | uuid | FK to verification run |
| status | enum | verified, partial, unverified |
| diagramData | json | React Flow nodes/edges |
| transitionTable | json | |
| explanation | text? | AI-generated explanation |
| exportedProjectId | uuid? | FK to Project if exported |
| createdAt | timestamp | |

**QuestionClarification**

| Field | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| requestId | uuid | FK to QuestionRequest |
| ambiguityField | string | |
| userResponse | text | |
| createdAt | timestamp | |

---

### 9.14 Verification strategy

#### Rules

1. Every candidate automaton must be tested against all extracted positive examples (must accept) and negative examples (must reject).
2. The engine must generate additional bounded test strings (up to length 8) to increase coverage.
3. For DFA candidates, structural checks must verify: exactly one start state, deterministic transitions for every state-symbol pair, and reachability of accept states.
4. For regex candidates, the engine must parse the regex and verify it against positive/negative examples using the existing DFA simulation pipeline.
5. Rejected candidates must store the rejection reason and the counterexample that caused failure.
6. If no candidate passes verification, the system must either request clarification or return status `unverified` with an explanation. It must never display an unverified result as correct.
7. Test-case generation alone is not sufficient for formal correctness, but serves as a high-confidence layer. The system should state this transparently when showing results.

#### Verification pipeline

```text
Candidate → Structural Check → Positive Test Suite → Negative Test Suite → Bounded Exhaustive Check → Pass/Fail + Counterexamples
```

---

### 9.15 Ranking and confidence

#### Candidate selection logic

1. If only one candidate passes verification, it is selected.
2. If multiple candidates pass, prefer the one with fewer states (simplicity).
3. If candidates are structurally equivalent (same state count, same language), select the first.
4. Confidence score = weighted average of extraction confidence (40%), verification pass rate (40%), and structural simplicity (20%).

#### Surfacing to user

- Confidence badge: High (≥0.85), Medium (0.6–0.84), Low (<0.6).
- Ambiguity score: count of unresolved AmbiguityFlags.
- Assumptions panel: all assumptions listed with source (inferred vs. stated).
- Traceability: user can inspect Question → Constraints → Candidate → Verification → Final Solution at each stage.

---

### 9.16 UX and UI requirements

#### Screen layout

```text
┌─────────────────────────────────────────────────────────────┐
│  Question Solver                                     [Help] │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Paste your automata question here...                  │  │
│  │                                              [Solve ▶]│  │
│  └───────────────────────────────────────────────────────┘  │
│  Examples: "DFA for strings ending in 01" | "NFA for..."    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ Extraction       │  │ Solution Diagram                │  │
│  │ ─────────────── │  │                                 │  │
│  │ Task: build_dfa  │  │   [React Flow canvas]           │  │
│  │ Alphabet: {0,1}  │  │                                 │  │
│  │ Confidence: 92%  │  │                                 │  │
│  │ Assumptions: ... │  │                                 │  │
│  │ ⚠ Ambiguities   │  │                                 │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │ Transition   │ │ Test Cases   │ │ Explanation         │  │
│  │ Table        │ │ ✓ accepted   │ │ Step 1: ...         │  │
│  │ q0 →0→ q1   │ │ ✗ rejected   │ │ Step 2: ...         │  │
│  │ q0 →1→ q0   │ │ ✓ accepted   │ │ Step 3: ...         │  │
│  └──────────────┘ └──────────────┘ └────────────────────┘  │
│                                    [Open in Simulator ▶]    │
└─────────────────────────────────────────────────────────────┘
```

#### States

| State | UI behavior |
|---|---|
| Idle | Input box with examples/suggestions |
| Parsing | Skeleton loader with "Analyzing question..." |
| Clarification needed | Extraction panel shows warnings, clarification form appears |
| Solving | Progress indicator with "Generating and verifying..." |
| Solved (verified) | Full result with green verified badge |
| Solved (partial) | Result with yellow warning: "Partially verified" |
| Failed | Error panel with reason and retry button |
| Unsupported | Clear message with suggestion to try supported types |

---

### 9.17 Error handling

| Error case | Behavior |
|---|---|
| No alphabet detected | Ask user to specify alphabet in clarification panel |
| Conflicting constraints | Surface conflicts with suggested resolutions |
| Impossible language description | Return "The extracted constraints appear contradictory" with details |
| Unsupported question type | Return detected category + suggestion for supported types |
| Model timeout/failure | Retry with fallback model; if all fail, show "AI service temporarily unavailable, try again" |
| No verified candidate | Return "Unable to verify a solution. Please check the constraints or rephrase." |
| Malformed LLM JSON | Log the raw response, retry once with explicit JSON instructions; if still malformed, return parse_error |
| Empty question | Client-side validation prevents submission |
| Rate limited | Show cooldown timer and retry-after suggestion |

---

### 9.18 Security and abuse prevention

| Concern | Mitigation |
|---|---|
| Rate limiting | 10 requests/minute per user, 50/hour per user |
| Prompt injection | User question is injected into a sandboxed user-content section of the prompt, never into system instructions. All LLM output is schema-validated before use. |
| Input sanitization | Strip HTML/script tags. Limit question length to 2000 characters. |
| Output validation | All automaton structures are schema-validated before rendering. No raw LLM text is rendered as trusted formal output. |
| AI usage quotas | Track per-user daily AI calls. Free tier: 20/day. |
| Observability | Log request_id, user_id, model_used, latency, token counts. Never log full question text in production logs (PII risk). |
| PII-safe logging | Store question text only in the database, not in log streams. Telemetry uses anonymized request IDs. |

---

### 9.19 Performance requirements

| Metric | Target |
|---|---|
| Parse latency (classify + extract) | < 5 seconds |
| Solve latency (generate + verify) | < 2 seconds |
| Explanation latency | < 4 seconds |
| Total end-to-end latency | < 12 seconds |
| Timeout threshold per LLM call | 30 seconds |
| Cache strategy | Cache parse results by question hash for 24 hours. Cache verified solutions indefinitely. |
| Async processing | Not required for MVP (sequential pipeline is fast enough). Consider for batch mode in Phase 3. |

---

### 9.20 Analytics

Track these events:

| Event | When |
|---|---|
| question_submitted | User clicks Solve |
| question_parsed | Parse pipeline completes |
| clarification_requested | Ambiguity detected, clarification shown |
| clarification_provided | User submits clarification |
| candidate_generated | Engine produces a candidate |
| candidate_verified | Verification run completes (pass or fail) |
| solution_rendered | Verified solution shown to user |
| solution_exported | User clicks "Open in Simulator" |
| solve_failed | No verified candidate or pipeline error |
| ambiguity_detected | One or more AmbiguityFlags raised |
| openrouter_fallback_used | Primary model failed, fallback served request |
| unsupported_question | Question classified as unsupported |
| explanation_requested | User requests AI explanation |

---

### 9.21 Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Ambiguous natural language | High | Conservative extraction + clarification flow. Never guess silently. |
| Hallucinated constraint extraction | High | Schema validation + verification pipeline catches incorrect constraints via test failures. |
| False confidence in results | High | Display confidence score, assumptions, and test case details. Never hide verification status. |
| Unsupported phrasing | Medium | Graceful rejection with category detection. Expand supported phrasings over time via prompt tuning. |
| Expensive model usage | Medium | Use free-tier OpenRouter models. Track cost per request. Set daily quotas. |
| Poor verification coverage | Medium | Bounded exhaustive testing + structural checks. Clearly state verification is confidence-based, not proof-based. |
| User overtrust in AI | High | Label all AI-generated content clearly. Show "Verified by engine" vs "Explained by AI" badges distinctly. |
| LLM output format instability | Medium | Strict Zod validation + retry with explicit JSON mode. Fallback to structured error. |
| Cold start latency | Low | Warm OpenRouter connection. Cache common question patterns. |

---

### 9.22 Phasing recommendation

**Recommended placement: Phase 1.5** (between MVP and Phase 2).

Rationale:
- The core engine (DFA/NFA simulation, regex conversion, verification) is already built in MVP.
- This module primarily adds an AI interpretation layer on top of existing engine capabilities.
- It does not require CFG/PDA/TM support, so it stays within regular-language scope.
- It is a high-impact differentiator that dramatically increases the product's value proposition.
- It can be built incrementally: start with regex_to_nfa and build_dfa support, then expand.

If MVP bandwidth is tight, defer to early Phase 2, but prioritize it before CFG/parsing work because it leverages existing engine investment and provides immediate student value.

---

### 9.23 Copilot / Antigravity implementation prompts

#### Prompt 1: OpenRouter client service

```text
Build a TypeScript OpenRouter API client for AutoMind.
Location: packages/prompts/src/openrouter-client.ts
Requirements:
- Configurable via environment variables (OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_PRIMARY_MODEL, OPENROUTER_FALLBACK_MODELS)
- POST /chat/completions with model + models fallback chain
- Support response_format: { type: 'json_object' }
- Timeout handling with configurable threshold (default 30s)
- Retry with exponential backoff (max 2 retries)
- Log selected model from response
- Track latency, tokens, cost
- Return typed response or structured error
- No framework dependencies (pure TypeScript + fetch)
Include unit tests with mocked fetch.
```

#### Prompt 2: Question parsing pipeline

```text
Build the question parsing pipeline for AutoMind Question Solver.
Location: packages/prompts/src/question-parser.ts
Requirements:
- classifyQuestion(text): Promise<TaskClassification> — calls OpenRouter with classification prompt
- extractConstraints(text, classification): Promise<QuestionParseResult> — calls OpenRouter with extraction prompt
- detectAmbiguities(parseResult): Promise<AmbiguityFlag[]> — calls OpenRouter with ambiguity prompt
- All LLM outputs must be parsed as JSON and validated with Zod schemas
- On malformed JSON, retry once with explicit JSON instructions
- Return structured errors, never throw unhandled
- Use prompt templates from a separate templates file
Include Zod schemas for all intermediate types.
```

#### Prompt 3: Verifier pipeline

```text
Build the candidate verification pipeline for AutoMind Question Solver.
Location: packages/engine/src/question-verifier.ts
Requirements:
- verifyCandidateAutomaton(candidate, parseResult): VerificationResult
- Test candidate against all positive examples (must accept)
- Test candidate against all negative examples (must reject)
- Generate bounded test strings (up to length 8) for additional coverage
- Run structural checks (valid start state, deterministic for DFA, reachable accept states)
- Return pass/fail with counterexamples and rejection reason
- Pure deterministic logic, no AI calls
Include comprehensive unit tests.
```

#### Prompt 4: Question solver API routes

```text
Build Next.js API route handlers for AutoMind Question Solver.
Routes:
- POST /api/question/parse — classify + extract + detect ambiguities
- POST /api/question/clarify — re-extract with user clarification
- POST /api/question/solve — generate candidates + verify + rank
- POST /api/question/explain — generate AI explanation of verified result
- POST /api/question/export — export solution to simulator project
Requirements:
- Zod request validation on all routes
- Rate limiting (10/min per user)
- Proper error responses with machine codes
- Call service layer, no business logic in handlers
- Log request_id and latency for telemetry
```

#### Prompt 5: Question solver UI

```text
Build the Question Solver workspace UI for AutoMind.
Location: apps/web/src/app/question-solver/page.tsx + components
Requirements:
- Question input with example suggestions
- Extraction preview panel (task type, alphabet, confidence, assumptions)
- Clarification panel with form controls
- Solution diagram using React Flow (reuse existing node/edge components)
- Transition table component
- Test case panel (green checks, red crosses)
- Explanation panel (markdown rendered)
- Export to simulator button
- Loading, error, and empty states
- Dark theme consistent with existing Automata Lab
Use Zustand for local state. TypeScript only.
```

#### Prompt 6: Database schema additions

```text
Add Prisma models for AutoMind Question Solver.
New models:
- QuestionRequest (userId, questionText, status, timestamps)
- QuestionParseResult (requestId, version, taskType, confidence, constraints JSON, assumptions, ambiguities, rawLlmResponse, modelUsed, latencyMs)
- QuestionSolutionCandidate (requestId, parseResultId, automaton JSON, regex, generationMethod)
- QuestionVerificationRun (candidateId, passed, positiveResults JSON, negativeResults JSON, counterexamples, rejectionReason)
- QuestionSolution (requestId, candidateId, verificationId, status, diagramData, transitionTable, explanation, exportedProjectId)
- QuestionClarification (requestId, ambiguityField, userResponse)
Add proper relations, indexes, enums, and timestamps.
```

#### Prompt 7: Test suite

```text
Write tests for the AutoMind Question Solver module.
Cover:
- Task classification accuracy for 10+ sample questions
- Constraint extraction with known-good outputs
- Ambiguity detection for deliberately ambiguous inputs
- Verification pipeline with correct and incorrect candidates
- Counterexample generation
- Malformed LLM JSON handling and retry logic
- OpenRouter timeout and fallback behavior
- API route validation and error responses
- End-to-end: question input → verified solution output
Use Vitest. Mock OpenRouter responses for deterministic testing.
```

---

### 9.24 Acceptance criteria

#### MVP release criteria for this module

1. User can paste a supported DFA construction question and receive a verified DFA with diagram, transition table, and test cases.
2. User can paste a supported NFA construction question and receive a verified NFA.
3. User can paste a regex and receive a verified NFA conversion (via existing Thompson engine).
4. Ambiguous questions trigger a clarification panel instead of blind output.
5. Unsupported questions (CFG, PDA, TM) are rejected gracefully with a clear message.
6. Every result displayed as "verified" has passed deterministic engine checks.
7. Assumptions made during extraction are visible to the user.
8. Test cases (positive and negative) are shown alongside every solution.
9. User can export a verified solution to the Automata Lab simulator.
10. AI explanations are clearly labeled as AI-generated and reference the verified result.
11. OpenRouter integration handles timeouts and model fallback without crashing.
12. Rate limiting prevents abuse (10 requests/min per user).
13. End-to-end latency is under 12 seconds for supported question types.

---

### 9.25 Example internal system prompts

#### Production task classifier prompt

```text
SYSTEM: You are a formal language question classifier. You classify student questions about Theory of Automata and Formal Languages into task categories.

CATEGORIES:
- build_dfa: Construct a Deterministic Finite Automaton
- build_nfa: Construct a Nondeterministic Finite Automaton
- build_regex: Write a regular expression
- regex_to_nfa: Convert a given regex to NFA
- nfa_to_dfa: Convert a given NFA to DFA
- minimize_dfa: Minimize a given DFA
- explain: Explain a concept, language, or regex
- unsupported: CFG, PDA, Turing Machine, proofs, or anything beyond regular languages

RULES:
1. Output ONLY a JSON object: { "taskType": string, "confidence": number, "reasoning": string }
2. confidence is 0.0 to 1.0
3. If the question is unclear, set confidence < 0.6 and explain why in reasoning
4. Do NOT solve the problem
5. Do NOT claim correctness of any formal artifact
6. If you detect keywords like "pushdown", "context-free", "Turing", "grammar", classify as unsupported

USER: {{questionText}}
```

#### Production constraint extractor prompt

```text
SYSTEM: You are a formal constraint extractor for automata theory. Extract structured constraints from a classified question.

TASK CONTEXT:
- Classified task type: {{taskType}}
- Original question: {{questionText}}

EXTRACT:
1. alphabet: the set of input symbols
2. languageDescription: precise description of the language
3. atomicConstraints: array of { type, target, value, description }
4. positiveExamples: 5+ strings the automaton SHOULD accept
5. negativeExamples: 5+ strings the automaton should NOT accept
6. assumptions: anything you inferred that wasn't explicitly stated
7. ambiguityFlags: anything unclear, with suggested resolutions

RULES:
1. Output ONLY valid JSON matching the QuestionParseResult schema
2. Be conservative — flag uncertainty rather than guessing
3. Do NOT construct any automaton or regex
4. Do NOT claim any formal result is correct
5. Clearly separate stated facts from inferences
```

---

### 9.26 Example payloads

#### Parse request

```json
{
  "questionText": "Design a DFA over {0,1} that accepts all strings ending in 01"
}
```

#### Parse response

```json
{
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "taskType": "build_dfa",
  "confidence": 0.95,
  "alphabet": ["0", "1"],
  "languageSummary": "All binary strings that end with the substring 01",
  "constraints": [
    { "type": "ends_with", "target": "01", "description": "String must end with 01" }
  ],
  "assumptions": ["Alphabet is {0,1} as stated", "Empty string is not accepted (does not end in 01)"],
  "ambiguities": [],
  "positiveExamples": ["01", "001", "101", "0101", "1101"],
  "negativeExamples": ["", "0", "1", "10", "00", "11", "010"]
}
```

#### Solve response

```json
{
  "requestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "verified",
  "automaton": {
    "type": "DFA",
    "states": ["q0", "q1", "q2"],
    "alphabet": ["0", "1"],
    "startState": "q0",
    "acceptStates": ["q2"],
    "transitions": [
      { "from": "q0", "symbol": "0", "to": "q1" },
      { "from": "q0", "symbol": "1", "to": "q0" },
      { "from": "q1", "symbol": "0", "to": "q1" },
      { "from": "q1", "symbol": "1", "to": "q2" },
      { "from": "q2", "symbol": "0", "to": "q1" },
      { "from": "q2", "symbol": "1", "to": "q0" }
    ]
  },
  "transitionTable": {
    "headers": ["State", "0", "1"],
    "rows": [
      ["→q0", "q1", "q0"],
      ["q1", "q1", "*q2"],
      ["*q2", "q1", "q0"]
    ]
  },
  "positiveTests": [
    { "input": "01", "accepted": true, "passed": true },
    { "input": "001", "accepted": true, "passed": true },
    { "input": "101", "accepted": true, "passed": true }
  ],
  "negativeTests": [
    { "input": "", "accepted": false, "passed": true },
    { "input": "0", "accepted": false, "passed": true },
    { "input": "10", "accepted": false, "passed": true }
  ],
  "counterexamples": [],
  "candidatesEvaluated": 1,
  "verificationStatus": "verified"
}
```

#### Explanation response

```json
{
  "explanation": "## Construction: DFA for strings ending in 01\n\nThis DFA tracks how much of the suffix '01' has been matched:\n\n- **q0** (start): No part of '01' matched yet. On '0', move to q1 (first character matched). On '1', stay in q0.\n- **q1**: We've seen a '0'. On '1', move to q2 (full '01' matched). On '0', stay in q1 (new '0' could start the pattern).\n- **q2** (accept): Full '01' matched at the end. On '0', move to q1 (new potential match). On '1', return to q0 (pattern broken).\n\nThe key insight is that q2 is only accepting — if more input arrives, the DFA must re-verify that the string still ends in '01'.",
  "model": "google/gemini-2.0-flash-exp:free",
  "latencyMs": 1850
}
```

---

### 9.27 Final implementation recommendation

This module should be implemented as a **hybrid verified-AI workflow**:

| Layer | Role | Technology |
|---|---|---|
| Interpretation | Understand the student's question and extract formal constraints | AI via OpenRouter |
| Generation | Build candidate automata/regex from structured constraints | Deterministic engine (packages/engine) |
| Verification | Test candidates against constraints and examples | Deterministic engine (packages/engine) |
| Explanation | Generate human-readable construction walkthroughs | AI via OpenRouter |
| Rendering | Display verified results with diagrams, tables, and test cases | React UI (apps/web) |

**Key architectural invariants:**

1. AI interprets. Engine decides.
2. Strict Zod schema validation sits between every AI output and every engine input.
3. OpenRouter is the LLM provider, with model fallback and easy provider swapping.
4. No unverified formal artifact is ever shown as correct.
5. Every pipeline stage produces traceable, inspectable intermediate output.

This architecture ensures that AutoMind can leverage the best available AI models for natural language understanding while maintaining the formal correctness guarantees that an educational platform for automata theory demands.
