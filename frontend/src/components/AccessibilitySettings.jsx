import React, { useState, useEffect, useRef } from 'react';
import { Settings, Check, Type, Sun, Moon, Contrast } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

const AccessibilitySettings = () => {
    const { fontSize, setFontSize, highContrast, toggleHighContrast } = useAccessibility();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fontSizes = [
        { id: 'sm', label: 'Small', icon: 'A' },
        { id: 'md', label: 'Medium', icon: 'A' },
        { id: 'lg', label: 'Large', icon: 'A' }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-300 relative ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                title="Accessibility Settings"
            >
                <Settings className="w-5 h-5" />
                {(fontSize !== 'md' || highContrast) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse capitalize" title="Settings Active"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-900">Accessibility Settings</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Customize your viewing experience</p>
                    </div>

                    <div className="p-5 space-y-8">
                        {/* Font Size - Segmented Switch */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">Text Size</label>
                            <div className="relative bg-slate-100 p-1 rounded-xl flex items-center h-12">
                                {/* Sliding Pill */}
                                <div
                                    className="absolute h-10 bg-white rounded-lg shadow-sm transition-all duration-300 ease-out z-0"
                                    style={{
                                        width: 'calc(33.33% - 4px)',
                                        left: fontSize === 'sm' ? '4px' : fontSize === 'md' ? '33.33%' : 'calc(66.66% - 4px)'
                                    }}
                                />
                                {fontSizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => setFontSize(size.id)}
                                        className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-200 ${fontSize === size.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span style={{ fontSize: size.id === 'sm' ? '12px' : size.id === 'md' ? '15px' : '18px' }}>
                                                {size.icon}
                                            </span>
                                            <span className="text-[8px] mt-0.5 uppercase tracking-tighter">{size.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* High Contrast - Modern Toggle Switch */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block">High Contrast Mode</label>
                            <div
                                onClick={toggleHighContrast}
                                className="group cursor-pointer flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 bg-white border-slate-100 hover:border-slate-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl transition-colors duration-300 ${highContrast ? 'bg-slate-900 text-yellow-400' : 'bg-slate-50 text-slate-400'}`}>
                                        <Contrast className="w-4 h-4" />
                                    </div>
                                    <span className={`text-sm font-bold transition-colors duration-300 ${highContrast ? 'text-slate-900' : 'text-slate-600'}`}>
                                        Enforce Contrast
                                    </span>
                                </div>

                                {/* Toggle Switch UI */}
                                <div className={`w-12 h-6 rounded-full transition-all duration-300 relative ${highContrast ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${highContrast ? 'left-7' : 'left-1'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/30 p-3 text-center">
                        <p className="text-[10px] text-indigo-600 font-semibold italic">Changes apply instantly to all pages</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessibilitySettings;
