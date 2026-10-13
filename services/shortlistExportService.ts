// services/shortlistExportService.ts
// Priority 8: Export shortlisted candidates to CSV or printable PDF summary

import { PipelineCandidate } from './pipelineService';

export function exportShortlistCSV(candidates: PipelineCandidate[]): void {
  const headers = [
    'Masked Name',
    'Pipeline Stage',
    'Overall Score',
    'Recommendation',
    'Applied Role',
    'Stage Updated',
    'Interview Date',
    'Interview Type',
    'Notes'
  ];

  const rows = candidates.map(c => [
    c.maskedName,
    c.stage,
    c.overallScore.toString(),
    c.recommendation,
    c.appliedRole,
    new Date(c.stageUpdatedAt).toLocaleDateString(),
    c.interviewSchedule?.scheduledDate || '',
    c.interviewSchedule?.interviewType || '',
    (c.notes || '').replace(/,/g, ';')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `blindhire_shortlist_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportShortlistPrintable(candidates: PipelineCandidate[]): void {
  const stageGroups: Record<string, PipelineCandidate[]> = {};
  for (const c of candidates) {
    if (!stageGroups[c.stage]) stageGroups[c.stage] = [];
    stageGroups[c.stage].push(c);
  }

  const win = window.open('', '_blank');
  if (!win) return;

  const groupsHtml = Object.entries(stageGroups).map(([stage, items]) => `
    <div style="margin-bottom: 28px;">
      <h2 style="font-size: 16px; font-weight: 700; color: #4f46e5; margin-bottom: 12px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px;">${stage} (${items.length})</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Candidate</th>
            <th style="text-align: center; padding: 8px; border: 1px solid #e2e8f0;">Score</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Recommendation</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Role</th>
            <th style="text-align: left; padding: 8px; border: 1px solid #e2e8f0;">Interview</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(c => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 600;">${c.maskedName}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; font-weight: 700; color: ${c.overallScore >= 80 ? '#059669' : c.overallScore >= 60 ? '#d97706' : '#dc2626'};">${c.overallScore}%</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${c.recommendation}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${c.appliedRole}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">${c.interviewSchedule ? `${c.interviewSchedule.scheduledDate} — ${c.interviewSchedule.interviewType}` : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head><title>BlindHire AI — Shortlist Report</title></head>
    <body style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 32px; color: #1e293b;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="width: 36px; height: 36px; background: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">BH</div>
        <div>
          <h1 style="margin: 0; font-size: 20px; color: #0f172a;">BlindHire AI — Candidate Shortlist Report</h1>
          <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">Generated ${new Date().toLocaleString()} | Total Candidates: ${candidates.length}</p>
        </div>
      </div>
      ${groupsHtml}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
        BlindHire AI — Zero-Bias Recruitment Platform | Confidential
      </div>
    </body>
    </html>
  `);
  win.document.close();
  win.print();
}
