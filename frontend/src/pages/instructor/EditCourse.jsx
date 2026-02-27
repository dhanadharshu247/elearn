import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Trash2, Trash, AlertTriangle } from 'lucide-react';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail: '',
        status: 'Draft',
        modules: [],
        assessment: []
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [generatingIndex, setGeneratingIndex] = useState(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiModalData, setAiModalData] = useState({
        topic: '',
        count: 10,
        type: 'mcq',
        index: null
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/courses/${id}`);
                const data = response.data;
                // Transform backend data to match form state
                setCourseData({
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    thumbnail: data.thumbnail || '',
                    status: data.status || 'Draft',
                    modules: data.modules ? data.modules.map(mod => ({
                        id: mod.id,
                        title: mod.title,
                        contentLink: mod.contentLink || '',
                        quiz: mod.quiz ? mod.quiz.map(q => ({
                            id: q.id,
                            questionText: q.questionText,
                            questionType: q.questionType || 'mcq',
                            options: q.options ? q.options.map(opt => ({ text: opt.text })) : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                            correctOptionIndex: q.correctOptionIndex,
                            correctAnswerText: q.correctAnswerText || ''
                        })) : []
                    })) : [],
                    assessment: data.assessment ? data.assessment.map(q => ({
                        id: q.id,
                        questionText: q.questionText,
                        questionType: q.questionType || 'mcq',
                        difficulty: q.difficulty || 'medium',
                        options: q.options ? q.options.map(opt => ({ text: opt.text })) : [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
                        correctOptionIndex: q.correctOptionIndex,
                        correctAnswerText: q.correctAnswerText || ''
                    })) : []
                });
            } catch (err) {
                console.error('Failed to fetch course:', err);
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCourse();
    }, [id]);

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
                { title: `Module ${prev.modules.length + 1}`, contentLink: '', quiz: [] }
            ]
        }));
    };

    const removeModule = (index) => {
        const updatedModules = courseData.modules.filter((_, i) => i !== index);
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const addQuestion = (moduleIndex) => {
        if (moduleIndex === 'assessment') {
            const updatedAssessment = [...courseData.assessment];
            updatedAssessment.push({
                questionText: '',
                questionType: 'mcq',
                difficulty: 'medium',
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
            difficulty: 'medium',
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

    const removeAllQuestions = (mIndex) => {
        if (window.confirm('Are you sure you want to delete all questions in this module? This action cannot be undone.')) {
            const updatedModules = [...courseData.modules];
            updatedModules[mIndex].quiz = [];
            setCourseData(prev => ({ ...prev, modules: updatedModules }));
        }
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
                    difficulty: q.difficulty || 'medium',
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
            setError('Failed to generate questions. Please try again.');
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
        setSubmitting(true);
        setError(null);

        try {
            await api.put(`/courses/${id}`, courseData);
            navigate('/instructor/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to update course');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-600 font-medium">Loading course data...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-slate-900 tracking-tight">Edit Course</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {/* Basic Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Course Info</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                            <select
                                name="status"
                                value={courseData.status}
                                onChange={handleCourseChange}
                                className={`px-4 py-1.5 border rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all ${courseData.status === 'Published' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                                    courseData.status === 'Archived' ? 'bg-slate-100 border-slate-300 text-slate-600' :
                                        'bg-amber-50 border-amber-200 text-amber-600'
                                    }`}
                            >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Course Title</label>
                            <input
                                type="text"
                                name="title"
                                value={courseData.title}
                                onChange={handleCourseChange}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="e.g., Advanced React Patterns"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleCourseChange}
                                required
                                rows="3"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="Describe what students will learn..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                value={courseData.price}
                                onChange={handleCourseChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Thumbnail URL</label>
                            <input
                                type="text"
                                name="thumbnail"
                                value={courseData.thumbnail}
                                onChange={handleCourseChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>
                </div>

                {/* Modules Section */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Curriculum</h2>
                        <button
                            type="button"
                            onClick={addModule}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="12 4v16m8-8H4" />
                            </svg>
                            Add Module
                        </button>
                    </div>

                    <div className="space-y-6">
                        {courseData.modules.map((module, mIndex) => (
                            <div key={mIndex} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group animate-fade-in">
                                <button
                                    type="button"
                                    onClick={() => removeModule(mIndex)}
                                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                    title="Remove Module"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>

                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Module {mIndex + 1}</label>
                                        <input
                                            type="text"
                                            value={module.title}
                                            onChange={(e) => handleModuleChange(mIndex, 'title', e.target.value)}
                                            className="w-full text-xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-100 focus:outline-none focus:border-indigo-500 transition-colors pb-1"
                                            placeholder="Module Title"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Tutorial Link</label>
                                        <input
                                            type="text"
                                            value={module.contentLink}
                                            onChange={(e) => handleModuleChange(mIndex, 'contentLink', e.target.value)}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono text-sm"
                                            placeholder="YouTube or Resource URL"
                                        />
                                    </div>

                                    {/* Quiz Builder */}
                                    <div className="mt-8 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h3 className="font-bold text-slate-800">Module Quiz ({module.quiz.length})</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    disabled={generatingIndex !== null}
                                                    onClick={() => openAIModal(mIndex, module.title, 'mcq')}
                                                    className="text-[10px] font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {generatingIndex === mIndex ? '...' : '✨ AI MCQ'}
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={generatingIndex !== null}
                                                    onClick={() => openAIModal(mIndex, module.title, 'descriptive')}
                                                    className="text-[10px] font-bold text-violet-600 bg-white border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                                                >
                                                    {generatingIndex === mIndex ? '...' : '✨ AI Desc'}
                                                </button>
                                                {module.quiz.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAllQuestions(mIndex)}
                                                        className="text-[10px] font-bold text-red-600 bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors shadow-sm flex items-center gap-1"
                                                    >
                                                        <Trash className="w-3 h-3" /> Clear Quiz
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => addQuestion(mIndex)}
                                                    className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                                >
                                                    + Add Question
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {module.quiz.map((q, qIndex) => (
                                                <div key={qIndex} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm relative group/q animate-fade-in-up">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(mIndex, qIndex)}
                                                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1.5 bg-slate-50 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Remove Question"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>

                                                    <div className="flex gap-4 mb-4 pr-8">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={q.questionText}
                                                                onChange={(e) => updateQuestion(mIndex, qIndex, 'questionText', e.target.value)}
                                                                className="w-full text-base font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-indigo-400 transition-colors pb-2"
                                                                placeholder="Ask your question here..."
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
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {q.options.map((opt, oIndex) => (
                                                                <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${q.correctOptionIndex === oIndex ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${mIndex}-${qIndex}`}
                                                                        checked={q.correctOptionIndex === oIndex}
                                                                        onChange={() => updateQuestion(mIndex, qIndex, 'correctOptionIndex', oIndex)}
                                                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={opt.text}
                                                                        onChange={(e) => updateOption(mIndex, qIndex, oIndex, e.target.value)}
                                                                        className="flex-1 bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
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
                                                                rows="3"
                                                                placeholder="Enter the correct answer or key points..."
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {module.quiz.length === 0 && (
                                                <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                                    <p className="text-sm font-medium">No questions added yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Assessment Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Final Course Assessment</h2>
                            <p className="text-sm text-slate-500 font-medium">Add exactly 25 questions for the final course certification</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={generatingIndex !== null}
                                onClick={() => setAiModalData({ index: 'assessment', topic: courseData.title, count: 25, type: 'mcq' }) || setIsAIModalOpen(true)}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Generate 25 Qs
                            </button>
                            <button
                                type="button"
                                onClick={() => addQuestion('assessment')}
                                className="bg-slate-50 text-slate-600 border border-slate-200 px-5 py-2 rounded-xl font-bold hover:bg-slate-100 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Question
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {courseData.assessment.map((q, qIndex) => (
                            <div key={qIndex} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative group/as animate-fade-in-up">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion('assessment', qIndex)}
                                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-all"
                                    title="Delete Question"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="flex gap-4 mb-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={q.questionText}
                                            onChange={(e) => updateQuestion('assessment', qIndex, 'questionText', e.target.value)}
                                            className="w-full text-base font-semibold text-slate-800 bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-indigo-400 transition-colors pb-2"
                                            placeholder={`Assessment Question ${qIndex + 1}`}
                                        />
                                    </div>
                                    <div className="w-40">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options.map((opt, oIndex) => (
                                            <div key={oIndex} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${q.correctOptionIndex === oIndex ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-300'}`}>
                                                <input
                                                    type="radio"
                                                    name={`assessment-correct-${qIndex}`}
                                                    checked={q.correctOptionIndex === oIndex}
                                                    onChange={() => updateQuestion('assessment', qIndex, 'correctOptionIndex', oIndex)}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500/20"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt.text}
                                                    onChange={(e) => updateOption('assessment', qIndex, oIndex, e.target.value)}
                                                    className="flex-1 bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
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
                                            onChange={(e) => updateQuestion('assessment', qIndex, 'correctAnswerText', e.target.value)}
                                            className="w-full p-3 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10"
                                            rows="2"
                                            placeholder="Enter the correct answer or key points..."
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        {courseData.assessment.length === 0 && (
                            <div className="text-center py-12 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
                                <p className="text-slate-400 font-bold mb-2">No final assessment questions created.</p>
                                <p className="text-xs text-slate-400">Click "AI Generate 25 Qs" to populate this section automatically.</p>
                            </div>
                        )}
                        {courseData.assessment.length > 0 && (
                            <div className="flex justify-between items-center pt-4">
                                <span className={`text-sm font-black uppercase tracking-wider ${courseData.assessment.length === 25 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    Assessment Progress: {courseData.assessment.length} / 25 Questions
                                </span>
                                {courseData.assessment.length !== 25 && (
                                    <span className="text-xs text-amber-500 italic">Recommended exactly 25 for certification.</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => navigate('/instructor/dashboard')}
                        className="px-8 py-3 text-slate-500 font-bold hover:text-slate-700 transition"
                    >
                        Back to Dashboard
                    </button>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/instructor/dashboard')}
                            className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition shadow-xl shadow-indigo-500/20 disabled:opacity-50 min-w-[180px]"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form >

            {/* AI Generation Modal */}
            {
                isAIModalOpen && (
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
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                )
            }
        </div >
    );
};

export default EditCourse;
