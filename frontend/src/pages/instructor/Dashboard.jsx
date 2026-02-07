import React from 'react';
import {
    Users,
    BookOpen,
    Clock,
    TrendingUp,
    Plus,
    MoreVertical,
    Activity
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:border-indigo-300 transition-colors shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <div className="flex items-center text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {trend}
                </div>
            )}
        </div>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
    </div>
);

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-4 -mx-4">
        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${type === 'sale' ? 'bg-emerald-500' :
                type === 'enrollment' ? 'bg-indigo-500' : 'bg-amber-500'
            }`} />
        <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{time}</p>
        </div>
    </div>
);

const Dashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Students', value: '1,234', icon: Users, trend: '+12%' },
        { title: 'Active Courses', value: '12', icon: BookOpen, trend: '+2%' },
        { title: 'Hours Taught', value: '890', icon: Clock },
        { title: 'Revenue (Mo)', value: '$4,500', icon: Activity, trend: '+8%' },
    ];

    const recentActivity = [
        { id: 1, title: 'New student enrolled in "React Patterns"', time: '2 hours ago', type: 'enrollment' },
        { id: 2, title: 'Assignment submission: "Design Systems"', time: '4 hours ago', type: 'submission' },
        { id: 3, title: 'Course "Advanced Node" reached 500 students', time: '1 day ago', type: 'sale' },
        { id: 4, title: 'New review received (5 stars)', time: '2 days ago', type: 'enrollment' },
    ];

    return (
        <div className="space-y-8 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500 mt-1">Track your performance and student engagement.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50">
                        View Analytics
                    </Button>
                    <Link to="/instructor/courses">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Plus className="w-4 h-4 mr-2" /> Create Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area (Mock) */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Engagement Overview</h3>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-600">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    {/* CSS Chart Mock */}
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full bg-indigo-50 rounded-t-sm hover:bg-indigo-100 transition-colors relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900">Recent Activity</h3>
                        <button className="text-slate-400 hover:text-slate-600">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                    <div>
                        {recentActivity.map(item => (
                            <ActivityItem key={item.id} {...item} />
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
