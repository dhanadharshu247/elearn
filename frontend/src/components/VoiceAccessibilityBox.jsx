import React, { useEffect } from 'react';
import useVoiceAssessment from '../hooks/useVoiceAssessment';

/**
 * VoiceAccessibilityBox - A production-ready voice UI for assessments.
 */
const VoiceAccessibilityBox = ({ onSelect, onNext, options = [], enabled = false }) => {
    const {
        isListening,
        transcript,
        interimTranscript,
        countdown,
        error,
        recognizedAnswer,
        reset
    } = useVoiceAssessment(options, onSelect, onNext, enabled);

    // Reset transcripts when the question changes (detected by options change)
    useEffect(() => {
        reset();
    }, [options]);

    return (
        <div className="mt-6 p-6 bg-slate-50 border-2 border-dashed border-indigo-200 rounded-[2.5rem] animate-fade-in shadow-inner relative overflow-hidden">
            {/* Background Pulse for Mic Active */}
            {isListening && !countdown && (
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${isListening ? 'bg-indigo-600 shadow-lg shadow-indigo-200 scale-110' : 'bg-slate-200'}`}>
                        {isListening ? (
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                            </span>
                        ) : (
                            <span className="text-xl">🎙️</span>
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-slate-800 text-xs tracking-widest uppercase">
                            {isListening ? 'Listening...' : 'Voice Mode Standby'}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {error ? `Error: ${error}` : 'Say "Option A", "Option B", etc.'}
                        </p>
                    </div>
                </div>

                {recognizedAnswer && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg animate-bounce-in">
                        <span>✅</span> Selected {recognizedAnswer}
                    </div>
                )}

                {countdown !== null && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg animate-pulse">
                        <span>⏱️</span> Next in {countdown}s
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-3xl min-h-[80px] shadow-sm border border-slate-100 flex flex-col justify-center mb-0 relative z-10">
                <div className="text-sm text-slate-700 leading-relaxed font-bold text-center">
                    {transcript}
                    <span className="text-slate-300 italic"> {interimTranscript}</span>
                    {!transcript && !interimTranscript && !isListening && (
                        <p className="text-slate-300 text-xs italic font-normal">
                            Voice mode is waiting for your permission...
                        </p>
                    )}
                    {!transcript && !interimTranscript && isListening && (
                        <p className="text-slate-400 text-xs animate-pulse font-normal">
                            Try saying "Option A" or "Answer B"
                        </p>
                    )}
                </div>
            </div>

            <p className="mt-4 text-[9px] text-slate-400 font-black text-center uppercase tracking-[0.2em] opacity-50">
                Continuous AI Speech Recognition • v2.0
            </p>
        </div>
    );
};

export default VoiceAccessibilityBox;
