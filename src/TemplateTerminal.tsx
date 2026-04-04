import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { DotGrid, RadialGlow, ScanLines, WinBar, ProgressBar, SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TERMINAL INTRO (نسخة ديناميكية بالكامل)
// ─────────────────────────────────────────────────
export const TerminalIntro: React.FC<{ item: SceneItem; duration: number }> = ({ item, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });

  // 1. جلب العنوان الرئيسي والوصف (يدعم التغيير من n8n)
  const mainTitle = item.title || item.content?.split('\n')[0] || "Flutter Tips";
  const words = mainTitle.split(' ');
  const sub = item.content?.split('\n').slice(1).join(' ') || item.badge || "@flutterbymousa";
  
  // 2. جعل أسطر الـ Boot Log ديناميكية (لو بعت مصفوفة bootLogs في الـ item)
  const defaultLogs = [
    ['[SYS]', 'Loading Dart runtime...', 'OK'],
    ['[FLT]', 'Widget tree initialized', 'OK'],
    ['[RND]', 'Skia renderer active', 'OK'],
    ['[HOT]', 'Hot reload ready', 'OK'],
    ['[EDU]', 'Loading tutorial...', '!!']
  ];
  const logs = (item as any).bootLogs || defaultLogs;

  return (
    <AbsoluteFill style={{ background: '#04040A', flexDirection: 'column' }}>
      <DotGrid /><ScanLines /><RadialGlow glow={glow} top="50%" duration={duration} />

      {/* Top status bar */}
      <div style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono,monospace', fontSize: 20, color: 'rgba(255,255,255,0.3)',
        letterSpacing: 2, borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)', flexShrink: 0, zIndex: 10 }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
            background: accent, boxShadow: `0 0 8px ${accent}`, marginInlineEnd: 10, verticalAlign: 'middle' }} />
          LIVE SYSTEM
        </span>
        <span>v3.10.x</span>
        <span>🔋 {Math.min(100, 80 + Math.floor(frame/10))}%</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '0 40px', gap: 0, zIndex: 5 }}>

        {/* Boot log (Dynamic Animation) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 36 }}>
          {logs.map(([pre, msg, st]: any, i: number) => {
            const p = sp(i * 8);
            return (
              <div key={i} style={{ display: 'flex', gap: 20, fontFamily: 'JetBrains Mono,monospace',
                fontSize: 22, direction: 'ltr', opacity: p, 
                transform: `translateX(${Math.round((1 - p) * -20)}px)` }}>
                <span style={{ color: accent, fontWeight: 700 }}>{pre}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', flex: 1 }}>{msg}</span>
                <span style={{ color: st === '!!' ? '#FFCB6B' : accent }}>{st}</span>
              </div>
            );
          })}
        </div>

        {/* Hero Section */}
        <div style={{ zIndex: 8 }}>
          <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 8,
            color: accent, textTransform: 'uppercase', marginBottom: 16, direction: 'ltr',
            opacity: interpolate(sp(44), [0, 1], [0, 0.75]) }}>
            // {item.badge || "Flutter Tutorial"}
          </div>
          
          {/* العنوان الرئيسي المتغير */}
          <div style={{ 
            fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: 72,
            color: '#fff', direction: 'rtl', lineHeight: 1.2, marginBottom: 12,
            display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 8, wordBreak: 'break-word',
            opacity: interpolate(sp(50), [0, 0.4, 1], [0, 0.6, 1]),
            transform: `translateY(${Math.round((1 - sp(50)) * 30)}px)` }}>
            {words.map((w, i) => (
              <span key={i} style={{ color: i === 0 ? accent : '#fff',
                textShadow: i === 0 ? `0 0 30px ${accent}` : 'none' }}>{w}</span>
            ))}
          </div>

          {/* الوصف الفرعي المتغير */}
          {sub && (
            <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 30, color: 'rgba(255,255,255,0.35)',
              direction: 'rtl', fontWeight: 700, opacity: sp(60), marginBottom: 24 }}>{sub}</div>
          )}

          <div style={{ background: dim, border: `1px solid ${accent}33`, borderRadius: 16,
            padding: '20px 28px', direction: 'ltr',
            opacity: interpolate(sp(70), [0, 1], [0, 1]) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14,
              fontFamily: 'JetBrains Mono,monospace', fontSize: 24 }}>
              <span style={{ color: accent, fontWeight: 700 }}>▶</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>flutter run --release</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar - برضه ممكن تخليه ديناميكي */}
      <div style={{ padding: '22px 40px', borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'space-between',
        flexShrink: 0, zIndex: 10 }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18,
          letterSpacing: 6, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>
          {(item as any).username || "@flutterbymousa"}
        </span>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18,
          letterSpacing: 4, color: accent }}>REC ●</span>
      </div>
    </AbsoluteFill>
  );
};

// ... (باقي المكونات GenericTextScene و GenericCodeScene بتفضل زي ما هي لأنها كانت شغالة تمام)
        
