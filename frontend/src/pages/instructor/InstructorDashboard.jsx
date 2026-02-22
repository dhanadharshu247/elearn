import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses/my-courses');
                setCourses(response.data);
            } catch (err) {
                setError('Failed to load courses');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleStatusUpdate = async (courseId, newStatus) => {
        try {
            // Optimistic update
            setCourses(prev => prev.map(c =>
                c._id === courseId ? { ...c, status: newStatus } : c
            ));

            await api.put(`/courses/${courseId}/status`, { status: newStatus });
        } catch (err) {
            console.error('Status Update Failed:', err);
            // Revert on failure
            alert('Failed to update status');
            // You might want to re-fetch or revert state here
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Instructor Dashboard</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening with your courses.</p>
                </div>
                <Link
                    to="/instructor/add-course"
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 font-medium"
                >
                    + Create New Course
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Students</div>
                    <div className="text-3xl font-bold text-slate-900">
                        {courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Active Courses</div>
                    <div className="text-3xl font-bold text-slate-900">{courses.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Earnings</div>
                    <div className="text-3xl font-bold text-emerald-600">$0.00</div>
                    <div className="text-xs text-slate-400 mt-1">Coming soon</div>
                </div>
            </div>

            {/* Recent Courses / Management */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>
                {courses.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 mb-4">You haven't created any courses yet.</p>
                        <Link to="/instructor/add-course" className="text-indigo-600 font-bold hover:underline">
                            Create your first course
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Students</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.map(course => (
                                    <tr key={course.id || course._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{course.title}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1">{course.description}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {course.enrolledStudents?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {course.price > 0 ? `$${course.price}` : 'Free'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={course.status || 'Draft'}
                                                onChange={(e) => handleStatusUpdate(course.id || course._id, e.target.value)}
                                                className={`text-xs font-bold px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${(course.status === 'Published') ? 'bg-emerald-100 text-emerald-700' :
                                                    (course.status === 'Archived') ? 'bg-slate-100 text-slate-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Published">Published</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/instructor/edit-course/${course.id || course._id}`}
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
