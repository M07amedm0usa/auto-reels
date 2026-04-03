import React from 'react'; // [تم التصحيح]
import {
  AbsoluteFill,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
// [تم الحذف]: Audio و staticFile
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getP } from './types';
import { SceneIdx, RadialGlow } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 11 — DARK MINIMAL
// minimal — text on black مع accent line
// ─────────────────────────────────────────────────────────────────────
export const DarkMinimalScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const pct = duration > 0 ? frame / duration : 0;
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#000000', flexDirection: 'column', justifyContent: 'center' }}>
      <RadialGlow glow={glow} top="50%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* Accent line left */}
      <div style={{
        position: 'absolute', left: 48, top: 160, bottom: 160, width: 3,
        background: `linear-gradient(180deg,transparent,${accent},transparent)`,
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }} />

      <div style={{ padding: '0 88px', zIndex: 5 }}>
        {item.badge && (
          <div style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 8,
            color: `${accent}88`, textTransform: 'uppercase', marginBottom: 24,
            direction: 'ltr', opacity: interpolate(sp(8), [0, 1], [0, 1]),
          }}>
            {item.badge}
          </div>
        )}

        {!isCode && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontWeight: 900,
            fontSize: 80, color: '#ffffff', direction: 'rtl', lineHeight: 1.1, marginBottom: 24,
            opacity: interpolate(sp(12), [0, 0.4, 1], [0, 0.5, 1]),
            transform: `translateX(${(1 - sp(12)) * 30}px)`,
          }}>
            {(item.title ?? text.split('\n')[0] ?? '').split(' ').map((w, i) => (
              <span key={i} style={{
                color: i === 0 ? accent : '#fff',
                textShadow: i === 0 ? `0 0 40px ${accent}` : 'none',
                // [تم التعديل]: مسافة بين الكلمات العربي
                marginInlineStart: i === 0 ? 0 : 16,
              }}>{w} </span>
            ))}
          </div>
        )}

        {!isCode && text.split('\n').slice(1).join(' ') && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontSize: 32, color: 'rgba(255,255,255,0.35)',
            direction: 'rtl', lineHeight: 1.7,
            opacity: interpolate(sp(22), [0, 1], [0, 1]),
          }}>
            {text.split('\n').slice(1).join(' ')}
          </div>
        )}

        {isCode && (
          <div style={{
            background: 'rgba(8,8,8,0.98)', borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${accent}22`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              // [تم التصحيح]: fontSize لـ 46
              customStyle={{ background: 'transparent', fontSize: 46, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Bottom Progress */}
      <div style={{
        position: 'absolute', bottom: 60, left: 88, right: 88,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, letterSpacing: 4, color: 'rgba(255,255,255,0.2)' }}>@flutterbymousa</span>
        <div style={{ height: 1, width: `${pct * 160}px`, background: `linear-gradient(90deg,transparent,${accent})` }} />
      </div>
    </AbsoluteFill>
  );
};
