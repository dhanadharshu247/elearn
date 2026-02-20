import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Layers, Plus, Users, Search, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [newBatch, setNewBatch] = useState({ name: '', course_id: '', start_time: '', end_time: '' });

    const fetchData = async () => {
        try {
            const [batchesRes, coursesRes] = await Promise.all([
                api.get('/batches'),
                api.get('/courses/my-courses', { params: { status: 'All' } })
            ]);
            console.log('Courses fetched for batches:', coursesRes.data);
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
            setNewBatch({ name: '', course_id: '', start_time: '', end_time: '' });
            fetchData();
        } catch (err) {
            console.error('Failed to create batch:', err);
        }
    };

    const openManageStudents = async (batch) => {
        setSelectedBatch(batch);
        setIsManageModalOpen(true);
        try {
            // Fetch students enrolled in the course associated with the batch
            const response = await api.get(`/courses/${batch.course_id}`);
            // The course response should have enrolledStudents list
            // We might need an endpoint to get student details by IDs or update the backend
            // For now, let's assume we can fetch students from /courses/my-learners and filter them
            const learnersRes = await api.get('/courses/my-learners');
            const courseLearners = learnersRes.data.filter(l => l.courses.includes(response.data.title));
            setEnrolledStudents(courseLearners);
        } catch (err) {
            console.error('Failed to fetch course students:', err);
        }
    };

    const handleAssignStudent = async (studentId) => {
        if (!selectedBatch) return;
        try {
            // We'll update the assigned students list
            // The backend endpoint /batches/{batch_id}/students expects a list of IDs
            // We should get current assigned students first or just toggle
            // For now, let's just toggle and send the new list
            const currentIds = selectedBatch.students ? selectedBatch.students.map(s => s.id) : [];
            const newIds = currentIds.includes(studentId)
                ? currentIds.filter(id => id !== studentId)
                : [...currentIds, studentId];

            await api.post(`/batches/${selectedBatch.id}/students`, newIds);

            // Refresh batch data to show updated student count
            const batchesRes = await api.get('/batches');
            setBatches(batchesRes.data);

            // Update selectedBatch locally to reflect changes in modal
            const updatedBatch = batchesRes.data.find(b => b.id === selectedBatch.id);
            setSelectedBatch(updatedBatch);
        } catch (err) {
            console.error('Failed to assign student:', err);
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
                                    <span className="font-medium text-indigo-600">{batch.course_title || `Course ID: ${batch.course_id}`}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Users className="w-4 h-4" />
                                    <span>{batch.students ? batch.students.length : 0} Students</span>
                                </div>
                                {(batch.start_time || batch.end_time) && (
                                    <div className="mt-2 text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded-lg">
                                        {batch.start_time && `Start: ${new Date(batch.start_time).toLocaleString()}`}
                                        {batch.end_time && ` - End: ${new Date(batch.end_time).toLocaleString()}`}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => openManageStudents(batch)}
                                className="w-full mt-6 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors"
                            >
                                Manage Students
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={newBatch.start_time}
                                        onChange={(e) => setNewBatch({ ...newBatch, start_time: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={newBatch.end_time}
                                        onChange={(e) => setNewBatch({ ...newBatch, end_time: e.target.value })}
                                        className="w-full p-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/10"
                                    />
                                </div>
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

            {/* Manage Students Modal */}
            {isManageModalOpen && selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Manage Students</h2>
                                <p className="text-slate-500 text-sm">Batch: {selectedBatch.name}</p>
                            </div>
                            <button
                                onClick={() => setIsManageModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            >
                                <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2">
                            {enrolledStudents.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    No students enrolled in this course yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {enrolledStudents.map(student => {
                                        const isAssigned = selectedBatch.students?.some(s => s.id === student.id);
                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50/50 transition-colors border border-transparent hover:border-indigo-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm">
                                                        {student.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{student.name}</p>
                                                        <p className="text-xs text-slate-500">{student.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAssignStudent(student.id)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isAssigned
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20'}`}
                                                >
                                                    {isAssigned ? 'Remove' : 'Assign'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => setIsManageModalOpen(false)}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
