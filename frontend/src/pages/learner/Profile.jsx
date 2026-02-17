import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Mail, Shield, Smartphone, Award } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || 'Learner User',
        email: user?.email || 'learner@edweb.com',
    });
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const response = await api.get('/badges/my-badges');
                setBadges(response.data);
            } catch (err) {
                console.error('Failed to fetch badges:', err);
            }
        };
        fetchBadges();
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-8 font-sans">
            <div className="text-center md:text-left border-b border-slate-200 pb-6">
                <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-1">Manage your personal information and preferences.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">

                    {/* Avatar Section */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-slate-50">
                            {formData.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 text-lg">{formData.name}</h2>
                            <p className="text-slate-500 text-sm">Student Account</p>
                            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-1">
                                Change Avatar
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Form */}
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                icon={User}
                                className="bg-white"
                            />
                            <Input
                                label="Email Address"
                                value={formData.email}
                                disabled
                                icon={Mail}
                                className="bg-slate-50 text-slate-500 border-slate-200"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button className="w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                    <Award className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-slate-900">Achievements</h2>
                </div>
                {badges.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 italic">No badges earned yet. Complete courses to unlock them!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {badges.map((b) => (
                            <div key={b.id} className="flex flex-col items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100 hover:scale-105 transition-transform cursor-default">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                                    <Award className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="text-sm font-bold text-slate-800 text-center">{b.name}</span>
                                <span className="text-[10px] text-slate-500 mt-1">{new Date(b.awarded_at).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Security Section (Mock) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Password</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-3">Last changed 3 months ago</p>
                        <button className="text-sm font-medium text-indigo-600 hover:underline">Update Password</button>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Sessions</h3>
                        <p className="text-sm text-slate-500 mt-1 mb-3">2 active sessions detected</p>
                        <button className="text-sm font-medium text-indigo-600 hover:underline">Manage Devices</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
