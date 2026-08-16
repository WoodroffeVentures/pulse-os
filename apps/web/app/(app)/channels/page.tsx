'use client';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle2, Clock, ExternalLink, Info } from 'lucide-react';

interface Channel {
  code: string;
  name: string;
  capability: 'live_certified' | 'adapter_ready' | 'blocked_external_certification' | 'not_built';
  commission_default: number;
  certification_notes?: string;
}

const CHANNELS: Channel[] = [
  { code: 'direct', name: 'Direct Booking', capability: 'live_certified', commission_default: 0 },
  { code: 'phone', name: 'Phone / Email', capability: 'live_certified', commission_default: 0 },
  { code: 'walk_in', name: 'Walk-in', capability: 'live_certified', commission_default: 0 },
  { code: 'ical', name: 'iCal Sync', capability: 'live_certified', commission_default: 0 },
  {
    code: 'booking_com', name: 'Booking.com', capability: 'blocked_external_certification',
    commission_default: 0.15,
    certification_notes: 'Requires Booking.com Connectivity Partner certification. Application process takes 8–12 weeks. Foundation connector built; waiting on test environment access.',
  },
  {
    code: 'airbnb', name: 'Airbnb', capability: 'blocked_external_certification',
    commission_default: 0.03,
    certification_notes: 'Requires Airbnb API access via approved Software Partner programme. Apply at airbnb.com/partners. Guest-side fee model (host: ~3%, guest: 14%). Connector foundation built.',
  },
  {
    code: 'expedia', name: 'Expedia / Hotels.com', capability: 'blocked_external_certification',
    commission_default: 0.15,
    certification_notes: 'Requires Expedia Group connectivity certification. iCal workaround is available immediately. Full XML/API requires partner onboarding.',
  },
  {
    code: 'lekke_slaap', name: 'LekkeSlaap', capability: 'adapter_ready',
    commission_default: 0.10,
    certification_notes: 'Adapter framework built. Awaiting LekkeSlaap API credentials and sandbox access to complete integration test.',
  },
  {
    code: 'agoda', name: 'Agoda', capability: 'adapter_ready',
    commission_default: 0.15,
    certification_notes: 'YCS (Yield Control System) API adapter in progress. Requires Agoda property registration first.',
  },
  {
    code: 'google_hotels', name: 'Google Hotels', capability: 'blocked_external_certification',
    commission_default: 0,
    certification_notes: 'Requires Google Hotel Center integration via approved connectivity partner. Works via Booking.com / Expedia surface once those channels are connected.',
  },
  { code: 'agent', name: 'Travel Agent / Wholesale', capability: 'adapter_ready', commission_default: 0.10 },
  { code: 'corporate', name: 'Corporate Accounts', capability: 'adapter_ready', commission_default: 0 },
];

const CAP_META = {
  live_certified: { label: 'Live', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  adapter_ready: { label: 'Adapter Ready', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Clock },
  blocked_external_certification: { label: 'Pending Cert', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: AlertCircle },
  not_built: { label: 'Not Built', color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: WifiOff },
};

export default function ChannelsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'ical'>('overview');

  const live = CHANNELS.filter((c) => c.capability === 'live_certified');
  const adapterReady = CHANNELS.filter((c) => c.capability === 'adapter_ready');
  const pendingCert = CHANNELS.filter((c) => c.capability === 'blocked_external_certification');
  const notBuilt = CHANNELS.filter((c) => c.capability === 'not_built');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#f1f5f9]">Channel Distribution</h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Manage OTA connections, iCal feeds and distribution health
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#111318] border border-[#1e2028] rounded-lg p-1">
          {(['overview', 'ical'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs rounded transition-colors font-medium ${
                tab === t ? 'bg-[#1e2028] text-[#f1f5f9]' : 'text-[#64748b] hover:text-[#94a3b8]'
              }`}>
              {t === 'overview' ? 'Channel Status' : 'iCal Import'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3">
            <KPI label="Live Channels" value={live.length} color="emerald" />
            <KPI label="Adapter Ready" value={adapterReady.length} color="blue" />
            <KPI label="Pending Cert" value={pendingCert.length} color="amber" />
            <KPI label="Not Built" value={notBuilt.length} color="gray" />
          </div>

          {/* Honest status notice */}
          <div className="flex items-start gap-3 bg-[#111318] border border-amber-500/20 rounded-lg px-4 py-3">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              OTA channels (Booking.com, Airbnb, Expedia) require third-party certification before a live connection can be claimed.
              PULSE has built the connector foundations and will never display a channel logo as connected until certification is complete.
              Use iCal import as an immediate workaround for any OTA already managed via iCal export.
            </p>
          </div>

          {/* Channel sections */}
          {[
            { title: 'Live Channels', channels: live },
            { title: 'Adapter Ready (awaiting credentials/sandbox)', channels: adapterReady },
            { title: 'Pending External Certification', channels: pendingCert },
          ].map(({ title, channels }) => channels.length > 0 && (
            <div key={title}>
              <h3 className="text-[10px] font-semibold text-[#64748b] tracking-widest uppercase mb-2">{title}</h3>
              <div className="space-y-2">
                {channels.map((ch) => {
                  const meta = CAP_META[ch.capability];
                  const Icon = meta.icon;
                  const isExpanded = expanded === ch.code;
                  return (
                    <div key={ch.code} className={`bg-[#111318] border rounded-lg overflow-hidden transition-colors ${
                      ch.capability === 'blocked_external_certification' ? 'border-amber-500/10' : 'border-[#1e2028]'
                    }`}>
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#161b22] transition-colors"
                        onClick={() => setExpanded(isExpanded ? null : ch.code)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.color} border`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#f1f5f9]">{ch.name}</div>
                            <div className="text-[10px] text-[#64748b] mt-0.5">
                              {ch.commission_default > 0
                                ? `~${(ch.commission_default * 100).toFixed(0)}% commission`
                                : 'No commission'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${meta.color}`}>
                            {meta.label}
                          </span>
                          {ch.capability === 'live_certified' ? (
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-600 rounded-full" />
                          )}
                        </div>
                      </div>
                      {isExpanded && ch.certification_notes && (
                        <div className="border-t border-[#1e2028] px-4 py-3 bg-[#0d1117]">
                          <p className="text-xs text-[#94a3b8] leading-relaxed">{ch.certification_notes}</p>
                          {ch.capability === 'blocked_external_certification' && (
                            <div className="mt-3 flex items-center gap-2">
                              <button className="text-xs bg-[#111318] border border-[#1e2028] text-[#94a3b8] rounded px-3 py-1.5 hover:border-[#374151] transition-colors flex items-center gap-1.5">
                                <ExternalLink className="w-3 h-3" /> Partner Application
                              </button>
                              <button className="text-xs bg-[#111318] border border-[#1e2028] text-[#94a3b8] rounded px-3 py-1.5 hover:border-[#374151] transition-colors">
                                Use iCal Workaround
                              </button>
                            </div>
                          )}
                          {ch.capability === 'adapter_ready' && (
                            <div className="mt-3">
                              <button className="text-xs bg-[#C6A66B]/10 border border-[#C6A66B]/20 text-[#C6A66B] rounded px-3 py-1.5 hover:bg-[#C6A66B]/20 transition-colors">
                                Configure Connection
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'ical' && <ICalPanel />}
    </div>
  );
}

// ─── iCal import panel ────────────────────────────────────────────────────────

function ICalPanel() {
  const [feeds] = useState([
    { id: 'ic-001', name: 'Airbnb — Jackals Rest', url: 'https://www.airbnb.com/calendar/ical/53438771.ics', property: "Jackals Rest", last_sync: '2026-08-09T06:00:00Z', status: 'ok', events_imported: 12 },
    { id: 'ic-002', name: 'Booking.com — Swallows Nest', url: 'https://admin.booking.com/hotel/hoteladmin/ical.html?t=...', property: "Swallows Nest Studio", last_sync: '2026-08-09T06:00:00Z', status: 'ok', events_imported: 7 },
    { id: 'ic-003', name: "LekkeSlaap — Woody's Cottage", url: 'https://lekkeslaap.co.za/accommodation/export.ics?id=...', property: "Woody's Cottage", last_sync: '2026-08-08T18:00:00Z', status: 'warning', events_imported: 3 },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 bg-[#111318] border border-blue-500/20 rounded-lg px-4 py-3">
        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#94a3b8] leading-relaxed">
          iCal feeds sync availability from any OTA that supports .ics export (Airbnb, Booking.com, LekkeSlaap, Expedia, etc.).
          This is a one-way import — PULSE reads OTA calendars to prevent double-bookings. Full two-way push requires OTA certification.
        </p>
      </div>

      <div className="space-y-2">
        {feeds.map((feed) => (
          <div key={feed.id} className={`bg-[#111318] border rounded-lg px-4 py-3 ${
            feed.status === 'warning' ? 'border-amber-500/20' : 'border-[#1e2028]'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#f1f5f9]">{feed.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                    feed.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {feed.status === 'ok' ? 'OK' : 'STALE'}
                  </span>
                </div>
                <div className="text-[10px] text-[#64748b] mt-0.5 font-mono truncate">{feed.url}</div>
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-[#64748b]">
                  <span>Property: {feed.property}</span>
                  <span>Last sync: {new Date(feed.last_sync).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  <span>{feed.events_imported} events</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors px-2 py-1">Sync Now</button>
                <button className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1">Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add feed */}
      <div className="bg-[#111318] border border-dashed border-[#1e2028] rounded-lg px-4 py-4">
        <div className="text-xs font-semibold text-[#f1f5f9] mb-3">Add iCal Feed</div>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://www.airbnb.com/calendar/ical/XXXXXXXX.ics"
            className="flex-1 bg-[#0d1117] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none placeholder:text-[#9BA7B8]"
          />
          <input
            type="text"
            placeholder="Feed name"
            className="w-40 bg-[#0d1117] border border-[#1e2028] text-xs text-[#f1f5f9] rounded px-3 py-1.5 outline-none placeholder:text-[#9BA7B8]"
          />
          <button className="px-3 py-1.5 bg-[#C6A66B] text-[#020912] text-xs font-semibold rounded hover:bg-[#D4B47A] transition-colors">
            Add Feed
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: number; color: string }) {
  const map: Record<string, string> = { emerald: 'text-emerald-400', blue: 'text-blue-400', amber: 'text-amber-400', gray: 'text-gray-500' };
  return (
    <div className="bg-[#111318] border border-[#1e2028] rounded-lg px-4 py-3">
      <div className={`text-2xl font-bold ${map[color]}`}>{value}</div>
      <div className="text-[10px] text-[#64748b] mt-0.5">{label}</div>
    </div>
  );
}
