import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => (
  <div className={cn(
    "bg-[#1D172F]/60 backdrop-blur-xl border border-[#302945] rounded-2xl p-5 shadow-xl",
    className
  )}>
    {children}
  </div>
);

interface ActionButtonProps {
  title: string;
  onPress?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  glow?: boolean;
}

export const ActionButton = ({ title, onPress, className, variant = 'primary', glow }: ActionButtonProps) => {
  const variants = {
    primary: "bg-[#B685FF] text-[#110C1E]",
    secondary: "bg-[#302945] text-white",
    outline: "bg-transparent border border-[#302945] text-white"
  };

  return (
    <button
      onClick={onPress}
      className={cn(
        "w-full py-4 rounded-xl font-bold text-sm tracking-widest transition-all active:scale-95 hover:opacity-90",
        variants[variant],
        glow && "shadow-[0_0_20px_rgba(182,133,255,0.4)]",
        className
      )}
    >
      {title}
    </button>
  );
};

export const PriorityBadge = ({ level }: { level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' }) => {
  const colors = {
    CRITICAL: "text-[#E84855] bg-[#E84855]/10 border-[#E84855]",
    HIGH: "text-[#E58A32] bg-[#E58A32]/10 border-[#E58A32]",
    MEDIUM: "text-[#B685FF] bg-[#B685FF]/10 border-[#B685FF]",
    LOW: "text-[#2F72E4] bg-[#2F72E4]/10 border-[#2F72E4]"
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold border",
      colors[level]
    )}>
      {level}
    </span>
  );
};
