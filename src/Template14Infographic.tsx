import React from 'react';
import {
  AbsoluteFill,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getP } from './types';
import { GraphPaper, SceneIdx, RadialGlow, ProgressBar } from './primitives';
import type { SceneItem } from './types';

export const InfographicScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  
  const text = item.content ?? '';
  const isCode = item.type === 'code';

  const defaultBullets = text.split('\n').filter(Boolean).map((t) => ({ text: t, done: true }));
  const bullets = item.checkItems ?? defaultBullets;

  return (
    <AbsoluteFill style={{ background: '#050512', flexDirection: 'column' }}>
      <GraphPaper />
      <RadialGlow glow={glow} top="20%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* 1. Header - مسافات ملمومة */}
      <div style={{
        padding: '100px 60px 40px', // زيادة الـ top padding لنزول العنوان شوية عن الحافة
        flexShrink: 0, zIndex: 5,
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }}>
        {item.badge && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 25,
            background: dim, border: `1px solid ${accent}44`, borderRadius: 100,
            padding: '12px 28px', fontFamily: 'JetBrains Mono,monospace',
            fontSize: 22, letterSpacing: 4, color: accent, textTransform: 'uppercase',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent, boxShadow: `0 0 12px ${accent}` }} />
            {item.badge}
          </div>
        )}
        <div style={{
          fontFamily: 'Cairo,sans-serif', fontWeight: 900, 
          fontSize: 85, // تكبير العنوان قليلاً
          color: '#fff', direction: 'rtl', lineHeight: 1.1,
          opacity: interpolate(sp(10), [0, 0.5, 1], [0, 0.6, 1]),
        }}>
          {(item.title ?? text.split('\n')[0] ?? '').split(' ').map((w, i) => (
            <span key={i} style={{ color: i === 0 ? accent : '#fff', marginInlineStart: i === 0 ? 0 : 15 }}>{w} </span>
          ))}
        </div>
      </div>

      {/* 2. Body - تم إلغاء الـ justifyContent: center لتقريب المسافات */}
      <div style={{ 
        flex: 1, 
        padding: '0 60px', 
        zIndex: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', // جعل العناصر تبدأ من الأعلى
        marginTop: 40 // مسافة ثابتة تحت العنوان
      }}>
        
        {/* Stats Section */}
        {!isCode && item.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
            {item.stats.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}22`,
                borderRadius: 24, padding: '30px',
                opacity: interpolate(sp(14 + i * 6), [0, 1], [0, 1]),
                transform: `translateY(${(1 - sp(14 + i * 6)) * 20}px)`,
              }}>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 65, fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 24, color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bullets Section - مسافات محكمة */}
        {!isCode && bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30, direction: 'rtl' }}>
            {bullets.slice(0, 5).map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 25,
                fontFamily: 'Cairo,sans-serif', 
                fontSize: 44, // تصغير بسيط ليناسب الأسطر المتقاربة
                color: 'rgba(255,255,255,0.9)',
                opacity: interpolate(sp(18 + i * 8), [0, 1], [0, 1]),
                transform: `translateX(${(1 - sp(18 + i * 8)) * -30}px)`,
                lineHeight: 1.3,
              }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                  background: b.done ? `${accent}25` : 'rgba(255,255,255,0.05)',
                  border: b.done ? `3px solid ${accent}` : '2px dashed rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: accent,
                }}>
                  {b.done ? '✓' : ''}
                </div>
                <div style={{ flex: 1, fontWeight: 600 }}>{b.text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Code Section */}
        {isCode && (
          <div style={{
            background: 'rgba(5,5,18,0.98)', borderRadius: 24, overflow: 'hidden',
            border: `1px solid ${accent}33`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
            boxShadow: `0 20px 50px rgba(0,0,0,0.5)`
          }}>
            <div style={{ height: 4, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 42, padding: '35px', margin: 0, lineHeight: '1.6', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      <ProgressBar accent={accent} duration={duration} />
    </AbsoluteFill>
  );
};
            
