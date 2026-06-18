/**
 * Wallpaper definitions — maps to files in /public/wallpaper/
 * Used by WallpaperContext and SettingsPanel.
 */
export const WALLPAPERS = [
    { id: "none",  label: "None",     url: null },
    { id: "w0",    label: "Classic",  url: "/wallpaper/images.jpg" },
    { id: "w1",    label: "Style 1",  url: "/wallpaper/images (1).jpg" },
    { id: "w2",    label: "Style 2",  url: "/wallpaper/images (2).jpg" },
    { id: "w3",    label: "Style 3",  url: "/wallpaper/images (3).jpg" },
    { id: "w4",    label: "Style 4",  url: "/wallpaper/images (4).jpg" },
    { id: "w5",    label: "Style 5",  url: "/wallpaper/images (5).jpg" },
    { id: "w6",    label: "Style 6",  url: "/wallpaper/images (6).jpg" },
    { id: "w7",    label: "Style 7",  url: "/wallpaper/images (7).jpg" },
    { id: "w8",    label: "Style 8",  url: "/wallpaper/images (8).jpg" },
    { id: "w9",    label: "Style 9",  url: "/wallpaper/images (9).jpg" },
    { id: "w10",   label: "Style 10", url: "/wallpaper/images (10).jpg" },
];

/** Returns the wallpaper object for the given id, falling back to "none". */
export function getWallpaperById(id) {
    return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}

/** Converts a wallpaper URL into a CSS background style object. */
export function frameStyleFromUrl(url) {
    if (!url) return {};
    return {
        backgroundImage: `url("${encodeURI(url)}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "local",
        backgroundRepeat: "no-repeat",
    };
}
