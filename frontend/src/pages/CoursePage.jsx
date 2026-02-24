import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CoursePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [activeModuleIndex, setActiveModuleIndex] = useState(0);
    const [activeQuizQuestionIndex, setActiveQuizQuestionIndex] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!id || id === 'undefined') {
                setError('Invalid course ID');
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/courses/${id}`);
                setCourse(response.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.detail || err.message || 'Failed to load course details');
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id]);

    const handleEnroll = async () => {
        if (!id || id === 'undefined') {
            alert('Unable to enroll: Invalid course ID. Please go back and try again.');
            return;
        }
        setEnrolling(true);
        try {
            await api.post(`/courses/${id}/enroll`);
            const response = await api.get(`/courses/${id}`);
            setCourse(response.data);
        } catch (err) {
            alert(err.response?.data?.detail || 'Enrollment failed');
        } finally {
            setEnrolling(false);
        }
    };

    const isEnrolled = course?.enrolledStudents?.some(sId => String(sId) === String(user?.id) || String(sId) === String(user?._id));
    const instructorId = course?.instructor_id || (course?.instructor?._id || course?.instructor?.id || course?.instructor);
    const isInstructor = String(instructorId) === String(user?.id) || String(instructorId) === String(user?._id);

    const handleAnswerChange = (qIndex, oIndex) => {
        setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
        setQuizResult(null);
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.includes('youtube.com/watch?v=')) {
            const id = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes('youtube.com/embed/')) return url;
        return url;
    };

    const submitQuiz = async () => {
        const currentModule = course.modules[activeModuleIndex];
        const answersList = Object.keys(quizAnswers)
            .sort((a, b) => Number(a) - Number(b))
            .map(key => quizAnswers[key]);

        try {
            const response = await api.post(`/modules/${currentModule.id}/quiz/submit`, {
                answers: answersList,
                total_questions: currentModule.quiz.length
            });

            setQuizResult({
                score: response.data.percentage,
                correct: response.data.correctCount,
                total: response.data.totalQuestions,
                review: response.data.review,
                userAnswers: response.data.userAnswers
            });
        } catch (err) {
            console.error('Failed to submit quiz:', err);
            alert('Progress could not be saved.');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Course...</div>;
    if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
    if (!course) return <div className="p-8 text-center">Course not found</div>;

    const activeModule = course.modules?.[activeModuleIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation / Banner */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link
                        to={user?.role === 'instructor' ? '/instructor/dashboard' : '/learner/dashboard'}
                        className="text-slate-400 hover:text-indigo-600 transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-900 truncate max-w-md">{course.title}</h1>
                </div>
                {!isEnrolled && !isInstructor && (
                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {enrolling ? 'Enrolling...' : 'Enroll to Start'}
                    </button>
                )}
                {(isEnrolled || isInstructor) && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider border border-green-100 italic">
                        {isInstructor ? 'Instructor Access' : 'Enrolled'}
                    </span>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar - Course Curriculum */}
                <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto hidden md:block">
                    <div className="p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 italic">Course modules</h2>
                        <div className="space-y-2">
                            {course.modules?.map((m, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setActiveModuleIndex(idx);
                                        setActiveQuizQuestionIndex(0);
                                        setQuizAnswers({});
                                        setQuizResult(null);
                                    }}
                                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 ${activeModuleIndex === idx
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                        : 'hover:bg-slate-50 text-slate-600'
                                        }`}
                                >
                                    <div className="text-xs opacity-70 mb-1">Module {idx + 1}</div>
                                    <div className="font-bold truncate">{m.title}</div>
                                </button>
                            ))}

                            {/* Final Assessment Link */}
                            {course.assessment && course.assessment.length > 0 && (isEnrolled || isInstructor) && (
                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <Link
                                        to={`/learner/quiz/${course.id}`}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all font-bold shadow-sm ${course.isAssessmentCompleted
                                            ? 'bg-green-50 text-green-700 border border-green-100 hover:bg-green-100'
                                            : 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{course.isAssessmentCompleted ? '✅' : '🏆'}</span>
                                            <div className="text-left">
                                                <div className="text-[10px] uppercase tracking-wider opacity-70">
                                                    {course.isAssessmentCompleted ? 'Completed' : 'Final Step'}
                                                </div>
                                                <div className="truncate">
                                                    {course.isAssessmentCompleted ? 'View Assessment Result' : 'Course Assessment'}
                                                </div>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </Link>

                                    {course.hasCertificate && (
                                        <Link
                                            to={`/learner/certificate/${course.id}`}
                                            className="w-full flex items-center justify-between p-4 mt-2 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">📜</span>
                                                <div className="text-left">
                                                    <div className="text-[10px] uppercase tracking-wider opacity-70">Awarded</div>
                                                    <div>View Certificate</div>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50">
                    {!isEnrolled && !isInstructor ? (
                        <div className="max-w-4xl mx-auto p-8 text-center space-y-12">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-80 object-cover rounded-[2.5rem] shadow-2xl" />
                            <div className="space-y-4">
                                <h2 className="text-4xl font-bold text-slate-900">{course.title}</h2>
                                <p className="text-lg text-slate-600 leading-relaxed">{course.description}</p>
                            </div>
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <h3 className="text-xl font-bold mb-4">What's inside?</h3>
                                <ul className="text-left space-y-3">
                                    {course.modules?.map((m, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-slate-700">
                                            <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                            {m.title}
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={handleEnroll}
                                    className="mt-8 w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition"
                                >
                                    Get Started Now
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
                            {/* Module Header */}
                            <div>
                                <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2 italic">Active Module</h2>
                                <h1 className="text-4xl font-bold text-slate-900">{activeModule?.title}</h1>
                            </div>

                            {/* Tutorial Content */}
                            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden p-2">
                                <div className="aspect-video bg-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center space-y-6">
                                    {activeModule?.contentLink?.includes('youtube.com') || activeModule?.contentLink?.includes('youtu.be') ? (
                                        <div className="w-full h-full">
                                            <iframe
                                                className="w-full h-full rounded-[1.5rem]"
                                                src={getEmbedUrl(activeModule.contentLink)}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center space-y-6">
                                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-3xl">📄</div>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">Tutorial Resource</h3>
                                                <p className="text-slate-500 mb-6 italic">Study the content via the link below before taking the quiz.</p>
                                                <a
                                                    href={activeModule?.contentLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg"
                                                >
                                                    Open Tutorial Link
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* Quiz Section */}
                            {activeModule?.quiz && activeModule.quiz.length > 0 && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">📝</span>
                                            <h2 className="text-2xl font-bold text-slate-900">Module Quiz</h2>
                                        </div>
                                        <div className="text-xs font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                            Question {activeQuizQuestionIndex + 1} of {activeModule.quiz.length}
                                        </div>
                                    </div>

                                    {!quizResult ? (
                                        <div className="space-y-8 animate-fade-in">
                                            {/* Single Question View */}
                                            {activeModule.quiz.map((q, qIndex) => (
                                                qIndex === activeQuizQuestionIndex && (
                                                    <div key={qIndex} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                                        <div className="mb-6">
                                                            <h3 className="text-xl font-bold text-slate-800">{q.questionText}</h3>
                                                        </div>
                                                        {q.questionType === 'mcq' || (q.options && q.options.length > 0) ? (
                                                            <div className="grid grid-cols-1 gap-3">
                                                                {q.options.map((opt, oIndex) => (
                                                                    <button
                                                                        key={oIndex}
                                                                        onClick={() => handleAnswerChange(qIndex, oIndex)}
                                                                        className={`p-4 rounded-2xl text-left transition-all border-2 font-medium ${quizAnswers[qIndex] === oIndex
                                                                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                                                                            : 'hover:bg-slate-50 border-slate-100 text-slate-600'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${quizAnswers[qIndex] === oIndex ? 'bg-indigo-500 text-white border-indigo-500' : 'border-slate-200'}`}>
                                                                                {String.fromCharCode(65 + oIndex)}
                                                                            </span>
                                                                            {opt.text}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <textarea
                                                                    value={quizAnswers[qIndex] || ''}
                                                                    onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
                                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none italic text-slate-600"
                                                                    rows="4"
                                                                    placeholder="Type your answer here..."
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            ))}

                                            {/* Quiz Navigation */}
                                            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                                                <button
                                                    onClick={() => setActiveQuizQuestionIndex(prev => Math.max(0, prev - 1))}
                                                    disabled={activeQuizQuestionIndex === 0}
                                                    className="px-6 py-2 text-slate-400 font-bold hover:bg-slate-50 rounded-xl transition disabled:opacity-10"
                                                >
                                                    Back
                                                </button>

                                                {activeQuizQuestionIndex < activeModule.quiz.length - 1 ? (
                                                    <button
                                                        onClick={() => setActiveQuizQuestionIndex(prev => prev + 1)}
                                                        disabled={quizAnswers[activeQuizQuestionIndex] === undefined || quizAnswers[activeQuizQuestionIndex] === ''}
                                                        className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={submitQuiz}
                                                        disabled={quizAnswers[activeQuizQuestionIndex] === undefined || quizAnswers[activeQuizQuestionIndex] === ''}
                                                        className="px-8 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50"
                                                    >
                                                        Finish Quiz
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-white p-12 rounded-[2rem] border-2 border-indigo-500 shadow-2xl shadow-indigo-100 text-center space-y-4 animate-bounce-in">
                                                <div className="text-5xl font-black text-indigo-600">{quizResult.score}%</div>
                                                <div className="text-slate-500 font-bold text-lg">You got {quizResult.correct} out of {quizResult.total} correct!</div>
                                                <button
                                                    onClick={() => {
                                                        setQuizResult(null);
                                                        setQuizAnswers({});
                                                        setActiveQuizQuestionIndex(0);
                                                    }}
                                                    className="mt-4 px-8 py-3 bg-slate-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition border border-indigo-100"
                                                >
                                                    Retry Quiz
                                                </button>
                                            </div>

                                            {/* Detailed Review Section */}
                                            {quizResult.review && (
                                                <div className="space-y-6 mt-12 text-left">
                                                    <h3 className="text-xl font-bold text-slate-800 border-b pb-4">Review Your Answers</h3>
                                                    {quizResult.review.map((rev, idx) => (
                                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                                                            <div className="flex gap-4">
                                                                <span className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{idx + 1}</span>
                                                                <p className="font-bold text-slate-800 leading-tight">{rev.questionText}</p>
                                                            </div>

                                                            {rev.questionType === 'mcq' || (rev.options && rev.options.length > 0) ? (
                                                                <div className="pl-12 space-y-2">
                                                                    <div className="grid gap-2">
                                                                        {rev.options.map((opt, oIdx) => {
                                                                            const isUserSelected = quizResult.userAnswers && quizResult.userAnswers[idx] === oIdx;
                                                                            const isCorrect = oIdx === rev.correctOptionIndex;

                                                                            return (
                                                                                <div
                                                                                    key={oIdx}
                                                                                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${isCorrect
                                                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                                                            : isUserSelected
                                                                                                ? 'bg-red-50 border-red-200 text-red-700'
                                                                                                : 'bg-white border-slate-100 text-slate-500'
                                                                                        }`}
                                                                                >
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                                                                                        {isCorrect && <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter">✅ Correct</span>}
                                                                                        {isUserSelected && !isCorrect && <span className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter">❌ Yours</span>}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {quizResult.userAnswers && quizResult.userAnswers[idx] !== rev.correctOptionIndex && (
                                                                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-900 font-bold">
                                                                            <span className="opacity-50 uppercase text-[9px] block mb-1">Correct Answer</span>
                                                                            {String.fromCharCode(65 + rev.correctOptionIndex)}. {rev.options[rev.correctOptionIndex].text}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="pl-12 space-y-3">
                                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                                                                        <span className="opacity-50 uppercase text-[9px] block mb-1">Your Answer</span>
                                                                        <p className="font-bold text-slate-800 italic">"{quizResult.userAnswers && quizResult.userAnswers[idx]}"</p>
                                                                    </div>
                                                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-xs">
                                                                        <span className="opacity-50 uppercase text-[9px] block mb-1">Correct Answer Pattern</span>
                                                                        <p className="font-bold text-green-800 italic">"{rev.correctAnswerText}"</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 mt-12">
                                <button
                                    onClick={() => setActiveModuleIndex(prev => Math.max(0, prev - 1))}
                                    disabled={activeModuleIndex === 0}
                                    className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition disabled:opacity-20"
                                >
                                    Previous Module
                                </button>
                                <div className="text-slate-400 font-bold italic">
                                    {activeModuleIndex + 1} / {course.modules.length}
                                </div>
                                <button
                                    onClick={() => setActiveModuleIndex(prev => Math.min(course.modules.length - 1, prev + 1))}
                                    disabled={activeModuleIndex === course.modules.length - 1}
                                    className="px-6 py-2 text-indigo-600 font-bold hover:bg-slate-50 rounded-xl transition disabled:opacity-20"
                                >
                                    Next Module
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoursePage;
