import React from 'react';
import { GlassCard } from '@/components/shared/UI';
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';

export default function ProfileScreen() {
  return (
    <div className="pb-32 pt-10 px-6">
      <header className="mb-10">
        <h1 className="text-2xl font-black text-white uppercase italic">Профиль</h1>
      </header>

      <section className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden border-4 border-[#B685FF] mb-4">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
        <h2 className="text-xl font-black text-white">Felix Savy</h2>
        <p className="text-sm text-[#8F8A9B]">snekkincoop777@gmail.com</p>
      </section>

      <div className="space-y-4">
        <ProfileItem icon={Settings} title="Общие настройки" />
        <ProfileItem icon={Bell} title="Уведомления" />
        <ProfileItem icon={Shield} title="Приватность и безопасность" />
        <ProfileItem icon={User} title="Данные аккаунта" />
        
        <div className="pt-6">
          <button className="w-full flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 transition-all active:scale-[0.98]">
            <LogOut size={20} className="text-red-500" />
            <span className="flex-1 text-left text-sm font-bold text-red-500">Выйти</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const ProfileItem = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <button className="w-full flex items-center gap-4 bg-[#1D172F]/60 border border-[#302945] rounded-xl p-4 transition-all active:scale-[0.98]">
    <Icon size={20} className="text-[#B685FF]" />
    <span className="flex-1 text-left text-sm font-bold text-white">{title}</span>
    <ChevronRight size={20} className="text-[#8F8A9B]" />
  </button>
);
