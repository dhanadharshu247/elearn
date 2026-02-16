import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Search, Filter, Play, Award } from 'lucide-react';
import Button from '../../components/ui/Button';

const MyCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses/my-courses');
                const mappedCourses = response.data.map(c => ({
                    id: c._id,
                    title: c.title,
                    instructor: c.instructor?.name || 'Instructor',
                    progress: c.progress || 0,
                    total: c.modules ? c.modules.length : 0,
                    completed: 0, // In a real app, this would be fetched
                    status: c.progress === 100 ? 'Completed' : 'In Progress',
                    image: c.thumbnail || 'https://via.placeholder.com/300'
                }));
                setCourses(mappedCourses);
            } catch (err) {
                console.error('Failed to fetch my courses:', err);
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading your courses...</div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;

    return (
        <div className="space-y-8 font-sans p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Learning</h1>
                    <p className="text-slate-500 mt-1">Pick up where you left off.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search my courses..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500 mb-4">You are not enrolled in any courses yet.</p>
                        <Link to="/learner/dashboard" className="text-indigo-600 font-bold hover:underline">
                            Explore Courses
                        </Link>
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col group border shadow-sm">
                            <div className="h-48 overflow-hidden relative">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                {course.status === 'Completed' && (
                                    <div className="absolute inset-0 bg-emerald-500/60 backdrop-blur-[2px] flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform">
                                        <div className="bg-white text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Course Completed
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{course.title}</h3>
                                <p className="text-sm text-slate-500 mb-6 italic">By {course.instructor}</p>

                                <div className="mt-auto space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                            <span>Progress</span>
                                            <span className="text-indigo-600">{course.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                style={{ width: `${course.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/learner/courses/${course.id}`}
                                        className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${course.status === 'Completed'
                                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                                            }`}
                                    >
                                        {course.status === 'Completed' ? 'Review Course' : 'Continue Learning →'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyCourses;
