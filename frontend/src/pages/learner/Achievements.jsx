import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Award, Trophy, Star, Shield, Lock, CheckCircle } from 'lucide-react';

const Achievements = () => {
    const [badges, setBadges] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [badgesRes, batchesRes] = await Promise.all([
                    api.get('/users/me/badges'),
                    api.get('/batches')
                ]);
                setBadges(badgesRes.data);
                setBatches(batchesRes.data);
            } catch (error) {
                console.error('Data fetch error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    // Helper to get batch styling
    const getBatchStyle = (name) => {
        if (name.includes('Diamond')) return 'bg-cyan-50 text-cyan-700 border-cyan-100 shadow-cyan-100';
        if (name.includes('Gold')) return 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-100';
        if (name.includes('Silver')) return 'bg-slate-50 text-slate-700 border-slate-200 shadow-slate-100';
        if (name.includes('Bronze')) return 'bg-orange-50 text-orange-700 border-orange-100 shadow-orange-100';
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-indigo-100';
    };

    return (
        <div className="space-y-12 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Achievements</h1>
                    <p className="text-slate-500 mt-2 text-lg">Your hard work and dedication in one place.</p>
                </div>
                <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-2xl bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center">
                            <Award className={`w-6 h-6 ${i === 1 ? 'text-yellow-500' : i === 2 ? 'text-indigo-400' : 'text-emerald-400'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Batches Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Performance Batches</h2>
                </div>
                {batches.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-slate-200">
                        <Star className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No performance batches earned yet. Ace your quizzes to get assigned!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {batches.map((batch) => (
                            <div key={batch.id} className={`p-6 rounded-[2rem] border-2 shadow-xl shadow-opacity-5 transition-transform hover:-translate-y-1 ${getBatchStyle(batch.name)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-white/50 rounded-2xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Level Earned</span>
                                </div>
                                <h3 className="font-black text-xl mb-1">{batch.name} Batch</h3>
                                <p className="text-sm opacity-70 font-medium italic">Course Performance Milestone</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Graduation Badges Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-slate-800">Graduation Badges</h2>
                </div>
                {badges.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-10 text-center border border-dashed border-slate-200">
                        <Lock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">Complete courses to unlock your graduation badges.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {badges.map((badge) => (
                            <div key={badge.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Award className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                                        <CheckCircle className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{badge.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    {badge.description}
                                </p>
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">Course Complete</span>
                                    <span className="text-[10px] font-bold text-slate-400">Verified</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Achievements;
