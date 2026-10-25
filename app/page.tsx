'use client';
import { useState, FormEvent, ChangeEvent } from 'react';

export default function ChatWidget() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'ai', content: '您好，有什么我可以帮您？' }]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      // 防崩溃检查：如果后端返回 500 等错误状态码
      if (!res.ok) {
        throw new Error('网络请求失败');
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', content: '（网络错误，信息未发送成功）' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '10px 0' }}>
            <span style={{ background: msg.role === 'user' ? '#0070f3' : '#eaeaea', color: msg.role === 'user' ? '#fff' : '#000', padding: '8px', borderRadius: '8px', display: 'inline-block', maxWidth: '80%' }}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', marginTop: '10px' }}>
        <input 
          value={input} 
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} 
          style={{ flex: 1, padding: '8px' }} 
          placeholder="输入您的问题..." 
          disabled={isLoading}
        />
        <button type="submit" style={{ padding: '8px' }} disabled={isLoading}>
          {isLoading ? '发送中...' : '发送'}
        </button>
      </form>
    </div>
  );
}