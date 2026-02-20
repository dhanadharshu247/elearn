import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';
import api from '../api/axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your AI Learning Assistant. How can I help you with your courses today?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = { text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const response = await api.post('/api/chat', { message: userMessage.text });
            const aiMessage = { text: response.data.response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = { text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div
                className={`
                    pointer-events-auto
                    bg-white rounded-2xl shadow-2xl border border-slate-200 
                    w-80 sm:w-96 flex flex-col transition-all duration-300 origin-bottom-right
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0 mb-4' : 'opacity-0 scale-95 translate-y-10 h-0 w-0 overflow-hidden'}
                `}
                style={{ maxHeight: 'calc(100vh - 120px)', height: '500px' }}
            >
                {/* Header */}
                <div className="bg-indigo-600 p-4 rounded-t-2xl flex justify-between items-center text-white shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Learning Assistant</h3>
                            <p className="text-xs text-indigo-200">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`
                                max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                                ${msg.sender === 'user'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}
                            `}>
                                {msg.sender === 'ai' && (
                                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                        <Bot className="w-3 h-3" /> AI Assistant
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-1">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 rounded-b-2xl">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ask about your courses..."
                            className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-sm font-medium text-slate-700"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!inputText.trim() || isLoading}
                            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400">AI can make mistakes. Verify important info.</p>
                    </div>
                </form>
            </div>

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    pointer-events-auto
                    p-4 rounded-full shadow-2xl transition-all duration-300 group
                    ${isOpen ? 'bg-slate-800 text-white rotate-90 scale-0 opacity-0' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white scale-100 opacity-100 hover:scale-110'}
                `}
            >
                <div className="relative">
                    <MessageCircle className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-indigo-600"></span>
                    </span>
                </div>
            </button>

            {/* Close button that appears when open, but handled by the main window close button mostly. 
                Actually, the main button disappears when open to avoid clutter, 
                and we rely on the window's close button. 
                Or we can keep a simple close FAB if desired, but window close is better.
             */}
        </div>
    );
};

export default Chatbot;
