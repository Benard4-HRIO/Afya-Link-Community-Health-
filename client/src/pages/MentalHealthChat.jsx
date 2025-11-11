import React, { useState, useEffect, useRef } from 'react';

const initialAIResponses = [
  "Hello! I'm here to listen. How are you feeling today?",
  "Thank you for sharing. Can you tell me a bit more about what's on your mind?",
  "I hear you. It's completely okay to feel this way.",
  "You're not alone. Would you like to continue sharing?",
  "I appreciate your openness. Remember, we're here for you.",
];

const MentalHealthChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [msgCount, setMsgCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    let aiMessage;
    if (msgCount < initialAIResponses.length) {
      aiMessage = { sender: 'ai', text: initialAIResponses[msgCount] };
    } else {
      aiMessage = {
        sender: 'ai',
        text: "Thank you for sharing. Our team is here for you, and one of our doctors may reach out to you shortly."
      };
    }

    setMessages(prev => [...prev, aiMessage]);
    setMsgCount(prev => prev + 1);
    setInput('');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Mental Health Chat</h2>
      <div className="mb-4 h-64 overflow-y-auto flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg ${
              msg.sender === 'user' ? 'bg-blue-500 self-end text-white' : 'bg-gray-200 self-start text-gray-900'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-lg focus:outline-none"
        />
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default MentalHealthChat;
