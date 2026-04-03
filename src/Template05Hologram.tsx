import React from 'react';
import {
  AbsoluteFill, Audio, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { ScanLines, SceneIdx, RadialGlow } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — HOLOGRAM
// تأثير هولوغرام مضيء مع خطوط سكانر وtitle يطلع من الوسط
// ─────────────────────────────────────────────────────────────────────
export const HologramScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 20 } });
  const pct = duration > 0 ? frame / duration : 0;
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#000510', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${accent}18 1px,transparent 1px),linear-gradient(90deg,${accent}18 1px,transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <ScanLines />
      <RadialGlow glow={glow} top="50%" duration={duration} />

      {/* Hex ring */}
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        border: `2px solid ${accent}22`,
        boxShadow: `0 0 60px ${accent}18, inset 0 0 60px ${accent}10`,
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        border: `1px solid ${accent}30`,
        opacity: interpolate(sp(10), [0, 1], [0, 1]),
      }} />

      <SceneIdx index={index} total={total} />

      {/* Content */}
      <div style={{ width: '85%', zIndex: 10, textAlign: 'center', padding: '0 40px' }}>
        {item.badge && (
          <div style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 8,
            color: accent, textTransform: 'uppercase', marginBottom: 24,
            opacity: interpolate(sp(8), [0, 1], [0, 1]),
          }}>
            [ {item.badge} ]
          </div>
        )}
        {!isCode && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontWeight: 900,
            fontSize: 64, color: '#fff', direction: 'rtl', lineHeight: 1.2,
            textShadow: `0 0 40px ${accent}88`,
            opacity: interpolate(sp(14), [0, 0.5, 1], [0, 0.6, 1]),
            transform: `scale(${interpolate(sp(14), [0, 1], [0.92, 1])})`,
          }}>
            {(item.title ?? text.split('\n')[0] ?? '').split(' ').map((w, i) => (
              <span key={i} style={{ color: i === 0 ? accent : '#fff', marginRight: 14 }}>{w} </span>
            ))}
          </div>
        )}
        {!isCode && text.split('\n').slice(1).join(' ') && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontSize: 30,
            color: `${accent}99`, direction: 'rtl', marginTop: 24, lineHeight: 1.6,
            opacity: interpolate(sp(24), [0, 1], [0, 1]),
          }}>
            {text.split('\n').slice(1).join(' ')}
          </div>
        )}
        {isCode && (
          <div style={{
            background: 'rgba(0,5,16,0.95)', borderRadius: 20,
            border: `1px solid ${accent}33`,
            boxShadow: `0 0 40px ${accent}18`,
            opacity: interpolate(sp(14), [0, 1], [0, 1]),
            direction: 'ltr', overflow: 'hidden',
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 72, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Progress arc */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12,
        fontFamily: 'JetBrains Mono,monospace', fontSize: 16, letterSpacing: 4,
        color: `${accent}55`,
      }}>
        <div style={{ height: 1, width: `${pct * 200}px`, background: `linear-gradient(90deg,transparent,${accent})` }} />
        @flutterbymousa
        <div style={{ height: 1, width: `${pct * 200}px`, background: `linear-gradient(90deg,${accent},transparent)` }} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 6 — BLUEPRINT
// تصميم هندسي زرقاق مع خطوط blueprint وcode بارزة
// ─────────────────────────────────────────────────────────────────────
