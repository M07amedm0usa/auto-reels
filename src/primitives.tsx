import React from 'react'; // [تم التصحيح] حرف الـ i سمول
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ─────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────

export const DotGrid: React.FC<{ op?: number }> = ({ op = 0.055 }) => (
  <div style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
    backgroundImage:`radial-gradient(circle,rgba(255,255,255,${op}) 1px,transparent 1px)`,
    backgroundSize:'28px 28px',
  }} />
);

export const GraphPaper: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
    backgroundImage:`
      linear-gradient(rgba(99,102,241,0.13) 1px,transparent 1px),
      linear-gradient(90deg,rgba(99,102,241,0.13) 1px,transparent 1px),
      radial-gradient(circle,rgba(99,102,241,0.18) 1px,transparent 1px)`,
    backgroundSize:'40px 40px,40px 40px,40px 40px',
    backgroundPosition:'0 0,0 0,20px 20px',
  }} />
);

// [FIX CRITICAL] RadialGlow يستقبل duration من الخارج بدل useVideoConfig().durationInFrames
export const RadialGlow: React.FC<{ glow: string; top?: string; duration: number }> = ({ glow, top = '30%', duration }) => {
  const frame = useCurrentFrame();
  // حماية من القسمة على صفر أو القيم السالبة
  const drift = interpolate(frame, [0, Math.max(1, duration)], [-20, 20]);
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
      background:`radial-gradient(ellipse 65% 55% at 50% ${top},${glow} 0%,transparent 70%)`,
      transform:`translateY(${drift}px)`,
    }} />
  );
};

export const ScanLines: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, zIndex:50, pointerEvents:'none',
    background:'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)',
  }} />
);

export const FilmGrain: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, zIndex:50, pointerEvents:'none', opacity:0.03,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize:'200px 200px',
  }} />
);

export const Letterbox: React.FC = () => (
  <>
    <div style={{ position:'absolute', top:0,    left:0, right:0, height:80, background:'#000', zIndex:40 }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'#000', zIndex:40 }} />
  </>
);

// [FIX CONSISTENCY] WinBar — تم إضافة حماية لو الـ title جاي undefined من n8n
export const WinBar: React.FC<{ title?: string; right?: React.ReactNode }> = ({ title = '', right }) => {
  const isRTL = /[\u0600-\u06FF]/.test(title);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, padding:'28px 40px',
      borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.015)',
      flexShrink:0, zIndex:5, position:'relative' }}>
      <div style={{ display:'flex', gap:10 }}>
        {(['#ff5f57','#febc2e','#28c840'] as const).map((c,i) => (
          <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:c }} />
        ))}
      </div>
      <div style={{ flex:1, textAlign:'center', fontSize:20,
        // ملحوظة: لو الخط العربي شكله مش حلو، ضيف اسم الخط العربي بتاعك قبل JetBrains
        fontFamily:'JetBrains Mono, sans-serif',
        letterSpacing: isRTL ? 0 : 3,
        direction: isRTL ? 'rtl' : 'ltr',
        textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
        {title}
      </div>
      <div style={{ minWidth:80 }}>{right}</div>
    </div>
  );
};

// [FIX CRITICAL] ProgressBar يستقبل duration من الخارج
export const ProgressBar: React.FC<{ accent: string; duration: number }> = ({ accent, duration }) => {
  const frame = useCurrentFrame();
  const pct = duration > 0 ? frame / duration : 0;
  return (
    <div style={{ height:4, background:'rgba(255,255,255,0.04)', flexShrink:0 }}>
      <div style={{ height:'100%', width:`${pct * 100}%`,
        background:`linear-gradient(90deg,${accent}88,${accent})`,
        boxShadow:`0 0 10px ${accent}`, borderRadius:'0 2px 2px 0' }} />
    </div>
  );
};

export const Enter: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config:{ damping:22, stiffness:110, mass:0.8 } });
  return (
    <div style={{ width:'100%', height:'100%',
      opacity: interpolate(p,[0,0.5,1],[0,0.7,1]),
      transform:`translateY(${(1-p)*50}px) scale(${interpolate(p,[0,1],[0.97,1])})` }}>
      {children}
    </div>
  );
};

export const SceneIdx: React.FC<{ index: number; total: number }> = ({ index, total }) => (
  <div style={{ position:'absolute', top:56, right:60,
    fontFamily:'JetBrains Mono,monospace', fontSize:22,
    color:'rgba(255,255,255,0.18)', letterSpacing:4, zIndex:10 }}>
    {String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
  </div>
);
