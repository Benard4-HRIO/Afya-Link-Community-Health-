import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaComments,
  FaPaperPlane,
  FaHeadset,
  FaRobot
} from 'react-icons/fa';

const MessageBubble = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg p-3 text-sm ${
          isOwn
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white/20 backdrop-blur-sm text-white border border-white/20'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.message}</div>
        {message.createdAt && (
          <div
            className={`mt-1 text-[10px] ${
              isOwn ? 'text-blue-100' : 'text-blue-200'
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

const MentalHealth = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('counselor');
  
  // Session-based chat state
  const [sessionId, setSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isAnonymous] = useState(true);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // AI Chatbot state
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionId, aiMessages]);

  // ---------------------------
  // SESSION-BASED CHAT
  // ---------------------------
  const startSessionMutation = useMutation(
    (payload) => axios.post('/api/mental-health/start-session', payload),
    {
      onSuccess: (res) => {
        setSessionId(res.data.sessionId);
      },
      onError: (error) => {
        console.error('Failed to start session:', error);
        alert('Failed to start chat session. Please try again.');
      }
    }
  );

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery(
    ['mh-messages', sessionId],
    async () => {
      const res = await axios.get(`/api/mental-health/sessions/${sessionId}/messages`, {
        params: { limit: 100 }
      });
      return res.data.messages;
    },
    { enabled: !!sessionId, refetchInterval: 4000 }
  );

  const messages = messagesData || [];

  const sendMessageMutation = useMutation(
    (payload) => axios.post(`/api/mental-health/sessions/${sessionId}/messages`, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mh-messages', sessionId]);
        setInput('');
        scrollToBottom();
      },
      onError: (error) => {
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
      }
    }
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;
    sendMessageMutation.mutate({ message: input.trim(), senderType: 'user' });
  };

  // ---------------------------
  // AI CHATBOT CHAT
  // ---------------------------
  const handleAISend = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = { sender: 'user', message: aiInput };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput('');

    try {
      setLoadingAI(true);
      const res = await axios.post('/api/chat/send', { message: aiInput });
      const reply =
        res.data?.reply ||
        res.data?.botMessage?.message ||
        res.data?.botMessage?.text ||
        'Sorry, no reply received.';

      const botMessage = { sender: 'bot', message: reply };
      setAiMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      const errMsg = {
        sender: 'bot',
        message: '⚠️ Something went wrong. Please try again.'
      };
      setAiMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoadingAI(false);
    }
  };

  // ---------------------------
  // Assessments & Resources
  // ---------------------------
  const { data: assessments, isLoading: loadingAssessments } = useQuery(
    'mh-assessments',
    async () => (await axios.get('/api/mental-health/assessments')).data
  );

  const { data: resources, isLoading: loadingResources } = useQuery(
    'mh-resources',
    async () => (await axios.get('/api/mental-health/resources')).data
  );

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mental Health Support
          </h1>
          <p className="text-blue-100">
            Start an anonymous chat, talk to our AI chatbot, take self-assessments, and find local resources.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg h-[600px] flex flex-col">
              {/* Custom Tabs Header */}
              <div className="flex border-b border-white/20">
                <button
                  onClick={() => setActiveTab('counselor')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'counselor'
                      ? 'bg-white/10 text-white border-b-2 border-blue-400'
                      : 'text-blue-200 hover:bg-white/5'
                  }`}
                >
                  <FaHeadset className="inline mr-2" />
                  Counselor Chat
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-white/10 text-white border-b-2 border-blue-400'
                      : 'text-blue-200 hover:bg-white/5'
                  }`}
                >
                  <FaRobot className="inline mr-2" />
                  AI Chatbot
                </button>
              </div>

              {/* Counselor Chat Tab */}
              {activeTab === 'counselor' && (
                <>
                  <div className="border-b border-white/20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FaComments className="text-blue-300" />
                      <h3 className="text-lg font-semibold text-white">Anonymous Chat</h3>
                    </div>
                    {!sessionId && (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-50"
                        onClick={() =>
                          startSessionMutation.mutate({ isAnonymous, priority, topic })
                        }
                        disabled={startSessionMutation.isLoading}
                      >
                        {startSessionMutation.isLoading ? 'Starting…' : 'Start Session'}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
                    {!sessionId ? (
                      <div className="max-w-lg mx-auto text-center text-blue-100 mt-20">
                        <FaHeadset className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                        <p className="mb-4">
                          Start an anonymous session. A counselor or volunteer will respond shortly.
                        </p>
                        <div className="space-y-4 text-left">
                          <div>
                            <label className="block text-sm font-medium mb-1">Topic (Optional)</label>
                            <input
                              type="text"
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200"
                              placeholder="e.g., Stress, Anxiety, Depression"
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select
                              className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white"
                              value={priority}
                              onChange={(e) => setPriority(e.target.value)}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : isLoadingMessages ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        {messages.map((m) => (
                          <MessageBubble key={m.id} message={m} isOwn={m.senderType === 'user'} />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  <div className="border-t border-white/20 px-6 py-4 bg-white/5">
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder={sessionId ? 'Type your message…' : 'Start a session to chat'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={!sessionId || sendMessageMutation.isLoading}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!sessionId || !input.trim()}
                      >
                        <FaPaperPlane />
                      </button>
                    </form>
                  </div>
                </>
              )}

              {/* AI Chatbot Tab */}
              {activeTab === 'ai' && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/5">
                    {aiMessages.length === 0 ? (
                      <div className="text-center text-blue-100 mt-20">
                        <FaRobot className="w-10 h-10 mx-auto mb-3 text-blue-300" />
                        <p>Ask me anything about mental wellness, stress, or coping tips.</p>
                      </div>
                    ) : (
                      <>
                        {aiMessages.map((msg, idx) => (
                          <MessageBubble key={idx} message={msg} isOwn={msg.sender === 'user'} />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                    {loadingAI && (
                      <div className="text-center text-blue-200 italic">AI is typing...</div>
                    )}
                  </div>
                  
                  <div className="border-t border-white/20 px-6 py-4 bg-white/5">
                    <form onSubmit={handleAISend} className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        placeholder="Ask something…"
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        disabled={loadingAI}
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 disabled:opacity-50"
                        disabled={!aiInput.trim() || loadingAI}
                      >
                        <FaPaperPlane />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar - Assessments & Resources */}
          <div className="lg:col-span-1 space-y-8">
            {/* Self-Assessment Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Self-Assessments</h3>
              {loadingAssessments ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {assessments?.map((assessment) => (
                    <button
                      key={assessment.id}
                      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg p-4 transition-colors"
                    >
                      <h4 className="font-semibold text-white">{assessment.title}</h4>
                      <p className="text-sm text-blue-200 mt-1">{assessment.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Local Resources</h3>
              {loadingResources ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {resources?.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white/5 border border-white/20 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-white">{resource.name}</h4>
                      <p className="text-sm text-blue-200 mt-1">{resource.description}</p>
                      {resource.phone && (
                        <p className="text-sm text-blue-300 mt-2">📞 {resource.phone}</p>
                      )}
                      {resource.address && (
                        <p className="text-sm text-blue-300">📍 {resource.address}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentalHealth;