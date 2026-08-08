'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Users,
  Star,
  Settings,
  Zap,
  Building2,
  Shield,
  Home,
  Wrench,
  ClipboardList,
  BookOpen,
  Bot,
  Lock,
  TrendingUp,
  Map,
  Landmark,
  Network,
} from 'lucide-react';

const navItems = [
  {
    label: 'COMMAND',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/properties', icon: Building2, label: 'Properties' },
      { href: '/ai-brief', icon: Bot, label: 'AI Brief' },
    ],
  },
  {
    label: 'LIVE OPERATIONS',
    items: [
      { href: '/bookings', icon: Calendar, label: 'Bookings' },
      { href: '/tasks', icon: CheckSquare, label: 'Tasks' },
      { href: '/housekeeping', icon: Home, label: 'Housekeeping' },
      { href: '/maintenance', icon: Wrench, label: 'Maintenance' },
      { href: '/works', icon: ClipboardList, label: 'Works' },
      { href: '/guests', icon: Users, label: 'Guests' },
      { href: '/reviews', icon: Star, label: 'Reviews' },
      { href: '/guest-guides', icon: BookOpen, label: 'Guest Guides' },
      { href: '/brain', icon: Zap, label: 'Brain' },
    ],
  },
  {
    label: 'LOCKED ROADMAP',
    items: [
      { href: '/visibility', icon: Lock, label: 'Visibility' },
      { href: '/growth', icon: TrendingUp, label: 'Growth' },
      { href: '/local-ecosystem', icon: Network, label: 'Local Ecosystem' },
      { href: '/destination', icon: Map, label: 'Destination' },
      { href: '/opportunities', icon: Shield, label: 'Opportunities' },
      { href: '/economic-intelligence', icon: Landmark, label: 'Government' },
    ],
  },
  {
    label: 'PLATFORM',
    items: [
      { href: '/admin', icon: Shield, label: 'Admin' },
      { href: '/settings', icon: Settings, label: 'Settings' },
      { href: '/board-demo', icon: Landmark, label: 'Board Demo' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen bg-[#020912] border-r border-white/10 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#C6A66B] rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-[#020912] rounded-full" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#f1f5f9] tracking-widest">
              PULSE
            </div>
            <div className="text-[9px] text-[#9BA7B8] tracking-widest">
              HOSPITALITY OS
            </div>
          </div>
        </div>
      </div>

      {/* Org Badge */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 px-2 py-1.5 bg-[#08111f] rounded border border-white/10">
          <Building2 className="w-3 h-3 text-[#C6A66B]" />
          <div>
            <div className="text-xs font-medium text-[#f1f5f9]">Farmstead</div>
            <div className="text-[9px] text-[#9BA7B8]">Production MVP</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-2 mb-1">
              <span className="text-[9px] font-semibold text-[#374151] tracking-widest">
                {section.label}
              </span>
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-1.5 rounded text-sm mb-0.5 transition-colors',
                    active
                      ? 'bg-[#C6A66B]/10 text-[#C6A66B] border border-[#C6A66B]/20'
                      : 'text-[#9BA7B8] hover:text-[#f1f5f9] hover:bg-[#08111f]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="text-[9px] text-[#617089] text-center tracking-widest">
          AI ASSISTS · HUMANS GOVERN
        </div>
      </div>
    </aside>
  );
}
