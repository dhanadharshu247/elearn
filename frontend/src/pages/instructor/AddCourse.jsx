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
        ]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        const updatedModules = [...courseData.modules];
        updatedModules[moduleIndex].quiz.push({
            questionText: '',
            options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
            correctOptionIndex: 0
        });
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const updateQuestion = (mIndex, qIndex, field, value) => {
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz[qIndex][field] = value;
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const updateOption = (mIndex, qIndex, oIndex, value) => {
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz[qIndex].options[oIndex].text = value;
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
    };

    const removeQuestion = (mIndex, qIndex) => {
        const updatedModules = [...courseData.modules];
        updatedModules[mIndex].quiz.splice(qIndex, 1);
        setCourseData(prev => ({ ...prev, modules: updatedModules }));
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
                                        <h3 className="font-bold text-slate-700">Module Test (MCQs)</h3>
                                        <button
                                            type="button"
                                            onClick={() => addQuestion(mIndex)}
                                            className="text-indigo-600 text-sm font-bold border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-50"
                                        >
                                            + Add Question
                                        </button>
                                    </div>

                                    {module.quiz.map((q, qIndex) => (
                                        <div key={qIndex} className="bg-white p-4 rounded-xl border border-slate-200 mb-4 shadow-sm relative">
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(mIndex, qIndex)}
                                                className="absolute top-2 right-2 text-slate-300 hover:text-red-400"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <input
                                                type="text"
                                                value={q.questionText}
                                                onChange={(e) => updateQuestion(mIndex, qIndex, 'questionText', e.target.value)}
                                                className="w-full px-3 py-2 border-b border-slate-100 focus:outline-none mb-3 font-medium"
                                                placeholder="Enter question text..."
                                            />
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
                                                            className="flex-1 text-sm px-2 py-1 border-none focus:ring-b-2 focus:ring-indigo-100"
                                                            placeholder={`Option ${oIndex + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
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
        </div>
    );
};

export default AddCourse;
