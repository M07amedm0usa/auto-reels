import React from 'react';
import { AbsoluteFill, Audio, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getP } from './types';
import { DotGrid, FilmGrain, Letterbox, RadialGlow, SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TEMPLATE 4: CINEMATIC
// ─────────────────────────────────────────────────
export const CinematicScene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });

  // [FIX CRITICAL] pct من duration الممرر — مش من durationInFrames الكلي
  const pct = duration > 0 ? frame / duration : 0;

  const isIntro = item.type === 'intro' || item.type === undefined;
  const isCode  = item.type === 'code';
  // [FIX LOGIC] حذف isFact — النوع ملغي، badge يحل محله
  const words = (item.title ?? item.content?.split('\n')[0] ?? '').split(' ');
  const body  = item.content?.split('\n').slice(1).join(' ') ?? '';

  return (
    <AbsoluteFill style={{ background:'#04040A', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
      <DotGrid op={0.04} /><FilmGrain /><Letterbox />
      <RadialGlow glow={glow} top="45%" duration={duration} />

      {/* Episode tag */}
      {isIntro && (
        <div style={{ position:'absolute', top:100, left:0, right:0,
          display:'flex', alignItems:'center', gap:20, padding:'0 48px', zIndex:10, direction:'ltr' }}>
          <div style={{ height:1, flex:1,
            background:`linear-gradient(90deg,${accent}88,transparent)`,
            transform:`scaleX(${sp(5)})`, transformOrigin:'left' }} />
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:6,
            color:`${accent}BB`, textTransform:'uppercase', whiteSpace:'nowrap', opacity:sp(10) }}>
            {item.badge ?? `Episode ${String(index+1).padStart(2,'0')}`}
          </div>
          <div style={{ height:1, flex:1,
            background:`linear-gradient(90deg,transparent,${accent}88)`,
            transform:`scaleX(${sp(5)})`, transformOrigin:'right' }} />
        </div>
      )}

      {!isIntro && <SceneIdx index={index} total={total} />}

      {/* Content */}
      <div style={{ position:'absolute', bottom: isIntro ? 100 : undefined,
        left:0, right:0, padding:'0 48px', zIndex:10 }}>
        {/* [FIX LOGIC] label يعتمد على badge بدل أنواع ملغية */}
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:6,
          color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:16, direction:'ltr',
          opacity: interpolate(sp(5),[0,1],[0,1]) }}>
          {item.badge ? `// ${item.badge}` : isCode ? (item.title ?? 'main.dart') : '@flutterbymousa presents'}
        </div>

        <div style={{ fontFamily:'Cairo,sans-serif', fontWeight:900,
          fontSize: isIntro ? 80 : 60, color:'#fff', direction:'rtl', lineHeight:1.1, marginBottom:16, overflow:'hidden' }}>
          <div style={{ transform:`translateY(${(1-sp(10))*60}px)`, opacity: interpolate(sp(10),[0,0.4,1],[0,0.5,1]) }}>
            {words.map((w,i) => (
              <span key={i} style={{
                color:i===0?accent:'#fff',
                textShadow:i===0?`0 0 28px ${accent}`:'none',
                marginRight:16 }}>{w} </span>
            ))}
          </div>
        </div>

        {body && !isCode && (
          <div style={{ fontFamily:'Cairo,sans-serif', fontSize:28, color:'rgba(255,255,255,0.4)',
            direction:'rtl', lineHeight:1.7, fontWeight:700,
            opacity: interpolate(sp(22),[0,1],[0,1]) }}>
            {body}
          </div>
        )}

        {isCode && (
          <div style={{ background:'rgba(8,8,18,0.97)', borderRadius:20, overflow:'hidden',
            border:`1px solid ${accent}20`, boxShadow:`0 0 40px ${accent}12`,
            opacity: interpolate(sp(15),[0,1],[0,1]), direction:'ltr' }}>
            <div style={{ height:3, background:`linear-gradient(90deg,transparent,${accent},transparent)` }} />
            <SyntaxHighlighter language="dart" style={vscDarkPlus}
              customStyle={{ background:'transparent', fontSize:56, padding:'28px 32px', margin:0, lineHeight:'1.65', direction:'ltr' }}>
              {item.code ?? ''}
            </SyntaxHighlighter>
          </div>
        )}

        {item.stats && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginTop:20,
            opacity: interpolate(sp(28),[0,1],[0,1]) }}>
            {item.stats.map((s,i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'20px 24px' }}>
                <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:56, color:accent,
                  lineHeight:1, marginBottom:4, textShadow:`0 0 16px ${accent}66` }}>{s.value}</div>
                <div style={{ fontFamily:'Cairo,sans-serif', fontSize:20, color:'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom band */}
      <div style={{ position:'absolute', bottom:80, left:0, right:0, height:56,
        background:`${accent}08`, borderTop:`1px solid ${accent}22`, borderBottom:`1px solid ${accent}22`,
        display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 48px',
        zIndex:10, opacity: interpolate(sp(40),[0,1],[0,1]) }}>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18,
          letterSpacing:5, color:'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>@flutterbymousa</span>
        <div style={{ width:`${pct * 200}px`, maxWidth:200, height:2,
          background:`linear-gradient(90deg,${accent},${accent}44)`, borderRadius:1 }} />
        <span style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:32, color:`${accent}66`, letterSpacing:2 }}>
          EP.{String(index+1).padStart(2,'0')}
        </span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};
