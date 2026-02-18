import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Search, User, MoreVertical } from 'lucide-react';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeChat) {
            // In a real app, we would fetch messages specific to this conversation
            // For this simple implementation, we filter the global messages list
            // or fetch all messages and filter client-side if the backend doesn't support conversation-specific fetching yet.
            // Let's assume we fetch all messages for now as per backend implementation.
            fetchMessages();
        }
    }, [activeChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            // For a learner, potential conversations are with instructors of enrolled courses.
            // We can fetch "my-courses" and extract instructors.
            const res = await api.get('/courses/my-courses');
            const courses = res.data;

            // Extract unique instructors
            const instructors = {};
            courses.forEach(c => {
                if (c.instructor && c.instructor.id) {
                    instructors[c.instructor.id] = c.instructor;
                }
            });

            setConversations(Object.values(instructors));
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!activeChat) return;
        try {
            const res = await api.get('/messages');
            // Filter messages between current user and activeChat (instructor)
            const chatMessages = res.data.filter(m =>
                (m.sender_id === user.id && m.receiver_id === activeChat.id) ||
                (m.sender_id === activeChat.id && m.receiver_id === user.id)
            );
            // Sort by date
            chatMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setMessages(chatMessages);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        try {
            const msgData = {
                content: newMessage,
                receiver_id: activeChat.id
            };

            // Optimistic update
            const tempMsg = {
                id: Date.now(),
                sender_id: user.id,
                receiver_id: activeChat.id,
                content: newMessage,
                created_at: new Date().toISOString(),
                is_read: false
            };
            setMessages([...messages, tempMsg]);
            setNewMessage('');

            await api.post('/messages', msgData);
            // Re-fetch to confirm and get real ID/timestamp if needed
            fetchMessages();
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message");
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            {/* Sidebar / Conversation List */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search instructors..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500 text-sm">Loading instructors...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <p className="text-sm">No instructors found.</p>
                            <p className="text-xs mt-2">Enroll in a course to message instructors.</p>
                        </div>
                    ) : (
                        conversations.map(instructor => (
                            <button
                                key={instructor.id}
                                onClick={() => setActiveChat(instructor)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-slate-50 ${activeChat?.id === instructor.id ? 'bg-white border-l-4 border-l-indigo-600 shadow-sm' : 'border-l-4 border-l-transparent'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                    {instructor.name ? instructor.name[0] : 'I'}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${activeChat?.id === instructor.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {instructor.name || 'Instructor'}
                                    </h3>
                                    <p className="text-xs text-slate-500 truncate">{instructor.email}</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                    {activeChat.name ? activeChat.name[0] : 'I'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{activeChat.name || 'Instructor'}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                        <span className="text-xs text-slate-500">Online</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500">Start a conversation with {activeChat.name}</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === user?.id; // Assuming user.id is available from AuthContext
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${isMe ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-200 text-slate-600'
                                                    }`}>
                                                    {isMe ? 'Me' : (activeChat.name ? activeChat.name[0] : 'I')}
                                                </div>
                                                <div>
                                                    <div className={`p-3 rounded-2xl text-sm ${isMe
                                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-200'
                                                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <p className={`text-[10px] mt-1 text-slate-400 ${isMe ? 'text-right' : 'text-left'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-600">Select a Conversation</h3>
                        <p className="max-w-xs text-center mt-2 text-slate-500">
                            Choose an instructor from the sidebar to start messaging.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
