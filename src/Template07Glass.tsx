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
export const GlassScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#080018' }}>
      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: `radial-gradient(circle,${accent}33,transparent 70%)`,
        top: -100, left: -100,
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle,#FF4D8D22,transparent 70%)`,
        bottom: -80, right: -80,
        filter: 'blur(60px)',
      }} />
      <DotGrid op={0.03} />
      <SceneIdx index={index} total={total} />

      {/* Glass card */}
      <div style={{
        position: 'absolute', inset: '60px 40px',
        background: 'rgba(255,255,255,0.035)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: `0 0 0 1px ${accent}18, 0 40px 80px rgba(0,0,0,0.6), 0 0 80px ${glow}`,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
        transform: `translateY(${(1 - sp(5)) * 40}px)`,
      }}>
        {/* Glass top strip */}
        <div style={{
          padding: '32px 44px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          background: `linear-gradient(180deg,${accent}08,transparent)`,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />
            ))}
          </div>
          <span style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 4,
            color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
          }}>
            {item.badge ?? item.title ?? 'flutter'}
          </span>
          <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: `${accent}66` }}>
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, padding: '44px', display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {!isCode ? (
            <>
              {item.title && (
                <div style={{
                  fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 5,
                  color: accent, textTransform: 'uppercase', marginBottom: 20,
                  direction: 'ltr', opacity: interpolate(sp(10), [0, 1], [0, 1]),
                }}>
                  // {item.title}
                </div>
              )}
              <div style={{ opacity: interpolate(sp(14), [0, 1], [0, 1]) }}>
                <TypewriterWithPen text={text} frameOffset={16} color={accent} fontSize={48} />
              </div>
            </>
          ) : (
            <div style={{
              background: 'rgba(0,0,0,0.5)', borderRadius: 20, overflow: 'hidden',
              border: `1px solid ${accent}22`, direction: 'ltr',
            }}>
              <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
              <SyntaxHighlighter language="dart" style={vscDarkPlus}
                customStyle={{ background: 'transparent', fontSize: 56, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
                {item.code ?? ''}
              </SyntaxHighlighter>
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
// TEMPLATE 8 — RETRO CRT
// شاشة قديمة phosphor green مع scanlines ووميض
// ─────────────────────────────────────────────────────────────────────
