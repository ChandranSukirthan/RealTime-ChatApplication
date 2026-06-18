import { createContext, useContext } from "react";

export const SoundContext = createContext(null);

export function useSound() {
    const ctx = useContext(SoundContext);
    if (!ctx) {
        throw new Error("useSound must be used within SoundProvider");
    }
    return ctx;
}

/** All available keyboard sound profiles */
export const SOUND_PROFILES = [
    { id: "none",    label: "No Sound",     icon: "🔇", desc: "Typing in silence" },
    { id: "click_1", label: "Soft Tap",     icon: "🪶", desc: "Membrane / rubber dome" },
    { id: "click_2", label: "Medium Click", icon: "⌨️", desc: "Chiclet / scissor-switch" },
    { id: "click_3", label: "Crisp Snap",   icon: "✨", desc: "Laptop key style" },
    { id: "click_4", label: "Mech Clack",   icon: "🔊", desc: "Mechanical MX-style" },
];
