import React, { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Mic, MicOff, Bot, User as UserIcon, Loader } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChatMessage, ChatResponse } from '../types';
import { getChatResponse } from '../services/chatService';

const ChatInterface: React.FC = () => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add enhanced welcome message on component mount
    const welcomeMessage: ChatMessage = {
      id: '1',
      content: `🌱 **Welcome to Mudhumeni AI - Your Zimbabwe Farming Expert!**

I'm an AI agricultural advisor specialized in Zimbabwe's farming conditions, climate, and crops. I can help you with:

• **Crop selection & planting** - When and how to plant various crops
• **Pest & disease management** - Identify and treat farming problems  
• **Soil & fertilizer advice** - Improve soil health and nutrition
• **Seasonal planning** - What to do throughout the farming calendar
• **Market guidance** - Crop profitability and selling strategies

**Ask me anything about farming in Zimbabwe!** I understand local conditions, varieties, and challenges specific to our agricultural regions.

Try asking: *"When should I plant maize in Mashonaland?"* or *"How do I control fall armyworm?"*`,
      sender: 'ai',
      timestamp: new Date(),
      confidence: 1.0,
      visualAid: undefined
    };
    setMessages([welcomeMessage]);
    
    // Check API status
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    setApiStatus('checking');
    try {
      // Test API with a simple question
      await getChatResponse('test', {
        questionCount: 0,
        topicsDiscussed: [],
        userExperienceLevel: 'beginner',
        lastTopics: []
      });
      setApiStatus('connected');
    } catch (error) {
      console.error('API status check failed:', error);
      setApiStatus('disconnected');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date(),
      visualAid: undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const userQuestions = messages.filter(m => m.sender === 'user').length;
      const topics = messages
        .filter(m => m.sender === 'ai')
        .map(m => m.content.toLowerCase())
        .flatMap(content => {
          const topicKeywords = [];
          if (content.includes('maize')) topicKeywords.push('maize');
          if (content.includes('tomato')) topicKeywords.push('tomatoes');
          if (content.includes('pest')) topicKeywords.push('pest_control');
          if (content.includes('soil')) topicKeywords.push('soil');
          return topicKeywords;
        });

      const response: ChatResponse = await getChatResponse(currentInput, {
        questionCount: userQuestions,
        topicsDiscussed: Array.from(new Set(topics)),
        userExperienceLevel: 'intermediate', // Could be dynamic based on user profile
        lastTopics: topics.slice(-3)
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
        confidence: response.confidence,
        teachingTip: response.teachingElements?.explanation,
        visualAid: response.teachingElements?.example ? {
          type: 'text',
          content: response.teachingElements.example
        } : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
      setApiStatus('connected');

    } catch (error: any) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I'm having technical difficulties right now. ${error.message || 'Please try again in a moment.'}

In the meantime, I can still help with general farming guidance. What specific farming challenge are you facing?`,
        sender: 'ai',
        timestamp: new Date(),
        confidence: 0.5,
        visualAid: undefined
      };
      setMessages(prev => [...prev, errorMessage]);
      setApiStatus('disconnected');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleRating = (messageId: string, rating: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, rating } : msg
      )
    );
    
    // You could send rating feedback to analytics here
    console.log(`Message ${messageId} rated: ${rating}`);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
    if (!isListening) {
      // Start speech recognition
      console.log('Starting speech recognition...');
    } else {
      // Stop speech recognition
      console.log('Stopping speech recognition...');
    }
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•\s/g, '• ')
      .replace(/\n/g, '<br>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
  };

  const getStatusIndicator = () => {
    switch (apiStatus) {
      case 'connected':
        return <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">🟢 AI Connected</span>;
      case 'disconnected':
        return <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">🔴 AI Disconnected</span>;
      case 'checking':
        return <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">🟡 Connecting...</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.chat.title}</h1>
              <p className="text-sm text-gray-600">Zimbabwe Agricultural AI Expert</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusIndicator()}
            <button
              onClick={checkAPIStatus}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-3`}
            >
              {/* AI Avatar */}
              {message.sender === 'ai' && (
                <div className="flex-shrink-0 bg-green-600 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl shadow-lg ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white ml-12'
                    : 'bg-white text-gray-900 border border-gray-100 mr-12'
                }`}
              >
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                
                {/* Teaching tip */}
                {message.teachingTip && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 text-lg">💡</span>
                      <div>
                        <p className="text-xs font-semibold text-blue-800 mb-1">Why this works:</p>
                        <p className="text-xs text-blue-700">{message.teachingTip}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visual aid/Example */}
                {message.visualAid && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 text-lg">📝</span>
                      <div>
                        <p className="text-xs font-semibold text-green-800 mb-1">Real Example:</p>
                        <p className="text-xs text-green-700">{message.visualAid.content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message metadata */}
                <div className={`flex items-center justify-between mt-3 pt-2 border-t ${
                  message.sender === 'user' ? 'border-green-500' : 'border-gray-200'
                } text-xs ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'}`}>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  
                  {/* Confidence indicator for AI messages */}
                  {message.sender === 'ai' && message.confidence && (
                    <span className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                      <span className="text-gray-600">Confidence:</span>
                      <span className={`font-semibold ${
                        message.confidence > 0.8 ? 'text-green-600' :
                        message.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(message.confidence * 100)}%
                      </span>
                    </span>
                  )}
                </div>

                {/* Rating buttons for AI messages */}
                {message.sender === 'ai' && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Was this helpful?</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRating(message.id, 'up')}
                        className={`p-2 rounded-full transition-all ${
                          message.rating === 'up'
                            ? 'bg-green-100 text-green-600 scale-110'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRating(message.id, 'down')}
                        className={`p-2 rounded-full transition-all ${
                          message.rating === 'down'
                            ? 'bg-red-100 text-red-600 scale-110'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              {message.sender === 'user' && (
                <div className="flex-shrink-0 bg-gray-600 p-2 rounded-full">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Enhanced Loading indicator */}
          {isLoading && (
            <div className="flex justify-start items-start space-x-3">
              <div className="flex-shrink-0 bg-green-600 p-2 rounded-full">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white text-gray-900 shadow-lg border border-gray-100 max-w-xs lg:max-w-2xl px-6 py-4 rounded-2xl mr-12">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    <Loader className="w-4 h-4 inline mr-1 animate-spin" />
                    Analyzing your farming question...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Example questions */}
      {messages.length <= 1 && (
        <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3 font-medium">🌱 Try asking about Zimbabwe farming:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "When should I plant maize in Mashonaland?",
                "How do I control fall armyworm organically?",
                "What's the best fertilizer for tomatoes?",
                "How do I improve clay soil naturally?",
                "When is tobacco planting season?",
                "What varieties of beans grow well here?"
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example)}
                  className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-3 rounded-lg transition-colors border border-gray-200 hover:border-gray-300 text-left"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Input area */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about farming in Zimbabwe..."
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-all"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">Press Enter to send • Shift+Enter for new line</p>
                <div className="flex items-center space-x-2">
                  {apiStatus === 'connected' && (
                    <span className="text-xs text-green-600">✅ AI Ready</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {input.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* Voice input button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading || input.length > 500}
              className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              title="Send message"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;