import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Chatbot from '../../components/Chatbot';

const LearnerDashboard = () => {
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [myCoursesRes, allCoursesRes] = await Promise.all([
                    api.get('/courses/my-courses'),
                    api.get('/courses')
                ]);
                setMyCourses(myCoursesRes.data);
                setAllCourses(allCoursesRes.data);
            } catch (err) {
                setError('Failed to load data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    // Filter available courses to exclude enrolled ones
    const enrolledIds = new Set(myCourses.map(c => c._id));
    const availableCourses = allCourses.filter(c => !enrolledIds.has(c._id));

    const filteredAvailableCourses = availableCourses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 relative">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Learner Dashboard</h1>

            {/* Enrolled Courses */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">My Learning</h2>
                {myCourses.length === 0 ? (
                    <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.map(course => (
                            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                {course.thumbnail && (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-40 object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{course.progress || 0}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-50">
                                            <div
                                                className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                                                style={{ width: `${course.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/learner/courses/${course._id}`}
                                        className="inline-block text-blue-600 font-medium hover:underline text-sm"
                                    >
                                        {course.progress === 100 ? 'Review Course' : 'Continue Learning →'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Courses */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700">Explore Courses</h2>
                    <input
                        type="text"
                        placeholder="Search for new courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {filteredAvailableCourses.length === 0 ? (
                    <p className="text-gray-500">No new courses match your search.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAvailableCourses.map(course => (
                            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                {course.thumbnail && (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-5">
                                    <h3 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">
                                            {course.price === 0 ? 'Free' : `$${course.price}`}
                                        </span>
                                        <Link
                                            to={`/learner/courses/${course._id}`}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <Chatbot />
        </div>
    );
};

export default LearnerDashboard;
