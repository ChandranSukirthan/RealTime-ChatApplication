import { useEffect, useRef, useState } from "react";
import { SoundContext } from "./sound";

const STORAGE_KEY = "keyboard_sound_profile";

const SOUND_FILES = {
    click_1:   "/sounds/key_click_1.wav",
    click_2:   "/sounds/key_click_2.wav",
    click_3:   "/sounds/key_click_3.wav",
    click_4:   "/sounds/key_click_4.wav",
    enter:     "/sounds/key_enter.wav",
    backspace: "/sounds/key_backspace.wav",
};

function readStoredProfile() {
    return localStorage.getItem(STORAGE_KEY) ?? "none";
}

export function SoundProvider({ children }) {
    const [soundProfile, setSoundProfileState] = useState(readStoredProfile);

    // Pre-load all audio objects once
    const audioMap = useRef({});
    useEffect(() => {
        Object.entries(SOUND_FILES).forEach(([key, src]) => {
            const a = new Audio(src);
            a.volume = 0.55;
            audioMap.current[key] = a;
        });
    }, []);

    // Persist preference
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, soundProfile);
    }, [soundProfile]);

    // Global keydown listener — only active when a profile is selected
    useEffect(() => {
        if (!soundProfile || soundProfile === "none") return;

        const play = (key) => {
            const a = audioMap.current[key];
            if (!a) return;
            a.currentTime = 0;
            a.play().catch(() => {});
        };

        const handler = (e) => {
            if (e.key === "Enter") {
                play("enter");
            } else if (e.key === "Backspace" || e.key === "Delete") {
                play("backspace");
            } else if (e.key.length === 1) {
                play(soundProfile);
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [soundProfile]);

    /** Play a one-shot preview of the given sound profile (used in the settings panel) */
    const previewSound = (id) => {
        if (id === "none") return;
        const key = ["click_1","click_2","click_3","click_4"].includes(id) ? id : "enter";
        const src = SOUND_FILES[key];
        const a = new Audio(src);
        a.volume = 0.7;
        a.play().catch(() => {});
    };

    const setSoundProfile = (id) => setSoundProfileState(id);

    return (
        <SoundContext.Provider value={{ soundProfile, setSoundProfile, previewSound }}>
            {children}
        </SoundContext.Provider>
    );
}
