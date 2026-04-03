import React from 'react';
import {
  AbsoluteFill, Audio, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getP } from './types';
// primitives not used in this template
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 15 — COMIC PANEL
// بانيل كوميك بـ thick borders وspeech bubble
// ─────────────────────────────────────────────────────────────────────
export const ComicPanelScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, dim } = getP(item.color ?? 'c-cyan');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 18, stiffness: 130 } });
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#f0f0f0', flexDirection: 'column' }}>
      {/* Halftone dots */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle,rgba(0,0,0,0.07) 1px,transparent 1px)`,
        backgroundSize: '14px 14px',
        zIndex: 0,
      }} />

      {/* Panel border */}
      <div style={{
        position: 'absolute', inset: 20,
        border: '6px solid #1a1a1a',
        borderRadius: 8, zIndex: 1,
      }} />

      {/* Black header panel */}
      <div style={{
        background: '#1a1a1a', padding: '28px 48px 24px',
        borderBottom: `6px solid #1a1a1a`,
        flexShrink: 0, zIndex: 5, margin: '20px 20px 0',
        borderTopLeftRadius: 2, borderTopRightRadius: 2,
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
        transform: `translateY(${(1 - sp(5)) * -20}px)`,
      }}>
        <div style={{
          fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: 28,
          color: accent, textTransform: 'uppercase', letterSpacing: 4, direction: 'ltr',
          textShadow: `0 0 10px ${accent}66`,
        }}>
          @flutterbymousa — FLUTTER COMICS
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: '32px 52px', zIndex: 5, display: 'flex',
        flexDirection: 'column', justifyContent: 'center', margin: '0 20px',
        background: 'rgba(240,240,240,0.95)',
      }}>
        {/* Speech bubble */}
        {!isCode && (
          <div style={{
            background: '#fff', border: '4px solid #1a1a1a', borderRadius: 20,
            padding: '32px 40px', position: 'relative', marginBottom: 28,
            opacity: interpolate(sp(10), [0, 1], [0, 1]),
            transform: `scale(${interpolate(sp(10), [0, 1], [0.9, 1])})`,
          }}>
            {/* Speech tail */}
            <div style={{
              position: 'absolute', bottom: -36, right: 60,
              width: 0, height: 0,
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderTop: '36px solid #1a1a1a',
            }} />
            <div style={{
              position: 'absolute', bottom: -26, right: 66,
              width: 0, height: 0,
              borderLeft: '14px solid transparent',
              borderRight: '14px solid transparent',
              borderTop: '26px solid #fff',
            }} />

            {item.badge && (
              <div style={{
                fontFamily: 'JetBrains Mono,monospace', fontSize: 18, fontWeight: 700,
                color: accent, letterSpacing: 4, textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                [{item.badge}]
              </div>
            )}
            <div style={{
              fontFamily: 'Cairo,sans-serif', fontWeight: 900,
              fontSize: 56, color: '#1a1a1a', direction: 'rtl', lineHeight: 1.1,
            }}>
              {(item.title ?? text.split('\n')[0] ?? '').split(' ').map((w, i) => (
                <span key={i} style={{ color: i === 0 ? accent : '#1a1a1a', marginRight: 10 }}>{w} </span>
              ))}
            </div>
          </div>
        )}

        {!isCode && text.split('\n').slice(1).join(' ') && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontSize: 28, color: '#333',
            direction: 'rtl', lineHeight: 1.7, marginTop: 24,
            opacity: interpolate(sp(20), [0, 1], [0, 1]),
            border: `3px solid #1a1a1a`, borderRadius: 12,
            padding: '20px 28px', background: `${accent}12`,
          }}>
            💡 {text.split('\n').slice(1).join(' ')}
          </div>
        )}

        {isCode && (
          <div style={{
            background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
            border: `4px solid ${accent}`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
            transform: `rotate(-0.5deg) scale(${interpolate(sp(12), [0, 1], [0.95, 1])})`,
          }}>
            <div style={{ height: 4, background: `linear-gradient(90deg,${accent},#FF4D8D,${accent})` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 56, padding: '24px 28px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Footer panel */}
      <div style={{
        background: '#1a1a1a', padding: '18px 48px',
        margin: '0 20px 20px', borderTop: '6px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, zIndex: 5,
        borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: `${accent}88`, letterSpacing: 3 }}>
          FLUTTER COMICS
        </span>
        <span style={{ fontFamily: 'Cairo,sans-serif', fontSize: 22, fontWeight: 900, color: accent }}>
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};
