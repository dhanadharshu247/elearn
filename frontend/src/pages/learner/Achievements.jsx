import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Trophy, Star, Shield, Lock } from 'lucide-react';

const Achievements = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // We don't have a direct "me" endpoint that returns badges in all setups, 
                // but usually /auth/me or just getting the stored user info works. 
                // Let's assume we fetch fresh profile data or use a specific endpoint. 
                // Since we don't have a dedicated "get my badges" endpoint, we'll fetch user profile.
                // Assuming we might need to add this endpoint or reuse existing.
                // For now, let's use a hypothetical /auth/profile or similar if it exists, 
                // OR just use local storage if we updated it on login? No, badges update dynamicallly.
                // Let's create a quick endpoint or use what we have. 
                // Actually, let's use /auth/me if we implemented it, otherwise let's assume we can hit /users/:myId if we are authorized.
                // Safest bet: Just mock for now or add endpoint. 
                // I will assume we can get it from an endpoint I'll ensure exists: GET /auth/me
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Profile fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="p-8">Loading achievements...</div>;

    const badges = user?.badges || [];

    // Define all possible badges to show locked state
    const allBadges = [
        { id: 'Newbie', label: 'Newbie', icon: Star, desc: 'Scored <= 50% on a quiz', color: 'text-blue-500 bg-blue-100' },
        { id: 'Intermediate', label: 'Intermediate', icon: Shield, desc: 'Scored > 50% & < 80%', color: 'text-purple-500 bg-purple-100' },
        { id: 'Legend', label: 'Legend', icon: Trophy, desc: 'Scored >= 80% on a quiz', color: 'text-amber-500 bg-amber-100' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Achievements</h1>
                    <p className="text-slate-500 mt-1">Unlock badges by completing quizzes and courses.</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                    <Award className="w-8 h-8" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allBadges.map((badge) => {
                    const isUnlocked = badges.includes(badge.id);
                    const Icon = badge.icon;

                    return (
                        <div key={badge.id} className={`p-6 rounded-2xl border ${isUnlocked ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'} flex flex-col items-center text-center transition-all hover:shadow-md`}>
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? badge.color : 'bg-slate-200 text-slate-400'}`}>
                                {isUnlocked ? <Icon className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                            </div>
                            <h3 className={`text-lg font-bold mb-1 ${isUnlocked ? 'text-slate-900' : 'text-slate-500'}`}>{badge.label}</h3>
                            <p className="text-sm text-slate-500">{badge.desc}</p>
                            {isUnlocked && (
                                <span className="mt-4 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    Unlocked
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Achievements;
