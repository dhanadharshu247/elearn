import React from 'react';
import { Plus, MoreVertical, BookOpen, Clock, Users, Star, BarChart } from 'lucide-react';
import Button from '../../components/ui/Button';

const CourseCard = ({ title, description, students, duration, rating, status, image }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white/60 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group flex flex-col h-full">
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
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md uppercase tracking-wider shadow-lg ${status === 'Published' ? 'bg-emerald-500/90 text-white' :
                        'bg-amber-500/90 text-white'
                    }`}>
                    {status}
                </span>
            </div>

            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button className="p-2 bg-white/90 rounded-full shadow-lg hover:bg-white text-slate-600 hover:text-indigo-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                </button>
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

            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 pt-5 mt-auto">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{students}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-violet-400" />
                        <span>{duration}</span>
                    </div>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1">
                    Manage <BarChart className="w-3 h-3" />
                </button>
            </div>
        </div>
    </div>
);

const Courses = () => {
    const courses = [
        {
            id: 1,
            title: 'Advanced React Design Patterns and Best Practices',
            description: 'Master modern React patterns including HOCs, Render Props, and Custom Hooks to build scalable applications.',
            students: '1.2k',
            duration: '12h 40m',
            rating: 4.9,
            status: 'Published',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 2,
            title: 'UI/UX Principles for Developers',
            description: 'Learn the fundamentals of UI/UX design to build better digital products without relying on designers.',
            students: 856,
            duration: '8h 15m',
            rating: 4.7,
            status: 'Draft',
            image: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 3,
            title: 'Fullstack Development with Node.js and GraphQL',
            description: 'Build scalable backend systems using Node.js, Express, and MongoDB with modern GraphQL APIs.',
            students: '3.4k',
            duration: '24h 10m',
            rating: 4.8,
            status: 'Published',
            image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 4,
            title: 'Python for Data Science Bootcamp',
            description: 'A comprehensive guide to Python programming for data analysis, visualization and machine learning.',
            students: '890',
            duration: '18h 30m',
            rating: 4.6,
            status: 'Published',
            image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        },
        {
            id: 5,
            title: 'Mobile App Development with Flutter',
            description: 'Create beautiful cross-platform mobile applications for iOS and Android using a single codebase.',
            students: '560',
            duration: '15h 20m',
            rating: 4.9,
            status: 'Draft',
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        }
    ];

    return (
        <div className="space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        My Courses
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage your educational content and student engagements.
                    </p>
                </div>
                <Button className="w-auto shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none">
                    <Plus className="w-5 h-5 mr-2" /> New Course
                </Button>
            </div>

            {/* Filter Tabs (Mock) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['All Courses', 'Published', 'Drafts', 'Archived'].map((tab, i) => (
                    <button
                        key={tab}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${i === 0
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Create New Card */}
                <div className="min-h-[400px] rounded-[2rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 gap-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer group animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-white group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-indigo-500/20 transition-all duration-300">
                        <Plus className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Create New Course</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
                            Start building your next masterpiece. We'll guide you through the process.
                        </p>
                    </div>
                </div>

                {courses.map((course) => (
                    <div key={course.id} className="animate-fade-in-up">
                        <CourseCard {...course} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Courses;
