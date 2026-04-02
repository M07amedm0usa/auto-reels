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
export const RetroCRTScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color ?? 'c-green');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const flicker = Math.sin(frame * 0.3) * 0.02;

  return (
    <AbsoluteFill style={{ background: '#020a02', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* CRT curvature vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%,transparent 60%,rgba(0,0,0,0.7) 100%)',
        zIndex: 50, pointerEvents: 'none',
      }} />
      <ScanLines />
      <RadialGlow glow={`rgba(57,255,110,0.15)`} top="50%" duration={duration} />

      <SceneIdx index={index} total={total} />

      {/* Screen content */}
      <div style={{
        width: '90%', opacity: 0.97 + flicker, zIndex: 10,
        transform: `scale(${1 + flicker * 0.5})`,
      }}>
        {/* Prompt header */}
        <div style={{
          fontFamily: 'JetBrains Mono,monospace', fontSize: 20,
          color: `${accent}88`, letterSpacing: 4, marginBottom: 32,
          direction: 'ltr', opacity: interpolate(sp(5), [0, 1], [0, 1]),
        }}>
          flutter_edu@mousa:~$ <span style={{ color: accent }}>run --tutorial</span>
        </div>

        {!isCode ? (
          <>
            {item.badge && (
              <div style={{
                fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 6,
                color: `${accent}66`, textTransform: 'uppercase', marginBottom: 16,
                direction: 'ltr', opacity: interpolate(sp(8), [0, 1], [0, 1]),
              }}>
                ## {item.badge}
              </div>
            )}
            <div style={{
              fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: 68,
              color: accent, direction: 'rtl', lineHeight: 1.2,
              textShadow: `0 0 20px ${accent}88`,
              opacity: interpolate(sp(14), [0, 0.5, 1], [0, 0.6, 1]),
              transform: `translateY(${(1 - sp(14)) * 30}px)`,
            }}>
              {(item.title ?? item.content?.split('\n')[0] ?? '')}
            </div>
            {item.content?.split('\n').slice(1).join(' ') && (
              <div style={{
                fontFamily: 'JetBrains Mono,monospace', fontSize: 26,
                color: `${accent}77`, direction: 'rtl', marginTop: 28, lineHeight: 1.6,
                opacity: interpolate(sp(24), [0, 1], [0, 1]),
              }}>
                {'> '}{item.content?.split('\n').slice(1).join(' ')}
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: 'rgba(2,10,2,0.97)', borderRadius: 12, overflow: 'hidden',
            border: `1px solid ${accent}33`,
            boxShadow: `0 0 30px ${accent}18, inset 0 0 30px rgba(0,0,0,0.5)`,
            direction: 'ltr', opacity: interpolate(sp(12), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background: 'transparent', fontSize: 40, padding: '28px 32px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}

        {/* Cursor blink */}
        <div style={{
          marginTop: 32, width: 20, height: 36, background: accent,
          opacity: Math.sin(frame * 0.15) > 0 ? 0.9 : 0,
          boxShadow: `0 0 10px ${accent}`,
        }} />
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 40, left: 48, right: 48,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono,monospace', fontSize: 16,
        color: `${accent}44`, letterSpacing: 3, zIndex: 10,
      }}>
        <span>@flutterbymousa</span>
        <span>CRT MODE ●</span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 9 — NEON SIGN
// title يضيء زي نيون حقيقي مع flicker و glow effects
// ─────────────────────────────────────────────────────────────────────
