import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'md');
    const [highContrast, setHighContrast] = useState(localStorage.getItem('highContrast') === 'true');

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-font-size', fontSize);
        localStorage.setItem('fontSize', fontSize);
    }, [fontSize]);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-high-contrast', highContrast ? 'true' : 'false');
        localStorage.setItem('highContrast', highContrast.toString());
    }, [highContrast]);

    const toggleHighContrast = () => setHighContrast(prev => !prev);

    return (
        <AccessibilityContext.Provider value={{ fontSize, setFontSize, highContrast, toggleHighContrast }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
