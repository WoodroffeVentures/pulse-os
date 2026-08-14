'use client';
import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useNavStore } from '@/lib/stores/nav-store';

const pageTitles: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/properties':       'Properties',
  '/front-desk':       'Front Desk',
  '/reservations':     'Reservations',
  '/rates':            'Rate Plans',
  '/housekeeping':     'Housekeeping',
  '/maintenance':      'Maintenance',
  '/guests':           'Guest CRM',
  '/reviews':          'Reviews',
  '/guest-guides':     'Guest Guides',
  '/businesses':       'Businesses',
  '/opportunities':    'Opportunity Radar',
  '/viability':        'Viability',
  '/participation':    'Participation & JVs',
  '/outcomes':         'Outcomes',
  '/graph':            'Participation Graph',
  '/reports':          'Reports',
  '/settings':         'Settings',
  '/admin':            'Admin',
};

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Match prefix for nested routes like /opportunities/[id]
  const match = Object.keys(pageTitles).find(k => k !== '/' && pathname.startsWith(k + '/'));
  return match ? pageTitles[match] : 'PULSE OS';
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);
  const { toggleMobile } = useNavStore();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <header className="h-14 bg-[#020912]/95 border-b border-white/10 flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleMobile}
        className="md:hidden p-1.5 rounded text-[#9BA7B8] hover:text-[#f1f5f9] hover:bg-[#08111f] transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-[#f1f5f9] tracking-wide truncate">
          {title}
        </h1>
        <p className="text-[10px] text-[#9BA7B8] tracking-widest hidden sm:block">
          {dateStr} · FARMSTEAD HOSPITALITY · PILOT
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded hover:bg-[#08111f] transition-colors" aria-label="Notifications">
          <Bell className="w-4 h-4 text-[#9BA7B8]" />
        </button>
        <div className="w-7 h-7 bg-[#C6A66B]/20 border border-[#C6A66B]/30 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-[#C6A66B]">FH</span>
        </div>
      </div>
    </header>
  );
}
