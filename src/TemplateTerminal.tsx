import React from 'react';
import { AbsoluteFill, Audio, staticFile, spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import { getP } from './types';
import { DotGrid, RadialGlow, ScanLines, WinBar, ProgressBar, SceneIdx } from './primitives';
import type { SceneItem } from './types';

// ─────────────────────────────────────────────────
// TERMINAL INTRO
// ─────────────────────────────────────────────────
export const TerminalIntro: React.FC<{ item: SceneItem; duration: number }> = ({ item, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });

  const words = (item.title ?? item.content?.split('\n')[0] ?? '').split(' ');
  const sub   = item.content?.split('\n').slice(1).join(' ') ?? item.badge ?? '';

  return (
    <AbsoluteFill style={{ background:'#04040A', flexDirection:'column' }}>
      <DotGrid /><ScanLines /><RadialGlow glow={glow} top="50%" duration={duration} />

      {/* Top status bar */}
      <div style={{ padding:'28px 40px', display:'flex', justifyContent:'space-between',
        fontFamily:'JetBrains Mono,monospace', fontSize:20, color:'rgba(255,255,255,0.3)',
        letterSpacing:2, borderBottom:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(0,0,0,0.4)', flexShrink:0, zIndex:10 }}>
        <span>
          <span style={{ display:'inline-block', width:12, height:12, borderRadius:'50%',
            background:accent, boxShadow:`0 0 8px ${accent}`, marginRight:10, verticalAlign:'middle' }} />
          LIVE
        </span>
        <span>flutter_os v3.7.2</span>
        <span>🔋 100%</span>
      </div>

      {/* Center content — boot log + hero together */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'0 40px', gap:0, zIndex:5 }}>

        {/* Boot log */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:36 }}>
          {(
            [['[SYS]','Loading Dart runtime...','OK'],
             ['[FLT]','Widget tree initialized','OK'],
             ['[RND]','Skia renderer active','OK'],
             ['[HOT]','Hot reload ready','OK'],
             ['[EDU]','Loading tutorial...','!!']] as const
          ).map(([pre,msg,st],i) => {
            const p = sp(i * 8);
            return (
              <div key={i} style={{ display:'flex', gap:20, fontFamily:'JetBrains Mono,monospace',
                fontSize:22, direction:'ltr', opacity:p, 
                // تم إضافة Math.round هنا لمنع رعشة البيكسلات
                transform:`translateX(${Math.round((1-p)*-20)}px)` }}>
                <span style={{ color:accent, fontWeight:700 }}>{pre}</span>
                <span style={{ color:'rgba(255,255,255,0.4)', flex:1 }}>{msg}</span>
                <span style={{ color: st==='!!' ? '#FFCB6B' : accent }}>{st}</span>
              </div>
            );
          })}
        </div>

        {/* Hero */}
        <div style={{ zIndex:8 }}>
          <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:8,
            color:accent, textTransform:'uppercase', marginBottom:16, direction:'ltr',
            opacity: interpolate(sp(44),[0,1],[0,0.75]) }}>
            // Flutter Tutorial — بالعربي
          </div>
          <div style={{ fontFamily:'Cairo,sans-serif', fontWeight:900, fontSize:72,
            color:'#fff', direction:'rtl', lineHeight:1.1, marginBottom:12,
            opacity: interpolate(sp(50),[0,0.4,1],[0,0.6,1]),
            // تم إضافة Math.round هنا لمنع الهزة العمودية أثناء الأنيميشن
            transform:`translateY(${Math.round((1-sp(50))*30)}px)` }}>
            {words.map((w,i) => (
              <span key={i} style={{ color:i===0?accent:'#fff',
                textShadow:i===0?`0 0 30px ${accent}`:'none', marginRight:18 }}>{w}</span>
            ))}
          </div>
          {sub && (
            <div style={{ fontFamily:'Cairo,sans-serif', fontSize:30, color:'rgba(255,255,255,0.35)',
              direction:'rtl', fontWeight:700, opacity: sp(60), marginBottom:24 }}>{sub}</div>
          )}
          <div style={{ background:dim, border:`1px solid ${accent}33`, borderRadius:16,
            padding:'20px 28px', direction:'ltr',
            opacity: interpolate(sp(70),[0,1],[0,1]) }}>
            <div style={{ display:'flex', alignItems:'center', gap:14,
              fontFamily:'JetBrains Mono,monospace', fontSize:24 }}>
              <span style={{ color:accent, fontWeight:700 }}>▶</span>
              <span style={{ color:'rgba(255,255,255,0.7)' }}>flutter run --profile --release</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding:'22px 40px', borderTop:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'space-between',
        flexShrink:0, zIndex:10 }}>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18,
          letterSpacing:6, color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>@flutterbymousa</span>
        <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18,
          letterSpacing:4, color:accent }}>REC ●</span>
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────
// GENERIC TEXT SCENE (terminal/default)
// ─────────────────────────────────────────────────
export const GenericTextScene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });
  const text = item.content ?? '';
  const isRTL = /[\u0600-\u06FF]/.test(text);

  return (
    <AbsoluteFill style={{ background:'#04040A', justifyContent:'center', alignItems:'center' }}>
      <DotGrid /><RadialGlow glow={glow} duration={duration} /><SceneIdx index={index} total={total} />
      <div style={{ 
        width:'90%', 
        background:'rgba(8,8,18,0.97)', 
        borderRadius:32, 
        overflow:'hidden',
        boxShadow:`0 0 0 1px rgba(255,255,255,0.06),0 40px 80px rgba(0,0,0,.7),0 0 80px ${glow}`,
        position:'relative',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}>
        <div style={{ position:'absolute', inset:0, borderRadius:32, padding:1,
          background:`linear-gradient(140deg,${accent}88 0%,transparent 50%)`,
          WebkitMask:'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          WebkitMaskComposite:'xor', maskComposite:'exclude', pointerEvents:'none', zIndex:10 }} />
        <WinBar title={item.title ?? 'flutter_by_mousa'} />
        <div style={{ padding:'48px 52px', minHeight:400, display:'flex',
          flexDirection:'column', justifyContent:'center', direction: isRTL ? 'rtl' : 'ltr' }}>
          {item.badge && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, marginBottom:32,
              background:dim, border:`1px solid ${accent}`, borderRadius:100, padding:'10px 24px',
              fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:4,
              textTransform:'uppercase', color:accent,
              alignSelf: isRTL ? 'flex-end' : 'flex-start',
              opacity: sp(5) }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:accent, boxShadow:`0 0 8px ${accent}` }} />
              {item.badge}
            </div>
          )}
          <TypewriterWithPen text={text} frameOffset={14} color={accent} fontSize={48} />
        </div>
        <ProgressBar accent={accent} duration={duration} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────
// GENERIC CODE SCENE
// ─────────────────────────────────────────────────
export const GenericCodeScene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const code  = item.code ?? item.content ?? '';
  const lines = code.split('\n');
  const revP  = spring({ frame:Math.max(0,frame-8), fps, config:{ damping:24, stiffness:70 } });
  const vis   = Math.min(lines.length, revP * (lines.length + 2));
  const full  = Math.floor(vis);
  const hl    = Math.max(0, full - 1);

  return (
    <AbsoluteFill style={{ background:'#04040A', justifyContent:'center', alignItems:'center' }}>
      <DotGrid /><RadialGlow glow={glow} duration={duration} /><SceneIdx index={index} total={total} />
      <div style={{ 
        width:'96%', 
        background:'rgba(8,8,18,0.97)', 
        borderRadius:32, 
        overflow:'hidden',
        boxShadow:`0 0 0 1px rgba(255,255,255,0.06),0 40px 80px rgba(0,0,0,.7),0 0 60px ${glow}`,
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}>
        <WinBar title={item.title ?? 'main.dart'}
          right={<span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:3, color:accent }}>DART</span>} />
        <div style={{ padding:'40px 44px', display:'flex', gap:24, direction:'ltr' }}>
          {/* line numbers */}
          <div style={{ display:'flex', flexDirection:'column', color:'rgba(255,255,255,0.15)',
            fontFamily:'"JetBrains Mono",monospace', fontSize:72, lineHeight:1.5,
            textAlign:'right', flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.06)',
            paddingRight:24, minWidth:64, userSelect:'none' }}>
            {lines.map((_,i) => (
              <div key={i} style={{ opacity: i<=full ? (i===hl ? 0.7 : 0.25) : 0, color: i===hl ? accent : undefined }}>{i+1}</div>
            ))}
          </div>
          {/* code block */}
          <div style={{ flex:1, overflow:'hidden' }}>
            <SyntaxHighlighter
              language="dart"
              style={vscDarkPlus}
              wrapLines={true}
              wrapLongLines={false}
              lineProps={(lineNumber) => {
                const i = lineNumber - 1;
                const op = i < full ? 1 : i === full ? vis - full : 0;
                return {
                  style: {
                    opacity: op,
                    background: i === hl ? `linear-gradient(90deg,${accent}14,transparent 70%)` : 'transparent',
                    borderLeft: i === hl ? `3px solid ${accent}` : '3px solid transparent',
                    paddingLeft: 12,
                    marginLeft: -14,
                    display: 'block',
                    direction: 'ltr',
                  },
                };
              }}
              customStyle={{ 
                background:'transparent', 
                fontSize: 72, 
                fontWeight: 700, 
                fontFamily: '"JetBrains Mono",monospace', 
                padding:0, 
                margin:0, 
                lineHeight: 1.5, 
                direction:'ltr' 
              }}
            >
              {code || ' '}
            </SyntaxHighlighter>
          </div>
        </div>
        <ProgressBar accent={accent} duration={duration} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};
  
