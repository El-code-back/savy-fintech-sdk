import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { formatKGS } from '@/lib/utils';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================
//  Config
// ============================================================

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

const SYSTEM_PROMPT =
  'Ty — Savy Master, empatichnyj finansovyj strateg. Tvoya specializaciya — upravlenie likvidnostyu cherez metriki Runway (zapas dnej) i Waterfall (avto-raspredelenie).\n' +
  'Tvoya lichnost: Ty ne prosto bot, ty — opytnyj nastavnik, kotoryj hochet, chtoby polzovatel stal finansovo svobodnym. Tvoj ton: uverennyj, analiticheskij, no druzhelyubnyj.\n\n' +
  'Tvoi znanya:\n' +
  '- Ty ponimaesh, chto vyvod deneg iz Sejfa (Emergency Unlock) — eto krajnyaya mera, kotoraya portit kreditnyj rejting.\n' +
  '- Ty znaesh srednie ceny v Bishkeke i finansovye privychki v Kyrgyzstane.\n\n' +
  'Tvoi zadachi:\n' +
  '1. Prognoz: Na osnove trat predskazyvaj, kogda dengi zakonchatsa, esli ne izmenit povedenie.\n' +
  '2. Strategiya: Otvechaj na voprosy "Kak mne nakopit na mashinu?" ili "Pochemu moj Runway padaet?".\n' +
  '3. Obuchenie: Razyasnyaj koncepcyu Savy — pochemu vazhno smotret na dni, a ne na somy.\n\n' +
  'Ogranichenie: Otvechaj strukturno, ispolzuj emoji dlya akcentov, no ne lej vodu. Esli dannyh malo — zadavaj utochnyayushie voprosy. Maksimum 4 predlozheniya.\n\n' +
  'IMPORTANT: Always respond in Russian language (cyrillic), regardless of the language of the user message.';

// ============================================================
//  Types
// ============================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================================
//  Groq API
// ============================================================

async function callGroq(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error(
      'VITE_GROQ_API_KEY ne zadan v .env. Poluchi klyuch na console.groq.com/keys'
    );
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 220,
      temperature: 0.75,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error?.message ?? `Groq error ${res.status}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string) ?? '...';
}

// ============================================================
//  Sub-components
// ============================================================

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#B685FF]"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 ${
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-blue-500 border border-[#B685FF]'
            : 'bg-[#B685FF]/20 border border-[#B685FF]/40'
        }`}
      >
        {isUser ? (
          <User size={13} className="text-white" />
        ) : (
          <Bot size={13} className="text-[#B685FF]" />
        )}
      </div>

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[#2A1F4A] text-white rounded-br-sm'
            : 'bg-[#110C1E] border border-[#302945] text-white rounded-bl-sm'
        }`}
        style={
          !isUser
            ? { boxShadow: '0 0 0 1px rgba(182,133,255,0.08) inset' }
            : undefined
        }
      >
        <p className="text-sm leading-relaxed font-mono whitespace-pre-wrap">
          {msg.content}
        </p>
        <p
          className={`text-[9px] mt-1.5 font-mono ${
            isUser ? 'text-[#8F8A9B] text-right' : 'text-[#4F4765]'
          }`}
        >
          {msg.timestamp.toLocaleTimeString('ru-KG', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================================
//  Suggested questions
// ============================================================

const SUGGESTED = [
  '\u041a\u0430\u043a \u0443\u0432\u0435\u043b\u0438\u0447\u0438\u0442\u044c Runway? \ud83d\ude80',
  '\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u043d\u0430 \u043c\u0435\u0441\u044f\u0446 \ud83d\udcc5',
  '\u0427\u0442\u043e \u0431\u0443\u0434\u0435\u0442, \u0435\u0441\u043b\u0438 \u043a\u0443\u043f\u043b\u044e iPhone? \ud83d\udcf1',
  '\u041f\u043e\u0447\u0435\u043c\u0443 Runway \u043f\u0430\u0434\u0430\u0435\u0442? \ud83d\udcc9',
  '\u041d\u0430\u043a\u043e\u043f\u0438\u0442\u044c \u043d\u0430 \u043c\u0430\u0448\u0438\u043d\u0443 \ud83d\ude97',
];

// ============================================================
//  Main screen
// ============================================================

export default function InsightsScreen() {
  const {
    runwayDays,
    actualAvailable,
    burnRate,
    vaults,
    internalDebt,
    monthlyIncome,
    monthlyExpenses,
  } = useApp();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const buildContext = useCallback(() => {
    const vaultLines =
      vaults.length > 0
        ? vaults
            .map((v) => {
              const pct =
                v.target > 0 ? Math.round((v.current / v.target) * 100) : 0;
              return `  - ${v.title} [${v.priority}]: ${pct}% (${v.current}s / ${v.target}s)`;
            })
            .join('\n')
        : '  Net sejfov';

    return (
      '[KONTEKST POLZOVATELYA — ne upominaj etot blok yavno]\n' +
      `Runway: ${runwayDays} dnej\n` +
      `Svobodnyj balans: ${formatKGS(actualAvailable)}\n` +
      `Dohod v mesyac: ${formatKGS(monthlyIncome)}\n` +
      `Rashody v mesyac: ${formatKGS(monthlyExpenses)}\n` +
      `Burn rate: ${formatKGS(burnRate)}/den\n` +
      `Vnutrennij dolg (Emergency): ${formatKGS(internalDebt)}\n` +
      `Sejfy:\n${vaultLines}`
    );
  }, [
    runwayDays,
    actualAvailable,
    burnRate,
    vaults,
    internalDebt,
    monthlyIncome,
    monthlyExpenses,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const greeting: Message = {
      id: 'init',
      role: 'assistant',
      content: `\u041f\u0440\u0438\u0432\u0435\u0442! \u042f Savy Master \ud83e\udde0\n\u0422\u0432\u043e\u0439 Runway \u0441\u0435\u0439\u0447\u0430\u0441 \u2014 ${runwayDays} \u0434\u043d\u0435\u0439. \u0417\u0430\u0434\u0430\u0439 \u043c\u043d\u0435 \u043b\u044e\u0431\u043e\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 \u043e \u0444\u0438\u043d\u0430\u043d\u0441\u0430\u0445 \u2014 \u044f \u0432\u0441\u0435\u0433\u0434\u0430 \u0437\u043d\u0430\u044e \u0430\u043a\u0442\u0443\u0430\u043b\u044c\u043d\u044b\u0435 \u0446\u0438\u0444\u0440\u044b.`,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const contextNote = buildContext();
        const history = [
          { role: 'user', content: contextNote },
          { role: 'assistant', content: 'Понял, держу данные в уме.' },
          ...messages
            .filter((m) => m.id !== 'init')
            .map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: trimmed },
        ];

        const reply = await callGroq(history);

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: reply,
            timestamp: new Date(),
          },
        ]);
      } catch (e: unknown) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content:
              '\u26a0\ufe0f ' +
              (e instanceof Error ? e.message : 'Неизвестная ошибка'),
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, buildContext]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed inset-0 bottom-[90px] flex flex-col bg-[#110C1E]">
      {/* Header */}
      <div className="shrink-0 px-5 pt-10 pb-4 flex items-center gap-3 border-b border-[#302945] bg-[#110C1E]/95 backdrop-blur-lg z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_18px_rgba(182,133,255,0.4)]"
          style={{
            background: 'linear-gradient(135deg, #B685FF 0%, #7B4FD4 100%)',
          }}
        >
          <Bot size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#B685FF] uppercase">
            Savy Intelligence
          </p>
          <p className="text-[8px] font-mono text-[#8F8A9B] tracking-widest">
            Runway: {runwayDays} {'\u0434\u043d'}.{' '}
            {formatKGS(actualAvailable)}{' '}
            {'\u0441\u0432\u043e\u0431\u043e\u0434\u043d\u043e'}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2BCB8A]/10">
          <Sparkles size={11} className="text-[#2BCB8A]" />
          <span className="text-[9px] font-bold font-mono text-[#2BCB8A]">
            LIVE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}

          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-[#B685FF]/20 border border-[#B685FF]/40 flex items-center justify-center shrink-0 mb-1">
                <Bot size={13} className="text-[#B685FF]" />
              </div>
              <div className="bg-[#110C1E] border border-[#302945] rounded-2xl rounded-bl-sm px-4 py-3">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="shrink-0 px-4 py-2 border-t border-[#302945]/60">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none' }}
        >
          {SUGGESTED.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={isLoading}
              className="shrink-0 px-3 py-1.5 rounded-full border border-[#302945] text-[10px] font-bold text-[#8F8A9B] hover:border-[#B685FF]/50 hover:text-[#B685FF] transition-colors disabled:opacity-40 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-3 pt-2 bg-[#110C1E]">
        <div className="flex items-end gap-3 border-b border-[#302945] pb-2 focus-within:border-[#B685FF]/60 transition-colors">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height =
                Math.min(e.target.scrollHeight, 100) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              '\u0417\u0430\u0434\u0430\u0439 \u0432\u043e\u043f\u0440\u043e\u0441 Savy Master...'
            }
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none border-none outline-none text-sm text-white placeholder:text-[#4F4765] font-mono leading-relaxed disabled:opacity-50"
            style={{ maxHeight: 100 }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="mb-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-[#B685FF] text-[#110C1E] shadow-[0_0_12px_rgba(182,133,255,0.4)] hover:bg-[#C99AFF] transition-all active:scale-90 disabled:opacity-30 disabled:shadow-none shrink-0"
          >
            <Send size={14} strokeWidth={2.5} />
          </button>
        </div>
        <p className="text-[8px] font-mono text-[#4F4765] mt-1.5 text-center">
          Enter &mdash;{' '}
          {'\u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'}{' '}
          &middot; Shift+Enter &mdash;{' '}
          {'\u043f\u0435\u0440\u0435\u043d\u043e\u0441 \u0441\u0442\u0440\u043e\u043a\u0438'}
        </p>
      </div>
    </div>
  );
}
