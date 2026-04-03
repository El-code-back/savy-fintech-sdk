import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, CreditCard, BarChart2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const navItems = [
    { icon: Home, label: 'HOME', path: '/' },
    { icon: Shield, label: 'SAFES', path: '/vaults' },
    { icon: CreditCard, label: 'CREDITS', path: '/credits' },
    { icon: BarChart2, label: 'INSIGHTS', path: '/insights' },
    { icon: User, label: 'PROFILE', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F0B19]/90 backdrop-blur-lg border-t border-[#302945] px-6 pt-3 pb-8 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => cn(
            "flex flex-col items-center gap-1 transition-colors",
            isActive ? "text-[#B685FF]" : "text-[#4F4765]"
          )}
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "p-2 rounded-xl transition-all",
                isActive && "bg-[#B685FF]/10 shadow-[0_0_15px_rgba(182,133,255,0.2)]"
              )}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[8px] font-bold tracking-widest">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
