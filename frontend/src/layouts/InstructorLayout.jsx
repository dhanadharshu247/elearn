import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    User,
    LogOut,
    Menu,
    Search,
    GraduationCap,
    Bell,
    MessageSquare,
    Layers
} from 'lucide-react';
import AccessibilitySettings from '../components/AccessibilitySettings';

const InstructorLayout = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/instructor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/instructor/courses', icon: BookOpen, label: 'My Courses' },
        { path: '/instructor/batches', icon: Layers, label: 'Batches' },
        { path: '/instructor/messages', icon: MessageSquare, label: 'Messages' },
        { path: '/instructor/learners', icon: Users, label: 'Learners' },
        { path: '/instructor/profile', icon: User, label: 'Profile' },
    ];

    const getPageTitle = () => {
        const current = navItems.find(item => item.path === location.pathname);
        return current ? current.label : 'Instructor Portal';
    }

    const handleLogout = () => {
        logout();
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
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        EdWeb <span className="text-xs font-normal text-slate-400 ml-1 uppercase tracking-wider">Instructor</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    <div className="mb-4 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Management
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => `
                                flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                                ${isActive
                                    ? 'bg-slate-100 text-indigo-700'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }
                            `}
                        >
                            <item.icon className={`w-4 h-4 mr-3 transition-colors ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
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
                        Sign Out
                    </button>
                </nav>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 w-64 bg-slate-50"
                            />
                        </div>
                        <button
                            onClick={() => navigate('/notifications')}
                            className="p-2 text-slate-400 hover:text-slate-600 relative"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>
                        <AccessibilitySettings />
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900">{user?.name || user?.sub || 'Instructor'}</p>
                                <p className="text-xs text-slate-500">Instructor Account</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-white shadow-sm text-sm uppercase">
                                {(user?.name || user?.sub || 'U').charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="w-full max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default InstructorLayout;
