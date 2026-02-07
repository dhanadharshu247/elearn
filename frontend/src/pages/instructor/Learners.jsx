import React from 'react';
import { Search, Filter, MoreVertical, Mail, CheckCircle, Clock } from 'lucide-react';

const Learners = () => {
    // Mock Data
    const learners = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', course: 'React Fundamentals', progress: 75, status: 'Active', lastActive: '2 hours ago', avatar: 'A' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', course: 'Advanced Node.js', progress: 45, status: 'Inactive', lastActive: '3 days ago', avatar: 'B' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', course: 'UI/UX Design', progress: 90, status: 'Completed', lastActive: '1 week ago', avatar: 'C' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', course: 'Python for Data Science', progress: 30, status: 'Active', lastActive: '5 hours ago', avatar: 'D' },
        { id: 5, name: 'Evan Wright', email: 'evan@example.com', course: 'Mobile App Dev', progress: 10, status: 'Active', lastActive: '1 day ago', avatar: 'E' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700';
            case 'Inactive': return 'bg-slate-100 text-slate-600';
            case 'Completed': return 'bg-indigo-100 text-indigo-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

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
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all text-slate-700 placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-semibold text-slate-900">Total:</span> {learners.length} Students
                    </div>
                </div>

                {/* Table/List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100/50">
                                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {learners.map((learner) => (
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
                </div>

                {/* Pagination (Mock) */}
                <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="text-xs font-medium text-slate-500">
                        Showing <span className="text-slate-900 font-bold">1-5</span> of <span className="text-slate-900 font-bold">50</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Learners;
