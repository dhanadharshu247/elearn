import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, Filter, MoreVertical, Mail, CheckCircle, Clock } from 'lucide-react';

const Learners = () => {
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLearners = async () => {
            try {
                const response = await api.get('/courses/my-learners');
                const formatted = response.data.map(learner => ({
                    ...learner,
                    course: learner.courses && learner.courses.length > 0 ? learner.courses.join(', ') : 'None'
                }));
                setLearners(formatted);
            } catch (err) {
                console.error('Failed to fetch learners:', err);
                setError('Failed to load learners');
            } finally {
                setLoading(false);
            }
        };

        fetchLearners();
    }, []);

    const filteredLearners = learners.filter(learner =>
        learner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Inactive': return 'bg-slate-100 text-slate-600';
            case 'Completed': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (loading) return <div className="p-8">Loading learners...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 fade-in">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Learners
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Track student progress and engagement across all created courses.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">
                        <Mail className="w-4 h-4" /> Message All
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/60 overflow-hidden animate-fade-in-up">
                {/* Toolbar */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search learners by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">Total:</span> {filteredLearners.length} Students
                    </div>
                </div>

                {/* Table/List */}
                <div className="overflow-x-auto">
                    {filteredLearners.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No learners found matching your search.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100/50">
                                    <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Badges</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredLearners.map((learner) => (
                                    <tr key={learner.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                                                    {learner.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{learner.name}</p>
                                                    <p className="text-sm text-slate-500 font-medium">{learner.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-700">
                                            {learner.course}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                                                    <span>{learner.progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 group-hover:from-indigo-400 group-hover:to-violet-400 transition-all duration-1000 ease-out"
                                                        style={{ width: `${learner.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-wrap gap-2">
                                                {learner.badges && learner.badges.length > 0 ? (
                                                    learner.badges.map((badge, idx) => (
                                                        <span key={idx} className={`px-2 py-1 rounded text-xs font-bold border ${badge === 'Legend' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                            badge === 'Newbie' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}>
                                                            {badge === 'Legend' ? '👑 ' : ''}{badge}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getStatusColor(learner.status)}`}>
                                                {learner.status === 'Completed' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                                {learner.status === 'Active' && <Clock className="w-3 h-3 mr-1.5" />}
                                                {learner.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500 font-medium">
                                            {learner.lastActive}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm hover:shadow-md">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination (Mock) */}
                <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-500">
                        Showing <span className="text-slate-900 font-bold">1-{learners.length}</span> of <span className="text-slate-900 font-bold">{learners.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learners;
