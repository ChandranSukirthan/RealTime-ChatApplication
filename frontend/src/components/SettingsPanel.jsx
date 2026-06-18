import { useState, useEffect, useRef } from 'react';
import { SOUND_FILES } from '../hooks/useKeyboardSound';

/* ─── Wallpaper list (from public/wallpaper/) ─────────────────────────────── */
const WALLPAPERS = [
  { id: 'none', label: 'None', src: null },
  { id: 'w0',  label: 'Classic', src: '/wallpaper/images.jpg' },
  { id: 'w1',  label: 'Style 1', src: '/wallpaper/images (1).jpg' },
  { id: 'w2',  label: 'Style 2', src: '/wallpaper/images (2).jpg' },
  { id: 'w3',  label: 'Style 3', src: '/wallpaper/images (3).jpg' },
  { id: 'w4',  label: 'Style 4', src: '/wallpaper/images (4).jpg' },
  { id: 'w5',  label: 'Style 5', src: '/wallpaper/images (5).jpg' },
  { id: 'w6',  label: 'Style 6', src: '/wallpaper/images (6).jpg' },
  { id: 'w7',  label: 'Style 7', src: '/wallpaper/images (7).jpg' },
  { id: 'w8',  label: 'Style 8', src: '/wallpaper/images (8).jpg' },
  { id: 'w9',  label: 'Style 9', src: '/wallpaper/images (9).jpg' },
  { id: 'w10', label: 'Style 10', src: '/wallpaper/images (10).jpg' },
];

/* ─── Sound list ──────────────────────────────────────────────────────────── */
const SOUNDS = [
  { id: 'none',    label: 'No Sound',       icon: '🔇', desc: 'Typing in silence' },
  { id: 'click_1', label: 'Soft Tap',       icon: '🪶', desc: 'Membrane / rubber dome' },
  { id: 'click_2', label: 'Medium Click',   icon: '⌨️', desc: 'Chiclet / scissor-switch' },
  { id: 'click_3', label: 'Crisp Snap',     icon: '✨', desc: 'Laptop key style' },
  { id: 'click_4', label: 'Mech Clack',     icon: '🔊', desc: 'Mechanical MX-style' },
];

/* ─── SettingsPanel ───────────────────────────────────────────────────────── */
export default function SettingsPanel({ open, onClose, wallpaper, onWallpaper, sound, onSound }) {
  const [tab, setTab] = useState('wallpaper');
  const panelRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  /* Preview a sound when its card is clicked */
  const previewSound = (id) => {
    if (id === 'none') return;
    const file = id === 'click_1' || id === 'click_2' || id === 'click_3' || id === 'click_4'
      ? SOUND_FILES[id]
      : SOUND_FILES.enter;
    const a = new Audio(file);
    a.volume = 0.7;
    a.play().catch(() => {});
  };

  return (
    <>
      {/* Backdrop */}
      <div className={`sp-backdrop ${open ? 'sp-backdrop--open' : ''}`} />

      {/* Panel */}
      <div ref={panelRef} className={`sp-panel ${open ? 'sp-panel--open' : ''}`}>

        {/* Panel header */}
        <div className="sp-header">
          <div className="sp-header-title">
            <span className="sp-header-icon">🎨</span>
            <span>Customize Chat</span>
          </div>
          <button className="sp-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Tabs */}
        <div className="sp-tabs">
          <button
            className={`sp-tab ${tab === 'wallpaper' ? 'sp-tab--active' : ''}`}
            onClick={() => setTab('wallpaper')}
          >
            🖼️ Wallpaper
          </button>
          <button
            className={`sp-tab ${tab === 'sound' ? 'sp-tab--active' : ''}`}
            onClick={() => setTab('sound')}
          >
            🎵 Keyboard Sound
          </button>
        </div>

        {/* ── Wallpaper tab ── */}
        {tab === 'wallpaper' && (
          <div className="sp-body">
            <p className="sp-hint">Choose a background for your chat window</p>
            <div className="sp-wall-grid">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  className={`sp-wall-card ${wallpaper === w.id ? 'sp-wall-card--active' : ''}`}
                  onClick={() => onWallpaper(w.id)}
                  title={w.label}
                >
                  {w.src ? (
                    <img src={w.src} alt={w.label} className="sp-wall-img" />
                  ) : (
                    <div className="sp-wall-none">
                      <span>🚫</span>
                      <small>None</small>
                    </div>
                  )}
                  <div className="sp-wall-label">{w.label}</div>
                  {wallpaper === w.id && <div className="sp-wall-check">✔</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Sound tab ── */}
        {tab === 'sound' && (
          <div className="sp-body">
            <p className="sp-hint">Choose a typing sound (click a card to preview)</p>
            <div className="sp-sound-list">
              {SOUNDS.map((s) => (
                <button
                  key={s.id}
                  className={`sp-sound-card ${sound === s.id ? 'sp-sound-card--active' : ''}`}
                  onClick={() => { onSound(s.id); previewSound(s.id); }}
                >
                  <span className="sp-sound-icon">{s.icon}</span>
                  <div className="sp-sound-info">
                    <span className="sp-sound-name">{s.label}</span>
                    <span className="sp-sound-desc">{s.desc}</span>
                  </div>
                  {sound === s.id && <span className="sp-sound-active-dot" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
