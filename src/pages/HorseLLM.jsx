import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

const LOADING_PUNS = [
  "Saddling up the neurons...",
  "Galloping through the data...",
  "Checking the hay-stacks...",
  "Consulting the horse whisperer...",
  "Trotting through past performances...",
  "Measuring hoofprints in the data...",
  "Reining in the insights...",
  "Clearing the last furlong...",
  "Warming up in the paddock...",
  "Feeding the algorithm some oats...",
  "Horsing around with the numbers...",
  "Unbridled analysis in progress...",
  "Hold your horses...",
  "Cantering through GPS coordinates...",
  "Mane-lining the important stats...",
  "Stirrup some predictions...",
  "Jockeying for the best answer...",
  "No horsing around, almost there...",
  "Running neck and neck with the data...",
  "Putting the cart before the... wait, got it...",
];

const SUGGESTIONS = [
  "Who do you think will win Tampa Bay R7 on March 28?",
  "Which horse has the best closing speed in the Aqueduct R9 field?",
  "I live in Lexington, KY. Any races near me this weekend?",
  "Explain what ground loss means and why it matters",
  "What's the difference between a stalker and a closer?",
  "Which horse is the best value bet this week based on GPS data?",
  "Tell me about Son of a Slew's recent form",
  "What does a stride fade of -6% tell you about a horse?",
];

export default function HorseLLM() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPun, setLoadingPun] = useState(LOADING_PUNS[0]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const punInterval = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingPun]);

  useEffect(() => {
    if (loading) {
      let idx = Math.floor(Math.random() * LOADING_PUNS.length);
      // Advance on a timer only; the first pun is whatever state already holds,
      // so no state is written synchronously during the effect.
      punInterval.current = setInterval(() => {
        idx = (idx + 1) % LOADING_PUNS.length;
        setLoadingPun(LOADING_PUNS[idx]);
      }, 2200);
    } else {
      clearInterval(punInterval.current);
    }
    return () => clearInterval(punInterval.current);
  }, [loading]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Send only user/assistant messages; the server builds the RAG context
      const chatMessages = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Whoa there, too many questions at once! Give me a moment to catch my breath.' }]);
      } else if (res.status === 400) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error || 'Invalid request. Try a shorter question.' }]);
      } else if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Try again.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px clamp(18px, 4vw, 32px) 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 0px)' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div className="label" style={{ color: '#C59757', marginBottom: 14, fontSize: 16 }}>AI Assistant</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 500, color: '#D6D1CC', marginBottom: 10 }}>
          Horse<span style={{ color: '#C59757' }}>LLM</span>
        </h1>
        <p style={{ fontSize: 20, color: '#8A847E', lineHeight: 1.6 }}>
          Ask anything about horses, races, GPS data, or betting insights. Powered by 12,919 horse profiles and real GPS telemetry.
        </p>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, paddingRight: 8 }}>
        {messages.length === 0 && (
          <div style={{ paddingTop: 20 }}>
            <div style={{ fontSize: 19, color: '#8A847E', marginBottom: 24 }}>Try asking:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="card" style={{
                    padding: '14px 20px', cursor: 'pointer', fontSize: 18,
                    color: '#8A847E', background: '#141A10', textAlign: 'left',
                    transition: 'all 250ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#D6D1CC'; e.currentTarget.style.borderColor = 'rgba(197,151,87,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8A847E'; e.currentTarget.style.borderColor = ''; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 16, display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '85%', padding: '14px 18px', borderRadius: 3,
              background: msg.role === 'user' ? 'rgba(197,151,87,0.1)' : '#141A10',
              border: msg.role === 'user' ? '1px solid rgba(197,151,87,0.15)' : '1px solid rgba(197,151,87,0.06)',
            }}>
              {msg.role === 'assistant' && (
                <div style={{ fontSize: 10, color: '#C59757', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                  HorseLLM
                </div>
              )}
              <div style={{ fontSize: 17, color: '#D6D1CC', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: '16px 18px', maxWidth: '85%' }}>
            <div style={{
              padding: '16px 20px', borderRadius: 3,
              background: '#141A10', border: '1px solid rgba(197,151,87,0.06)',
            }}>
              <div style={{ fontSize: 10, color: '#C59757', fontFamily: 'var(--font-mono)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>
                HorseLLM
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Loader2 style={{ width: 16, height: 16, color: '#C59757', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={loadingPun}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    style={{ fontSize: 16, color: '#8A847E', fontStyle: 'italic' }}
                  >
                    {loadingPun}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ flexShrink: 0, paddingBottom: 24 }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 20px', borderRadius: 3,
            background: '#141A10', border: '1px solid rgba(197,151,87,0.1)',
          }}>
          <input ref={inputRef} type="text" value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about horses, races, GPS data..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 16, color: '#D6D1CC', fontFamily: 'var(--font-sans)' }}
          />
          <button type="submit" disabled={loading || !input.trim()}
            style={{
              width: 38, height: 38, borderRadius: 3, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: input.trim() ? 'rgba(197,151,87,0.15)' : 'transparent',
              border: input.trim() ? '1px solid rgba(197,151,87,0.2)' : '1px solid rgba(197,151,87,0.06)',
              color: input.trim() ? '#C59757' : '#8A847E',
              transition: 'all 250ms',
            }}>
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
