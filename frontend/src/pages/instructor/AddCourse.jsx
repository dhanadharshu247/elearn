import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddCourse = () => {
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail: '',
        modules: [
            {
                title: 'Module 1',
                contentLink: '',
                documents: [],
                quiz: []
            }
        ],
        assessment: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingIndex, setGeneratingIndex] = useState(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiModalData, setAiModalData] = useState({
        topic: '',
        count: 10,
        type: 'mcq',
        index: null
    });

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setCourseData(prev => ({ ...prev, [name]: value }));
    };

    const handleModuleChange = (index, field, value) => {
        const updatedModules = [...courseData.modules];
        updatedModules[index][field] = value;
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const addModule = () => {
        setCourseData(prev => ({
            ...prev,
            modules: [
                ...prev.modules,
                { title: `Module ${prev.modules.length + 1}`, contentLink: '', documents: [], quiz: [] }
            ]
        }));
    };

    const removeModule = (index) => {
        if (courseData.modules.length === 1) return;
        const updatedModules = courseData.modules.filter((_, i) => i !== index);
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const addQuestion = (moduleIndex) => {
        if (moduleIndex === 'assessment') {
            const updatedAssessment = [...courseData.assessment];
            updatedAssessment.push({
                questionText: '',
                questionType: 'mcq',
                options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                correctOptionIndex: 0,
                correctAnswerText: ''
            });
            setCourseData(prev => ({ ...prev, assessment: updatedAssessment }));
            return;
        }
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex].quiz.push({
            questionText: '',
            questionType: 'mcq',
            options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
            correctOptionIndex: 0,
            correctAnswerText: ''
        });
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const updateQuestion = (mIndex, qIndex, field, value) => {
        if (mIndex === 'assessment') {
            const updatedAssessment = [...courseData.assessment];
            updatedAssessment[qIndex][field] = value;
            setCourseData(prev => ({ ...prev, assessment: updatedAssessment }));
            return;
        }
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz[qIndex][field] = value;
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const updateOption = (mIndex, qIndex, oIndex, value) => {
        if (mIndex === 'assessment') {
            const updatedAssessment = [...courseData.assessment];
            updatedAssessment[qIndex].options[oIndex].text = value;
            setCourseData(prev => ({ ...prev, assessment: updatedAssessment }));
            return;
        }
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz[qIndex].options[oIndex].text = value;
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const removeQuestion = (mIndex, qIndex) => {
        if (mIndex === 'assessment') {
            const updatedAssessment = [...courseData.assessment];
            updatedAssessment.splice(qIndex, 1);
            setCourseData(prev => ({ ...prev, assessment: updatedAssessment }));
            return;
        }
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz.splice(qIndex, 1);
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const handleAIGenerate = async () => {
        const { index, topic, type, count } = aiModalData;
        setGeneratingIndex(index);
        setIsAIModalOpen(false);
        setError(null);
        try {
            const response = await api.post('/api/ai/generate-questions', {
                topic: topic,
                questionType: type,
                count: parseInt(count) || 10
            });

            const newQuestions = response.data.questions;
            if (newQuestions && newQuestions.length > 0) {
                const formattedQuestions = newQuestions.map(q => ({
                    questionText: q.questionText,
                    questionType: q.questionType || type,
                    options: q.options || [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                    correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0,
                    correctAnswerText: q.correctAnswerText || ''
                }));

                if (index === 'assessment') {
                    setCourseData(prev => ({
                        ...prev,
                        assessment: [...prev.assessment, ...formattedQuestions]
                    }));
                } else {
                    const updatedModules = [...courseData.modules];
                    updatedModules[index].quiz = [...updatedModules[index].quiz, ...formattedQuestions];
                    setCourseData(prev => ({ ...prev, modules: updatedModules }));
                }
            }
        } catch (err) {
            console.error('AI Generation failed:', err);
            setError('Failed to generate questions.');
        } finally {
            setGeneratingIndex(null);
        }
    };

    const openAIModal = (index, title, type) => {
        setAiModalData({
            index,
            topic: title,
            count: 10,
            type
        });
        setIsAIModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/courses', courseData);
            navigate('/instructor/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Create Multi-Module Course</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold mb-4 text-slate-800">Course Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Course Title</label>
                            <input
                                type="text"
                                name="title"
                                value={courseData.title}
                                onChange={handleCourseChange}
                                required
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Full Stack Development Bootcamp"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleCourseChange}
                                required
                                rows="3"
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="Summarize your course contents..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={courseData.price}
                                onChange={handleCourseChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-1">Thumbnail URL</label>
                            <input
                                type="text"
                                name="thumbnail"
                                value={courseData.thumbnail}
                                onChange={handleCourseChange}
                                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Course Curriculum</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition"
                        >
                            + Add Module
                        </button>
                    </div>

                    {courseData.modules.map((module, mIndex) => (
                        <div key={mIndex} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative">
                            <button
                                type="button"
                                onClick={() => removeModule(mIndex)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                                title="Remove Module"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Module {mIndex + 1} Title</label>
                                    <input
                                        type="text"
                                        value={module.title}
                                        onChange={(e) => handleModuleChange(mIndex, 'title', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold"
                                        placeholder="Introduction, Getting Started, etc."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">Tutorial Content Link</label>
                                    <input
                                        type="text"
                                        value={module.contentLink}
                                        onChange={(e) => handleModuleChange(mIndex, 'contentLink', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                                        placeholder="YouTube Video Link or Article URL"
                                    />
                                </div>


                                {/* Quiz Builder for Module */}
                                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-700">Module Test (MCQs & Descriptive)</h3>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={generatingIndex !== null}
                                                onClick={() => openAIModal(mIndex, module.title, 'mcq')}
                                                className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {generatingIndex === mIndex ? '...' : '✨ AI MCQ'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={generatingIndex !== null}
                                                onClick={() => openAIModal(mIndex, module.title, 'descriptive')}
                                                className="text-[10px] font-bold text-violet-600 bg-white border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {generatingIndex === mIndex ? '...' : '✨ AI Desc'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addQuestion(mIndex)}
                                                className="text-indigo-600 text-sm font-bold border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50"
                                            >
                                                + Add Question
                                            </button>
                                        </div>
                                    </div>

                                    {module.quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm relative">
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(mIndex, qIndex)}
                                                className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                                                title="Delete Question"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <div className="flex gap-4 mb-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={q.questionText}
                                                        onChange={(e) => updateQuestion(mIndex, qIndex, 'questionText', e.target.value)}
                                                        className="w-full px-3 py-2 border-b border-slate-100 focus:outline-none font-medium"
                                                        placeholder="Enter question text..."
                                                    />
                                                </div>
                                                <div className="w-40">
                                                    <select
                                                        value={q.questionType}
                                                        onChange={(e) => updateQuestion(mIndex, qIndex, 'questionType', e.target.value)}
                                                        className="w-full p-2 text-sm border-none bg-slate-50 rounded-lg focus:ring-2 focus:ring-indigo-500/10"
                                                    >
                                                        <option value="mcq">MCQ</option>
                                                        <option value="descriptive">Descriptive</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {q.questionType === 'mcq' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center space-x-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${mIndex}-${qIndex}`}
                                                                checked={q.correctOptionIndex === oIndex}
                                                                onChange={() => updateQuestion(mIndex, qIndex, 'correctOptionIndex', oIndex)}
                                                                className="text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt.text}
                                                                onChange={(e) => updateOption(mIndex, qIndex, oIndex, e.target.value)}
                                                                className="flex-1 text-sm px-2 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                                                placeholder={`Option ${oIndex + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-sm">
                                                    <label className="block font-bold text-slate-500 mb-1">Model Answer (Optional)</label>
                                                    <textarea
                                                        value={q.correctAnswerText || ''}
                                                        onChange={(e) => updateQuestion(mIndex, qIndex, 'correctAnswerText', e.target.value)}
                                                        className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/10"
                                                        rows="2"
                                                        placeholder="Enter the correct answer or key points..."
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Assessment Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Final Course Assessment</h2>
                            <p className="text-sm text-slate-500">Add 25 questions for the final test</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={generatingIndex !== null}
                                onClick={() => setAiModalData({ index: 'assessment', topic: courseData.title, count: 25, type: 'mcq' }) || setIsAIModalOpen(true)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                            >
                                ✨ AI Generate 25 Qs
                            </button>
                            <button
                                type="button"
                                onClick={() => addQuestion('assessment')}
                                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition"
                            >
                                + Add Manually
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {courseData.assessment.map((q, qIndex) => (
                            <div key={qIndex} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion('assessment', qIndex)}
                                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                                    title="Delete Question"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="flex gap-4 mb-3">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion('assessment', qIndex, 'questionText', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-medium"
                                            placeholder={`Assessment Question ${qIndex + 1}`}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <select
                                            value={q.questionType}
                                            onChange={(e) => updateQuestion('assessment', qIndex, 'questionType', e.target.value)}
                                            className="w-full p-2 text-sm border-none bg-white rounded-lg focus:ring-2 focus:ring-indigo-500/10"
                                        >
                                            <option value="mcq">MCQ</option>
                                            <option value="descriptive">Descriptive</option>
                                        </select>
                                    </div>
                                </div>
                                {q.questionType === 'mcq' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name={`assessment-correct-${qIndex}`}
                                                    checked={q.correctOptionIndex === oIndex}
                                                    onChange={() => updateQuestion('assessment', qIndex, 'correctOptionIndex', oIndex)}
                                                    className="text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateOption('assessment', qIndex, oIndex, e.target.value)}
                                                    className="flex-1 text-sm px-2 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder={`Option ${oIndex + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <textarea
                                        value={q.correctAnswerText || ''}
                                        onChange={(e) => updateQuestion('assessment', qIndex, 'correctAnswerText', e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10 text-sm"
                                        rows="2"
                                        placeholder="Enter the correct answer or key points..."
                                    />
                                )}
                            </div>
                        ))}
                        {courseData.assessment.length === 0 && (
                            <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-400 font-medium">No assessment questions added yet. Use AI to generate 25 questions quickly!</p>
                            </div>
                        )}
                        {courseData.assessment.length > 0 && (
                            <div className="text-right pt-2">
                                <span className={`text-sm font-bold ${courseData.assessment.length === 25 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                    Total Questions: {courseData.assessment.length} / 25
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/instructor/dashboard')}
                        className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Publish Course'}
                    </button>
                </div>
            </form>

            {/* AI Generation Modal */}
            {isAIModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Generate AI Questions</h3>
                            <p className="text-sm text-slate-500 mb-6">Customize your {aiModalData.type.toUpperCase()} generation</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Topic</label>
                                    <input
                                        type="text"
                                        value={aiModalData.topic}
                                        onChange={(e) => setAiModalData(prev => ({ ...prev, topic: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                        placeholder="Enter topic..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Number of Questions</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={aiModalData.count}
                                        onChange={(e) => setAiModalData(prev => ({ ...prev, count: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <button
                                    onClick={() => setIsAIModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAIGenerate}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddCourse;
