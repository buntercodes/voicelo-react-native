import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const OFFICIAL_VOICES = [
    { id: 'Alex', name: 'Alex', gender: 'Male', description: 'Energetic & Expressive' },
    { id: 'Ashley', name: 'Ashley', gender: 'Female', description: 'Warm & Natural' },
    { id: 'Craig', name: 'Craig', gender: 'Male', description: 'Refined & Articulate' },
    { id: 'Deborah', name: 'Deborah', gender: 'Female', description: 'Gentle & Elegant' },
    { id: 'Dennis', name: 'Dennis', gender: 'Male', description: 'Smooth & Friendly' },
    { id: 'Edward', name: 'Edward', gender: 'Male', description: 'Fast-talking & Emphatic' },
    { id: 'Elizabeth', name: 'Elizabeth', gender: 'Female', description: 'Professional & Polished' },
    { id: 'Julia', name: 'Julia', gender: 'Female', description: 'Quirky & High-pitched' },
];

interface SettingsContextType {
    selectedVoiceId: string;
    setSelectedVoiceId: (id: string) => void;
    speechRate: number;
    setSpeechRate: (rate: number) => void;
    pitch: number;
    setPitch: (pitch: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [selectedVoiceId, setSelectedVoiceId] = useState('Alex');
    const [speechRate, setSpeechRate] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);

    useEffect(() => {
        // Load settings from storage
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem('app_settings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.voiceId) setSelectedVoiceId(parsed.voiceId);
                    if (parsed.speechRate) setSpeechRate(parsed.speechRate);
                    if (parsed.pitch) setPitch(parsed.pitch);
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        // Save settings to storage whenever they change
        const saveSettings = async () => {
            try {
                const settings = {
                    voiceId: selectedVoiceId,
                    speechRate,
                    pitch,
                };
                await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
            } catch (e) {
                console.error('Failed to save settings', e);
            }
        };
        saveSettings();
    }, [selectedVoiceId, speechRate, pitch]);

    return (
        <SettingsContext.Provider value={{
            selectedVoiceId,
            setSelectedVoiceId,
            speechRate,
            setSpeechRate,
            pitch,
            setPitch
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
