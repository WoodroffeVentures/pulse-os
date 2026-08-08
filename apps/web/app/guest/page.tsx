'use client';
import { useState } from 'react';

// Guest Lite — free, no account required.
// Provides stay information, verified local discovery, service requests.

const DEMO_PLACES = [
  { name: 'Sani Pass Summit', category: 'Adventure', rating: 4.9, distance: '22km', verified: true, description: 'Highest road pass in South Africa. Guided 4x4 trips available.' },
  { name: 'Thabo Mokoena Photography', category: 'Experience', rating: 4.8, distance: '8km', verified: true, description: 'Award-winning landscape photography sessions. Book via the property.' },
  { name: 'Zulu Craft Brewery', category: 'Food & Drink', rating: 4.6, distance: '5km', verified: true, description: 'Locally brewed craft beer. Tasting evenings Wed–Sat.' },
  { name: 'Nomvula Wellness Studio', category: 'Wellness', rating: 4.5, distance: '3km', verified: false, description: 'Yoga, breathwork and massage. Verification pending.' },
  { name: 'Drakensberg Bird Trail', category: 'Nature', rating: 4.7, distance: '12km', verified: true, description: 'Self-guided 3-hour trail. Best at dawn. Map at reception.' },
  { name: 'Mpho Artisan Collective', category: 'Shopping', rating: 4.4, distance: '6km', verified: true, description: 'Handmade Basotho crafts and textiles. Saturday market.' },
];

const SERVICE_TYPES = ['Housekeeping', 'Maintenance issue', 'Extra towels/amenities', 'Restaurant/dining', 'Transport', 'Emergency', 'Other'];

type Tab = 'discover' | 'stay' | 'request' | 'itinerary';

export default function GuestLitePage() {
  const [tab, setTab] = useState<Tab>('discover');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  const [serviceSubmitted, setServiceSubmitted] = useState(false);
  const [itinerary, setItinerary] = useState<string[]>([]);

  const categories = ['All', ...Array.from(new Set(DEMO_PLACES.map(p => p.category)))];
  const filtered = DEMO_PLACES.filter(p =>
    (filter === 'All' || p.category === filter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  function addToItinerary(name: string) {
    if (!itinerary.includes(name)) setItinerary(v => [...v, name]);
  }

  function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setServiceSubmitted(true);
  }

  const navItem = (t: Tab, label: string, icon: string) => (
    <button onClick={() => setTab(t)} style={{
      flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '0.6rem 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      color: tab === t ? '#C6A66B' : '#617089',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#07090E', fontFamily: 'Inter, sans-serif', color: '#f1f5f9', maxWidth: 430, margin: '0 auto', position: 'relative', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: '#0B1220', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.25rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: '#9BA7B8' }}>PULSE GUEST LITE</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Your Stay · Drakensberg</div>
          </div>
          <div style={{ fontSize: 10, background: '#1e1e2e', border: '1px solid #374151', borderRadius: 4, padding: '2px 8px', color: '#6b7280' }}>⬛ DEMO</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        {tab === 'discover' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search local places…"
                style={{ width: '100%', boxSizing: 'border-box', background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', padding: '0.6rem 0.9rem', fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: 4 }}>
              {categories.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ whiteSpace: 'nowrap', background: filter === c ? '#C6A66B' : '#0B1220', color: filter === c ? '#07090E' : '#9BA7B8', border: '1px solid ' + (filter === c ? '#C6A66B' : 'rgba(255,255,255,0.1)'), borderRadius: 20, padding: '0.3rem 0.85rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(p => (
                <div key={p.name} style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <span style={{ fontSize: 11, background: p.verified ? 'rgba(43,184,165,0.15)' : 'rgba(107,114,128,0.15)', color: p.verified ? '#2BB8A5' : '#6b7280', border: `1px solid ${p.verified ? 'rgba(43,184,165,0.3)' : 'rgba(107,114,128,0.3)'}`, borderRadius: 4, padding: '1px 6px', marginLeft: 8, flexShrink: 0 }}>
                      {p.verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#9BA7B8', marginBottom: 6, lineHeight: 1.5 }}>{p.description}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#617089' }}>{p.category} · {p.distance}</span>
                    <span style={{ fontSize: 11, color: '#C6A66B' }}>★ {p.rating}</span>
                    <button onClick={() => addToItinerary(p.name)}
                      style={{ marginLeft: 'auto', background: itinerary.includes(p.name) ? 'rgba(43,184,165,0.15)' : 'transparent', color: itinerary.includes(p.name) ? '#2BB8A5' : '#9BA7B8', border: `1px solid ${itinerary.includes(p.name) ? 'rgba(43,184,165,0.3)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 5, padding: '0.25rem 0.65rem', fontSize: 11, cursor: 'pointer' }}>
                      {itinerary.includes(p.name) ? '✓ Saved' : '+ Save'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'stay' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ fontSize: 11, color: '#9BA7B8', marginBottom: 4 }}>CHECK-IN / CHECK-OUT</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>08 Aug 2026 → 11 Aug 2026</div>
              <div style={{ fontSize: 12, color: '#9BA7B8', marginTop: 4 }}>Sani Stone Lodge · Room 4</div>
            </div>
            <div style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '1.25rem' }}>
              <div style={{ fontSize: 11, color: '#9BA7B8', marginBottom: 8 }}>NEED TO KNOW</div>
              {[
                { label: 'Wi-Fi', value: 'PulseSani · ask reception for password' },
                { label: 'Breakfast', value: '07:00–09:30, main dining room' },
                { label: 'Check-out', value: '10:00 — late check-out on request' },
                { label: 'Emergency', value: '+27 33 123 4567' },
                { label: 'Nearest hospital', value: 'Murchison Hospital, 48km' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#9BA7B8', minWidth: 100 }}>{label}</span>
                  <span style={{ color: '#f1f5f9' }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '1rem', fontSize: 13, color: '#fca5a5' }}>
              <strong>Emergency:</strong> For life-threatening emergencies call 10111 (police) or 10177 (ambulance). Nearest hospital: Murchison, 48km north.
            </div>
          </div>
        )}

        {tab === 'request' && (
          <div>
            {serviceSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#2BB8A5', marginBottom: 8 }}>Request received</div>
                <div style={{ fontSize: 13, color: '#9BA7B8' }}>The property team has been notified and will respond shortly.</div>
                <button onClick={() => { setServiceSubmitted(false); setServiceType(''); setServiceNote(''); }}
                  style={{ marginTop: 20, background: 'transparent', color: '#9BA7B8', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '0.5rem 1rem', fontSize: 13, cursor: 'pointer' }}>
                  New request
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Service request</div>
                <div>
                  <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>Type of request *</label>
                  <select required value={serviceType} onChange={e => setServiceType(e.target.value)}
                    style={{ width: '100%', background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f1f5f9', padding: '0.6rem 0.75rem', fontSize: 13 }}>
                    <option value="">Select…</option>
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#9BA7B8', display: 'block', marginBottom: 4 }}>Notes</label>
                  <textarea value={serviceNote} onChange={e => setServiceNote(e.target.value)} rows={3} placeholder="Describe your request…"
                    style={{ width: '100%', boxSizing: 'border-box', background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#f1f5f9', padding: '0.6rem 0.75rem', fontSize: 13, resize: 'vertical' }} />
                </div>
                <button type="submit" style={{ background: '#C6A66B', color: '#07090E', border: 'none', borderRadius: 6, padding: '0.7rem', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Send Request
                </button>
              </form>
            )}
          </div>
        )}

        {tab === 'itinerary' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: '1rem' }}>My Itinerary</div>
            {itinerary.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#9BA7B8', fontSize: 13 }}>
                No places saved yet. Explore the Discover tab and tap + Save to add places.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {itinerary.map((name, i) => (
                  <div key={name} style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: '#C6A66B', fontWeight: 700, minWidth: 20 }}>{i + 1}</span>
                    <span style={{ fontSize: 13, flex: 1 }}>{name}</span>
                    <button onClick={() => setItinerary(v => v.filter(n => n !== name))}
                      style={{ background: 'none', border: 'none', color: '#617089', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: '#0B1220', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex' }}>
        {navItem('discover', 'Discover', '🗺️')}
        {navItem('stay', 'Stay', '🏠')}
        {navItem('request', 'Request', '🔔')}
        {navItem('itinerary', 'My Plan', '📋')}
      </div>
    </div>
  );
}
