'use client';
import { useState, FormEvent, ChangeEvent } from 'react';

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
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      overflow: 'hidden'
    }}>
      {/* 头部 (移除了关闭按钮，因为外层网站会处理折叠) */}
      <div style={{ backgroundColor: '#0070f3', color: 'white', padding: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
        <span>Synmac AI Support</span>
      </div>

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
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
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
          style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', fontSize: '14px' }} 
          placeholder="Type your question..." 
          disabled={isLoading}
        />
        <button type="submit" style={{ marginLeft: '8px', padding: '0 16px', borderRadius: '20px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold' }} disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}