import { FairnessAuditReport } from '../types';

export function exportFairnessReportToCsv(report: FairnessAuditReport) {
  const lines: string[] = [];
  lines.push('--- BLINDHIRE AI: FAIRNESS & BIAS AUDIT REPORT ---');
  lines.push(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
  lines.push(`Audit Period: ${report.auditPeriod}`);
  lines.push(`Total Candidates: ${report.totalCandidates}`);
  lines.push(`Assessed Candidates: ${report.assessedCandidates}`);
  lines.push(`Consented Demographic Cohort: ${report.consentedCandidates}`);
  lines.push('');
  lines.push('Category,Group,Candidate Count,Selected Count,Selection Rate (%),Reference Benchmark (%),Impact Ratio,Status');

  report.impactRatios.forEach(ir => {
    lines.push(`"${ir.category}","${ir.group}",${ir.candidateCount},${ir.selectedCount},${ir.selectionRate}%,${ir.referenceRate}%,${ir.impactRatio.toFixed(2)},"${ir.status}"`);
  });

  lines.push('');
  lines.push('--- FAIRNESS ALERTS ---');
  lines.push('Alert Type,Title,Severity,Description');
  report.alerts.forEach(a => {
    lines.push(`"${a.type}","${a.title}","${a.severity}","${a.description.replace(/"/g, '""')}"`);
  });

  lines.push('');
  lines.push(`"DISCLAIMER: ${report.disclaimer.replace(/"/g, '""')}"`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `blindhire_fairness_audit_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportFairnessReportToPrintableSummary(report: FairnessAuditReport) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the printable PDF audit summary.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>BlindHire AI — Fairness & Bias Audit Executive Summary</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
          h1 { color: #4338ca; margin-bottom: 4px; font-size: 24px; }
          .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .meta-item span { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
          .meta-item strong { font-size: 18px; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .badge { padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; }
          .badge-danger { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
          .badge-warning { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
          .badge-success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
          .alert-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 12px; font-size: 12px; }
          .disclaimer { font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 32px; font-style: italic; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div>
            <h1>BlindHire AI — Fairness & Bias Audit Summary</h1>
            <div class="subtitle">EEOC &amp; Four-Fifths Adverse Impact Compliance Verification</div>
          </div>
          <button onclick="window.print()" style="padding:10px 18px; background:#4f46e5; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">
            Print / Save as PDF
          </button>
        </div>

        <div class="meta-box">
          <div class="meta-item"><span>Audit Period</span><strong>${report.auditPeriod}</strong></div>
          <div class="meta-item"><span>Total Candidates</span><strong>${report.totalCandidates}</strong></div>
          <div class="meta-item"><span>Assessed</span><strong>${report.assessedCandidates}</strong></div>
          <div class="meta-item"><span>Consented Sample</span><strong>${report.consentedCandidates}</strong></div>
        </div>

        <h3>1. Impact Ratio & Selection Rate by Group</h3>
        <table>
          <thead>
            <tr>
              <th>Dimension</th>
              <th>Group</th>
              <th>Total Candidates</th>
              <th>Selected</th>
              <th>Selection Rate</th>
              <th>Reference Benchmark</th>
              <th>Impact Ratio</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${report.impactRatios.map(ir => `
              <tr>
                <td>${ir.category}</td>
                <td><strong>${ir.group}</strong></td>
                <td>${ir.candidateCount}</td>
                <td>${ir.selectedCount}</td>
                <td>${ir.selectionRate}%</td>
                <td>${ir.referenceRate}%</td>
                <td><strong>${ir.impactRatio.toFixed(2)}</strong></td>
                <td>
                  <span class="badge ${ir.status === 'High Disparity Alert' ? 'badge-danger' : ir.status === 'Review Required' ? 'badge-warning' : 'badge-success'}">
                    ${ir.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>2. Adverse Impact & Disparity Alerts</h3>
        ${report.alerts.map(a => `
          <div class="alert-box">
            <strong>${a.title}</strong>
            <p style="margin:4px 0 0 0; color:#334155;">${a.description}</p>
          </div>
        `).join('')}

        <h3>3. Question & Skill Disparity Findings</h3>
        <table>
          <thead>
            <tr>
              <th>Question ID</th>
              <th>Question Context</th>
              <th>Max Group Pass</th>
              <th>Min Group Pass</th>
              <th>Disparity Gap</th>
            </tr>
          </thead>
          <tbody>
            ${report.disparateQuestions.map(q => `
              <tr>
                <td><code>${q.questionId}</code></td>
                <td>${q.questionText}</td>
                <td>${q.maxGroupPassRate}%</td>
                <td>${q.minGroupPassRate}%</td>
                <td><strong style="color:#b91c1c;">${q.gap}% gap</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="disclaimer">
          <strong>Compliance Disclaimer:</strong> ${report.disclaimer}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
