'use client';
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

type Message = {
  role: 'ai' | 'user';
  content: string;
};

export default function ChatWidget() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! How can I help you today? / 您好！有什么我可以帮您？' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rawX = (e.clientX / window.innerWidth - 1) * 10;
      const rawY = (e.clientY / window.innerHeight - 1) * 10;
      
      const x = Math.max(-7, Math.min(0, rawX));
      const y = Math.max(-7, Math.min(0, rawY));
      
      setPupilOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok || typeof data.reply !== 'string') {
        throw new Error(data.error || 'Network error');
      }

      setMessages([...newMessages, { role: 'ai', content: data.reply }]);
    } catch (error) {
      console.error('Chat request error:', error);
      setMessages([...newMessages, { role: 'ai', content: '（Network error / 网络错误）' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      
      {isOpen && (
        <div style={{
          width: '350px',
          height: '500px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          marginBottom: '16px',
          border: '1px solid #eaeaea',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ backgroundColor: '#0070f3', color: 'white', padding: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Synmac AI Support</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✖</button>
          </div>

          {/* 
            Update 1: Changed backgroundColor from '#f9f9f9' to '#e4e4e7' 
            to create contrast against the white bot bubbles.
          */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#e4e4e7' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '12px' }}>
                <span style={{
                  background: msg.role === 'user' ? '#0070f3' : '#ffffff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Slightly stronger shadow
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  // Update 2: Added text-align justify to make the text edges neat
                  textAlign: 'justify'
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
            <input 
              value={input} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} 
              style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }} 
              placeholder="Type your question..." 
              disabled={isLoading}
            />
            <button type="submit" style={{ marginLeft: '8px', padding: '0 16px', borderRadius: '20px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }} disabled={isLoading}>
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* 悬浮机器人 UI */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100px',
          height: '100px',
          float: 'right',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transformOrigin: 'bottom center'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <line x1="50" y1="30" x2="50" y2="10" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
          <circle cx="50" cy="10" r="5" fill={isOpen ? "#22c55e" : "#ef4444"} />
          
          <rect x="35" y="70" width="30" height="25" fill="#cbd5e1" rx="4" />
          <path d="M 25 95 L 75 95 L 85 100 L 15 100 Z" fill="#94a3b8" />
          
          <rect x="15" y="25" width="70" height="55" fill="#0070f3" rx="16" />
          <rect x="25" y="35" width="50" height="30" fill="#1e293b" rx="8" />
          
          <circle cx="37" cy="50" r="9" fill="white" />
          <circle cx="63" cy="50" r="9" fill="white" />
          
          <circle cx={37 + pupilOffset.x} cy={50 + pupilOffset.y} r="4" fill="#0f172a" />
          <circle cx={63 + pupilOffset.x} cy={50 + pupilOffset.y} r="4" fill="#0f172a" />
        </svg>
      </div>

    </div>
  );
}