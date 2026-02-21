import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { AlertCircle, User, Mail, GraduationCap, Building2 } from 'lucide-react';
import AccessibilitySettings from '../../components/AccessibilitySettings';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'learner',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setIsLoading(false);
            return;
        }

        const { confirmPassword, ...dataToSend } = formData;
        const result = await register(dataToSend);

        if (result.success) {
            navigate('/login'); // Redirect to login after signup
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
            {/* Accessibility Controls */}
            <div className="absolute top-4 right-4 z-[100]">
                <AccessibilitySettings />
            </div>
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>

            <div className="max-w-md w-full relative z-10 fade-in">
                <div className="text-center mb-8">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg flex items-center justify-center mb-4">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-slate-600">
                        Join our community of learners and educators.
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-[2rem] border border-white/20 sm:px-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-xl bg-red-50/80 border border-red-100 p-4 animate-shake">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            name="name"
                            icon={User}
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            required
                        />

                        <PasswordInput
                            label="Password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />

                        <PasswordInput
                            label="Confirm Password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                I am a
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'learner' })}
                                    className={`flex items-center justify-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${formData.role === 'learner'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <GraduationCap className={`mr-2 h-5 w-5 ${formData.role === 'learner' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    Learner
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'instructor' })}
                                    className={`flex items-center justify-center px-4 py-3 border rounded-xl text-sm font-medium transition-all duration-200 ${formData.role === 'instructor'
                                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Building2 className={`mr-2 h-5 w-5 ${formData.role === 'instructor' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    Instructor
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" isLoading={isLoading} className="shadow-lg shadow-indigo-200">
                                Sign up
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
