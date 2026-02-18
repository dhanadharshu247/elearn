import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Layers, Plus, Users, Search, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newBatch, setNewBatch] = useState({ name: '', course_id: '' });

    const fetchData = async () => {
        try {
            const [batchesRes, coursesRes] = await Promise.all([
                api.get('/batches'),
                api.get('/courses/my-courses')
            ]);
            setBatches(batchesRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateBatch = async (e) => {
        e.preventDefault();
        try {
            await api.post('/batches', newBatch);
            setIsCreateModalOpen(false);
            setNewBatch({ name: '', course_id: '' });
            fetchData();
        } catch (err) {
            console.error('Failed to create batch:', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Student Batches</h1>
                    <p className="text-slate-500 mt-2">Manage groups of students for your courses.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    <Plus className="w-5 h-5 mr-2" /> Create Batch
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : batches.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No batches created yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map((batch) => (
                        <div key={batch.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <Layers className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{batch.name}</h3>
                                    <p className="text-xs text-slate-500">ID: {batch.id}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Course ID: {batch.course_id}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span>0 Students</span>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                                Manage Students
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Simple Modal Shim */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">Create New Batch</h2>
                        <form onSubmit={handleCreateBatch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Batch Name (e.g. Morning, Evening)</label>
                                <input
                                    type="text"
                                    value={newBatch.name}
                                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                                    placeholder="e.g. Morning Batch / Evening Batch"
                                    className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Assign Course</label>
                                <select
                                    value={newBatch.course_id}
                                    onChange={(e) => setNewBatch({ ...newBatch, course_id: e.target.value })}
                                    className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10"
                                    required
                                >
                                    <option value="">Select a course</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
