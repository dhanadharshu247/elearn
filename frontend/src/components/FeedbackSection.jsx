import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const FeedbackSection = ({ resultId }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAnalysis, setShowAnalysis] = useState(false);

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!resultId) return;
            try {
                const res = await api.get(`/api/feedback/${resultId}`);
                setFeedback(res.data);
            } catch (err) {
                console.error("Error fetching feedback:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [resultId]);

    if (!resultId) return null;

    if (loading) return (
        <div className="my-8 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100 flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-indigo-600">AI is analyzing your performance...</span>
        </div>
    );

    if (!feedback) return null;

    return (
        <div className="my-8 text-left">
            <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:bg-slate-50 transition-all duration-300 shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-slate-900">Personalized Analysis</h4>
                        <p className="text-xs text-slate-500 font-medium font-sans">See AI's tailored improvement plan for you</p>
                    </div>
                </div>
                <div className={`transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>

            {showAnalysis && (
                <div className="mt-4 p-8 bg-indigo-600 rounded-[2rem] text-white shadow-2xl shadow-indigo-200 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                            Tutor AI Insights
                        </div>
                    </div>

                    <h5 className="text-2xl font-black mb-4 leading-tight">
                        "{feedback.feedback_text}"
                    </h5>

                    <div className="space-y-4">
                        <div className="h-px bg-white/20 w-full" />
                        <h6 className="text-sm font-black uppercase tracking-widest text-indigo-200">Improvement Plan</h6>
                        <div className="text-indigo-50 font-medium leading-relaxed whitespace-pre-line">
                            {feedback.improvement_areas}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackSection;
