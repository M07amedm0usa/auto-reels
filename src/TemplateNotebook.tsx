import React from 'react';
import { AbsoluteFill, Audio, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { GraphPaper, RadialGlow, ProgressBar } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TEMPLATE 3: NEON NOTEBOOK
// ─────────────────────────────────────────────────
export const NotebookScene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color ?? 'c-purple');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });

  // [FIX CRITICAL] pct من duration الممرر — مش من durationInFrames الكلي
  const pct = duration > 0 ? frame / duration : 0;

  const isCode = item.type === 'code';
  const text   = item.content ?? '';
  const isRTL  = /[\u0600-\u06FF]/.test(text);

  const hexByte = Math.min(255, Math.max(0, Math.round(pct * 255)));
  const hexPct  = hexByte.toString(16).padStart(2, '0');

  return (
    <AbsoluteFill style={{ background:'#0E0E1A', flexDirection:'column' }}>
      <GraphPaper /><RadialGlow glow={glow} top="35%" duration={duration} />

      {/* Header */}
      <div style={{ padding:'28px 40px 20px', borderBottom:`2px solid ${accent}30`,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexShrink:0, zIndex:5, position:'relative', direction:'ltr' }}>
        <div style={{ fontFamily:'Caveat,cursive', fontSize:34, color:accent, textShadow:`0 0 20px ${accent}` }}>
          @flutterbymousa
        </div>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:4, color:'rgba(255,255,255,0.2)' }}>
          {String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex:1, padding:'36px 48px', display:'flex', flexDirection:'column',
        justifyContent:'center', position:'relative', zIndex:3 }}>
        {item.badge && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:10,
            background:`${accent}10`, border:`1px dashed ${accent}55`, borderRadius:8,
            padding:'8px 20px', marginBottom:28,
            alignSelf: isRTL ? 'flex-end' : 'flex-start',
            fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:4,
            textTransform:'uppercase', color:accent,
            opacity: interpolate(sp(5),[0,1],[0,1]) }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }} />
            {item.badge}
          </div>
        )}
        {item.title && !isCode && (
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:4,
            color:accent, textTransform:'uppercase', marginBottom:14, direction:'ltr',
            opacity: interpolate(sp(8),[0,1],[0,1]) }}>
            // {item.title}
          </div>
        )}
        {!isCode ? (
          <div style={{ opacity: interpolate(sp(12),[0,1],[0,1]) }}>
            <TypewriterWithPen text={text} frameOffset={14} color={accent} fontSize={44} />
          </div>
        ) : (
          <div style={{ direction:'ltr' }}>
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background:'transparent', fontSize:56, padding:0, margin:0, lineHeight:'1.65', direction:'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}
        {item.stat && (
          <div style={{ fontFamily:'Caveat,cursive', fontSize:28, color:`${accent}88`,
            marginTop:24, direction:'rtl', transform:'rotate(-2deg)',
            opacity: interpolate(sp(35),[0,1],[0,1]) }}>
            ← {item.stat}
          </div>
        )}
      </div>

      {/* Checklist */}
      {item.checkItems && (
        <div style={{ padding:'0 48px 24px', display:'flex', flexDirection:'column',
          gap:14, direction:'rtl', zIndex:3 }}>
          {item.checkItems.map((c,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14,
              fontFamily:'Cairo,sans-serif', fontSize:26, color:'rgba(255,255,255,0.6)',
              opacity: interpolate(sp(20+i*8),[0,1],[0,1]) }}>
              <div style={{ width:28, height:28, borderRadius:6, display:'flex',
                alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0,
                background: c.done ? `${accent}15` : 'rgba(255,255,255,0.04)',
                border: c.done ? `1px solid ${accent}` : '1px dashed rgba(255,255,255,0.2)',
                color: c.done ? accent : 'transparent' }}>
                {c.done ? '✓' : '○'}
              </div>
              {c.text}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding:'18px 40px', borderTop:`2px solid ${accent}20`,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexShrink:0, zIndex:5, position:'relative' }}>
        <div style={{ fontFamily:'Caveat,cursive', fontSize:26, color:`${accent}40` }}>notes ✏️</div>
        <div style={{ height:3, flex:1, margin:'0 20px',
          background:`linear-gradient(90deg,${accent}00,${accent}${hexPct},${accent}00)` }} />
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:16,
          letterSpacing:3, color:'rgba(255,255,255,0.15)' }}>
          PAGE {String(index+1).padStart(2,'0')}
        </div>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};
