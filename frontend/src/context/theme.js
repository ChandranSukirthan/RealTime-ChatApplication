import { createContext, useContext } from "react";
import { DEFAULT_THEME_PRESET_ID, HERO_UI_THEME_PRESETS } from "../data/therouiThemePresets";

export const ThemeContext = createContext(null);

/** Returns true if the given id matches a known theme preset */
export function isValidThemePreset(presetId) {
    return HERO_UI_THEME_PRESETS.some((p) => p.id === presetId);
}

/** Apply preset id to <html data-theme-preset="…"> so CSS vars update before paint */
export function applyThemePresetToDocument(presetId) {
    const id = isValidThemePreset(presetId) ? presetId : DEFAULT_THEME_PRESET_ID;
    document.documentElement.setAttribute("data-theme-preset", id);
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used within ThemeProvider");
    }
    return ctx;
}
