import React from 'react';
import {
  AbsoluteFill, Sequence, Audio, staticFile,
  spring, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { TypewriterWithPen } from './TypewriterWithPen';
import './style.css';

// ─────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────
export type TemplateId = 'terminal' | 'notebook' | 'cinematic' | 'splitview';
export type SceneType  = 'intro' | 'text' | 'code' | 'tip' | 'fact';

export interface SceneItem {
  type?:               SceneType;
  template?:           TemplateId;
  content?:            string;
  code?:               string;
  title?:              string;
  badge?:              string;
  color?:              string;
  stat?:               string;
  statLabel?:          string;
  checkItems?:         { text: string; done: boolean }[];
  stats?:              { value: string; label: string }[];
  voiceFile?:          string;
  calculatedDuration?: number;
}

// ─────────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────────
const PALETTE: Record<string, { accent: string; glow: string; dim: string }> = {
  'c-cyan':   { accent: '#00FFB2', glow: 'rgba(0,255,178,0.22)',   dim: 'rgba(0,255,178,0.08)'   },
  'c-purple': { accent: '#A78BFA', glow: 'rgba(167,139,250,0.22)', dim: 'rgba(167,139,250,0.08)' },
  'c-green':  { accent: '#39FF6E', glow: 'rgba(57,255,110,0.22)',  dim: 'rgba(57,255,110,0.08)'  },
  'c-orange': { accent: '#F59E0B', glow: 'rgba(245,158,11,0.22)',  dim: 'rgba(245,158,11,0.08)'  },
  'c-pink':   { accent: '#FF4D8D', glow: 'rgba(255,77,141,0.22)',  dim: 'rgba(255,77,141,0.08)'  },
  'c-blue':   { accent: '#00C8FF', glow: 'rgba(0,200,255,0.22)',   dim: 'rgba(0,200,255,0.08)'   },
  'c-teal':   { accent: '#34D399', glow: 'rgba(52,211,153,0.22)',  dim: 'rgba(52,211,153,0.08)'  },
  'c-amber':  { accent: '#FBBF24', glow: 'rgba(251,191,36,0.22)',  dim: 'rgba(251,191,36,0.08)'  },
};
const getP = (c?: string) => PALETTE[c ?? 'c-cyan'] ?? (PALETTE['c-cyan'] as NonNullable<typeof PALETTE[string]>);

// ─────────────────────────────────────────────────
// SHARED PRIMITIVES
// ─────────────────────────────────────────────────
const DotGrid: React.FC<{ op?: number }> = ({ op = 0.055 }) => (
  <div style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
    backgroundImage:`radial-gradient(circle,rgba(255,255,255,${op}) 1px,transparent 1px)`,
    backgroundSize:'28px 28px',
  }} />
);

const GraphPaper: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
    backgroundImage:`
      linear-gradient(rgba(99,102,241,0.13) 1px,transparent 1px),
      linear-gradient(90deg,rgba(99,102,241,0.13) 1px,transparent 1px),
      radial-gradient(circle,rgba(99,102,241,0.18) 1px,transparent 1px)`,
    backgroundSize:'40px 40px,40px 40px,40px 40px',
    backgroundPosition:'0 0,0 0,20px 20px',
  }} />
);

const RadialGlow: React.FC<{ glow: string; top?: string }> = ({ glow, top = '30%' }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [-20, 20]);
  return (
    <div style={{
      position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
      background:`radial-gradient(ellipse 65% 55% at 50% ${top},${glow} 0%,transparent 70%)`,
      transform:`translateY(${drift}px)`,
    }} />
  );
};

const ScanLines: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, zIndex:50, pointerEvents:'none',
    background:'repeating-linear-gradient(0deg,transparent 0px,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)',
  }} />
);

const FilmGrain: React.FC = () => (
  <div style={{
    position:'absolute', inset:0, zIndex:50, pointerEvents:'none', opacity:0.03,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundSize:'200px 200px',
  }} />
);

const Letterbox: React.FC = () => (
  <>
    <div style={{ position:'absolute', top:0,    left:0, right:0, height:80, background:'#000', zIndex:40 }} />
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'#000', zIndex:40 }} />
  </>
);

const WinBar: React.FC<{ title: string; right?: React.ReactNode }> = ({ title, right }) => (
  <div style={{ display:'flex', alignItems:'center', gap:20, padding:'28px 40px',
    borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.015)',
    flexShrink:0, zIndex:5, position:'relative' }}>
    <div style={{ display:'flex', gap:10 }}>
      {(['#ff5f57','#febc2e','#28c840'] as const).map((c,i) => (
        <div key={i} style={{ width:16, height:16, borderRadius:'50%', background:c }} />
      ))}
    </div>
    <div style={{ flex:1, textAlign:'center', fontSize:20,
      fontFamily:'JetBrains Mono,monospace', letterSpacing:3,
      textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
      {title}
    </div>
    <div style={{ minWidth:80 }}>{right}</div>
  </div>
);

const ProgressBar: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pct = durationInFrames > 0 ? frame / durationInFrames : 0; // guard div/0
  return (
    <div style={{ height:4, background:'rgba(255,255,255,0.04)', flexShrink:0 }}>
      <div style={{ height:'100%', width:`${pct * 100}%`,
        background:`linear-gradient(90deg,${accent}88,${accent})`,
        boxShadow:`0 0 10px ${accent}`, borderRadius:'0 2px 2px 0' }} />
    </div>
  );
};

const Enter: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config:{ damping:22, stiffness:110, mass:0.8 } });
  return (
    <div style={{ width:'100%', height:'100%',
      opacity: interpolate(p,[0,0.5,1],[0,0.7,1]),
      transform:`translateY(${(1-p)*50}px) scale(${interpolate(p,[0,1],[0.97,1])})` }}>
      {children}
    </div>
  );
};

const SceneIdx: React.FC<{ index: number; total: number }> = ({ index, total }) => (
  <div style={{ position:'absolute', top:56, right:60,
    fontFamily:'JetBrains Mono,monospace', fontSize:22,
    color:'rgba(255,255,255,0.18)', letterSpacing:4, zIndex:10 }}>
    {String(index+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
  </div>
);

// ─────────────────────────────────────────────────
// GENERIC TEXT SCENE (terminal/default)
// ─────────────────────────────────────────────────
const GenericTextScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });
  const text = item.content ?? '';
  const isRTL = /[\u0600-\u06FF]/.test(text);

  return (
    <AbsoluteFill style={{ background:'#04040A', justifyContent:'center', alignItems:'center' }}>
      <DotGrid /><RadialGlow glow={glow} /><SceneIdx index={index} total={total} />
      <div style={{ width:'90%', background:'rgba(8,8,18,0.97)', borderRadius:32, overflow:'hidden',
        boxShadow:`0 0 0 1px rgba(255,255,255,0.06),0 40px 80px rgba(0,0,0,.7),0 0 80px ${glow}`,
        position:'relative' }}>
        {/* gradient border */}
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
        <ProgressBar accent={accent} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────
// GENERIC CODE SCENE
// ─────────────────────────────────────────────────
const GenericCodeScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // code له أولوية على content في مشاهد الكود
  const code  = item.code ?? item.content ?? '';
  const lines = code.split('\n');
  const revP  = spring({ frame:Math.max(0,frame-8), fps, config:{ damping:24, stiffness:70 } });
  const vis   = Math.min(lines.length, revP * (lines.length + 2));
  const full  = Math.floor(vis);
  const hl    = Math.max(0, full - 1);

  return (
    <AbsoluteFill style={{ background:'#04040A', justifyContent:'center', alignItems:'center' }}>
      <DotGrid /><RadialGlow glow={glow} /><SceneIdx index={index} total={total} />
      <div style={{ width:'92%', background:'rgba(8,8,18,0.97)', borderRadius:32, overflow:'hidden',
        boxShadow:`0 0 0 1px rgba(255,255,255,0.06),0 40px 80px rgba(0,0,0,.7),0 0 60px ${glow}` }}>
        <WinBar title={item.title ?? 'main.dart'}
          right={<span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:3, color:accent }}>DART</span>} />
        <div style={{ padding:'36px 40px', display:'flex', gap:20, direction:'ltr' }}>
          {/* line numbers */}
          <div style={{ display:'flex', flexDirection:'column', color:'rgba(255,255,255,0.15)',
            fontFamily:'JetBrains Mono,monospace', fontSize:24, lineHeight:1.68,
            textAlign:'right', flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.06)',
            paddingRight:20, minWidth:44, userSelect:'none' }}>
            {lines.map((_,i) => (
              <div key={i} style={{ opacity: i<=full ? (i===hl ? 0.6 : 0.2) : 0, color: i===hl ? accent : undefined }}>{i+1}</div>
            ))}
          </div>
          {/* code lines */}
          <div style={{ flex:1, overflow:'hidden' }}>
            {lines.map((line,i) => {
              const op = i<full ? 1 : i===full ? vis-full : 0;
              return (
                <div key={i} style={{ opacity:op,
                  background: i===hl ? `linear-gradient(90deg,${accent}12,transparent 70%)` : 'transparent',
                  borderLeft: i===hl ? `2px solid ${accent}` : '2px solid transparent',
                  paddingLeft:10, marginLeft:-12, direction:'ltr' }}>
                  <SyntaxHighlighter
                    language="dart"
                    style={vscDarkPlus}
                    customStyle={{ background:'transparent', fontSize:28, padding:0, margin:0, lineHeight:'1.68', display:'inline', direction:'ltr' }}
                    PreTag={({ children }: { children: React.ReactNode }) => <>{children}</>}
                  >
                    {line || ' '}
                  </SyntaxHighlighter>
                </div>
              );
            })}
          </div>
        </div>
        <ProgressBar accent={accent} />
      </div>
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────
// TEMPLATE 1: TERMINAL — INTRO
// ─────────────────────────────────────────────────
const TerminalIntro: React.FC<{ item: SceneItem }> = ({ item }) => {
  const { accent, glow, dim } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });

  const words = (item.title ?? item.content?.split('\n')[0] ?? '').split(' ');
  const sub   = item.content?.split('\n').slice(1).join(' ') ?? item.badge ?? '';

  return (
    <AbsoluteFill style={{ background:'#04040A', flexDirection:'column' }}>
      <DotGrid /><ScanLines /><RadialGlow glow={glow} top="25%" />

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

      {/* Boot log */}
      <div style={{ flex:1, padding:'0 40px', display:'flex', flexDirection:'column',
        justifyContent:'flex-end', gap:8, zIndex:5, paddingBottom:20 }}>
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
              fontSize:22, direction:'ltr', opacity:p, transform:`translateX(${(1-p)*-20}px)` }}>
              <span style={{ color:accent, fontWeight:700 }}>{pre}</span>
              <span style={{ color:'rgba(255,255,255,0.4)', flex:1 }}>{msg}</span>
              <span style={{ color: st==='!!' ? '#FFCB6B' : accent }}>{st}</span>
            </div>
          );
        })}
      </div>

      {/* Hero */}
      <div style={{ padding:'0 40px 0', zIndex:8, flexShrink:0 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:8,
          color:accent, textTransform:'uppercase', marginBottom:16, direction:'ltr',
          opacity: interpolate(sp(44),[0,1],[0,0.75]) }}>
          // Flutter Tutorial — بالعربي
        </div>
        <div style={{ fontFamily:'Cairo,sans-serif', fontWeight:900, fontSize:72,
          color:'#fff', direction:'rtl', lineHeight:1.1, marginBottom:12,
          opacity: interpolate(sp(50),[0,0.4,1],[0,0.6,1]),
          transform:`translateY(${(1-sp(50))*30}px)` }}>
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
          padding:'20px 28px', direction:'ltr', marginBottom:0,
          opacity: interpolate(sp(70),[0,1],[0,1]) }}>
          <div style={{ display:'flex', alignItems:'center', gap:14,
            fontFamily:'JetBrains Mono,monospace', fontSize:24 }}>
            <span style={{ color:accent, fontWeight:700 }}>▶</span>
            <span style={{ color:'rgba(255,255,255,0.7)' }}>flutter run --profile --release</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding:'22px 40px', borderTop:'1px solid rgba(255,255,255,0.06)',
        background:'rgba(0,0,0,0.4)', display:'flex', justifyContent:'space-between',
        flexShrink:0, zIndex:10, marginTop:20 }}>
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
// TEMPLATE 2: SPLIT VIEW
// ─────────────────────────────────────────────────
const SplitViewScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
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
      <DotGrid /><RadialGlow glow={glow} top="25%" />
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
      <ProgressBar accent={accent} />
      {item.voiceFile && <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} />}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────
// TEMPLATE 3: NEON NOTEBOOK
// ─────────────────────────────────────────────────
const NotebookScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, glow } = getP(item.color ?? 'c-purple');
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });
  const pct = durationInFrames > 0 ? frame / durationInFrames : 0; // guard div/0

  const isCode = item.type === 'code';
  const text   = item.content ?? '';
  const isRTL  = /[\u0600-\u06FF]/.test(text);

  // footer progress hex — safe version
  const hexPct = Math.round(pct * 255).toString(16).padStart(2, '0');

  return (
    <AbsoluteFill style={{ background:'#0E0E1A', flexDirection:'column' }}>
      <GraphPaper /><RadialGlow glow={glow} top="35%" />

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
              customStyle={{ background:'transparent', fontSize:24, padding:0, margin:0, lineHeight:'1.7', direction:'ltr' }}>
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

// ─────────────────────────────────────────────────
// TEMPLATE 4: CINEMATIC
// ─────────────────────────────────────────────────
const CinematicScene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const { accent, glow } = getP(item.color);
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sp = (d: number) => spring({ frame:Math.max(0,frame-d), fps, config:{ damping:22 } });
  const pct = durationInFrames > 0 ? frame / durationInFrames : 0;

  const isIntro = item.type === 'intro';
  const isCode  = item.type === 'code';
  const isFact  = item.type === 'fact';

  const words = (item.title ?? item.content?.split('\n')[0] ?? '').split(' ');
  const body  = item.content?.split('\n').slice(1).join(' ') ?? '';

  return (
    <AbsoluteFill style={{ background:'#04040A', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
      <DotGrid op={0.04} /><FilmGrain /><Letterbox />
      <RadialGlow glow={glow} top="45%" />

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

      {/* Big stat bg */}
      {isFact && item.stat && (
        <div style={{ position:'absolute', top:'10%', left:0, right:0, textAlign:'center',
          fontFamily:'Bebas Neue,sans-serif', fontSize:240, lineHeight:1,
          color:`${accent}06`, letterSpacing:10, userSelect:'none', zIndex:1 }}>
          {item.stat}
        </div>
      )}

      {/* Content */}
      <div style={{ position:'absolute', bottom: isIntro ? 100 : undefined,
        left:0, right:0, padding:'0 48px', zIndex:10 }}>
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:18, letterSpacing:6,
          color:'rgba(255,255,255,0.4)', textTransform:'uppercase', marginBottom:16, direction:'ltr',
          opacity: interpolate(sp(5),[0,1],[0,1]) }}>
          {isFact ? '// Did you know?' : item.type==='tip' ? '// Pro Tip' : isCode ? (item.title ?? 'main.dart') : '@flutterbymousa presents'}
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
              customStyle={{ background:'transparent', fontSize:26, padding:'28px 32px', margin:0, lineHeight:'1.7', direction:'ltr' }}>
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

// ─────────────────────────────────────────────────
// SCENE ROUTER
// ─────────────────────────────────────────────────
const Scene: React.FC<{ item: SceneItem; index: number; total: number }> = ({ item, index, total }) => {
  const tmpl = item.template ?? 'terminal';
  const type = item.type    ?? 'text';

  if (tmpl === 'terminal') {
    if (type === 'intro') return <TerminalIntro item={item} />;
    if (type === 'code')  return <Enter><GenericCodeScene item={item} index={index} total={total} /></Enter>;
    return <Enter><GenericTextScene item={item} index={index} total={total} /></Enter>;
  }
  if (tmpl === 'splitview')  return <SplitViewScene  item={item} index={index} total={total} />;
  if (tmpl === 'notebook')   return <NotebookScene   item={item} index={index} total={total} />;
  if (tmpl === 'cinematic')  return <CinematicScene  item={item} index={index} total={total} />;

  // fallback
  if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} /></Enter>;
  return <Enter><GenericTextScene item={item} index={index} total={total} /></Enter>;
};

// ─────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────
export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  if (!scenes?.length) return <AbsoluteFill style={{ background:'#04040A' }} />;

  let offset = 0;
  return (
    <AbsoluteFill style={{ background:'#04040A' }}>
      {scenes.map((item, index) => {
        const duration = Math.max(30, Math.ceil(item.calculatedDuration ?? 150));
        const start    = offset;
        offset += duration;
        return (
          <Sequence key={`scene-${index}`} from={start} durationInFrames={duration}>
            <Scene item={item} index={index} total={scenes.length} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
