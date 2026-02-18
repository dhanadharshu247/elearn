import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Trophy, Star, Shield, Lock } from 'lucide-react';

const Achievements = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, batchesRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/batches')
                ]);
                setUser(userRes.data);
                setBatches(batchesRes.data);
            } catch (error) {
                console.error('Data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8">Loading achievements...</div>;

    const badges = user?.badges || [];

    // Helper to get batch styling
    const getBatchStyle = (name) => {
        switch (name) {
            case 'Diamond': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
            case 'Gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Silver': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'Bronze': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

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

            {/* Batches Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">My Batches</h2>
                {batches.length === 0 ? (
                    <p className="text-slate-500 italic">No batches assigned yet. Complete a course to earn a batch!</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map((batch) => (
                            <div key={batch.id} className={`p-4 rounded-xl border-2 flex items-center justify-between ${getBatchStyle(batch.name)}`}>
                                <div>
                                    <h3 className="font-bold text-lg">{batch.name} Batch</h3>
                                    <p className="text-sm opacity-80">Course ID: {batch.course_id}</p>
                                </div>
                                <Award className="w-8 h-8 opacity-80" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mb-4 pt-4">Badges</h2>
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
