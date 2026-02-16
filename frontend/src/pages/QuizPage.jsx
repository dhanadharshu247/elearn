import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIndex: optionIndex }
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // We don't have a direct "get quiz" endpoint by ID in the plan/routes, 
                // but checking quizzes.js, we forgot a "GET /quizzes/:id" route! 
                // The plan said "GET /:id/submit". 
                // We actually need to fetch the quiz to display it.
                // I need to add GET /quizzes/:id to backend.
                // For now, I'll fetch ALL quizzes for the course (if I knew the course ID) or search.
                // Wait, I missed adding `GET /quizzes/:id` in the backend routes. 
                // I will assume I can fix it or I might have added it? checking...
                // I added `GET /course/:courseId`. 
                // I should add `GET /:id` to quizzes.js.

                // Let's assume I will fix backend in a moment.
                const res = await api.get(`/quizzes/${id}`);
                setQuiz(res.data);
            } catch (err) {
                console.error(err);
                // Fallback: This might fail if route doesn't exist.
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleOptionSelect = (qIndex, oIndex) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [qIndex]: oIndex
        }));
    };

    const handleSubmit = async () => {
        if (!quiz) return;
        setSubmitting(true);

        // Prepare answers array
        const answersArray = quiz.questions.map((_, index) => selectedAnswers[index] ?? -1);

        try {
            const res = await api.post(`/quizzes/${id}/submit`, { answers: answersArray });
            setResult(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Quiz...</div>;
    if (!quiz) return <div className="p-8 text-center text-red-500">Quiz not found or failed to load.</div>;

    if (result) {
        return (
            <div className="container mx-auto p-6 max-w-2xl text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                    <div className="mb-6">
                        <span className="text-6xl">🏆</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Quiz Completed!</h2>
                    <p className="text-gray-600 mb-6">You have successfully submitted the quiz.</p>

                    <div className="text-5xl font-black text-blue-600 mb-2">
                        {Math.round((result.score / result.totalQuestions) * 100)}%
                    </div>
                    <p className="text-lg text-gray-500 mb-8">
                        You scored {result.score} out of {result.totalQuestions}
                    </p>

                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                    >
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">{quiz.title}</h1>

            <div className="space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                            <span className="text-gray-400 mr-2">#{qIndex + 1}</span>
                            {q.questionText}
                        </h3>
                        <div className="space-y-2">
                            {q.options.map((opt, oIndex) => (
                                <label
                                    key={oIndex}
                                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${selectedAnswers[qIndex] === oIndex
                                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500'
                                            : 'hover:bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${qIndex}`}
                                        className="hidden"
                                        checked={selectedAnswers[qIndex] === oIndex}
                                        onChange={() => handleOptionSelect(qIndex, oIndex)}
                                    />
                                    <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedAnswers[qIndex] === oIndex ? 'border-blue-600' : 'border-gray-400'
                                        }`}>
                                        {selectedAnswers[qIndex] === oIndex && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                    </div>
                                    <span className="text-gray-700">{opt.text}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Answers'}
                </button>
            </div>
        </div>
    );
};

export default QuizPage;
