import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Award, Download, ArrowLeft, ShieldCheck, Calendar, BookOpen } from 'lucide-react';

const CertificatePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const res = await api.get('/users/me/certificates');
                const cert = res.data.find(c => String(c.course_id) === String(id));
                setCertificate(cert);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [id]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Certificate...</div>;
    if (!certificate) return (
        <div className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Certificate not found</h2>
            <p className="text-slate-500 font-medium">You haven't earned a certificate for this course yet.</p>
            <button onClick={() => navigate(-1)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">Go Back</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 p-6 md:p-12 flex flex-col items-center">
            {/* Header Controls */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-12 no-print">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition font-bold"
                >
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition shadow-xl"
                    >
                        <Download className="w-5 h-5" /> Download PDF
                    </button>
                </div>
            </div>

            {/* Certificate Container */}
            <div id="certificate-print" className="w-full max-w-4xl aspect-[1.414/1] bg-white rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden p-1">
                <div className="w-full h-full border-[20px] border-slate-900 rounded-[2.8rem] relative p-12 flex flex-col items-center justify-between text-center overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-50/50 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />

                    <div className="space-y-4 relative">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl mx-auto flex items-center justify-center rotate-12 shadow-2xl">
                            <Award className="w-10 h-10" />
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-8">CERTIFICATE OF COMPLETION</h1>
                        <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full" />
                    </div>

                    <div className="space-y-8 py-8">
                        <p className="text-xl font-medium text-slate-500 italic">This is to certify that</p>
                        <h2 className="text-6xl font-black text-indigo-600 tracking-tight underline decoration-indigo-100 decoration-8 underline-offset-8">
                            {certificate.user_name}
                        </h2>
                        <p className="text-xl font-medium text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            has successfully completed the comprehensive online course
                        </p>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {certificate.course_title}
                        </h3>
                    </div>

                    <div className="w-full grid grid-cols-3 items-end pt-12 border-t border-slate-100">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-32 h-px bg-slate-400" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date Issued</p>
                            <div className="flex items-center gap-1 text-slate-900 font-black">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                {new Date(certificate.issued_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 border-8 border-slate-50 p-2 rounded-full mb-2 bg-white flex items-center justify-center relative shadow-lg">
                                <ShieldCheck className="w-12 h-12 text-emerald-500" />
                                <div className="absolute inset-0 border-2 border-dashed border-slate-200 rounded-full animate-spin-slow" />
                            </div>
                            <p className="text-[10px] font-black text-slate-900 tracking-[0.3em] uppercase opacity-50">Verified Achievement</p>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <div className="w-32 h-px bg-slate-400" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Certificate ID</p>
                            <p className="text-slate-900 font-black tracking-tighter">{certificate.certificate_code}</p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-12 text-slate-500 font-bold no-print flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> EdWeb Academy · Empowering Futures
            </p>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; }
                    #certificate-print { 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        max-width: none !important;
                        border-radius: 0 !important;
                    }
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CertificatePage;
