// services/aiValidationService.ts
// Priority 9: Secure AI Gateway — Strict schema validation of AI responses

/**
 * Validates AI response structure before it reaches the UI.
 * Every AI feature should pass its response through one of these validators.
 * Returns { valid: true, data } on success, or { valid: false, error } on failure.
 */

export type ValidationResult<T> =
  | { valid: true; data: T }
  | { valid: false; error: string };

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !isNaN(val);
}

function isArrayOf<T>(val: unknown, check: (v: unknown) => v is T): val is T[] {
  return Array.isArray(val) && val.every(check);
}

// ── BlindProfile fields validation ──
export function validateBlindProfileResponse(raw: unknown): ValidationResult<Record<string, unknown>> {
  if (!isObject(raw)) return { valid: false, error: 'Response is not an object' };

  const required = ['maskedName', 'professionalSummary', 'topSkills', 'experienceLevel'];
  for (const field of required) {
    if (!(field in raw)) return { valid: false, error: `Missing required field: ${field}` };
  }

  if (!isString(raw.maskedName)) return { valid: false, error: 'maskedName must be a string' };
  if (!isString(raw.professionalSummary)) return { valid: false, error: 'professionalSummary must be a string' };
  if (!Array.isArray(raw.topSkills)) return { valid: false, error: 'topSkills must be an array' };

  // Check for PII leakage in maskedName
  const piiPatterns = [/@/, /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, /\b\d{5}\b/];
  for (const pattern of piiPatterns) {
    if (pattern.test(raw.maskedName as string)) {
      return { valid: false, error: 'PII detected in maskedName — rejecting response' };
    }
  }

  return { valid: true, data: raw };
}

// ── Assessment question validation ──
export function validateAssessmentQuestions(raw: unknown): ValidationResult<unknown[]> {
  if (!Array.isArray(raw)) return { valid: false, error: 'Response is not an array' };
  if (raw.length === 0) return { valid: false, error: 'Empty questions array' };

  for (let i = 0; i < raw.length; i++) {
    const q = raw[i];
    if (!isObject(q)) return { valid: false, error: `Question ${i} is not an object` };
    if (!isString(q.question)) return { valid: false, error: `Question ${i} missing question text` };
    if (!isString(q.skill)) return { valid: false, error: `Question ${i} missing skill` };
    if (!isString(q.difficulty)) return { valid: false, error: `Question ${i} missing difficulty` };

    // Validate that questions don't contain biased or discriminatory language
    const sensitiveTerms = ['gender', 'race', 'religion', 'caste', 'disability', 'pregnancy', 'sexual orientation'];
    const questionText = (q.question as string).toLowerCase();
    for (const term of sensitiveTerms) {
      if (questionText.includes(term)) {
        return { valid: false, error: `Question ${i} contains potentially biased term: "${term}"` };
      }
    }
  }

  return { valid: true, data: raw };
}

// ── Career coaching response validation ──
export function validateCareerCoachResponse(raw: unknown): ValidationResult<Record<string, unknown>> {
  if (!isObject(raw)) return { valid: false, error: 'Response is not an object' };
  return { valid: true, data: raw };
}

// ── Generic JSON validation ──
export function validateJsonResponse(raw: unknown): ValidationResult<unknown> {
  if (raw === null || raw === undefined) return { valid: false, error: 'Response is null/undefined' };
  return { valid: true, data: raw };
}

// ── Sanitize user input before sending to AI (prompt injection defense) ──
export function sanitizePromptInput(input: string): string {
  // Remove potential prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/gi,
    /you\s+are\s+now\s+/gi,
    /disregard\s+(all\s+)?prior/gi,
    /system\s*:\s*/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ];

  let sanitized = input;
  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }

  // Limit input length to prevent abuse
  if (sanitized.length > 50000) {
    sanitized = sanitized.slice(0, 50000) + '\n[INPUT TRUNCATED]';
  }

  return sanitized;
}
