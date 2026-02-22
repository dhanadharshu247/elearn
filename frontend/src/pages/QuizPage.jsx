import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Core states
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Adaptive tracking
    const [answeredIds, setAnsweredIds] = useState([]);
    const [performanceData, setPerformanceData] = useState([]); // {id, correct}
    const [currentStep, setCurrentStep] = useState(0);
    const [totalSteps] = useState(10); // Target 10 questions
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        const startAdaptive = async () => {
            setLoading(true);
            try {
                const res = await api.post(`/quizzes/${id}/adaptive/start`);
                setCurrentQuestion(res.data.question);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) startAdaptive();
    }, [id]);

    const handleAnswerChange = (value) => {
        setSelectedAnswer(value);
    };

    const handleNext = async () => {
        if (selectedAnswer === null || selectedAnswer === '') return;

        setSubmitting(true);

        const newAnsweredIds = [...answeredIds, currentQuestion.id];
        const newPerformance = [...performanceData, { id: currentQuestion.id, answer: selectedAnswer }];

        setAnsweredIds(newAnsweredIds);
        setPerformanceData(newPerformance);

        if (currentStep + 1 >= totalSteps) {
            // End of adaptive session - Final Submission
            try {
                // Map performance back to the format backend expects for final scoring/rewards
                // Since final scoring endpoint expects full array indexed by original course assessment,
                // we might need to be careful if we serve random questions.
                // However, the backend adaptive next endpoint just serves questions.
                // Let's create a specialized adaptive finish endpoint or reuse final submit if it handles partials.
                // For now, let's reuse finalized submission with the answers we collected.

                // Constructing an answer map for the final submit logic which evaluates 'course.assessment'
                // Actually, let's just send the collection of {id, answer} and let backend handle it if we modify it.
                // For simplicity, I'll send the answers we collected.

                const finalRes = await api.post(`/quizzes/${id}/submit`, {
                    answers: newPerformance.map(p => p.answer),
                    is_adaptive: true,
                    question_ids: newAnsweredIds
                });
                setResult(finalRes.data);
            } catch (err) {
                console.error(err);
                alert('Failed to submit final results');
            } finally {
                setSubmitting(false);
            }
        } else {
            // Fetch next adaptive question
            try {
                const res = await api.post(`/quizzes/${id}/adaptive/next`, {
                    answered_ids: newAnsweredIds,
                    last_answer: selectedAnswer,
                    last_difficulty: currentQuestion.difficulty || "medium"
                });

                if (res.data.finished) {
                    // Force finish if no more questions
                    const finalRes = await api.post(`/quizzes/${id}/submit`, {
                        answers: newPerformance.map(p => p.answer),
                        is_adaptive: true,
                        question_ids: newAnsweredIds
                    });
                    setResult(finalRes.data);
                } else {
                    setCurrentQuestion(res.data.question);
                    setCurrentStep(prev => prev + 1);
                    setSelectedAnswer(null);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Initializing Adaptive Assessment...</div>;
    if (!currentQuestion && !result) return <div className="p-8 text-center text-red-500">Failed to load assessment.</div>;

    if (result) {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-bounce-in">
                    <div className="mb-6 relative inline-block">
                        <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center animate-pulse">
                            <span className="text-6xl">{result.percentage >= 50 ? '🏆' : '📚'}</span>
                        </div>
                        {result.badgeAwarded && (
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg animate-bounce">
                                <span className="text-2xl">🏅</span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tight">
                        {result.percentage >= 50 ? 'Adaptive Master!' : 'Keep Practicing!'}
                    </h2>
                    <p className="text-slate-500 mb-8 font-medium">
                        {result.percentage >= 50
                            ? 'You navigated the adaptive challenges successfully.'
                            : 'The difficulty adjusted to your level. Review and try again!'}
                    </p>

                    <div className="bg-slate-50 rounded-3xl p-8 mb-8 border border-slate-100">
                        <div className="text-6xl font-black text-indigo-600 mb-2">
                            {result.percentage}%
                        </div>
                        <p className="text-lg text-slate-400 font-bold uppercase tracking-widest text-xs">
                            Score: {result.score} / {result.totalQuestions}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {result.certificate && (
                            <Link to={`/learner/certificate/${id}`} className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition shadow-xl">
                                <span>📜</span> Certificate
                            </Link>
                        )}
                        <Link to="/learner/achievements" className="flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition shadow-xl">
                            <span>🏅</span> Achievements
                        </Link>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate(`/learner/courses/${id}`)} className="px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition">
                            Back to Course
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Adaptive Assessment</h1>
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter">Difficulty: {currentQuestion.difficulty || 'medium'}</span>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm">
                    Question {currentStep + 1} of {totalSteps}
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-6 text-gray-900 leading-tight">
                        {currentQuestion.questionText}
                    </h3>

                    {currentQuestion.questionType === 'mcq' ? (
                        <div className="space-y-3">
                            {currentQuestion.options.map((opt, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAnswer === oIndex
                                        ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/10'
                                        : 'hover:bg-gray-50 border-gray-100'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="adaptive-question"
                                        className="hidden"
                                        checked={selectedAnswer === oIndex}
                                        onChange={() => handleAnswerChange(oIndex)}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${selectedAnswer === oIndex ? 'border-blue-600' : 'border-gray-300'}`}>
                                        {selectedAnswer === oIndex && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                    </div>
                                    <span className={`font-medium ${selectedAnswer === oIndex ? 'text-blue-900' : 'text-gray-700'}`}>{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            value={selectedAnswer || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none italic text-gray-700"
                            rows="6"
                            placeholder="Type your adaptive answer here..."
                        />
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end items-center bg-white p-4 rounded-2xl border border-gray-200">
                <button
                    onClick={handleNext}
                    disabled={submitting || selectedAnswer === null || selectedAnswer === ''}
                    className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center gap-2"
                >
                    {submitting ? 'Processing...' : (currentStep + 1 === totalSteps ? 'Finish Assessment' : 'Next Question')}
                    {!submitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>}
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
