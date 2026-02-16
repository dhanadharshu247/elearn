import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import PasswordInput from '../../components/ui/PasswordInput';
import Button from '../../components/ui/Button';
import { AlertCircle, LogIn, Mail, ArrowRight, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields');
            setIsLoading(false);
            return;
        }

        const result = await login(email, password);

        if (result.success) {
            if (from !== '/') {
                navigate(from, { replace: true });
            } else {
                if (result.role === 'instructor') {
                    navigate('/instructor/dashboard', { replace: true });
                } else {
                    navigate('/learner/dashboard', { replace: true });
                }
            }
        } else {
            setError(result.error || 'Failed to login');
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-blob animation-delay-2000"></div>

            {/* Left Side - Hero / Branding (Desktop only) */}
            <div className="hidden lg:flex w-[60%] relative flex-col justify-between p-16 bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-sky-50/80 backdrop-blur-sm border-r border-white/50">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-200">
                        <GraduationCap className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700 tracking-tight">EdWeb</h1>
                        <p className="text-xs text-indigo-400 font-medium tracking-wider uppercase">Education Platform</p>
                    </div>
                </div>

                {/* Content Middle */}
                <div className="max-w-xl space-y-8 relative z-10 pl-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-indigo-100 text-sm text-indigo-600 font-medium mb-4 shadow-sm backdrop-blur-sm animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Start your journey today</span>
                    </div>
                    <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                        Learn. <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Grow.</span> Succeed.
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
                        Join a calm space designed for focused learning and teaching. Access world-class resources to accelerate your growth.
                    </p>

                    {/* Abstract Visual Cards */}
                    <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-md">
                        <div className="p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 group">
                            <BookOpen className="w-8 h-8 text-indigo-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="font-semibold text-slate-800">Quality Content</h3>
                            <p className="text-sm text-slate-500 mt-1">Curated by experts</p>
                        </div>
                        <div className="p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all duration-500 hover:-translate-y-1 group delay-100">
                            <GraduationCap className="w-8 h-8 text-violet-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="font-semibold text-slate-800">Certified Learning</h3>
                            <p className="text-sm text-slate-500 mt-1">Recognized globally</p>
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <p className="text-slate-400 text-sm font-medium">© 2026 EdWeb Inc.</p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10">
                {/* Mobile Logo */}
                <div className="lg:hidden mb-8 flex items-center gap-2 animate-fade-in">
                    <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg shadow-md">
                        <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-slate-900">EdWeb</span>
                </div>

                <div className="w-full max-w-sm space-y-8 fade-in">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                        <p className="text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border border-white/20 ring-1 ring-black/5 transform transition-all hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.2)]">
                        <form className="space-y-6" onSubmit={handleSubmit}>
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

                            <div className="space-y-5">
                                <Input
                                    label="Email"
                                    icon={Mail}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    autoFocus
                                />

                                <div>
                                    <PasswordInput
                                        label="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Link
                                            to="/forgot-password"
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition-all"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" isLoading={isLoading} className="w-full text-base py-3.5 shadow-indigo-200 shadow-lg">
                                Sign in <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 italic">Demo Accounts</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-slate-700">Instructor</div>
                                            <div className="text-xs text-slate-500 font-mono">instructor@edweb.com</div>
                                            <button
                                                onClick={() => { setEmail('instructor@edweb.com'); setPassword('password123'); }}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                            >
                                                Auto-fill
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm font-bold text-slate-700">Learner</div>
                                            <div className="text-xs text-slate-500 font-mono">miru@gmail.com</div>
                                            <button
                                                onClick={() => { setEmail('miru@gmail.com'); setPassword('password123'); }}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                            >
                                                Auto-fill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{' '}
                                <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Protected by reCAPTCHA and subject to the EdWeb <a href="#" className="underline hover:text-slate-500">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
