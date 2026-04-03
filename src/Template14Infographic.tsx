import React from 'react';
import {
  AbsoluteFill, Audio, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { GraphPaper, SceneIdx, RadialGlow, ProgressBar } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 14 — INFOGRAPHIC
// كروت stats وbullets رسومية مرتبة
// ─────────────────────────────────────────────────────────────────────
export const InfographicScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const text = item.content ?? '';
  const isCode = item.type === 'code';

  const defaultBullets = text.split('\n').filter(Boolean).map((t, i) => ({ text: t, done: i % 2 === 0 }));
  const bullets = item.checkItems ?? defaultBullets;

  return (
    <AbsoluteFill style={{ background: '#050512', flexDirection: 'column' }}>
      <GraphPaper />
      <RadialGlow glow={glow} top="30%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* Header */}
      <div style={{
        padding: '44px 52px 32px', flexShrink: 0, zIndex: 5,
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }}>
        {item.badge && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20,
            background: dim, border: `1px solid ${accent}44`, borderRadius: 100,
            padding: '10px 24px', fontFamily: 'JetBrains Mono,monospace',
            fontSize: 18, letterSpacing: 4, color: accent, textTransform: 'uppercase',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
            {item.badge}
          </div>
        )}
        <div style={{
          fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: 60,
          color: '#fff', direction: 'rtl', lineHeight: 1.1,
          opacity: interpolate(sp(10), [0, 0.5, 1], [0, 0.6, 1]),
        }}>
          {(item.title ?? text.split('\n')[0] ?? '').split(' ').map((w, i) => (
            <span key={i} style={{ color: i === 0 ? accent : '#fff', marginRight: 12 }}>{w} </span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '0 52px 32px', zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {!isCode && item.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {item.stats.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${accent}22`,
                borderRadius: 20, padding: '24px 28px',
                opacity: interpolate(sp(14 + i * 6), [0, 1], [0, 1]),
                transform: `translateY(${(1 - sp(14 + i * 6)) * 20}px)`,
              }}>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 60, fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 6, textShadow: `0 0 20px ${accent}66` }}>{s.value}</div>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 22, color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {!isCode && bullets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, direction: 'rtl' }}>
            {bullets.slice(0, 5).map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                fontFamily: 'Cairo,sans-serif', fontSize: 28, color: 'rgba(255,255,255,0.75)',
                opacity: interpolate(sp(18 + i * 8), [0, 1], [0, 1]),
                transform: `translateX(${(1 - sp(18 + i * 8)) * -20}px)`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: b.done ? `${accent}18` : 'rgba(255,255,255,0.04)',
                  border: b.done ? `1px solid ${accent}` : '1px dashed rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: b.done ? accent : 'transparent',
                }}>
                  {b.done ? '✓' : '○'}
                </div>
                {b.text}
              </div>
            ))}
          </div>
        )}

        {isCode && (
          <div style={{
            background: 'rgba(5,5,18,0.98)', borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${accent}22`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 72, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      <ProgressBar accent={accent} duration={duration} />
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 15 — COMIC PANEL
// بانيل كوميك بـ thick borders وspeech bubble للـ tips
// ─────────────────────────────────────────────────────────────────────
