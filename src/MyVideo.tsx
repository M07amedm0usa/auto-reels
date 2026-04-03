import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from 'remotion';
import './style.css';

import { SCENE_MIN, OVERLAP_FRAMES } from './types';
import type { SceneItem, TemplateId } from './types';

import { Enter } from './primitives';

// ── original 4 ──
import { TerminalIntro, GenericTextScene, GenericCodeScene } from './TemplateTerminal';
import { SplitViewScene }  from './TemplateSplitView';
import { NotebookScene }   from './TemplateNotebook';
import { CinematicScene }  from './TemplateCinematic';

// ── new 11 ──
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
// كل الـ templates المتاحة
// ─────────────────────────────────────────────────
const ALL_TEMPLATES: TemplateId[] = [
  'terminal', 'splitview', 'notebook', 'cinematic',
  'hologram', 'blueprint', 'glass', 'retrocrt',
  'neonsign', 'newspaper', 'darkminimal', 'cardstack',
  'vaporwave', 'infographic', 'comic',
];

// ─────────────────────────────────────────────────
// CROSSFADE WRAPPER
// ─────────────────────────────────────────────────

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

  // intro دايمًا terminal
  if (type === 'intro') return <TerminalIntro item={item} duration={duration} />;

  if (tmpl === 'terminal') {
    if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
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

  // ── template واحد عشوائي للـ video كلها ──────────
  // لو الـ data.json بيحدد template في أول مشهد non-intro → استخدمه
  // غير كده → اختار عشوائي من الـ 15
  const videoTemplate = useMemo<TemplateId>(() => {
    const firstNonIntro = scenes.find(s => (s.type ?? 'text') !== 'intro');
    if (firstNonIntro?.template) return firstNonIntro.template;
    return ALL_TEMPLATES[Math.floor(Math.random() * ALL_TEMPLATES.length)]!;
  }, [scenes]);

  // ── Durations ─────────────────────────────────────
  const durations = scenes.map(item =>
    Math.max(SCENE_MIN, Math.ceil(item.calculatedDuration ?? SCENE_MIN))
  );

  // ── Offsets مع overlap ────────────────────────────
  const offsets: number[] = [];
  let cursor = 0;
  for (let i = 0; i < durations.length; i++) {
    offsets.push(cursor);
    cursor += Math.max(SCENE_MIN / 2, (durations[i] ?? SCENE_MIN) - OVERLAP_FRAMES);
  }

  return (
    <AbsoluteFill style={{ background: '#04040A' }}>
      {scenes.map((item, index) => {
        const dur     = durations[index] ?? SCENE_MIN;
        const start   = offsets[index]   ?? 0;
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
                tmpl={videoTemplate}
              />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
