import React from 'react'; // [تم التصحيح]
import {
  AbsoluteFill,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
// [تم الحذف]: Audio و staticFile
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getP } from './types';
import { SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 13 — VAPORWAVE
// ألوان vaporwave مع retrowave sun وgrid
// ─────────────────────────────────────────────────────────────────────
export const VaporwaveScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent } = getP(item.color ?? 'c-pink');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg,#0D0221 0%,#1A0633 50%,#3D0066 100%)' }}>
      {/* Retro grid floor */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 500,
        backgroundImage: `
          linear-gradient(transparent 0%,#FF4D8D44 100%),
          linear-gradient(90deg,#FF4D8D33 1px,transparent 1px),
          linear-gradient(#FF4D8D22 1px,transparent 1px)`,
        backgroundSize: '100% 100%, 80px 80px, 80px 80px',
        transform: 'perspective(400px) rotateX(60deg)',
        transformOrigin: 'bottom',
        opacity: 0.6,
      }} />

      {/* Retrowave sun */}
      <div style={{
        position: 'absolute', width: 340, height: 340, borderRadius: '50%',
        background: 'linear-gradient(180deg,#FFB800 0%,#FF4D8D 50%,#A855F7 100%)',
        top: '18%', left: '50%', transform: 'translateX(-50%)',
        boxShadow: '0 0 80px #FF4D8D88',
        overflow: 'hidden',
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            position: 'absolute', left: 0, right: 0, height: 18,
            background: '#0D0221',
            top: 170 + i * 36,
          }} />
        ))}
      </div>

      <SceneIdx index={index} total={total} />

      {/* Content */}
      <div style={{ position: 'absolute', top: '54%', left: 0, right: 0, padding: '0 48px', zIndex: 10 }}>
        {item.badge && (
          <div style={{
            fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 8,
            color: '#FF4D8D', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center',
            opacity: interpolate(sp(10), [0, 1], [0, 1]),
          }}>
            ✦ {item.badge} ✦
          </div>
        )}
        {!isCode && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontWeight: 900,
            fontSize: 72, color: '#fff', direction: 'rtl', lineHeight: 1.1,
            textAlign: 'center', textShadow: '0 0 30px #FF4D8D, 0 0 60px #A855F777',
            opacity: interpolate(sp(14), [0, 0.5, 1], [0, 0.6, 1]),
            transform: `translateY(${(1 - sp(14)) * 30}px)`,
          }}>
            {item.title ?? text.split('\n')[0] ?? ''}
          </div>
        )}
        {!isCode && text.split('\n').slice(1).join(' ') && (
          <div style={{
            fontFamily: 'Cairo,sans-serif', fontSize: 28,
            color: 'rgba(255,255,255,0.5)', direction: 'rtl', marginTop: 20,
            lineHeight: 1.6, textAlign: 'center',
            opacity: interpolate(sp(24), [0, 1], [0, 1]),
          }}>
            {text.split('\n').slice(1).join(' ')}
          </div>
        )}
        {isCode && (
          <div style={{
            background: 'rgba(13,2,33,0.95)', borderRadius: 20, overflow: 'hidden',
            border: '1px solid #FF4D8D33',
            boxShadow: '0 0 40px #FF4D8D18',
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: 'linear-gradient(90deg,#A855F7,#FF4D8D,#FFB800)' }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              // [تم التصحيح]: fontSize لـ 46
              customStyle={{ background: 'transparent', fontSize: 46, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        position: 'absolute', bottom: 48, left: 0, right: 0,
        textAlign: 'center', fontFamily: 'JetBrains Mono,monospace',
        fontSize: 16, letterSpacing: 6, color: '#FF4D8D66', zIndex: 10,
      }}>
        @flutterbymousa
      </div>
    </AbsoluteFill>
  );
};
