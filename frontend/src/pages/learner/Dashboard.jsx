import React from 'react';
import { Play, Clock, Award, ArrowRight, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';

const Dashboard = () => {
    // Mock Data
    const continuingCourse = {
        title: "Advanced React Patterns",
        instructor: "Sarah Drasner",
        progress: 65,
        nextLesson: "Compound Components",
        totalLessons: 24,
        completedLessons: 15,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    };

    const enrolledCourses = [
        { id: 1, title: "UI/UX Principles", instructor: "Gary Simon", progress: 30, total: 12, completed: 4 },
        { id: 2, title: "Node.js Microservices", instructor: "Fernando Doglio", progress: 0, total: 20, completed: 0 },
        { id: 3, title: "Figma Mastery", instructor: "Mizko", progress: 10, total: 15, completed: 1 },
    ];

    return (
        <div className="space-y-10 font-sans">
            {/* Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back, Learner</h1>
                <p className="text-slate-500 mt-1">Ready to continue your learning journey?</p>
            </div>

            {/* Continue Learning Hero */}
            <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" /> Continue Learning
                </h2>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow duration-300">
                    <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                        <img
                            src={continuingCourse.image}
                            alt={continuingCourse.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                                <Play className="w-5 h-5 text-indigo-600 ml-1" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                        <div className="uppercase tracking-wider text-xs font-bold text-indigo-600 mb-2">In Progress</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{continuingCourse.title}</h3>
                        <p className="text-slate-500 mb-6">Instructor: <span className="text-slate-700 font-medium">{continuingCourse.instructor}</span></p>

                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm font-medium text-slate-600">
                                <span>{continuingCourse.progress}% Complete</span>
                                <span>{continuingCourse.completedLessons}/{continuingCourse.totalLessons} Lessons</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full"
                                    style={{ width: `${continuingCourse.progress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">Next up: <span className="text-slate-900 font-medium">{continuingCourse.nextLesson}</span></p>
                        </div>

                        <div>
                            <Button className="w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-lg">
                                Resume Course
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enrolled Courses List */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Your Courses</h2>
                    <a href="/learner/my-courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center hover:underline">
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {enrolledCourses.map(course => (
                        <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-300 transition-colors group cursor-pointer shadow-sm">
                            <div className="mb-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <Award className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                                <p className="text-sm text-slate-500">{course.instructor}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-slate-800 rounded-full group-hover:bg-indigo-600 transition-colors"
                                        style={{ width: `${course.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State / Add New Placeholder */}
                    <a href="/learner/my-courses" className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                            <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600">Browse Catalog</p>
                        <p className="text-xs text-slate-400">Find new skills to master</p>
                    </a>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
