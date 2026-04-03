import React from 'react'; // [تم التصحيح]
import {
  AbsoluteFill,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
// [تم الحذف]: Audio و staticFile
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { DotGrid, RadialGlow, ProgressBar, SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TEMPLATE: HUD COMPARE (SplitView)
// ─────────────────────────────────────────────────
export const SplitViewScene: React.FC<{
  item: SceneItem; index: number; total: number; duration: number;
}> = ({ item, index, total, duration }) => {
  const { accent, glow, dim } = getP(item.color ?? 'c-cyan');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: { damping: 20, stiffness: 80 } });

  const isCode = item.type === 'code';
  const text   = item.content ?? '';
  const isRTL  = /[\u0600-\u06FF]/.test(text);
  const title  = item.title ?? text.split('\n')[0] ?? '';

  const nodes = item.checkItems
    ? item.checkItems.map((c, i) => ({
        icon:  c.done ? '✅' : '❌',
        label: c.text,
        sub:   '',
        color: c.done ? '#39FF6E' : '#FF4D8D',
        tag:   c.done ? 'PASS' : 'FAIL',
        delay: 24 + i * 16,
      }))
    : [
        { icon: '🧊', label: 'StatelessWidget', sub: 'Built once · no rebuild', color: '#39FF6E', tag: 'FAST',   delay: 24 },
        { icon: '🔥', label: 'StatefulWidget',  sub: 'Rebuilds on setState()',  color: '#FF4D8D', tag: 'COSTLY', delay: 40 },
        { icon: '⚡', label: 'القاعدة الذهبية', sub: 'Stateless أول اختيار',   color: accent,    tag: 'RULE',   delay: 56 },
      ];

  const cornerP = sp(4);

  return (
    <AbsoluteFill style={{ background: '#060612', flexDirection: 'column' }}>
      <DotGrid op={0.045} />
      <RadialGlow glow={glow} top="42%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* HUD corners */}
      {[
        { top: 32,    left:  32,  borderTop:    `2px solid ${accent}`, borderLeft:  `2px solid ${accent}` },
        { top: 32,    right: 32,  borderTop:    `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
        { bottom: 32, left:  32,  borderBottom: `2px solid ${accent}`, borderLeft:  `2px solid ${accent}` },
        { bottom: 32, right: 32,  borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', width: 48, height: 48, zIndex: 20, opacity: cornerP, ...style }} />
      ))}

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '72px 60px 36px', zIndex: 5 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 22,
          background: dim, border: `1px solid ${accent}55`,
          borderRadius: 8, padding: '9px 22px',
          fontFamily: 'JetBrains Mono,monospace', fontSize: 17, letterSpacing: 5,
          color: accent, textTransform: 'uppercase',
          opacity: interpolate(sp(5), [0, 1], [0, 1]), direction: 'ltr',
        }}>
          <span>▸</span>{item.badge ?? 'COMPARE'}
        </div>
        <div style={{
          fontFamily: 'Cairo,sans-serif', fontWeight: 900, fontSize: 64,
          color: '#fff', direction: isRTL ? 'rtl' : 'ltr', lineHeight: 1.15,
          opacity: interpolate(sp(10), [0, 0.4, 1], [0, 0.5, 1]),
          transform: `translateY(${(1 - sp(10)) * 28}px)`,
        }}>
          {title.split(' ').map((w, i) => (
            <span key={i} style={{
              color: i === 0 ? accent : '#fff',
              textShadow: i === 0 ? `0 0 30px ${accent}88` : 'none',
              // [تم التعديل]: مسافات عربية صحيحة
              marginInlineStart: i === 0 ? 0 : 14,
            }}>{w}</span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        flexShrink: 0, height: 1, margin: '0 60px',
        background: `linear-gradient(90deg, transparent, ${accent}66, transparent)`,
        opacity: sp(14),
      }} />

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 60px 0', display: 'flex', flexDirection: 'column', gap: 18, zIndex: 5, overflow: 'hidden' }}>

        {isCode && (
          <div style={{
            flex: 1, background: 'rgba(4,4,16,0.97)', borderRadius: 20, overflow: 'hidden',
            border: `1px solid ${accent}22`,
            boxShadow: `0 0 60px ${glow}`,
            opacity: interpolate(sp(18), [0, 1], [0, 1]),
          }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
            <div style={{ direction: 'ltr' }}>
              <SyntaxHighlighter language="dart" style={vscDarkPlus}
                // [تم التصحيح]: fontSize لـ 46
                customStyle={{ background: 'transparent', fontSize: 46, padding: '28px 36px', margin: 0, lineHeight: '1.65', direction: 'ltr' }}>
                {item.code ?? ''}
              </SyntaxHighlighter>
            </div>
          </div>
        )}

        {!isCode && !item.checkItems && text && (
          <div style={{
            flex: 1, background: 'rgba(4,4,16,0.9)', borderRadius: 20, padding: '44px 52px',
            border: `1px solid ${accent}22`, boxShadow: `0 0 60px ${glow}`,
            display: 'flex', alignItems: 'center',
          }}>
            <TypewriterWithPen text={text} frameOffset={18} color={accent} fontSize={52} />
          </div>
        )}

        {!isCode && (item.checkItems || !text) && nodes.map((n, i) => {
          const p = sp(n.delay);
          const nodeRTL = /[\u0600-\u06FF]/.test(n.label);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 22,
              background: `linear-gradient(110deg, ${n.color}0A, transparent)`,
              border: `1px solid ${n.color}30`,
              borderLeft: `3px solid ${n.color}`,
              borderRadius: '0 16px 16px 0',
              padding: '22px 28px',
              opacity: p, transform: `translateX(${(1 - p) * -40}px)`,
              boxShadow: `0 4px 24px ${n.color}10`,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                background: `${n.color}15`, border: `1.5px solid ${n.color}40`,
              }}>{n.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Cairo,sans-serif', fontWeight: 800, fontSize: 32,
                  color: 'rgba(255,255,255,0.92)',
                  direction: nodeRTL ? 'rtl' : 'ltr',
                }}>{n.label}</div>
                {n.sub && (
                  <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 19, color: 'rgba(255,255,255,0.32)', marginTop: 5 }}>{n.sub}</div>
                )}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono,monospace', fontSize: 18, fontWeight: 800,
                letterSpacing: 2, padding: '9px 22px', borderRadius: 8,
                background: `${n.color}18`, border: `1.5px solid ${n.color}55`,
                color: n.color, flexShrink: 0, boxShadow: `0 0 14px ${n.color}20`,
              }}>{n.tag}</div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{
        flexShrink: 0, padding: '22px 60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `1px solid ${accent}18`, zIndex: 5,
      }}>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 5, color: 'rgba(255,255,255,0.2)' }}>@flutterbymousa</span>
        <div style={{ flex: 1, margin: '0 32px' }}><ProgressBar accent={accent} duration={duration} /></div>
        <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 18, letterSpacing: 3, color: `${accent}66` }}>HUD.{String(index + 1).padStart(2, '0')}</span>
      </div>
    </AbsoluteFill>
  );
};
