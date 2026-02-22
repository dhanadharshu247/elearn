import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * VoiceAccessibilityBox - A component for AI-powered voice commands in quizzes.
 * Designed for users with motor or speech impairments.
 * 
 * Features:
 * - Real-time Speech-to-Text using Web Speech API.
 * - AI Speech Cleaning via Groq backend.
 * - Real-time feedback and confidence display.
 */
const VoiceAccessibilityBox = ({ onCommand, options = [] }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [isCleaning, setIsCleaning] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech Recognition not supported in this browser.');
            return;
        }

        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'en-US';

        recognizer.onresult = (event) => {
            let final = '';
            let interim = '';
            let conf = 0;

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                    conf = event.results[i][0].confidence;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => prev + ' ' + final);
                setConfidence(conf);
            }
            setInterimTranscript(interim);
        };

        recognizer.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognizer.onend = () => {
            setIsRecording(false);
        };

        setRecognition(recognizer);
    }, []);

    const startRecording = () => {
        if (recognition && !isRecording) {
            recognition.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognition && isRecording) {
            recognition.stop();
            setIsRecording(false);
            processSpeech(transcript + ' ' + interimTranscript);
        }
    };

    const clearTranscript = () => {
        setTranscript('');
        setInterimTranscript('');
        setConfidence(0);
    };

    const processSpeech = async (rawText) => {
        if (!rawText.trim()) return;

        setIsCleaning(true);
        try {
            const response = await api.post('/ai/clean-speech', { text: rawText });
            const cleanedText = response.data.cleaned_text;
            setTranscript(cleanedText);

            // Send cleaned text to parent for auto-selection logic
            if (onCommand) {
                onCommand(cleanedText);
            }
        } catch (err) {
            console.error('Failed to clean speech:', err);
            if (onCommand) onCommand(rawText);
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <div className="mt-6 p-5 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-3xl animate-fade-in shadow-inner">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🎙️</span>
                    <h4 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Voice Mode Active</h4>
                </div>
                {confidence > 0 && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-white px-2 py-1 rounded-full shadow-sm border border-indigo-50">
                        Confidence: {(confidence * 100).toFixed(0)}%
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-2xl min-h-[100px] shadow-sm border border-slate-100 flex flex-col justify-between mb-4">
                <div className="text-sm text-slate-700 leading-relaxed font-medium">
                    {transcript}
                    <span className="text-slate-300 italic"> {interimTranscript}</span>
                    {!transcript && !interimTranscript && (
                        <p className="text-slate-300 text-xs text-center mt-4 italic font-normal">
                            Try saying: "Option A" or "The first one"
                        </p>
                    )}
                </div>
                {isCleaning && (
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">AI Refinement...</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="flex-1 min-w-[120px] py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        <span>⏺️</span> Start
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="flex-1 min-w-[120px] py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition shadow-lg shadow-rose-100 flex items-center justify-center gap-2"
                    >
                        <span>⏹️</span> Stop
                    </button>
                )}

                <button
                    onClick={clearTranscript}
                    disabled={isRecording || !transcript}
                    className="px-6 py-3 bg-white text-slate-400 font-bold rounded-xl hover:bg-slate-100 transition border border-slate-100 disabled:opacity-30"
                >
                    Clear
                </button>
            </div>

            <p className="mt-3 text-[10px] text-slate-400 font-medium text-center uppercase tracking-widest">
                Optimized for speech impairments & motor disabilities
            </p>
        </div>
    );
};

export default VoiceAccessibilityBox;
