export const WALLPAPER_SECTIONS = [
  { id: "desktop", title: "Desktop" },
  { id: "abstract", title: "Abstract" },
];

export const WALLPAPERS = [
  {
    id: "sonoma-horizon",
    category: "desktop",
    label: "Sonoma Horizon",
    url: "/wallpaper/images.jpg",
  },
  {
    id: "redwoods",
    category: "desktop",
    label: "Redwoods",
    url: "/wallpaper/images (1).jpg",
  },
  {
    id: "utah-evening",
    category: "desktop",
    label: "Utah Evening",
    url: "/wallpaper/images (2).jpg",
  },
  {
    id: "san-francisco-bay",
    category: "desktop",
    label: "San Francisco Bay",
    url: "/wallpaper/images (3).jpg",
  },
  {
    id: "iceland-coast",
    category: "desktop",
    label: "Iceland Coast",
    url: "/wallpaper/images (4).jpg",
  },
  {
    id: "new-york-midtown",
    category: "desktop",
    label: "New York Midtown",
    url: "/wallpaper/images (5).jpg",
  },
  {
    id: "macos-graphic",
    category: "abstract",
    label: "macOS Graphic",
    url: "/wallpaper/images (6).jpg",
  },
  {
    id: "radial-yellow",
    category: "abstract",
    label: "Radial Yellow",
    url: "/wallpaper/images (7).jpg",
  },
  {
    id: "radial-purple",
    category: "abstract",
    label: "Radial Purple",
    url: "/wallpaper/images (8).jpg",
  },
  {
    id: "radial-green",
    category: "abstract",
    label: "Radial Green",
    url: "/wallpaper/images (9).jpg",
  },
  {
    id: "radial-blue",
    category: "abstract",
    label: "Radial Blue",
    url: "/wallpaper/images (10).jpg",
  },
  {
    id: "ventura-light",
    category: "abstract",
    label: "Ventura",
    url: "/wallpaper/images (2).jpg",
  },
  {
    id: "ventura-dark",
    category: "abstract",
    label: "Ventura Dark",
    url: "/wallpaper/images (3).jpg",
  },
];

export function frameStyleFromUrl(url) {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function getWallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}