import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, X, Send, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { getApplications, type Application } from '../admin/utils/storage';
import { GoogleGenAI } from '@google/genai';

// ── Types ──────────────────────────────────────────────────────────────────
type ChatRole = 'user' | 'bot';
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: number;
  detectedLang?: string;
};

type SupportedLang = 'eng' | 'zul' | 'xho' | 'sot';

const LANG_LABELS: Record<SupportedLang, string> = {
  eng: 'English',
  zul: 'isiZulu',
  xho: 'isiXhosa',
  sot: 'Sesotho',
};

const VULAVULA_LANG_MAP: Record<SupportedLang, string> = {
  eng: 'eng_Latn',
  zul: 'zul_Latn',
  xho: 'xho_Latn',
  sot: 'sot_Latn',
};

const QUICK_QUESTIONS = [
  'How do I apply for admission?',
  'What documents do I need?',
  'Is boarding available?',
  'What are the school hours?',
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
}

// ── Status lookup ────────────────────────────────────────────────────────────
type StatusQuery =
  | { kind: 'studentNumber'; studentNumber: string }
  | { kind: 'nameAndDob'; firstName: string; lastName: string; dob: string };

function parseStatusQuery(input: string): StatusQuery | null {
  const text = normalize(input);
  const snMatch = text.match(/(student number|student no|student|status)\s*[:#]?\s*([a-z0-9-]{6,})/i);
  if (snMatch?.[2]) return { kind: 'studentNumber', studentNumber: snMatch[2].toUpperCase() };
  const dobMatch = text.match(/\b(19|20)\d{2}-\d{2}-\d{2}\b/);
  if (dobMatch) {
    const dob = dobMatch[0];
    const namePart = text.replace(dob, ' ').replace(/\b(dob|date of birth)\b/g, ' ');
    const tokens = namePart.split(/\s+/).filter(Boolean);
    const statusIdx = tokens.findIndex((t) => t === 'status');
    const startIdx = statusIdx >= 0 ? statusIdx + 1 : 0;
    const firstName = tokens[startIdx];
    const lastName = tokens[startIdx + 1];
    if (firstName && lastName) return { kind: 'nameAndDob', firstName, lastName, dob };
  }
  return null;
}

function findApplication(apps: Application[], q: StatusQuery) {
  if (q.kind === 'studentNumber') {
    return apps.find((a) => normalize(a.studentNumber) === normalize(q.studentNumber));
  }
  return apps.find((a) =>
    normalize(a.firstName) === normalize(q.firstName) &&
    normalize(a.lastName) === normalize(q.lastName) &&
    normalize(a.dob) === normalize(q.dob)
  );
}

// ── Vulavula: detect language ────────────────────────────────────────────────
async function detectLanguage(text: string): Promise<SupportedLang> {
  try {
    const key =
      (import.meta as any).env?.VITE_VULAVULA_API_KEY ||
      (import.meta as any).env?.VULAVULA_API_KEY ||
      '';
    if (!key) return 'eng';
    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/classify/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CLIENT-TOKEN': key },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return 'eng';
    const data = await res.json();
    const detected = (data?.predicted_label ?? '').toLowerCase();
    if (detected.includes('zul')) return 'zul';
    if (detected.includes('xho')) return 'xho';
    if (detected.includes('sot')) return 'sot';
    return 'eng';
  } catch {
    return 'eng';
  }
}

async function translateText(text: string, src: SupportedLang, tgt: SupportedLang): Promise<string> {
  if (src === tgt) return text;
  try {
    const key =
      (import.meta as any).env?.VITE_VULAVULA_API_KEY ||
      (import.meta as any).env?.VULAVULA_API_KEY ||
      '';
    if (!key) return text;
    const res = await fetch('https://vulavula-services.lelapa.ai/api/v1/translate/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CLIENT-TOKEN': key },
      body: JSON.stringify({
        input_text: text,
        source_lang: VULAVULA_LANG_MAP[src],
        target_lang: VULAVULA_LANG_MAP[tgt],
      }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data?.translation ?? text;
  } catch {
    return text;
  }
}

// ── Gemini AI ────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a warm, knowledgeable and friendly assistant for Mvenyane Senior Secondary School in Cedarville, Eastern Cape, South Africa.

You help parents, learners, guardians and community members with anything about the school:
- Admissions and application process (general and boarding)
- Required documents for applications
- Boarding / hostel information
- School fees, payment and financial assistance
- School hours and term dates
- Staff, departments and contact information
- Academic results, achievements and activities
- Sports, culture and extra-curricular programs
- Student welfare and support services
- General encouragement and guidance for parents and learners

School details:
- Name: Mvenyane Senior Secondary School
- Location: Mvenyane A/A, Cedarville, 4735 (Eastern Cape)
- Phone: 082 768 8305 / 082 083 7333
- Website: www.mvenyanehighschool.com
- Motto: "Education is the key to success"
- School hours: Monday–Thursday 07:30–15:30, Friday 07:30–13:30
- Grades: Grade 8 to Grade 12
- The school has boarding facilities (hostel) available.
- 2026 admissions are CLOSED. 2027 applications are currently OPEN for both general and boarding admissions.

Be warm, clear and concise. Always encourage. If you are unsure about something very specific, direct them to call or email the school.`;

async function askGemini(userMessage: string): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    console.warn('[Chatbot] GEMINI_API_KEY not configured');
    return 'The assistant is not configured yet. Please contact the school directly at 082 768 8305 or admin@mvenyanehighschool.com.';
  }

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

  for (const model of models) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          maxOutputTokens: 1000,
        },
      });

      const text = response.text?.trim();
      if (!text) continue;
      return text;
    } catch (err: any) {
      console.error(`[Chatbot] Gemini (${model}) failed:`, err?.message || err);
      if (err?.message?.includes('API key') || err?.status === 403) {
        return 'The assistant is temporarily unavailable. Please contact the school directly at 082 768 8305 or admin@mvenyanehighschool.com.';
      }
    }
  }

  return 'I\'m having trouble connecting right now. Please contact the school directly at 082 768 8305 or admin@mvenyanehighschool.com.';
}

// ── Main ChatbotWidget ───────────────────────────────────────────────────────
export function ChatbotWidget(props: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(props.defaultOpen));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLang>('eng');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'bot',
      createdAt: Date.now(),
      text: "Welcome to Mvenyane Senior Secondary School!\n\n2027 applications are now OPEN for both general and boarding admissions.\n\nI can help you with applications, required documents, boarding info, school fees, results and more. How can I assist you today?",
    },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (showLangMenu) setShowLangMenu(false);
        else setOpen(false);
      }
    }
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, showLangMenu]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    if (showLangMenu) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showLangMenu]);

  const apps = useMemo(() => {
    try { return getApplications(); } catch { return []; }
  }, [open]);

  const showQuickQuestions = messages.length <= 1 && !isTyping;

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', text, createdAt: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 1. Local application status lookup
      const statusQ = parseStatusQuery(text);
      if (statusQ) {
        const app = findApplication(apps, statusQ);
        const replyText = app
          ? `I found the application for ${app.firstName} ${app.lastName} (Student number: ${app.studentNumber}). Status: ${app.status}.${app.submittedDate ? ` Submitted: ${formatDate(app.submittedDate)}.` : ''}`
          : 'I could not find a matching application. Please double-check the student number or learner name and date of birth.';
        setMessages((prev) => [...prev, { id: uid(), role: 'bot', text: replyText, createdAt: Date.now() }]);
        setIsTyping(false);
        return;
      }

      // 2. Detect language
      const detectedLang = await detectLanguage(text);
      setCurrentLang(detectedLang);

      // 3. Translate to English if needed
      const englishText = detectedLang !== 'eng'
        ? await translateText(text, detectedLang, 'eng')
        : text;

      // 4. Ask Gemini AI
      const englishReply = await askGemini(englishText);

      // 5. Translate reply back if needed
      const finalReply = detectedLang !== 'eng'
        ? await translateText(englishReply, 'eng', detectedLang)
        : englishReply;

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: finalReply,
          createdAt: Date.now(),
          detectedLang: detectedLang !== 'eng' ? LANG_LABELS[detectedLang] : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'bot',
          text: 'Something went wrong. Please contact the school at 082 768 8305.',
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes mh-chat-in {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .mh-chat-window { animation: mh-chat-in 0.2s cubic-bezier(0.34, 1.1, 0.64, 1) both; }
      `}</style>

      {/* ── Chat window ── */}
      {open && (
        <div
          className="mh-chat-window fixed z-50
            bottom-[4.5rem] right-3
            sm:bottom-24 sm:right-6
            w-[calc(100vw-1.5rem)] max-w-[375px]
            h-[min(70vh,560px)]
            bg-white rounded-2xl shadow-2xl border border-gray-200
            flex flex-col overflow-hidden"
          role="dialog"
          aria-label="School help desk chatbot"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-school-green text-white shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm leading-tight truncate">Mvenyane SSS Assistant</div>
                <div className="flex items-center gap-1 text-[11px] text-white/70 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block animate-pulse" />
                  Online · AI-powered
                  {currentLang !== 'eng' && <span className="ml-1">· {LANG_LABELS[currentLang]}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Language dropdown */}
              <div className="relative" ref={langMenuRef}>
                <button
                  onClick={() => setShowLangMenu((v) => !v)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold"
                  aria-label="Change language"
                >
                  <Globe size={11} />
                  <span>{LANG_LABELS[currentLang].split(' ')[0]}</span>
                  <ChevronDown size={10} className={`transition-transform duration-150 ${showLangMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 min-w-[130px]">
                    {(Object.entries(LANG_LABELS) as [SupportedLang, string][]).map(([code, label]) => (
                      <button
                        key={code}
                        onClick={() => { setCurrentLang(code); setShowLangMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                          currentLang === code
                            ? 'bg-school-green text-white font-bold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chatbot"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50 scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-1.5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {m.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-school-green flex items-center justify-center shrink-0 mb-0.5">
                    <Sparkles size={11} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-school-green text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {m.text}
                  {m.detectedLang && (
                    <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Globe size={9} /> Detected: {m.detectedLang}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-end gap-1.5">
                <div className="w-6 h-6 rounded-full bg-school-green flex items-center justify-center shrink-0">
                  <Sparkles size={11} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick questions — first load only */}
            {showQuickQuestions && (
              <div className="pt-1">
                <p className="text-[11px] text-gray-400 text-center mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-school-green/25 text-school-green hover:bg-school-green hover:text-white transition-colors font-medium shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-school-green/20 focus:border-school-green/40 transition-all bg-gray-50 placeholder:text-gray-400"
                placeholder="Ask me anything about the school…"
                aria-label="Chat input"
                disabled={isTyping}
              />
              <button
                onClick={() => send()}
                disabled={isTyping || !input.trim()}
                className="bg-school-green hover:bg-school-green/90 text-white px-3 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              AI-powered · English · isiXhosa · isiZulu · Sesotho
            </p>
          </div>
        </div>
      )}

      {/* ── Toggle FAB ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed z-50 bottom-4 right-3 sm:bottom-6 sm:right-6
          w-14 h-14 rounded-full shadow-xl
          bg-school-green hover:bg-school-green/90
          text-white flex items-center justify-center
          transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={open ? 'Close chatbot' : 'Open chatbot'}
      >
        <div className="relative">
          {open ? (
            <X size={22} />
          ) : (
            <>
              <MessageCircle size={22} />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
            </>
          )}
        </div>
      </button>
    </>
  );
}
