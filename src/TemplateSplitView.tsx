import React from 'react';
import { AbsoluteFill, Audio, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { getP } from './types';
import { DotGrid, RadialGlow, ProgressBar, SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TEMPLATE 2: SPLIT VIEW
// ─────────────────────────────────────────────────
export const SplitViewScene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color ?? 'c-purple');
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });

  const lines = (item.content ?? '').split('\n');
  const title = lines[0] ?? '';
  const sub   = lines[1] ?? '';

  const nodes = item.checkItems
    ? item.checkItems.map((c,i) => ({
        ...c,
        delay: 18 + i * 12,
        color: c.done ? '#39FF6E' : '#FF4D8D',
        tag:   c.done ? 'YES' : 'NO',
        icon:  c.done ? '✓' : '○',
        desc:  '',
      }))
    : [
        { text:'StatelessWidget', desc:'Built once · no rebuild', done:true,  icon:'🧊', color:'#39FF6E', tag:'FAST',   delay:18 },
        { text:'StatefulWidget',  desc:'Rebuilds on setState()', done:false, icon:'🔥', color:'#FF4D8D', tag:'COSTLY', delay:28 },
        { text:'القاعدة الذهبية', desc:'Stateless أول اختيار',   done:true,  icon:'⚡', color:accent,   tag:'RULE',   delay:38 },
      ];

  return (
    <AbsoluteFill style={{ background:'#04040A', flexDirection:'column' }}>
      <DotGrid /><RadialGlow glow={glow} top="25%" duration={duration} />
      <SceneIdx index={index} total={total} />

      {/* Top half */}
      <div style={{ flex:'0 0 44%', display:'flex', flexDirection:'column', justifyContent:'flex-end',
        padding:'60px 48px 36px', borderBottom:'1px solid rgba(255,255,255,0.06)',
        position:'relative', zIndex:2 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:6,
          color:accent, textTransform:'uppercase', marginBottom:16, direction:'ltr',
          opacity: interpolate(sp(5),[0,1],[0,1]) }}>
          // {item.badge ?? 'THE DIFFERENCE'}
        </div>
        <div style={{ fontFamily:'Cairo,sans-serif', fontWeight:900, fontSize:54,
          color:'#fff', direction:'rtl', lineHeight:1.15, marginBottom:12,
          opacity: interpolate(sp(12),[0,0.5,1],[0,0.6,1]),
          transform:`translateY(${(1-sp(12))*30}px)` }}>
          {title.split(' ').map((w,i) => (
            <span key={i} style={{
              color:i%2===0?'#fff':accent,
              textShadow:i%2===0?'none':`0 0 20px ${accent}`,
              marginRight:12 }}>{w} </span>
          ))}
        </div>
        {sub && (
          <div style={{ fontFamily:'Cairo,sans-serif', fontSize:26, color:'rgba(255,255,255,0.38)',
            direction:'rtl', fontWeight:700, opacity: interpolate(sp(22),[0,1],[0,1]) }}>{sub}</div>
        )}
      </div>

      {/* Widget tree */}
      <div style={{ flex:1, padding:'28px 48px', display:'flex', flexDirection:'column',
        justifyContent:'center', gap:18, position:'relative', zIndex:2 }}>
        {nodes.map((n, i) => {
          const p = sp(n.delay);
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{ width:2, height:14,
                  background:`linear-gradient(180deg,${accent},transparent)`,
                  marginLeft:22, opacity:0.35 }} />
              )}
              <div style={{ display:'flex', alignItems:'center', gap:18,
                opacity:p, transform:`translateX(${(1-p)*-20}px)` }}>
                <div style={{ width:56, height:56, borderRadius:14, display:'flex',
                  alignItems:'center', justifyContent:'center', fontSize:24,
                  background:`${n.color}12`, border:`1px solid ${n.color}30` }}>
                  {n.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'rgba(255,255,255,0.85)',
                    fontFamily:'Cairo,sans-serif' }}>{n.text}</div>
                  {n.desc && (
                    <div style={{ fontSize:17, color:'rgba(255,255,255,0.3)',
                      fontFamily:'JetBrains Mono,monospace', marginTop:2 }}>{n.desc}</div>
                  )}
                </div>
                <div style={{ fontSize:15, fontWeight:700, letterSpacing:2, padding:'5px 14px',
                  borderRadius:100, background:`${n.color}15`, border:`1px solid ${n.color}40`,
                  color:n.color, fontFamily:'JetBrains Mono,monospace' }}>{n.tag}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <ProgressBar accent={accent} duration={duration} />
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};
