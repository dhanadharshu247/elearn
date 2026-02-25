import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useVoiceAssessment - A production-grade hook for voice-controlled MCQ assessments.
 * 
 * Fixes:
 * - Ref-based callbacks to prevent stale closures.
 * - Robust 1s intervals for visual countdown.
 * - Aggressive auto-restart for SpeechRecognition.
 */
const useVoiceAssessment = (options, onSelect, onNext, enabled = false) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [countdown, setCountdown] = useState(null);
    const [error, setError] = useState(null);
    const [recognizedAnswer, setRecognizedAnswer] = useState(null);

    // Use Refs for callbacks to prevent stale state in timers
    const onSelectRef = useRef(onSelect);
    const onNextRef = useRef(onNext);
    const optionsRef = useRef(options);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Sync refs on every render
    useEffect(() => {
        onSelectRef.current = onSelect;
        onNextRef.current = onNext;
        optionsRef.current = options;
    });

    const normalizeTranscript = (text) => {
        const lower = text.toLowerCase().trim();
        const patterns = [
            { char: 'A', regex: /^(option|select|answer|number)?\s*(a|1|one)$/i },
            { char: 'B', regex: /^(option|select|answer|number)?\s*(b|2|two)$/i },
            { char: 'C', regex: /^(option|select|answer|number)?\s*(c|3|three)$/i },
            { char: 'D', regex: /^(option|select|answer|number)?\s*(d|4|four)$/i }
        ];

        for (const p of patterns) {
            if (p.regex.test(lower)) return p.char;
        }

        if (lower.includes('option a') || lower.includes('select a') || lower.includes('answer a')) return 'A';
        if (lower.includes('option b') || lower.includes('select b') || lower.includes('answer b')) return 'B';
        if (lower.includes('option c') || lower.includes('select c') || lower.includes('answer c')) return 'C';
        if (lower.includes('option d') || lower.includes('select d') || lower.includes('answer d')) return 'D';

        if (optionsRef.current && optionsRef.current.length > 0) {
            for (let i = 0; i < optionsRef.current.length; i++) {
                const optText = optionsRef.current[i].text.toLowerCase();
                if (lower.includes(optText) && optText.length > 3) {
                    return String.fromCharCode(65 + i);
                }
            }
        }
        return null;
    };

    const startRecognition = useCallback(() => {
        if (!recognitionRef.current) return;
        try {
            recognitionRef.current.start();
            setIsListening(true);
            setError(null);
            console.log('Voice Recognition Started');
        } catch (err) {
            // Error code 11 is 'already-started'
            if (err.error !== 'already-started') {
                console.warn('Recognition start attempted while already running or failed:', err);
            }
        }
    }, []);

    const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            console.log('Voice Recognition Stopped');
        }
    }, []);

    const processFinalTranscript = useCallback((text) => {
        if (countdown !== null) return; // Ignore while advancing

        const answerChar = normalizeTranscript(text);
        if (answerChar) {
            const index = answerChar.charCodeAt(0) - 65;
            if (optionsRef.current && optionsRef.current[index]) {
                console.log(`Voice Recognized: ${answerChar} (${index})`);
                setRecognizedAnswer(answerChar);

                // Execute callback via ref to ensure latest state access in parent
                if (onSelectRef.current) onSelectRef.current(index);

                // Stop recognition during countdown to focus
                stopRecognition();

                // Start 5-second countdown
                setCountdown(5);
            }
        }
    }, [countdown, stopRecognition]);

    // Countdown Logic using useEffect for stability
    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown hit 0
            console.log('Countdown finished, triggering auto-advance');
            setCountdown(null);
            setRecognizedAnswer(null);

            // Trigger next question via ref
            if (onNextRef.current) {
                onNextRef.current();
            }

            // The QuizPage will reset state/options which will trigger the restart effect below
        }
    }, [countdown]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let final = '';
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript;
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => (prev + ' ' + final).trim());
                processFinalTranscript(final);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') setError(event.error);

            if (enabled && countdown === null) {
                setTimeout(startRecognition, 1000);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Persistent listening: restart if enabled and not currently advancing
            if (enabled && countdown === null && !recognizedAnswer) {
                startRecognition();
            }
        };

        recognitionRef.current = recognition;

        if (enabled && countdown === null) {
            startRecognition();
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [enabled, countdown, recognizedAnswer, processFinalTranscript, startRecognition]);

    const reset = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setRecognizedAnswer(null);
        setCountdown(null);
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        countdown,
        error,
        recognizedAnswer,
        reset,
        startRecognition,
        stopRecognition
    };
};

export default useVoiceAssessment;
