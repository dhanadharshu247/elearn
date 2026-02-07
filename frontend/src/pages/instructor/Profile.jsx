import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Mail, Upload, Save, Building2, Globe, Check } from 'lucide-react';

const Profile = () => {
    const [isLoading, setIsLoading] = useState(false);

    // Mock user data for editing
    const [formData, setFormData] = useState({
        fullName: 'Instructor Doe',
        email: 'instructor@example.com',
        title: 'Senior Software Engineer',
        bio: 'Passionate about teaching React and modern web development.',
        website: 'https://example.com'
    });

    // Mock user object for display
    const user = {
        sub: 'Instructor Doe',
        email: 'instructor@example.com'
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSave = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => setIsLoading(false), 1000);
    }

    return (
        <div className="w-full space-y-8 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 fade-in">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Profile Settings
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage your public profile and global preferences.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Avatar & Quick Stats */}
                <div className="space-y-6 animate-fade-in-up">
                    <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/60 flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

                        <div className="relative z-10 mt-12 mb-4">
                            <div className="w-32 h-32 rounded-full p-1 bg-white shadow-2xl">
                                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-indigo-600 overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
                                    {/* Placeholder for real image */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
                                        {user?.sub?.charAt(0).toUpperCase() || 'I'}
                                    </div>
                                </div>
                            </div>
                            <button className="absolute bottom-1 right-1 p-3 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 border-4 border-white">
                                <Upload className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">{formData.fullName}</h2>
                        <p className="text-indigo-600 font-medium">{formData.title}</p>

                        <p className="text-slate-500 text-sm mt-4 leading-relaxed max-w-xs mx-auto">
                            {formData.bio}
                        </p>

                        <div className="mt-8 w-full pt-6 border-t border-slate-100 flex justify-around">
                            <div className="text-center group-hover:-translate-y-1 transition-transform duration-300">
                                <span className="block font-bold text-xl text-slate-900">12</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Courses</span>
                            </div>
                            <div className="text-center group-hover:-translate-y-1 transition-transform duration-300 delay-75">
                                <span className="block font-bold text-xl text-slate-900">1.2k</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Students</span>
                            </div>
                            <div className="text-center group-hover:-translate-y-1 transition-transform duration-300 delay-100">
                                <span className="block font-bold text-xl text-slate-900">4.8</span>
                                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-500/30 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-2">Upgrade to Pro</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Unlock advanced analytics and priority support.</p>
                            <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
                                View Plans
                            </button>
                        </div>
                        {/* Abstract Shapes */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-900/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2 animate-fade-in-up animation-delay-200">
                    <div className="bg-white/70 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/60">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold uppercase rounded-full tracking-wider border border-indigo-100">
                                Editable
                            </span>
                        </div>

                        <form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    icon={User}
                                    className="bg-white"
                                />
                                <Input
                                    label="Job Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    icon={Building2}
                                    placeholder="e.g. Senior Developer"
                                    className="bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Input
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    icon={Mail}
                                    disabled
                                    className="bg-slate-50/50 text-slate-500 cursor-not-allowed border-slate-100"
                                />
                                <Input
                                    label="Website"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    icon={Globe}
                                    placeholder="https://"
                                    className="bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Bio / About</label>
                                <textarea
                                    className="w-full px-5 py-4 border border-slate-200/80 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 placeholder:text-slate-400 bg-white min-h-[140px] resize-none text-slate-700"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                ></textarea>
                                <p className="text-right text-xs text-slate-400 mt-2 font-medium">240 characters left</p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                                <Button
                                    variant="outline"
                                    className="w-auto border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    onClick={(e) => { e.preventDefault(); }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="w-auto px-8 shadow-xl shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 border-none"
                                    onClick={handleSave}
                                    isLoading={isLoading}
                                >
                                    {isLoading ? 'Saving...' : <><Check className="w-4 h-4 mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
