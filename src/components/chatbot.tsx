'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

type ChatMessage = {
  sender: 'user' | 'bot';
  text: string;
};

const ChatbotPage = () => {
  const socket = useSocket();
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setChat((prev) => [...prev, { sender: 'user', text: input }]);
    socket?.emit('chat-message', input);
    setInput('');
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('bot-reply', (message: string) => {
      setChat((prev) => [...prev, { sender: 'bot', text: message }]);
    });

    return () => {
      socket.off('bot-reply');
    };
  }, [socket]);

  return (
    <div className="min-h-screen  from-purple-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white text-center">
          <h2 className="text-3xl font-bold">🤖 ChatBot</h2>
          <p className="text-sm">Let&apos;s talk! I&apos;m here to help.</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 scroll-smooth h-[400px]">
          {chat.map((msg, idx) => (
            <div key={idx} className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md transition-all duration-300 ease-in-out ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={sendMessage}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-full font-semibold hover:scale-105 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
