// services/aiAuditService.ts
// Priority 9: Secure AI Gateway — Logs AI requests/responses without storing PII

import { AIRequestMetadata, AIResponseMetadata } from '../types';

const AI_AUDIT_STORAGE_KEY = 'blindhire_ai_audit';

interface AIAuditEntry {
  id: string;
  request: AIRequestMetadata;
  response: AIResponseMetadata;
  timestamp: string;
}

function generateHash(input: string): string {
  // Simple deterministic hash for demo purposes (FNV-1a inspired)
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function loadAuditLog(): AIAuditEntry[] {
  try {
    const raw = localStorage.getItem(AI_AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAuditLog(log: AIAuditEntry[]): void {
  // Keep only last 500 entries to prevent localStorage bloat
  const trimmed = log.slice(-500);
  localStorage.setItem(AI_AUDIT_STORAGE_KEY, JSON.stringify(trimmed));
}

/**
 * Log an AI request/response pair. PII is never stored — only hashes of
 * inputs and outputs, prompt metadata, and timing information.
 */
export function logAIInteraction(
  promptId: string,
  promptVersion: string,
  inputText: string,
  outputText: string,
  model: string,
  success: boolean,
  isOfflineFallback: boolean,
  durationMs: number
): AIAuditEntry {
  const entry: AIAuditEntry = {
    id: `ai_audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    request: {
      promptId,
      promptVersion,
      inputHash: generateHash(inputText),
      timestamp: new Date().toISOString()
    },
    response: {
      promptId,
      promptVersion,
      outputHash: generateHash(outputText),
      model,
      success,
      isOfflineFallback,
      offlineFallbackNotice: isOfflineFallback ? 'Generated using offline verification engine — no AI model was consulted.' : undefined,
      durationMs
    },
    timestamp: new Date().toISOString()
  };

  const log = loadAuditLog();
  log.push(entry);
  saveAuditLog(log);

  return entry;
}

export function getAIAuditLog(): AIAuditEntry[] {
  return loadAuditLog();
}

export function getAIAuditStats(): {
  totalCalls: number;
  successRate: number;
  offlineFallbackRate: number;
  avgDurationMs: number;
  callsByPrompt: Record<string, number>;
} {
  const log = loadAuditLog();
  const total = log.length;
  const successful = log.filter(e => e.response.success).length;
  const offline = log.filter(e => e.response.isOfflineFallback).length;
  const totalDuration = log.reduce((sum, e) => sum + e.response.durationMs, 0);

  const callsByPrompt: Record<string, number> = {};
  for (const e of log) {
    callsByPrompt[e.request.promptId] = (callsByPrompt[e.request.promptId] || 0) + 1;
  }

  return {
    totalCalls: total,
    successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
    offlineFallbackRate: total > 0 ? Math.round((offline / total) * 100) : 0,
    avgDurationMs: total > 0 ? Math.round(totalDuration / total) : 0,
    callsByPrompt
  };
}

export function exportAIAuditCSV(): void {
  const log = loadAuditLog();
  const headers = ['Timestamp', 'Prompt ID', 'Version', 'Model', 'Success', 'Offline Fallback', 'Duration (ms)', 'Input Hash', 'Output Hash'];
  const rows = log.map(e => [
    e.timestamp,
    e.request.promptId,
    e.request.promptVersion,
    e.response.model,
    e.response.success.toString(),
    e.response.isOfflineFallback.toString(),
    e.response.durationMs.toString(),
    e.request.inputHash,
    e.response.outputHash
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blindhire_ai_audit_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
