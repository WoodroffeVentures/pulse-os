'use client';
import { useState, useCallback } from 'react';
import { useOrg } from '@/lib/context/org-context';
import { createClient } from '@/lib/supabase/client';
import { ClipboardList, FileText, Download } from 'lucide-react';

type ReportType =
  | 'properties'
  | 'businesses'
  | 'opportunities'
  | 'viability'
  | 'participation'
  | 'pilot';

interface ReportMeta {
  id: ReportType;
  title: string;
  description: string;
  live: boolean;
}

const REPORTS: ReportMeta[] = [
  { id: 'properties', title: 'Property Readiness', description: 'All properties with status, evidence and operational completeness.', live: true },
  { id: 'businesses', title: 'Business Evidence', description: 'Business profiles, evidence states and readiness gaps.', live: true },
  { id: 'opportunities', title: 'Opportunity Summary', description: 'Opportunities by status, type and geography.', live: true },
  { id: 'viability', title: 'Viability Assessments', description: 'All saved assessments with scores, confidence and recommendations.', live: true },
  { id: 'participation', title: 'Participation & JV Status', description: 'Decisions, milestones and conditions across all participation records.', live: true },
  { id: 'pilot', title: 'Controlled Pilot Report', description: 'End-to-end proof: business → opportunity → viability → participation → outcome → graph.', live: true },
];

function escHtml(s: string) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function reportShell(title: string, orgName: string, body: string) {
  const now = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escHtml(title)} — ${escHtml(orgName)} — PULSE OS</title>
<style>
  body{font-family:system-ui,sans-serif;background:#fff;color:#111;margin:0;padding:24px 40px;font-size:13px}
  h1{font-size:20px;margin:0 0 4px}
  h2{font-size:14px;margin:20px 0 8px;text-transform:uppercase;letter-spacing:.08em;color:#555}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top}
  th{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;background:#f9fafb}
  .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600}
  .meta{color:#6b7280;font-size:12px;margin-bottom:24px}
  .disclaimer{margin-top:32px;padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;color:#6b7280;font-size:11px}
  footer{margin-top:24px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px}
  @media print{body{padding:0}}
</style>
</head>
<body>
<h1>${escHtml(title)}</h1>
<div class="meta">
  Organisation: <strong>${escHtml(orgName)}</strong> &nbsp;·&nbsp;
  Generated: ${escHtml(now)} (Africa/Johannesburg) &nbsp;·&nbsp;
  Engine: rules-based-v1 &nbsp;·&nbsp;
  System: PULSE OS
</div>
${body}
<div class="disclaimer">
  <strong>Evidence Notice:</strong> This report reflects data entered into PULSE OS by authorised users of ${escHtml(orgName)}.
  Self-reported values are recorded as stated. Confidence ratings reflect evidence quality, not independent verification.
  Viability scores are produced by a deterministic rules engine (rules-based-v1) and are not financial advice.
  No economic outcomes, revenue forecasts or investment returns are guaranteed or implied.
</div>
<footer>PULSE OS · Controlled Pilot · ${escHtml(now)} · For internal use only</footer>
</body></html>`;
}

function openReport(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { orgId, orgName } = useOrg();
  const supabase = createClient();
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (type: ReportType) => {
    if (!orgId) return;
    setGenerating(type); setError(null);

    try {
      let body = '';

      if (type === 'properties') {
        const { data } = await supabase.from('properties').select('*').eq('organization_id', orgId).order('name');
        const rows = data ?? [];
        body = `<h2>Properties (${rows.length})</h2><table>
<tr><th>Name</th><th>Type</th><th>Status</th><th>City</th><th>Email</th><th>Place ID</th></tr>
${rows.map(r => `<tr>
  <td>${escHtml(r.name)}</td>
  <td>${escHtml(r.property_type ?? '—')}</td>
  <td>${escHtml(r.status ?? '—')}</td>
  <td>${escHtml(r.city ?? '—')}</td>
  <td>${escHtml(r.email ?? '—')}</td>
  <td>${escHtml(r.google_place_id ?? 'Not linked')}</td>
</tr>`).join('')}
</table>`;
        openReport(reportShell('Property Readiness', orgName ?? 'Organisation', body), `pulse-properties-${Date.now()}.html`);
      }

      else if (type === 'businesses') {
        const { data } = await supabase.from('business_profiles').select('*').eq('organization_id', orgId).order('business_name');
        const rows = data ?? [];
        body = `<h2>Business Profiles (${rows.length})</h2><table>
<tr><th>Name</th><th>Category</th><th>Evidence State</th><th>Verification</th><th>District</th><th>Place ID</th></tr>
${rows.map(r => {
  const sig = r.verified_signals ?? {};
  return `<tr>
  <td>${escHtml(r.business_name)}</td>
  <td>${escHtml(sig.category as string ?? '—')}</td>
  <td>${escHtml(sig.evidence_state as string ?? 'Self-entered')}</td>
  <td>${escHtml(r.verification_status ?? '—')}</td>
  <td>${escHtml(sig.district as string ?? '—')}</td>
  <td>${escHtml(sig.google_place_id as string ?? 'Not linked')}</td>
</tr>`;
}).join('')}
</table>`;
        openReport(reportShell('Business Evidence', orgName ?? 'Organisation', body), `pulse-businesses-${Date.now()}.html`);
      }

      else if (type === 'opportunities') {
        const { data } = await supabase.from('opportunities').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
        const rows = data ?? [];
        body = `<h2>Opportunities (${rows.length})</h2><table>
<tr><th>Title</th><th>Type</th><th>Status</th><th>District</th><th>Visibility</th><th>Created</th></tr>
${rows.map(r => {
  const elig = r.eligibility ?? {};
  return `<tr>
  <td>${escHtml(r.title)}</td>
  <td>${escHtml(r.opportunity_type ?? '—')}</td>
  <td>${escHtml(r.status ?? '—')}</td>
  <td>${escHtml(r.district ?? '—')}</td>
  <td>${escHtml(elig.visibility as string ?? '—')}</td>
  <td>${new Date(r.created_at).toLocaleDateString('en-ZA')}</td>
</tr>`;
}).join('')}
</table>`;
        openReport(reportShell('Opportunity Summary', orgName ?? 'Organisation', body), `pulse-opportunities-${Date.now()}.html`);
      }

      else if (type === 'viability') {
        const { data } = await supabase.from('viability_analyses').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
        const rows = data ?? [];
        body = `<h2>Viability Assessments (${rows.length})</h2><table>
<tr><th>Score</th><th>Confidence</th><th>Recommendation</th><th>Engine</th><th>Created</th></tr>
${rows.map(r => `<tr>
  <td>${r.score}</td>
  <td>${r.confidence != null ? Math.round(r.confidence * 100) + '%' : '—'}</td>
  <td>${escHtml(r.recommendation ?? '—')}</td>
  <td>${escHtml(r.ai_model ?? '—')}</td>
  <td>${new Date(r.created_at).toLocaleDateString('en-ZA')}</td>
</tr>`).join('')}
</table>`;
        openReport(reportShell('Viability Assessments', orgName ?? 'Organisation', body), `pulse-viability-${Date.now()}.html`);
      }

      else if (type === 'participation') {
        const { data } = await supabase.from('participation_records').select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
        const rows = data ?? [];
        body = `<h2>Participation Records (${rows.length})</h2><table>
<tr><th>Decision</th><th>Status</th><th>Milestones</th><th>Outcomes</th><th>Created</th></tr>
${rows.map(r => {
  const ev = r.evidence ?? {};
  const ms: any[] = ev.milestones ?? [];
  const oc: any[] = ev.outcomes ?? [];
  return `<tr>
  <td>${escHtml(ev.decision ?? r.status ?? '—')}</td>
  <td>${escHtml(r.status)}</td>
  <td>${ms.filter((m: any) => m.completed).length}/${ms.length} complete</td>
  <td>${oc.length} (${oc.filter((o: any) => !o.self_reported).length} confirmed)</td>
  <td>${new Date(r.created_at).toLocaleDateString('en-ZA')}</td>
</tr>`;
}).join('')}
</table>`;
        openReport(reportShell('Participation & JV Status', orgName ?? 'Organisation', body), `pulse-participation-${Date.now()}.html`);
      }

      else if (type === 'pilot') {
        // Full pilot report — join all tables
        const [propRes, bizRes, oppRes, vaRes, partRes] = await Promise.all([
          supabase.from('properties').select('*').eq('organization_id', orgId),
          supabase.from('business_profiles').select('*').eq('organization_id', orgId),
          supabase.from('opportunities').select('*').eq('organization_id', orgId),
          supabase.from('viability_analyses').select('*').eq('organization_id', orgId).order('created_at', { ascending: false }),
          supabase.from('participation_records').select('*').eq('organization_id', orgId),
        ]);

        const props = propRes.data ?? [];
        const bizs = bizRes.data ?? [];
        const opps = oppRes.data ?? [];
        const vas = vaRes.data ?? [];
        const parts = partRes.data ?? [];

        const allOutcomes = parts.flatMap((p: any) => p.evidence?.outcomes ?? []);
        const allMilestones = parts.flatMap((p: any) => p.evidence?.milestones ?? []);
        const confirmedOutcomes = allOutcomes.filter((o: any) => !o.self_reported);

        body = `
<h2>Pilot Summary</h2>
<table>
<tr><th>Metric</th><th>Value</th><th>Source</th></tr>
<tr><td>Properties</td><td>${props.length}</td><td>properties table</td></tr>
<tr><td>Business Profiles</td><td>${bizs.length}</td><td>business_profiles table</td></tr>
<tr><td>Opportunities</td><td>${opps.length}</td><td>opportunities table</td></tr>
<tr><td>Viability Assessments</td><td>${vas.length}</td><td>viability_analyses table</td></tr>
<tr><td>Participation Records</td><td>${parts.length}</td><td>participation_records table</td></tr>
<tr><td>Milestones (complete/total)</td><td>${allMilestones.filter((m: any) => m.completed).length}/${allMilestones.length}</td><td>evidence jsonb</td></tr>
<tr><td>Outcomes recorded</td><td>${allOutcomes.length}</td><td>evidence jsonb</td></tr>
<tr><td>Evidence-confirmed outcomes</td><td>${confirmedOutcomes.length}</td><td>evidence jsonb</td></tr>
</table>

<h2>Properties</h2>
<table>
<tr><th>Name</th><th>Type</th><th>Status</th><th>City</th></tr>
${props.map((r: any) => `<tr><td>${escHtml(r.name)}</td><td>${escHtml(r.property_type ?? '—')}</td><td>${escHtml(r.status ?? '—')}</td><td>${escHtml(r.city ?? '—')}</td></tr>`).join('')}
</table>

<h2>Viability Assessments</h2>
<table>
<tr><th>Score</th><th>Confidence</th><th>Recommendation</th><th>Engine</th></tr>
${vas.map((r: any) => `<tr><td>${r.score}</td><td>${r.confidence != null ? Math.round(r.confidence * 100) + '%' : '—'}</td><td>${escHtml(r.recommendation ?? '—')}</td><td>${escHtml(r.ai_model ?? '—')}</td></tr>`).join('')}
</table>

<h2>Participation Decisions</h2>
<table>
<tr><th>Decision</th><th>Status</th><th>Milestones</th><th>Outcomes</th></tr>
${parts.map((r: any) => {
  const ev = r.evidence ?? {};
  const ms: any[] = ev.milestones ?? [];
  const oc: any[] = ev.outcomes ?? [];
  return `<tr><td>${escHtml(ev.decision ?? r.status)}</td><td>${escHtml(r.status)}</td><td>${ms.filter((m: any) => m.completed).length}/${ms.length}</td><td>${oc.length}</td></tr>`;
}).join('')}
</table>

<p style="margin-top:16px;color:#6b7280;font-size:12px">
  Viability engine: rules-based-v1 · Evidence source: self-entered / manual ·
  Google integration: Manual Evidence Only · AI provider: not required ·
  All figures from ${escHtml(orgName ?? 'Organisation')} production database.
</p>`;

        openReport(reportShell('Controlled Pilot Report', orgName ?? 'Organisation', body), `pulse-pilot-report-${Date.now()}.html`);
      }

    } catch (err: any) {
      setError(err.message ?? 'Report generation failed');
    } finally {
      setGenerating(null);
    }
  }, [orgId, orgName, supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#E6EDF5]">Reports</h1>
        <p className="mt-1 text-sm text-[#9BA7B8]">
          Tenant-safe exports from your organisation's production database. Opens as print-ready HTML — use browser Print → Save as PDF.
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-3">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {REPORTS.map(r => (
          <div key={r.id} className="rounded-xl border border-white/10 bg-[#08111f] p-4 flex items-start gap-4">
            <FileText className="w-5 h-5 text-[#617089] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[#E6EDF5]">{r.title}</span>
                {r.live
                  ? <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">Live</span>
                  : <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#617089] border border-white/10 uppercase tracking-widest">Later</span>
                }
              </div>
              <p className="text-xs text-[#9BA7B8] mb-3">{r.description}</p>
              <button
                onClick={() => generate(r.id)}
                disabled={!r.live || generating !== null || !orgId}
                className="flex items-center gap-1.5 text-xs text-[#C6A66B] border border-[#C6A66B]/30 rounded px-3 py-1.5 hover:bg-[#C6A66B]/10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-3 h-3" />
                {generating === r.id ? 'Generating…' : 'Download HTML'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[10px] text-[#374151] text-center tracking-widest py-2">
        ALL REPORTS FROM {orgName?.toUpperCase() ?? 'YOUR'} PRODUCTION DATABASE · NO EXTERNAL REPORT SERVICE · PRINT TO PDF VIA BROWSER
      </div>
    </div>
  );
}
