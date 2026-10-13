// services/promptRegistry.ts
// Priority 9: Secure AI Gateway — Versioned prompt registry

import { PromptVersion } from '../types';

/**
 * Central registry of all AI prompts used across the platform.
 * Each prompt is versioned and auditable. When prompts are updated,
 * old versions are preserved for reproducibility.
 */
const PROMPT_REGISTRY: Record<string, PromptVersion> = {
  'resume_anonymization': {
    promptId: 'resume_anonymization',
    promptVersion: '2.1.0',
    model: 'gemini-2.0-flash',
    temperature: 0.2,
    systemInstruction: 'You are an expert resume analyzer for a blind hiring platform. Remove all PII (name, email, phone, address, age, gender, ethnicity, religion, photos). Preserve professional content, skills, and experience. Output structured JSON.'
  },
  'assessment_generation': {
    promptId: 'assessment_generation',
    promptVersion: '1.4.0',
    model: 'gemini-2.0-flash',
    temperature: 0.4,
    systemInstruction: 'Generate a skill-based technical assessment with MCQ and coding questions. Questions must be fair, unbiased, and job-relevant. Never reference demographics or protected characteristics.'
  },
  'career_coaching': {
    promptId: 'career_coaching',
    promptVersion: '1.2.0',
    model: 'gemini-2.0-flash',
    temperature: 0.6,
    systemInstruction: 'You are an AI career coach. Provide actionable, encouraging, and specific career guidance based on assessment results and skill gaps. Never make judgments based on personal attributes.'
  },
  'resume_studio_analysis': {
    promptId: 'resume_studio_analysis',
    promptVersion: '1.1.0',
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    systemInstruction: 'Analyze resume quality and provide improvement suggestions. Focus on content, structure, impact statements, and ATS compatibility. Do not infer or reference demographic attributes.'
  },
  'jd_matching': {
    promptId: 'jd_matching',
    promptVersion: '1.3.0',
    model: 'gemini-2.0-flash',
    temperature: 0.2,
    systemInstruction: 'Compare candidate skills against job requirements. Produce match scores, gap analysis, and alignment recommendations. Base analysis strictly on verified skills and experience.'
  },
  'explainability_summary': {
    promptId: 'explainability_summary',
    promptVersion: '1.0.0',
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    systemInstruction: 'Generate a plain-English explanation of how an assessment score was calculated. Be transparent about weights, gates, and confidence factors. Never reference candidate demographics.'
  },
  'interview_simulation': {
    promptId: 'interview_simulation',
    promptVersion: '1.0.0',
    model: 'gemini-2.0-flash',
    temperature: 0.5,
    systemInstruction: 'Simulate a technical interview. Ask contextual follow-up questions based on candidate responses. Evaluate depth of understanding without bias toward communication style or accent.'
  }
};

export function getPromptVersion(promptId: string): PromptVersion | null {
  return PROMPT_REGISTRY[promptId] || null;
}

export function getAllPromptVersions(): PromptVersion[] {
  return Object.values(PROMPT_REGISTRY);
}

export function getPromptIds(): string[] {
  return Object.keys(PROMPT_REGISTRY);
}
