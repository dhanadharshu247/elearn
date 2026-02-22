import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Award,
    User,
    LogOut,
    Menu,
    Bell,
    Search,
    ChevronRight,
    MessageSquare
} from 'lucide-react';
import AccessibilitySettings from '../components/AccessibilitySettings';

const LearnerLayout = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Mock User
    const user = {
        name: 'Learner User',
        email: 'learner@edweb.com',
        avatar: 'L'
    };

    const navItems = [
        { path: '/learner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/learner/my-courses', label: 'My Courses', icon: BookOpen },
        { path: '/learner/achievements', label: 'Achievements', icon: Award },
        { path: '/learner/messages', label: 'Messages', icon: MessageSquare },
        { path: '/learner/profile', label: 'Profile', icon: User },
    ];

    const getPageTitle = () => {
        const current = navItems.find(item => item.path === location.pathname);
        return current ? current.label : 'Learning Portal';
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        EdWeb
                    </div>
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="mb-6 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Learning
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-slate-100 text-indigo-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }
                            `}
                        >
                            <item.icon className={`w-4 h-4 mr-3 ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400'
                                }`} />
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="mt-8 mb-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Account
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Log Out
                    </button>
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                id="global-search"
                                className="pl-9 pr-8 py-1.5 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-64 bg-slate-50"
                            />
                        </div>
                        <NavLink to="/notifications" className="p-2 text-slate-400 hover:text-slate-600 relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </NavLink>
                        <AccessibilitySettings />
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">Student</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm">
                                {user.avatar}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LearnerLayout;
