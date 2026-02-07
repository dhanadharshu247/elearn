import React from 'react';
import { Search, Filter, Play, Award } from 'lucide-react';
import Button from '../../components/ui/Button';

const MyCourses = () => {
    // Mock Data
    const courses = [
        { id: 1, title: "Advanced React Patterns", instructor: "Sarah Drasner", progress: 65, total: 24, completed: 15, status: "In Progress", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
        { id: 2, title: "UI/UX Principles", instructor: "Gary Simon", progress: 30, total: 12, completed: 4, status: "In Progress", image: "https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
        { id: 3, title: "Node.js Microservices", instructor: "Fernando Doglio", progress: 0, total: 20, completed: 0, status: "Not Started", image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
        { id: 4, title: "Figma Mastery", instructor: "Mizko", progress: 10, total: 15, completed: 1, status: "In Progress", image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
        { id: 5, title: "Web Accessibility (a11y)", instructor: "Marcy Sutton", progress: 100, total: 8, completed: 8, status: "Completed", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" },
    ];

    return (
        <div className="space-y-8 font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Courses</h1>
                    <p className="text-slate-500 mt-1">Manage and track your enrolled content.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter courses..."
                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group">
                        <div className="h-40 overflow-hidden relative">
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {course.status === 'Completed' && (
                                <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur text-indigo-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Award className="w-3 h-3" /> Completed
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>

                            <div className="mt-auto">
                                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                                    <span>{course.progress}% Complete</span>
                                    <span>{course.completed}/{course.total}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full rounded-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>

                                <Button
                                    className={`w-full py-2 text-sm rounded-lg ${course.status === 'Completed'
                                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            : 'bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                >
                                    {course.status === 'Completed' ? 'Review Course' : 'Continue Learning'}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
