'use client';
import { useState, useEffect } from 'react';
import { listReviews } from '@/lib/queries/reviews';
import { listProperties } from '@/lib/queries/properties';
import { StatusBadge } from '@/components/ui/status-badge';
import { MetricTile } from '@/components/ui/metric-tile';
import { Star, ChevronDown, ChevronUp, Bot } from 'lucide-react';

const ORG_ID = 'a1b2c3d4-0001-0001-0001-000000000001';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? 'fill-amber-400 text-amber-400' : 'text-[#374151]'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-mono text-[#f1f5f9]">{rating}.0</span>
    </div>
  );
}

export default function ReviewsPage() {
  const [expandedDraft, setExpandedDraft] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [source, setSource] = useState<'live' | 'demo'>('demo');

  useEffect(() => {
    Promise.all([listReviews(ORG_ID), listProperties(ORG_ID)])
      .then(([r, p]) => { setReviews(r.rows); setProperties(p.rows); setSource(r.source); })
      .catch(console.error);
  }, []);

  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;
  const pending = reviews.filter((r: any) => r.response_status === 'pending').length;
  const draftReady = reviews.filter((r: any) => r.response_status === 'draft_ready').length;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r: any) => r.rating === star).length,
  }));
  const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        <MetricTile label="Avg Rating" value={avgRating.toFixed(1)} unit="/ 5" variant="success" />
        <MetricTile label="Total Reviews" value={reviews.length} />
        <MetricTile
          label="Pending Response"
          value={pending}
          variant={pending > 0 ? 'warning' : 'default'}
        />
        <MetricTile
          label="Drafts Ready"
          value={draftReady}
          subValue="awaiting approval"
          variant={draftReady > 0 ? 'default' : 'default'}
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Review Cards */}
        <div className="col-span-2 space-y-4">
          {reviews.map((review: any) => {
            const prop = properties.find((p: any) => p.id === review.property_id);
            const draft = review.ai_response_draft ?? review.recommended_response;
            const isExpanded = expandedDraft === review.id;

            return (
              <div
                key={review.id}
                className={`bg-[#111318] border rounded-lg overflow-hidden ${
                  review.sentiment === 'negative'
                    ? 'border-red-500/20'
                    : review.response_status === 'draft_ready'
                    ? 'border-blue-500/20'
                    : 'border-[#1e2028]'
                }`}
              >
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={review.platform ?? review.source ?? 'other'} />
                        <StatusBadge status={review.sentiment ?? 'neutral'} />
                        <StatusBadge status={review.response_status} />
                      </div>
                      <div className="text-xs text-[#64748b]">{prop?.name}</div>
                    </div>
                    <div className="flex-shrink-0">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>

                  {review.title && (
                    <div className="text-sm font-semibold text-[#f1f5f9] mb-1">
                      &ldquo;{review.title}&rdquo;
                    </div>
                  )}
                  <p className="text-sm text-[#94a3b8] leading-relaxed">
                    {review.content ?? review.review_text}
                  </p>

                  {review.topics && review.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.topics.map((t: string) => (
                        <span
                          key={t}
                          className="text-[10px] bg-[#161b22] border border-[#1e2028] text-[#64748b] px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Draft */}
                {draft && (
                  <div className="border-t border-[#1e2028]">
                    <button
                      onClick={() => setExpandedDraft(isExpanded ? null : review.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-[#161b22] transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#3b82f6]" />
                      <span className="text-xs text-[#3b82f6] font-medium">AI Draft Response</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-[#64748b] ml-auto" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[#64748b] ml-auto" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3">
                        <p className="text-xs text-[#94a3b8] leading-relaxed bg-[#0d0f14] border border-[#1e2028] rounded p-3 mb-3">
                          {draft}
                        </p>
                        <div className="flex gap-2">
                          <button className="flex-1 text-xs bg-[#3b82f6] text-white rounded px-3 py-1.5 hover:bg-[#2563eb] transition-colors font-medium">
                            Approve &amp; Send
                          </button>
                          <button className="flex-1 text-xs bg-[#111318] border border-[#1e2028] text-[#94a3b8] rounded px-3 py-1.5 hover:border-[#374151] transition-colors">
                            Edit Draft
                          </button>
                          <button className="text-xs text-[#64748b] px-3 py-1.5 hover:text-[#94a3b8] transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action row when no draft */}
                {!draft && review.response_status === 'pending' && (
                  <div className="border-t border-[#1e2028] px-4 py-2 flex gap-2">
                    <button className="text-xs bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded px-3 py-1 hover:bg-[#3b82f6]/20 transition-colors">
                      Generate AI Response
                    </button>
                    <button className="text-xs text-[#64748b] px-3 py-1 hover:text-[#94a3b8] transition-colors">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rating Distribution */}
        <div className="space-y-4">
          <div className="bg-[#111318] border border-[#1e2028] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase mb-4">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {ratingDist.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-[#64748b] font-mono w-4 text-right">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 bg-[#1e2028] rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#64748b] w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111318] border border-[#1e2028] rounded-lg p-4">
            <h3 className="text-xs font-semibold text-[#f1f5f9] tracking-widest uppercase mb-3">
              Response Queue
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Pending Response', count: pending, color: 'text-amber-400' },
                { label: 'Draft Ready', count: draftReady, color: 'text-blue-400' },
                { label: 'Responded', count: reviews.filter((r: any) => r.response_status === 'responded').length, color: 'text-green-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#64748b]">{item.label}</span>
                  <span className={`text-xs font-mono font-semibold ${item.color}`}>
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
