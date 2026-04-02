import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import './style.css';

import { SCENE_MIN } from './types';
import type { SceneItem, TemplateId } from './types';

import { Enter } from './primitives';

// ── original 4 ──
import { TerminalIntro, GenericTextScene, GenericCodeScene } from './TemplateTerminal';
import { SplitViewScene }  from './TemplateSplitView';
import { NotebookScene }   from './TemplateNotebook';
import { CinematicScene }  from './TemplateCinematic';

// ── new 11 (كل واحد في ملفه) ──
import { HologramScene }    from './Template05Hologram';
import { BlueprintScene }   from './Template06Blueprint';
import { GlassScene }       from './Template07Glass';
import { RetroCRTScene }    from './Template08RetroCRT';
import { NeonSignScene }    from './Template09NeonSign';
import { NewspaperScene }   from './Template10Newspaper';
import { DarkMinimalScene } from './Template11DarkMinimal';
import { CardStackScene }   from './Template12CardStack';
import { VaporwaveScene }   from './Template13Vaporwave';
import { InfographicScene } from './Template14Infographic';
import { ComicPanelScene }  from './Template15Comic';

// ─────────────────────────────────────────────────
// TEMPLATE ROTATION — 15 تمبلت بالترتيب
// لو المشهد مش عنده template → بيدور تلقائياً
// ─────────────────────────────────────────────────
const TEMPLATE_ROTATION: TemplateId[] = [
  'terminal',
  'splitview',
  'notebook',
  'cinematic',
  'hologram',
  'blueprint',
  'glass',
  'retrocrt',
  'neonsign',
  'newspaper',
  'darkminimal',
  'cardstack',
  'vaporwave',
  'infographic',
  'comic',
];

// ─────────────────────────────────────────────────
// SEAMLESS CROSSFADE WRAPPER
// كل مشهد بيعمل fade-in في الأول و fade-out في الآخر
// والـ overlap بين المشاهد بيخلي الانتقال سلس جداً
// ─────────────────────────────────────────────────
const OVERLAP_FRAMES = 18; // ~0.6 ثانية crossfade

const SceneFade: React.FC<{
  children: React.ReactNode;
  duration: number;
  isFirst: boolean;
  isLast: boolean;
}> = ({ children, duration, isFirst, isLast }) => {
  const frame = useCurrentFrame();

  const fadeIn = isFirst
    ? 1
    : interpolate(frame, [0, OVERLAP_FRAMES], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const fadeOut = isLast
    ? 1
    : interpolate(frame, [duration - OVERLAP_FRAMES, duration], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return (
    <div style={{ width: '100%', height: '100%', opacity: Math.min(fadeIn, fadeOut) }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────
// SCENE ROUTER — 15 templates
// ─────────────────────────────────────────────────
const Scene: React.FC<{
  item: SceneItem;
  index: number;
  total: number;
  duration: number;
  tmpl: TemplateId;
}> = ({ item, index, total, duration, tmpl }) => {
  const type = item.type ?? 'text';

  if (tmpl === 'terminal') {
    if (type === 'intro') return <TerminalIntro item={item} duration={duration} />;
    if (type === 'code')  return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
    return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
  }
  if (tmpl === 'splitview')   return <SplitViewScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'notebook')    return <NotebookScene    item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'cinematic')   return <CinematicScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'hologram')    return <HologramScene    item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'blueprint')   return <BlueprintScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'glass')       return <GlassScene       item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'retrocrt')    return <RetroCRTScene    item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'neonsign')    return <NeonSignScene    item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'newspaper')   return <NewspaperScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'darkminimal') return <DarkMinimalScene item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'cardstack')   return <CardStackScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'vaporwave')   return <VaporwaveScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'infographic') return <InfographicScene item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'comic')       return <ComicPanelScene  item={item} index={index} total={total} duration={duration} />;

  // fallback
  if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
  return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
};

// ─────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────
export { type SceneItem };

export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  if (!scenes?.length) return <AbsoluteFill style={{ background: '#04040A' }} />;

  // ── Template rotation ────────────────────────────
  // لو عنده template صريح في الـ data.json → استخدمه
  // لو ماعندوش → rotate أوتوماتيك (0→terminal, 1→splitview, ...)
  const resolvedTemplates: TemplateId[] = scenes.map((item, i) =>
    item.template ?? TEMPLATE_ROTATION[i % TEMPLATE_ROTATION.length]!
  );

  // ── Durations ────────────────────────────────────
  const durations = scenes.map(item =>
    Math.max(SCENE_MIN, Math.ceil(item.calculatedDuration ?? SCENE_MIN))
  );

  // ── Offsets مع overlap ───────────────────────────
  // كل مشهد بيبدأ قبل انتهاء السابق بـ OVERLAP_FRAMES
  // عشان الـ crossfade يكون متواصل ومش متقطع
  const offsets: number[] = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    offsets.push(cursor);
    cursor += Math.max(SCENE_MIN / 2, (durations[i] ?? SCENE_MIN) - OVERLAP_FRAMES);
  }

  return (
    <AbsoluteFill style={{ background: '#04040A' }}>
      {scenes.map((item, index) => {
        const dur    = durations[index] ?? SCENE_MIN;
        const start  = offsets[index]   ?? 0;
        const tmpl   = resolvedTemplates[index]!;
        const isFirst = index === 0;
        const isLast  = index === scenes.length - 1;

        return (
          <Sequence
            key={`scene-${index}`}
            from={start}
            durationInFrames={dur + (isLast ? 15 : OVERLAP_FRAMES)}
          >
            <SceneFade duration={dur} isFirst={isFirst} isLast={isLast}>
              <Scene
                item={item}
                index={index}
                total={scenes.length}
                duration={dur}
                tmpl={tmpl}
              />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
