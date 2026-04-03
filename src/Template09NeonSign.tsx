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
export const NeonSignScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color ?? 'c-pink');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 18 } });
  const isCode = item.type === 'code';
  const neonFlicker = Math.sin(frame * 2.1) * Math.sin(frame * 0.7) * 0.08 + 0.92;

  return (
    <AbsoluteFill style={{ background: '#0a0008', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <DotGrid op={0.025} />
      <FilmGrain />
      {/* Ambient glow floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 400,
        background: `linear-gradient(0deg,${accent}08,transparent)`,
      }} />

      <SceneIdx index={index} total={total} />

      <div style={{ width: '88%', zIndex: 10, textAlign: 'center' }}>
        {item.badge && (
          <div style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 8,
            color: `${accent}77`, textTransform: 'uppercase', marginBottom: 28,
            opacity: interpolate(sp(8), [0, 1], [0, 1]),
          }}>
            — {item.badge} —
          </div>
        )}

        {!isCode && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontWeight: 900,
            fontSize: 76, color: accent, direction: 'rtl', lineHeight: 1.15,
            textShadow: `0 0 10px ${accent}, 0 0 30px ${accent}88, 0 0 60px ${accent}44, 0 0 100px ${accent}22`,
            opacity: (interpolate(sp(12), [0, 0.4, 1], [0, 0.6, 1])) * neonFlicker,
            transform: `scale(${interpolate(sp(12), [0, 1], [0.95, 1])})`,
          }}>
            {item.title ?? item.content?.split('\n')[0] ?? ''}
          </div>
        )}

        {!isCode && item.content?.split('\n').slice(1).join(' ') && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontSize: 30,
            color: 'rgba(255,255,255,0.4)', direction: 'rtl', marginTop: 32, lineHeight: 1.6,
            opacity: interpolate(sp(22), [0, 1], [0, 1]),
          }}>
            {item.content?.split('\n').slice(1).join(' ')}
          </div>
        )}

        {isCode && (
          <div style={{
            background: 'rgba(10,0,8,0.97)', borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${accent}33`,
            boxShadow: `0 0 40px ${accent}22`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 56, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}

        {item.stats && (
          <div style={{
            display: 'flex', gap: 24, marginTop: 40, justifyContent: 'center',
            opacity: interpolate(sp(30), [0, 1], [0, 1]),
          }}>
            {item.stats.map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '20px 32px',
                border: `1px solid ${accent}33`, borderRadius: 16,
                boxShadow: `0 0 20px ${accent}18`,
              }}>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 52, fontWeight: 900, color: accent, textShadow: `0 0 20px ${accent}` }}>{s.value}</div>
                <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 20, color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: 50, left: 48, right: 48,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, letterSpacing: 4, color: `${accent}44` }}>@flutterbymousa</span>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: `${accent}55`, letterSpacing: 3 }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 10 — NEWSPAPER
// بتصميم صحيفة كلاسيكية بـ serif font مع headline ضخمة
// ─────────────────────────────────────────────────────────────────────
