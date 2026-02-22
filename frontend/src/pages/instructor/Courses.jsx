import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Plus, MoreVertical, BookOpen, Clock, Users, Star, BarChart, Search, Edit, Archive, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

const CourseCard = ({ id, title, description, students, duration, rating, status, image, onStatusChange, onDelete, onEdit }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Close menu when clicking elsewhere
    useEffect(() => {
        if (!showMenu) return;
        const closeMenu = () => setShowMenu(false);
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [showMenu]);

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white/60 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group flex flex-col h-full relative">
            {/* Image Container */}
            <div className="h-56 relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/0 transition-colors z-10 duration-500"></div>
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Content */}
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black backdrop-blur-md uppercase tracking-widest shadow-lg ${status === 'Published' ? 'bg-emerald-500/90 text-white' :
                        status === 'Archived' ? 'bg-slate-500/90 text-white' :
                            'bg-amber-500/90 text-white'
                        }`}>
                        {status}
                    </span>
                </div>

                <div className="absolute top-4 right-4 z-30">
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white text-slate-600 hover:text-indigo-600 transition-all duration-300 transform group-hover:scale-110"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-100 z-40 py-2 animate-fade-in-up origin-top-right">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors"
                                >
                                    <Edit className="w-4 h-4 text-indigo-500" /> Edit Details
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onStatusChange(status === 'Archived' ? 'Draft' : 'Archived'); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-600 flex items-center gap-3 transition-colors"
                                >
                                    <Archive className="w-4 h-4 text-amber-500" /> {status === 'Archived' ? 'Unarchive' : 'Archive Course'}
                                </button>
                                <div className="border-t border-slate-50 my-1"></div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                                            onDelete();
                                        }
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Course
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-0"></div>

                {/* Bottom Metrics on Image */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end text-white">
                    <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-1">
                    {description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 border-t border-slate-100 pt-5 mt-auto uppercase tracking-widest">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-slate-600">{students} Students</span>
                        </div>
                    </div>
                    <div className="flex gap-2.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(status === 'Published' ? 'Draft' : 'Published');
                            }}
                            className={`px-3 py-1.5 rounded-xl border transition-all duration-300 font-bold ${status === 'Published'
                                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                }`}
                        >
                            {status === 'Published' ? 'Set to Draft' : 'Publish'}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-200 flex items-center gap-2"
                        >
                            Manage <BarChart className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses/my-courses', {
                params: {
                    status: activeTab,
                    q: searchQuery
                }
            });
            const formattedCourses = response.data.map(course => ({
                id: course.id || course._id,
                title: course.title,
                description: course.description,
                students: course.enrolledStudents ? course.enrolledStudents.length : 0,
                duration: 'N/A',
                rating: 0,
                status: course.status || 'Draft',
                image: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop'
            }));
            setCourses(formattedCourses);
        } catch (err) {
            console.error('Failed to fetch courses:', err);
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (courseId, newStatus) => {
        try {
            await api.put(`/courses/${courseId}/status`, { status: newStatus });
            fetchCourses(); // Refresh
        } catch (err) {
            console.error('Status Update Failed:', err);
            alert('Failed to update status');
        }
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            await api.delete(`/courses/${courseId}`);
            setCourses(prev => prev.filter(c => c.id !== courseId));
        } catch (err) {
            console.error('Deletion Failed:', err);
            alert('Failed to delete course');
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [activeTab, searchQuery]);

    if (loading && courses.length === 0) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 font-sans p-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Courses</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Manage your educational content and student engagements.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/instructor/add-course')}
                    className="w-auto shadow-2xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> New Course
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-1 flex-grow scrollbar-hide">
                    {['All', 'Published', 'Draft', 'Archived'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                                : 'bg-white text-slate-400 hover:text-slate-900 hover:bg-white border border-slate-100 shadow-sm'
                                }`}
                        >
                            {tab === 'All' ? 'All Courses' : tab}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-4 w-full text-sm border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white shadow-inner"
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {/* Create New Card */}
                {activeTab === 'All' && (
                    <div
                        onClick={() => navigate('/instructor/add-course')}
                        className="min-h-[440px] rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 gap-8 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group animate-fade-in-up shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
                    >
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500 border border-slate-100">
                            <Plus className="w-10 h-10 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-700 transition-colors tracking-tight">Create New Course</h3>
                            <p className="text-slate-500 text-base mt-2 max-w-xs mx-auto font-medium">
                                Ready to share your knowledge? Start building your next course here.
                            </p>
                        </div>
                    </div>
                )}

                {courses.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center animate-fade-in">
                        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200 shadow-inner">
                            <BookOpen className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">No courses found</h3>
                        <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or search query.</p>
                    </div>
                )}

                {courses.map((course) => (
                    <div key={course.id} className="animate-fade-in-up h-full">
                        <CourseCard
                            {...course}
                            onStatusChange={(status) => handleStatusUpdate(course.id, status)}
                            onDelete={() => handleDeleteCourse(course.id)}
                            onEdit={() => navigate(`/instructor/edit-course/${course.id}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
