import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, Send, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { budgetSummary } from '@/lib/finance';
import { formatKGS } from '@/lib/utils';

interface Message { id: string; role: 'user' | 'assistant'; content: string }
const SUGGESTED = ['Что сейчас с моим бюджетом?', 'Сколько можно тратить в день?', 'Как накопить на цель?', 'Могу ли я позволить себе кредит?'];

export default function InsightsScreen() {
  const app = useApp();
  const location = useLocation();
  const summary = budgetSummary(app);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(() => (location.state?.question as string) || '');
  const [status, setStatus] = useState<'checking' | 'ready' | 'unconfigured' | 'offline'>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'local' | 'cloud'>('cloud');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch('/api/chat', { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (typeof data.configured !== 'boolean') throw new Error();
        if (active) setMode(data.mode === 'local' ? 'local' : 'cloud');
        if (active) setStatus(data.configured ? 'ready' : 'unconfigured');
      })
      .catch(() => { if (active) setStatus('offline'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); requestRef.current?.abort(); };
  }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, error]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 2000 || pendingRef.current || status !== 'ready') return;
    pendingRef.current = true;
    const message: Message = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    const history = [...messages, message];
    setMessages(history); setInput(''); setError(''); setIsLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), mode === 'local' ? 125000 : 30000);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-11).map(({ role, content }) => ({ role, content })),
          budget: { monthlyIncome: app.monthlyIncome, actualAvailable: app.actualAvailable,
            internalDebt: app.internalDebt, vaults: app.vaults, plannedSpends: app.plannedSpends },
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.content !== 'string') {
        if (response.status === 503) setStatus('unconfigured');
        throw new Error(data.error || 'Помощник сейчас недоступен. Попробуйте ещё раз.');
      }
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.content }]);
    } catch (e) {
      setMessages(prev => prev.filter(m => m.id !== message.id));
      setInput(trimmed);
      setError(controller.signal.aborted ? 'Ответ занял слишком много времени. Попробуйте ещё раз.' : e instanceof Error ? e.message : 'Не удалось отправить вопрос.');
    } finally { clearTimeout(timeout); pendingRef.current = false; setIsLoading(false); }
  }

  const available = status === 'ready';
  return (
    <div className="fixed inset-0 bottom-[90px] flex flex-col bg-[#110C1E]">
      <header className="shrink-0 px-5 pt-8 pb-4 border-b border-[#302945]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#B685FF]/20"><Bot className="text-[#B685FF]" size={22} /></div>
          <div className="flex-1"><h1 className="font-bold text-white">Помощник Savy</h1><p className="text-xs text-[#8F8A9B]">{status === 'checking' ? 'Проверяем подключение…' : available ? mode === 'local' ? 'Локальная модель · на этом компьютере' : 'Обсудим ваш бюджет' : 'AI пока недоступен'}</p></div>
          <button aria-label="Начать новый диалог" disabled={isLoading} onClick={() => { setMessages([]); setError(''); setInput(''); }} className="p-2 text-[#8F8A9B] disabled:opacity-30"><RotateCcw size={18} /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-[#1D172F] p-3"><p className="text-[#8F8A9B]">После бронирований</p><p className="mt-1 font-bold text-white">{formatKGS(summary.spendable)}</p></div>
          <div className="rounded-xl bg-[#1D172F] p-3"><p className="text-[#8F8A9B]">Бюджет на 30 дней</p><p className="mt-1 font-bold text-white">{formatKGS(summary.dailyBudget)} / день</p></div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" role="log" aria-label="Диалог с помощником" aria-live="polite">
        {messages.length === 0 && <div className="text-sm text-[#8F8A9B] leading-relaxed"><p className="text-white font-semibold mb-2">Разберёмся в цифрах вместе</p><p>Помогу объяснить запас денег, сравнить покупку с бюджетом и оценить платёж по кредиту. Я получаю текущие суммы и цели из Savy при каждом вопросе.</p></div>}
        {status === 'unconfigured' && <p className="rounded-2xl border border-[#B685FF]/30 p-4 text-sm text-[#B685FF]">Модель ещё не подключена владельцем приложения. Ваши расчёты выше доступны; ответы AI появятся после подключения.</p>}
        {status === 'offline' && <p className="rounded-2xl border border-[#302945] p-4 text-sm text-[#8F8A9B]">Не удалось связаться с помощником. Обновите страницу, чтобы повторить подключение.</p>}
        {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><p className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'user' ? 'bg-[#2A1F4A] text-white' : 'bg-[#1D172F] border border-[#302945] text-white'}`}>{message.content}</p></div>)}
        {isLoading && <p className="text-sm text-[#B685FF] animate-pulse" role="status">Savy разбирает ваш вопрос…</p>}
        {error && <p role="alert" className="text-sm text-[#EFA5AE]">{error} Вопрос сохранён в поле ввода.</p>}
        <div ref={bottomRef} />
      </div>
      <div className="shrink-0 px-4 pt-3 pb-4 border-t border-[#302945]">
        <div className="flex gap-2 overflow-x-auto pb-3">{SUGGESTED.map(question => <button key={question} onClick={() => setInput(question)} disabled={isLoading} className="shrink-0 px-3 py-2 rounded-full border border-[#302945] text-xs text-[#B685FF] disabled:opacity-40">{question}</button>)}</div>
        <form onSubmit={event => { event.preventDefault(); void sendMessage(input); }} className="flex items-end gap-3">
          <textarea aria-label="Вопрос помощнику" maxLength={2000} rows={2} value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(input); } }} placeholder="Например: потяну ли я платёж 3 000 сомов?" disabled={isLoading} className="flex-1 min-w-0 resize-none rounded-xl bg-[#1D172F] border border-[#302945] px-3 py-2 text-sm text-white outline-none focus:border-[#B685FF]" />
          <button type="submit" aria-label="Отправить вопрос" disabled={!available || isLoading || !input.trim()} className="p-3 rounded-xl bg-[#B685FF] text-[#110C1E] disabled:opacity-30"><Send size={18} /></button>
        </form>
        <p className="text-[10px] text-[#8F8A9B] mt-2">{mode === 'local' ? 'Ответ формируется на этом компьютере. Первый ответ может занять до двух минут.' : 'При отправке вопрос и суммы бюджета передаются AI-сервису.'} Ответы могут содержать ошибки.</p>
      </div>
    </div>
  );
}
