import React from 'react';
import {
  AbsoluteFill, Audio, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import {
  DotGrid, GraphPaper, FilmGrain, ScanLines,
  RadialGlow, ProgressBar, WinBar, SceneIdx, Enter,
} from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — HOLOGRAM
// تأثير هولوغرام مضيء مع خطوط سكانر وtitle يطلع من الوسط
// ─────────────────────────────────────────────────────────────────────
export const CardStackScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#06060F', justifyContent: 'center', alignItems: 'center' }}>
      <DotGrid op={0.04} />
      <RadialGlow glow={glow} top="50%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* Shadow card behind */}
      <div style={{
        position: 'absolute', width: '84%',
        height: 700,
        borderRadius: 40,
        background: `${accent}06`,
        border: `1px solid ${accent}15`,
        transform: `translateY(20px) rotate(2deg)`,
        opacity: interpolate(sp(5), [0, 1], [0, 0.6]),
      }} />
      <div style={{
        position: 'absolute', width: '87%',
        height: 720,
        borderRadius: 40,
        background: `${accent}04`,
        border: `1px solid ${accent}10`,
        transform: `translateY(10px) rotate(1deg)`,
        opacity: interpolate(sp(5), [0, 1], [0, 0.5]),
      }} />

      {/* Main card */}
      <div style={{
        width: '90%',
        background: 'rgba(8,8,20,0.98)',
        borderRadius: 40,
        overflow: 'hidden',
        boxShadow: `0 0 0 1px ${accent}22, 0 40px 80px rgba(0,0,0,0.8), 0 0 80px ${glow}`,
        opacity: interpolate(sp(8), [0, 1], [0, 1]),
        transform: `translateY(${(1 - sp(8)) * 40}px) scale(${interpolate(sp(8), [0, 1], [0.96, 1])})`,
        position: 'relative', zIndex: 5,
      }}>
        {/* Gradient border top */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${accent},#FF4D8D,${accent})` }} />

        <div style={{ padding: '44px 52px' }}>
          {item.badge && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28,
              background: dim, border: `1px solid ${accent}44`, borderRadius: 100,
              padding: '10px 24px', fontFamily: 'JetBrains Mono,monospace',
              fontSize: 18, letterSpacing: 4, color: accent, textTransform: 'uppercase',
              opacity: interpolate(sp(12), [0, 1], [0, 1]),
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}` }} />
              {item.badge}
            </div>
          )}

          {!isCode ? (
            <>
              {item.title && (
                <div style={{
                  fontFamily: 'Cairo,sans-serif', fontWeight: 900,
                  fontSize: 64, color: '#fff', direction: 'rtl', lineHeight: 1.1, marginBottom: 20,
                  opacity: interpolate(sp(14), [0, 0.5, 1], [0, 0.6, 1]),
                }}>
                  {item.title.split(' ').map((w, i) => (
                    <span key={i} style={{ color: i === 0 ? accent : '#fff', marginRight: 14 }}>{w} </span>
                  ))}
                </div>
              )}
              <div style={{ opacity: interpolate(sp(18), [0, 1], [0, 1]) }}>
                <TypewriterWithPen text={text} frameOffset={20} color={accent} fontSize={46} />
              </div>
            </>
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.5)', borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${accent}18`, direction: 'ltr',
              opacity: interpolate(sp(14), [0, 1], [0, 1]),
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
              <SyntaxHighlighter language="dart" style={vscDarkPlus}
                customStyle={{ background: 'transparent', fontSize: 40, padding: '24px 28px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
                {item.code ?? ''}
              </SyntaxHighlighter>
            </div>
          )}

          {item.checkItems && (
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14, direction: 'rtl' }}>
              {item.checkItems.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  fontFamily: 'Cairo,sans-serif', fontSize: 28, color: 'rgba(255,255,255,0.6)',
                  opacity: interpolate(sp(20 + i * 8), [0, 1], [0, 1]),
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    background: c.done ? `${accent}15` : 'rgba(255,255,255,0.04)',
                    border: c.done ? `1px solid ${accent}` : '1px dashed rgba(255,255,255,0.2)',
                    color: c.done ? accent : 'transparent',
                  }}>
                    {c.done ? '✓' : '○'}
                  </div>
                  {c.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <ProgressBar accent={accent} duration={duration} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 13 — VAPORWAVE
// ألوان vaporwave (pink/purple) مع sun وgrid retrowave
// ─────────────────────────────────────────────────────────────────────
