// 文件路径: app/page.tsx
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
  const [isOpen, setIsOpen] = useState(false); // 控制聊天框打开/关闭

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
      
      {/* 聊天框 (仅在 isOpen 为 true 时显示) */}
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
          border: '1px solid #eaeaea'
        }}>
          {/* 顶部导航栏 */}
          <div style={{ backgroundColor: '#0070f3', color: 'white', padding: '16px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🤖 AI 客服 (AI Support)</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✖</button>
          </div>

          {/* 聊天记录区域 */}
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
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          {/* 底部输入框 */}
          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
            <input 
              value={input} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} 
              style={{ flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }} 
              placeholder="Type a message..." 
              disabled={isLoading}
            />
            <button type="submit" style={{ marginLeft: '8px', padding: '0 16px', borderRadius: '20px', backgroundColor: '#0070f3', color: 'white', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }} disabled={isLoading}>
              {isLoading ? '...' : '发送'}
            </button>
          </form>
        </div>
      )}

      {/* 悬浮的可爱机器人按钮 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#0070f3',
          border: 'none',
          fontSize: '30px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,112,243,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          float: 'right',
          transition: 'transform 0.2s', // 添加按压动画
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <span style={{color: 'white', fontSize:'20px'}}>✖</span> : '🤖'}
      </button>

    </div>
  );
}