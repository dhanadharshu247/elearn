import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Send, User, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [activeConv, setActiveConv] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const response = await api.get('/messages');
            const msgs = response.data;
            setMessages(msgs);

            // Group by conversation
            const convMap = {};
            msgs.forEach(m => {
                const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
                if (!convMap[otherId]) {
                    convMap[otherId] = {
                        userId: otherId,
                        lastMessage: m.content,
                        time: m.created_at,
                        unread: !m.is_read && m.receiver_id === user.id
                    };
                }
            });
            setConversations(Object.values(convMap));
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConv) return;

        try {
            const response = await api.post('/messages', {
                receiver_id: activeConv.userId,
                content: newMessage
            });
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            fetchMessages(); // Refresh conversations list
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const filteredMessages = activeConv
        ? messages.filter(m => m.sender_id === activeConv.userId || m.receiver_id === activeConv.userId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        : [];

    return (
        <div className="flex h-[calc(100vh-10rem)] bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col">
                <div className="p-6 border-b border-slate-50">
                    <h2 className="text-xl font-bold text-slate-900">Messages</h2>
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="pl-9 pr-4 py-2 w-full text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    {loading ? (
                        <div className="p-4 text-center text-slate-400">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-slate-400">No conversations yet.</div>
                    ) : conversations.map((conv) => (
                        <button
                            key={conv.userId}
                            onClick={() => setActiveConv(conv)}
                            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${activeConv?.userId === conv.userId ? 'bg-indigo-50 text-indigo-900' : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="font-bold truncate">User {conv.userId}</p>
                                <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                            </div>
                            {conv.unread && <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50/30">
                {activeConv ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                <User className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900">User {activeConv.userId}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {filteredMessages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${m.sender_id === user?.id
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-white text-slate-900 border border-slate-100 rounded-bl-none'
                                        }`}>
                                        <p className="text-sm">{m.content}</p>
                                        <p className={`text-[10px] mt-1 ${m.sender_id === user?.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/10"
                            />
                            <button
                                type="submit"
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                        <MessageSquare className="w-16 h-16 opacity-20" />
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
