// ─────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────

export type SceneType  = 'intro' | 'text' | 'code';
export type TemplateId =
  | 'terminal'    // 1 — VS Code terminal dark
  | 'splitview'   // 2 — split two-panel comparison
  | 'notebook'    // 3 — neon notebook / graph paper
  | 'cinematic'   // 4 — cinematic letterbox
  | 'hologram'    // 5 — hologram hex ring glow
  | 'blueprint'   // 6 — engineering blueprint grid
  | 'glass'       // 7 — glassmorphism frosted card
  | 'retrocrt'    // 8 — retro CRT phosphor screen
  | 'neonsign'    // 9 — neon sign flicker
  | 'newspaper'   // 10 — newspaper broadsheet
  | 'darkminimal' // 11 — dark minimal accent line
  | 'cardstack'   // 12 — stacked cards gradient border
  | 'vaporwave'   // 13 — retrowave sun / grid
  | 'infographic' // 14 — stats + checklist infographic
  | 'comic';      // 15 — comic panel speech bubble

interface BaseScene {
  template?:           TemplateId;
  content?:            string;
  code?:               string;
  title?:              string;
  color?:              string;
  checkItems?:         { text: string; done: boolean }[];
  stats?:              { value: string; label: string }[];
  stat?:               string;
  statLabel?:          string;
  voiceFile?:          string;
  calculatedDuration?: number;
}

export interface TextScene  extends BaseScene { type: 'text';  badge: string;  }
export interface IntroScene extends BaseScene { type: 'intro'; badge?: string; } // التعديل هنا (type إجباري)
export interface CodeScene  extends BaseScene { type: 'code';  badge?: string; }

export type SceneItem = TextScene | IntroScene | CodeScene;

// يجب أن يطابق SCENE_MIN قيمة OVERLAP/2 في Root.tsx و MyVideo.tsx
export const SCENE_MIN     = 60;  // أقل مدة مشهد (2 ثانية)
export const OVERLAP_FRAMES = 18;  // crossfade overlap — يُستخدم في MyVideo.tsx و Root.tsx

// ─────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────
export const PALETTE: Record<string, { accent: string; glow: string; dim: string }> = {
  'c-cyan':   { accent: '#00FFB2', glow: 'rgba(0,255,178,0.22)',   dim: 'rgba(0,255,178,0.08)'   },
  'c-purple': { accent: '#A78BFA', glow: 'rgba(167,139,250,0.22)', dim: 'rgba(167,139,250,0.08)' },
  'c-green':  { accent: '#39FF6E', glow: 'rgba(57,255,110,0.22)',  dim: 'rgba(57,255,110,0.08)'  },
  'c-orange': { accent: '#F59E0B', glow: 'rgba(245,158,11,0.22)',  dim: 'rgba(245,158,11,0.08)'  },
  'c-pink':   { accent: '#FF4D8D', glow: 'rgba(255,77,141,0.22)',  dim: 'rgba(255,77,141,0.08)'  },
  'c-blue':   { accent: '#00C8FF', glow: 'rgba(0,200,255,0.22)',   dim: 'rgba(0,200,255,0.08)'   },
};

// تعديل بسيط لضمان دائمًا إرجاع أوبجيكت صالح بدون Type Assertion
export const getP = (c?: string) => PALETTE[c || 'c-cyan'] || PALETTE['c-cyan'];
