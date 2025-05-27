import React, { useEffect, useState } from 'react';
import Typewriter from './Typewriter';
import './index.css';

const API_URL = 'https://your-api-endpoint.com/chat'; // replace with your real API

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    const typingIndicator = { type: 'bot', isTyping: true };
    setMessages(prev => [...prev, userMessage, typingIndicator]);
    setInput('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { type: 'bot', fullText: data.reply }];
      });
    } catch (error) {
      console.error('API error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { type: 'bot', fullText: '⚠️ Error: Unable to fetch response.' }];
      });
    }
  };

  const clearChat = () => {
    localStorage.removeItem('chatHistory');
    setMessages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            {msg.type === 'bot' && msg.isTyping ? (
              <i>Typing...</i>
            ) : msg.type === 'bot' ? (
              <Typewriter text={msg.fullText} />
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
        <button onClick={clearChat} className="clear-btn">Clear</button>
      </div>
    </div>
  );
};

export default App;