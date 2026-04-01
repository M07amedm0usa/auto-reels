import React from 'react';
import {
  AbsoluteFill, Sequence, spring, useCurrentFrame,
  useVideoConfig, Audio, staticFile, interpolate,
} from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './style.css';

// ─── Types ───────────────────────────────────────────────
type BaseScene = {
  color?: string;
  voiceFile?: string;
  calculatedDuration?: number;
};

export type SceneItem =
  | (BaseScene & { type: 'intro'; content?: string; title?: string; badge?: string; code?: never })
  | (BaseScene & { type: 'text';  content: string;  title?: string; badge: string;  code?: never })
  | (BaseScene & { type: 'code';  code: string;     title?: string; badge?: string; content?: string });

// ─── Color System ────────────────────────────────────────
const PALETTE: Record<string, { accent: string; bg: string; glow: string }> = {
  'c-cyan':    { accent: '#00FFD1', bg: 'rgba(0,255,209,0.07)',  glow: 'rgba(0,255,209,0.25)' },
  'c-purple':  { accent: '#BF5FFF', bg: 'rgba(191,95,255,0.07)', glow: 'rgba(191,95,255,0.25)' },
  'c-orange':  { accent: '#FF8C42', bg: 'rgba(255,140,66,0.07)', glow: 'rgba(255,140,66,0.25)' },
  'c-pink':    { accent: '#FF4D8D', bg: 'rgba(255,77,141,0.07)', glow: 'rgba(255,77,141,0.25)' },
  'c-blue':    { accent: '#4D9FFF', bg: 'rgba(77,159,255,0.07)', glow: 'rgba(77,159,255,0.25)' },
  'c-green':   { accent: '#39FF6E', bg: 'rgba(57,255,110,0.07)', glow: 'rgba(57,255,110,0.25)' },
};
const getColor = (c?: string) => PALETTE[c || 'c-cyan'] ?? PALETTE['c-cyan'];

// ─── Transition: WIPE + SCALE ────────────────────────────
const TransitionIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 18, stiffness: 100, mass: 0.8 } });

  const translateY = interpolate(progress, [0, 1], [80, 0]);
  const opacity = interpolate(progress, [0, 0.4, 1], [0, 0.6, 1]);
  const scale = interpolate(progress, [0, 1], [0.94, 1]);
  const blur = interpolate(progress, [0, 1], [12, 0]);

  return (
    <div style={{
      width: '100%', height: '100%',
      transform: `translateY(${translateY}px) scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
    }}>
      {children}
    </div>
  );
};

// ─── Background ──────────────────────────────────────────
const Background: React.FC<{ glow: string }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [-20, 20]);

  return (
    <div className="bg-grid" style={{ position: 'absolute', inset: 0 }}>
      {/* ambient glow blob — radial-gradient بدل blur(120px) لتجنب render bottleneck */}
      <div style={{
        position: 'absolute',
        width: '700px',
        height: '700px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        top: '20%',
        left: '50%',
        transform: `translate(-50%, ${drift}px)`,
        opacity: 0.7,
        pointerEvents: 'none',
      }} />
    </div>
  );
};

// ─── INTRO Scene ─────────────────────────────────────────
const IntroScene: React.FC<{ item: SceneItem }> = ({ item }) => {
  const { accent, glow } = getColor(item.color);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const tagProgress = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 20 } });
  const titleProgress = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 16 } });
  const subProgress = spring({ frame: Math.max(0, frame - 30), fps, config: { damping: 20 } });

  const lines = (item.content || item.title || '').split('\n');
  const title = lines[0] || '';
  const subtitle = lines.slice(1).join(' ') || item.badge || '';

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#06060A' }}>
      <Background glow={glow} />

      {/* Corner accents */}
      {['corner corner-tl','corner corner-tr','corner corner-bl','corner corner-br'].map((c, i) => (
        <div key={i} className={c} style={{ '--accent': accent } as React.CSSProperties} />
      ))}

      <div className="intro-content" style={{ '--accent': accent } as React.CSSProperties}>
        {item.badge && (
          <div className="intro-tag" style={{
            transform: `translateY(${interpolate(tagProgress, [0,1], [20,0])}px)`,
            opacity: tagProgress,
          }}>
            {item.badge}
          </div>
        )}
        <div className="intro-title" style={{
          transform: `translateY(${interpolate(titleProgress, [0,1], [40,0])}px) scale(${interpolate(titleProgress,[0,1],[0.9,1])})`,
          opacity: titleProgress,
        }}>
          {title.split(' ').map((word, i) => (
            <span key={i} style={{ color: i === 0 ? '#fff' : accent, marginRight: '16px' }}>
              {word}
            </span>
          ))}
        </div>
        {subtitle && (
          <div className="intro-sub" style={{
            transform: `translateY(${interpolate(subProgress, [0,1], [20,0])}px)`,
            opacity: subProgress,
          }}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Bottom brand line */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center',
        fontSize: 22,
        letterSpacing: 5,
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        fontFamily: "'IBM Plex Mono', monospace",
        opacity: subProgress,
      }}>
        flutter by mousa
      </div>
    </AbsoluteFill>
  );
};

// ─── TEXT Scene ──────────────────────────────────────────
const TextScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, bg, glow } = getColor(item.color);
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const text = item.content || '';

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#06060A' }}>
      <Background glow={glow} />

      {/* Scene counter */}
      <div className="scene-counter">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>

      <div className="card" style={{ '--accent': accent } as React.CSSProperties}>
        {/* Header */}
        <div className="card-header">
          <div className="traffic-lights">
            <span className="tl tl-r" /><span className="tl tl-y" /><span className="tl tl-g" />
          </div>
          <div className="card-title">{item.title || 'FlutterByMousa'}</div>
          <div style={{ width: 52 }} />
        </div>

        {/* Body */}
        <div className="card-body">
          {item.badge && (
            <div className="scene-badge" style={{ '--accent': accent, '--accent-bg': bg } as React.CSSProperties}>
              <span className="scene-badge-dot" />
              {item.badge}
            </div>
          )}
          <TypewriterWithPen
            text={text}
            frameOffset={12}
            color={accent}
            fontSize={50}
          />
        </div>

        {/* Progress */}
        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            boxShadow: `0 0 12px ${accent}`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── CODE Scene ──────────────────────────────────────────
const CodeScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, glow } = getColor(item.color);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const code = item.code || item.content || '';
  const lineCount = code.split('\n').length;

  // Reveal lines one by one
  const revealProgress = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20 } });
  const visibleLines = Math.ceil(revealProgress * lineCount);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', background: '#06060A' }}>
      <Background glow={glow} />
      <div className="scene-counter">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>

      <div className="card" style={{ '--accent': accent } as React.CSSProperties}>
        <div className="card-header">
          <div className="traffic-lights">
            <span className="tl tl-r" /><span className="tl tl-y" /><span className="tl tl-g" />
          </div>
          <div className="card-title">{item.title || 'main.dart'}</div>
          <div style={{
            fontSize: 18, color: accent, letterSpacing: 2,
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            DART
          </div>
        </div>

        <div className="card-body" style={{ padding: '32px 40px' }}>
          <div className="code-line-numbers">
            {/* Line numbers */}
            <div className="code-nums">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="code-num" style={{
                  opacity: i < visibleLines ? 0.3 : 0,
                }}>
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code with clipping reveal */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                clipPath: `inset(0 0 ${Math.max(0, (1 - revealProgress) * 100)}% 0)`,
              }}>
                <SyntaxHighlighter
                  language="dart"
                  style={vscDarkPlus}
                  customStyle={{
                    background: 'transparent',
                    fontSize: '30px',
                    padding: 0,
                    lineHeight: '1.65',
                    margin: 0,
                  }}
                  wrapLines
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            boxShadow: `0 0 12px ${accent}`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene Router ────────────────────────────────────────
const Scene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const inner = item.type === 'intro'
    ? <IntroScene item={item} />
    : item.type === 'code'
      ? <CodeScene item={item} index={index} total={total} />
      : <TextScene item={item} index={index} total={total} />;

  return <TransitionIn>{inner}</TransitionIn>;
};

// ─── Main Export ─────────────────────────────────────────
export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  if (!scenes || scenes.length === 0) {
    return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
  }

  let offset = 0;
  return (
    <AbsoluteFill>
      {scenes.map((item, index) => {
        const duration = Math.ceil(item.calculatedDuration || 150);
        const start = offset;
        offset += duration;
        return (
          <Sequence key={`${index}-${item.title ?? ''}`} from={start} durationInFrames={duration}>
            {item.voiceFile && (
              <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} volume={1} />
            )}
            <Scene item={item} index={index} total={scenes.length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
  
