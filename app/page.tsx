// 文件路径: app/page.tsx
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
  
  // 用于追踪鼠标位置以控制机器人眼珠
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 计算鼠标在屏幕上的相对位置，转化为眼珠的偏移量 (最大偏移约 6px)
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
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
      
      {/* 聊天框弹窗 */}
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

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '12px' }}>
                <span style={{
                  background: msg.role === 'user' ? '#0070f3' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  maxWidth: '85%',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap' // 确保分段显示正常
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

      {/* 悬浮的可爱机器人 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '80px',
          height: '100px',
          float: 'right',
          cursor: 'pointer',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transformOrigin: 'bottom center'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="80" height="100" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
          {/* 天线 */}
          <line x1="40" y1="20" x2="40" y2="5" stroke="#94a3b8" strokeWidth="3" />
          <circle cx="40" cy="5" r="4" fill={isOpen ? "#22c55e" : "#ef4444"} />
          
          {/* 身体底座 */}
          <rect x="25" y="70" width="30" height="25" fill="#cbd5e1" rx="4" />
          <path d="M 15 95 L 65 95 L 75 100 L 5 100 Z" fill="#94a3b8" />
          
          {/* 机器人的头 */}
          <rect x="5" y="20" width="70" height="55" fill="#0070f3" rx="16" />
          <rect x="15" y="30" width="50" height="30" fill="#1e293b" rx="8" />
          
          {/* 眼睛白底 */}
          <circle cx="27" cy="45" r="9" fill="white" />
          <circle cx="53" cy="45" r="9" fill="white" />
          
          {/* 会跟随鼠标移动的黑色眼珠 */}
          <circle cx={27 + pupilOffset.x} cy={45 + pupilOffset.y} r="4" fill="#0f172a" />
          <circle cx={53 + pupilOffset.x} cy={45 + pupilOffset.y} r="4" fill="#0f172a" />
        </svg>
      </div>

    </div>
  );
}