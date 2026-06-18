import { useEffect, useState } from "react";
import { frameStyleFromUrl, getWallpaperById } from "../data/wallpapers";
// Fixed: was importing "wallpaperContexr" (typo) — now correctly uses WallpaperContext
import { WallpaperContext } from "./wallpaper";

const STORAGE_KEY = "chat_wallpaper-id";

function readStoredWallpaperId() {
    const id = localStorage.getItem(STORAGE_KEY);
    if (id) return id;
    return "none";
}

export function WallpaperProvider({ children }) {
    const [wallpaperId, setWallpaperIdState] = useState(readStoredWallpaperId);

    // Persist to localStorage whenever id changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, wallpaperId);
    }, [wallpaperId]);

    const wallpaper = getWallpaperById(wallpaperId);

    const setWallpaperId = (id) => {
        setWallpaperIdState(id);
    };

    const frameStyle = frameStyleFromUrl(wallpaper?.url ?? null);

    // Fixed: removed duplicate wallpaperId key, fixed broken JSX Provider structure
    return (
        <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId, wallpaper, frameStyle }}>
            {children}
        </WallpaperContext.Provider>
    );
}