'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOrg } from '@/lib/context/org-context';
import { useNavStore } from '@/lib/stores/nav-store';
import {
  LayoutDashboard,
  CalendarDays,
  ConciergeBell,
  Home,
  Wrench,
  Building2,
  Settings,
  LogOut,
  BookOpen,
  Users,
  Star,
  BadgeDollarSign,
  Network,
  Target,
  Handshake,
  TrendingUp,
  Map,
  ClipboardList,
  ChevronRight,
  Zap,
  X,
} from 'lucide-react';

const operationsNav = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/properties',   icon: Building2,        label: 'Properties' },
  { href: '/front-desk',   icon: ConciergeBell,    label: 'Front Desk' },
  { href: '/reservations', icon: CalendarDays,     label: 'Reservations' },
  { href: '/rates',        icon: BadgeDollarSign,  label: 'Rates' },
  { href: '/housekeeping', icon: Home,             label: 'Housekeeping' },
  { href: '/maintenance',  icon: Wrench,           label: 'Maintenance' },
  { href: '/guests',       icon: Users,            label: 'Guests' },
  { href: '/reviews',      icon: Star,             label: 'Reviews' },
  { href: '/guest-guides', icon: BookOpen,         label: 'Guest Guides' },
];

const pulseNav = [
  { href: '/businesses',   icon: Network,          label: 'Businesses' },
  { href: '/opportunities',icon: Target,           label: 'Opportunity Radar' },
  { href: '/viability',    icon: Zap,              label: 'Viability' },
  { href: '/participation',icon: Handshake,        label: 'Participation & JVs' },
  { href: '/outcomes',     icon: TrendingUp,       label: 'Outcomes' },
  { href: '/graph',        icon: Map,              label: 'Participation Graph' },
];

const platformNav = [
  { href: '/reports',      icon: ClipboardList,    label: 'Reports' },
  { href: '/settings',     icon: Settings,         label: 'Settings' },
];

function NavItem({ href, icon: Icon, label, onNav }: {
  href: string; icon: React.ElementType; label: string; onNav?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      onClick={onNav}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded text-sm mb-0.5 transition-colors',
        active
          ? 'bg-[#C6A66B]/10 text-[#C6A66B] border border-[#C6A66B]/20'
          : 'text-[#9BA7B8] hover:text-[#f1f5f9] hover:bg-[#08111f]'
      )}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { orgName, user, signOut } = useOrg();
  const initials = orgName
    ? orgName.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C6A66B] rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-[#020912] rounded-full" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#f1f5f9] tracking-widest">PULSE</div>
            <div className="text-[9px] text-[#9BA7B8] tracking-widest">OPPORTUNITY OS</div>
          </div>
        </div>
      </div>

      {/* Org badge */}
      <div className="px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#08111f] rounded border border-white/10">
          <div className="w-5 h-5 rounded bg-[#C6A66B]/20 border border-[#C6A66B]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-[#C6A66B]">{initials}</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-[#f1f5f9] truncate">
              {orgName ?? 'No organisation'}
            </div>
            <div className="text-[9px] text-[#9BA7B8]">Pilot · Production</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="mb-4">
          <div className="px-2 mb-1">
            <span className="text-[9px] font-semibold text-[#9BA7B8] tracking-widest">OPERATIONS</span>
          </div>
          {operationsNav.map(item => <NavItem key={item.href} {...item} onNav={onNav} />)}
        </div>

        <div className="mb-4">
          <div className="px-2 mb-1 flex items-center gap-1">
            <span className="text-[9px] font-semibold text-[#C6A66B] tracking-widest">PULSE CORE</span>
            <ChevronRight className="w-2.5 h-2.5 text-[#C6A66B]" />
          </div>
          {pulseNav.map(item => <NavItem key={item.href} {...item} onNav={onNav} />)}
        </div>

        <div className="mb-4">
          <div className="px-2 mb-1">
            <span className="text-[9px] font-semibold text-[#9BA7B8] tracking-widest">PLATFORM</span>
          </div>
          {platformNav.map(item => <NavItem key={item.href} {...item} onNav={onNav} />)}
        </div>
      </nav>

      {/* Sign-out */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#9BA7B8] hover:text-[#ef4444] hover:bg-[#08111f] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out · {user?.email?.split('@')[0] ?? ''}</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const { mobileOpen, closeMobile } = useNavStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-[#020912] border-r border-white/10 flex-col flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-[#020912] border-r border-white/10 flex flex-col md:hidden transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navigation menu"
      >
        <button
          onClick={closeMobile}
          className="absolute top-3 right-3 p-1.5 rounded text-[#9BA7B8] hover:text-[#f1f5f9] hover:bg-[#08111f]"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent onNav={closeMobile} />
      </aside>
    </>
  );
}
