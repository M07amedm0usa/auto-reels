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
export const BlueprintScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color ?? 'c-blue');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 22 } });
  const isCode = item.type === 'code';
  const lines = isCode
    ? (item.code ?? '').split('\n')
    : [];
  const revP = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 24, stiffness: 70 } });
  const vis = Math.min(lines.length, revP * (lines.length + 2));
  const full = Math.floor(vis);
  const hl = Math.max(0, full - 1);

  return (
    <AbsoluteFill style={{ background: '#040D1A', flexDirection: 'column' }}>
      {/* Blueprint grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(${accent}12 1px,transparent 1px),
          linear-gradient(90deg,${accent}12 1px,transparent 1px),
          linear-gradient(${accent}06 1px,transparent 1px),
          linear-gradient(90deg,${accent}06 1px,transparent 1px)`,
        backgroundSize: '80px 80px,80px 80px,20px 20px,20px 20px',
      }} />
      <RadialGlow glow={glow} top="35%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* Header ruler */}
      <div style={{
        padding: '36px 48px 24px', borderBottom: `1px solid ${accent}25`,
        display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, zIndex: 5,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: i === 2 ? 0 : '50%',
            background: i === 0 ? '#ff5f57' : i === 1 ? '#febc2e' : accent,
          }} />
        ))}
        <div style={{
          flex: 1, fontFamily: 'JetBrains Mono,monospace', fontSize: 20,
          letterSpacing: 5, color: `${accent}66`, textTransform: 'uppercase', direction: 'ltr',
          opacity: interpolate(sp(5), [0, 1], [0, 1]),
        }}>
          {item.badge ?? `flutter.dart`}
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono,monospace', fontSize: 16,
          color: `${accent}44`, letterSpacing: 3,
        }}>
          BLUEPRINT v3
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 3 }}>
        {!isCode ? (
          <>
            {item.title && (
              <div style={{
                fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 5,
                color: accent, textTransform: 'uppercase', marginBottom: 20, direction: 'ltr',
                opacity: interpolate(sp(8), [0, 1], [0, 1]),
              }}>
                /* {item.title} */
              </div>
            )}
            <div style={{ opacity: interpolate(sp(14), [0, 1], [0, 1]) }}>
              <TypewriterWithPen
                text={item.content ?? ''}
                frameOffset={16}
                color={accent}
                fontSize={46}
              />
            </div>
          </>
        ) : (
          <div style={{
            background: 'rgba(4,13,26,0.97)', borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${accent}25`,
            boxShadow: `0 0 60px ${accent}12`,
            direction: 'ltr',
          }}>
            <WinBar
              title={item.title ?? 'main.dart'}
              right={<span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 3, color: accent }}>DART</span>}
            />
            <div style={{ padding: '36px 44px', display: 'flex', gap: 24, direction: 'ltr' }}>
              <div style={{
                display: 'flex', flexDirection: 'column',
                color: 'rgba(255,255,255,0.15)', fontFamily: 'JetBrains Mono,monospace',
                fontSize: 40, lineHeight: 1.65, textAlign: 'right',
                flexShrink: 0, borderRight: `1px solid ${accent}20`,
                paddingRight: 20, minWidth: 52, userSelect: 'none',
              }}>
                {lines.map((_, i) => (
                  <div key={i} style={{
                    opacity: i <= full ? (i === hl ? 0.7 : 0.25) : 0,
                    color: i === hl ? accent : undefined,
                  }}>{i + 1}</div>
                ))}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SyntaxHighlighter
                  language="dart" style={vscDarkPlus}
                  wrapLines={true} wrapLongLines={false}
                  lineProps={(lineNumber) => {
                    const i = lineNumber - 1;
                    const op = i < full ? 1 : i === full ? vis - full : 0;
                    return {
                      style: {
                        opacity: op,
                        background: i === hl ? `linear-gradient(90deg,${accent}14,transparent 70%)` : 'transparent',
                        borderLeft: i === hl ? `3px solid ${accent}` : '3px solid transparent',
                        paddingLeft: 12, marginLeft: -14, display: 'block', direction: 'ltr',
                      },
                    };
                  }}
                  customStyle={{ background: 'transparent', fontSize: 40, padding: 0, margin: 0, lineHeight: '1.65', direction: 'ltr' }}
                >
                  {item.code ?? ' '}
                </SyntaxHighlighter>
              </div>
            </div>
            <ProgressBar accent={accent} duration={duration} />
          </div>
        )}
      </div>

      {/* Dimension lines bottom */}
      <div style={{
        padding: '20px 48px', borderTop: `1px solid ${accent}20`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0, zIndex: 5,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, letterSpacing: 4, color: `${accent}44` }}>@flutterbymousa</span>
        <div style={{ height: 1, flex: 1, margin: '0 20px', background: `${accent}22` }} />
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 16, color: `${accent}55`, letterSpacing: 3 }}>
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────
// TEMPLATE 7 — GLASSMORPHISM
// كارد شفاف frosted glass فوق خلفية gradient حية
// ─────────────────────────────────────────────────────────────────────
