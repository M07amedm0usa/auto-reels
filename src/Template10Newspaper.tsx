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
// TEMPLATE 10 — NEWSPAPER
// تصميم صحيفة كلاسيكية بـ serif font
// ─────────────────────────────────────────────────────────────────────
export const NewspaperScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent } = getP(item.color ?? 'c-orange');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const text = item.content ?? '';

  return (
    <AbsoluteFill style={{ background: '#f4f0e8', flexDirection: 'column' }}>
      {/* Paper texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          repeating-linear-gradient(0deg,transparent 0px,transparent 31px,rgba(0,0,0,0.04) 31px,rgba(0,0,0,0.04) 32px)
        `,
      }} />

      {/* Masthead */}
      <div style={{
        padding: '28px 48px 20px', borderBottom: '4px solid #1a1a1a',
        borderTop: '2px solid #1a1a1a', zIndex: 5, flexShrink: 0,
        background: '#1a1a1a',
        opacity: interpolate(sp(5), [0, 1], [0, 1]),
      }}>
        <div style={{
          fontFamily: 'Georgia,serif', fontSize: 44, fontWeight: 700,
          color: '#f4f0e8', textAlign: 'center', letterSpacing: 8,
          textTransform: 'uppercase',
        }}>
          Flutter Tribune
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 8,
          fontFamily: 'Georgia,serif', fontSize: 16, color: '#f4f0e880',
        }}>
          <span>@flutterbymousa</span>
          <span>الإصدار {String(index + 1).padStart(3, '0')}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px 48px', zIndex: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {item.badge && (
          <div style={{
            fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 700,
            color: accent, textTransform: 'uppercase', letterSpacing: 4,
            marginBottom: 16, borderBottom: `2px solid ${accent}`,
            paddingBottom: 8, direction: 'rtl',
            opacity: interpolate(sp(8), [0, 1], [0, 1]),
          }}>
            {item.badge}
          </div>
        )}

        {!isCode ? (
          <>
            <div style={{
              fontFamily: 'Georgia,serif', fontWeight: 700,
              fontSize: 72, color: '#1a1a1a', direction: 'rtl', lineHeight: 1.1, marginBottom: 24,
              opacity: interpolate(sp(12), [0, 0.5, 1], [0, 0.6, 1]),
              transform: `translateY(${(1 - sp(12)) * 20}px)`,
            }}>
              {item.title ?? text.split('\n')[0] ?? ''}
            </div>
            {text.split('\n').slice(1).join(' ') && (
              <div style={{
                fontFamily: 'Cairo,sans-serif', fontSize: 28, color: '#3a3a3a',
                direction: 'rtl', lineHeight: 1.8,
                opacity: interpolate(sp(22), [0, 1], [0, 1]),
              }}>
                {text.split('\n').slice(1).join(' ')}
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: '#1a1a1a', borderRadius: 12, overflow: 'hidden',
            border: `2px solid ${accent}`,
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

      {/* Footer */}
      <div style={{
        padding: '16px 48px', borderTop: '3px double #1a1a1a', flexShrink: 0, zIndex: 5,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'Georgia,serif', fontSize: 18, color: '#1a1a1a88',
      }}>
        <span>Flutter بالعربي</span>
        <span>{String(index + 1).padStart(2, '0')} من {String(total).padStart(2, '0')}</span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 11 — DARK MINIMAL
// minimal جداً — text on black مع accent line فقط
// ─────────────────────────────────────────────────────────────────────
