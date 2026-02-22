import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import VoiceAccessibilityBox from '../components/VoiceAccessibilityBox';

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

    // Accessibility state
    const [accessibilityMode, setAccessibilityMode] = useState(false);

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

    /**
     * handleVoiceCommand - Processes cleaned voice input to auto-select options.
     * Implements fuzzy matching and keyword detection.
     */
    const handleVoiceCommand = useCallback((text) => {
        if (!currentQuestion) return;
        const lowerText = text.toLowerCase();

        // 1. Direct Pattern Matching (Option A, First Option, etc.)
        const optionPatterns = [
            { patterns: ['option a', 'first option', 'number 1', 'option 1', 'first one'], index: 0 },
            { patterns: ['option b', 'second option', 'number 2', 'option 2', 'second one'], index: 1 },
            { patterns: ['option c', 'third option', 'number 3', 'option 3', 'third one'], index: 2 },
            { patterns: ['option d', 'fourth option', 'number 4', 'option 4', 'fourth one'], index: 3 }
        ];

        for (const patternGroup of optionPatterns) {
            if (patternGroup.patterns.some(p => lowerText.includes(p))) {
                if (currentQuestion.options && currentQuestion.options[patternGroup.index]) {
                    handleAnswerChange(patternGroup.index);
                    return;
                }
            }
        }

        // 2. Fuzzy Text Matching for MCQ options
        if (currentQuestion.questionType === 'mcq' && currentQuestion.options) {
            let bestMatchIndex = -1;
            let highestSimilarity = 0;

            currentQuestion.options.forEach((opt, index) => {
                const optText = opt.text.toLowerCase();
                // Extremely simple similarity - check if cleaned transcript contains substantial part of option text
                if (lowerText.includes(optText) || optText.includes(lowerText)) {
                    bestMatchIndex = index;
                }
            });

            if (bestMatchIndex !== -1) {
                handleAnswerChange(bestMatchIndex);
                return;
            }
        }

        // 3. Descriptive Answers
        if (currentQuestion.questionType === 'descriptive') {
            handleAnswerChange(text);
        }
    }, [currentQuestion]);

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

    if (loading) return <div className="p-8 text-center font-bold text-slate-400 uppercase tracking-widest">Initializing Adaptive Assessment...</div>;
    if (!currentQuestion && !result) return <div className="p-8 text-center text-red-500 font-bold">Failed to load assessment.</div>;

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
                        <p className="text-lg text-slate-400 font-bold uppercase tracking-widest text-[10px]">
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
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Adaptive Assessment</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded">Difficulty: {currentQuestion.difficulty || 'medium'}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="px-4 py-2 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-100">
                        Question {currentStep + 1} / {totalSteps}
                    </div>
                    {/* Accessibility Toggle */}
                    <button
                        onClick={() => setAccessibilityMode(!accessibilityMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${accessibilityMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        <span>♿</span> {accessibilityMode ? 'Voice Mode On' : 'Accessibility Mode'}
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 animate-fade-in">
                    <h3 className="text-2xl font-bold mb-8 text-slate-800 leading-tight tracking-tight">
                        {currentQuestion.questionText}
                    </h3>

                    {currentQuestion.questionType === 'mcq' ? (
                        <div className="space-y-3">
                            {currentQuestion.options.map((opt, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedAnswer === oIndex
                                        ? 'bg-indigo-50 border-indigo-500 ring-4 ring-indigo-500/5'
                                        : 'hover:bg-slate-50 border-slate-100'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="adaptive-question"
                                        className="hidden"
                                        checked={selectedAnswer === oIndex}
                                        onChange={() => handleAnswerChange(oIndex)}
                                    />
                                    <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${selectedAnswer === oIndex ? 'border-indigo-600' : 'border-slate-300'}`}>
                                        {selectedAnswer === oIndex && <div className="w-3 h-3 rounded-full bg-indigo-600 animate-scale-in" />}
                                    </div>
                                    <span className={`text-lg font-bold ${selectedAnswer === oIndex ? 'text-indigo-900' : 'text-slate-600'}`}>
                                        <span className="inline-block w-6 text-slate-300 mr-2">{String.fromCharCode(65 + oIndex)}.</span>
                                        {opt.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <textarea
                            value={selectedAnswer || ''}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium text-slate-700 min-h-[200px] shadow-inner"
                            placeholder="Type your adaptive answer here..."
                        />
                    )}

                    {/* AI Voice Accessibility Box */}
                    {accessibilityMode && (
                        <VoiceAccessibilityBox
                            onCommand={handleVoiceCommand}
                            options={currentQuestion.options}
                        />
                    )}
                </div>
            </div>

            <div className="mt-8 flex justify-end items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <button
                    onClick={handleNext}
                    disabled={submitting || selectedAnswer === null || selectedAnswer === ''}
                    className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 disabled:opacity-50 flex items-center gap-3 uppercase tracking-widest text-sm"
                >
                    {submitting ? 'Processing...' : (currentStep + 1 === totalSteps ? 'Finish Assessment' : 'Next Question')}
                    {!submitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7-7 7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 5l7 7-7 7" /></svg>}
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
