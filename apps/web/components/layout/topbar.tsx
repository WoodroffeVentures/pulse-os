'use client';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Command Dashboard',
  '/properties': 'Farmstead Portfolio',
  '/bookings': 'Reservations',
  '/tasks': 'Task Engine',
  '/housekeeping': 'Housekeeping',
  '/maintenance': 'Maintenance',
  '/works': 'Works Register',
  '/guests': 'Guest CRM',
  '/reviews': 'Review Intelligence',
  '/guest-guides': 'Guest Guides',
  '/brain': 'Brain / Knowledge Base',
  '/ai-brief': 'AI Daily Brief',
  '/visibility': 'Visibility Intelligence',
  '/growth': 'Growth Intelligence',
  '/local-ecosystem': 'Local Ecosystem',
  '/destination': 'Destination Intelligence',
  '/opportunities': 'Opportunity Participation',
  '/economic-intelligence': 'Economic Intelligence',
  '/admin': 'Admin Console',
  '/settings': 'Settings',
};

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'PULSE OS';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-14 bg-[#020912]/95 border-b border-white/10 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-[#f1f5f9] tracking-wide">
          {title}
        </h1>
        <p className="text-[10px] text-[#9BA7B8] tracking-widest">
          {dateStr} · FARMSTEAD HOSPITALITY · PHASE 1 PRODUCTION
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#08111f] border border-white/10 rounded px-3 py-1.5">
          <Search className="w-3 h-3 text-[#9BA7B8]" />
          <span className="text-xs text-[#617089]">Search...</span>
        </div>
        <button className="relative p-2 rounded hover:bg-[#08111f] transition-colors">
          <Bell className="w-4 h-4 text-[#9BA7B8]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#C6A66B] rounded-full" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 bg-[#C6A66B]/20 border border-[#C6A66B]/30 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-[#C6A66B]">FH</span>
          </div>
          <ChevronDown className="w-3 h-3 text-[#9BA7B8]" />
        </div>
      </div>
    </header>
  );
}
