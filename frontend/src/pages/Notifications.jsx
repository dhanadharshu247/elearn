import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'course_launch': return <Bell className="w-5 h-5 text-indigo-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                    {notifications.filter(n => !n.is_read).length} Unread
                </span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-5 rounded-2xl border transition-all ${n.is_read ? 'bg-white border-slate-100 opacity-75' : 'bg-white border-indigo-100 shadow-md shadow-indigo-500/5'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className={`p-2 rounded-xl bg-slate-50 h-fit`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                        {n.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-1">{n.message}</p>
                                    <span className="text-xs text-slate-400 mt-2 block">
                                        {new Date(n.created_at).toLocaleString()}
                                    </span>
                                </div>
                                {!n.is_read && (
                                    <button
                                        onClick={() => markAsRead(n.id)}
                                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                                    >
                                        Mark as read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
