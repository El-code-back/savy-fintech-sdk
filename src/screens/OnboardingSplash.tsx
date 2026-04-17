import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { GlassCard } from '@/components/shared/UI';
import { 
  ChevronRight, 
  Infinity, 
  Lock, 
  CreditCard, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionBlockProps {
  question: string;
  answer: string;
  icon: React.ElementType;
  delay: number;
}

const QuestionBlock = ({ question, answer, icon: Icon, delay }: QuestionBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="w-full"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full text-left p-5 rounded-3xl border transition-all duration-500",
          isOpen 
            ? "bg-[#1D172F] border-[#B685FF]/50 shadow-[0_0_30px_rgba(182,133,255,0.15)]" 
            : "bg-[#110C1E] border-[#302945] hover:border-[#8F8A9B]"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
              isOpen ? "bg-[#B685FF] text-[#110C1E]" : "bg-[#302945] text-[#8F8A9B]"
            )}>
              <Icon size={20} />
            </div>
            <p className={cn(
              "text-sm font-black uppercase tracking-widest",
              isOpen ? "text-white" : "text-[#8F8A9B]"
            )}>
              {question}
            </p>
          </div>
          <ChevronRight 
            size={18} 
            className={cn(
              "text-[#8F8A9B] transition-transform duration-500",
              isOpen && "rotate-90 text-[#B685FF]"
            )} 
          />
        </div>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-[#302945]/50">
                <p className="text-sm text-[#8F8A9B] leading-relaxed font-medium">
                  {answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

export default function OnboardingSplash() {
  const { setSplashSeen } = useApp();

  return (
    <div className="min-h-screen bg-[#0F0B19] flex flex-col p-8 pt-16 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[30%] bg-[#B685FF]/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[20%] bg-[#2BCB8A]/5 blur-[80px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-[40px] font-black text-white leading-tight italic uppercase tracking-tighter mb-2">
          SAVY: <br />
          <span className="text-[#B685FF]">ШТУРМАН</span> ТВОИХ ДЕНЕГ
        </h1>
        <p className="text-[#8F8A9B] text-xs font-bold uppercase tracking-widest opacity-60">
          Узнайте, как мы поменяем ваш подход к финансам
        </p>
      </motion.div>

      <div className="space-y-4 flex-1">
        <QuestionBlock 
          question="Что такое Runway?"
          answer="Это показатель того, сколько дней вы сможете прожить на текущие деньги. Мы считаем это за вас, учитывая ваши привычки и обязательства."
          icon={Infinity}
          delay={0.2}
        />
        <QuestionBlock 
          question="Для чего Сейфы?"
          answer="В Сейфах деньги 'замораживаются' на важные вещи: аренду, налоги или отпуск. Это гарантирует, что вы не потратите лишнего сегодня."
          icon={Lock}
          delay={0.3}
        />
        <QuestionBlock 
          question="Каталог кредитов?"
          answer="Если Runway падает, мы подбираем лучшие предложения, чтобы 'заправить' ваш бюджет и избежать кассовых разрывов."
          icon={CreditCard}
          delay={0.4}
        />
        <QuestionBlock 
          question="Что умеет Savy AI?"
          answer="Ваш личный штурман. Он анализирует математику и дает простые советы: когда притормозить с тратами, а когда можно ускориться."
          icon={Sparkles}
          delay={0.5}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="pt-12 flex justify-center pb-8"
      >
        <button 
          onClick={() => setSplashSeen(true)}
          className="w-16 h-16 rounded-full bg-[#B685FF] text-[#110C1E] flex items-center justify-center 
                     shadow-[0_0_30px_rgba(182,133,255,0.3)] hover:scale-110 active:scale-95 transition-all"
        >
          <ArrowRight size={32} />
        </button>
      </motion.div>
    </div>
  );
}
