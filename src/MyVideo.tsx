import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Audio, staticFile, getInputProps } from 'remotion';
import './style.css';

import { SCENE_MIN, OVERLAP_FRAMES } from './types';
import type { SceneItem, TemplateId } from './types';

import { Enter } from './primitives';

// -- استيراد كل التمبلتس (نفس اللي عندك) --
import { TerminalIntro, GenericTextScene, GenericCodeScene } from './TemplateTerminal';
import { SplitViewScene }  from './TemplateSplitView';
import { NotebookScene }   from './TemplateNotebook';
import { CinematicScene }  from './TemplateCinematic';
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

const ALL_TEMPLATES: TemplateId[] = [
  'terminal', 'splitview', 'notebook', 'cinematic',
  'hologram', 'blueprint', 'glass', 'retrocrt',
  'neonsign', 'newspaper', 'darkminimal', 'cardstack',
  'vaporwave', 'infographic', 'comic',
];

// -- SceneFade (نفس الكود بتاعك) --
const SceneFade: React.FC<{ children: React.ReactNode; duration: number; isFirst: boolean; isLast: boolean; }> = ({ children, duration, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const fadeIn = isFirst ? 1 : interpolate(frame, [0, OVERLAP_FRAMES], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = isLast ? 1 : interpolate(frame, [duration - OVERLAP_FRAMES, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ width: '100%', height: '100%', opacity: Math.min(fadeIn, fadeOut) }}>{children}</div>;
};

// -- SCENE ROUTER المعدل --
const Scene: React.FC<{ item: SceneItem; index: number; total: number; duration: number; tmpl: TemplateId; }> = ({ item, index, total, duration, tmpl }) => {
  const type = item.type ?? 'text';
  
  // لجعل الانترو يقرأ الـ topic حتى لو مش موجود جوه الـ item نفسه
  const inputProps = getInputProps() as any;
  const enrichedItem = { ...item, topic: inputProps.topic || (item as any).topic };

  // الـ Intro دايماً Terminal للبراندنج، بس دلوقتي بياخد الـ enrichedItem المتغير
  if (type === 'intro') return <TerminalIntro item={enrichedItem} duration={duration} />;

  // منطق اختيار التمبلت لباقي الفيديو
  switch (tmpl) {
    case 'splitview':   return <SplitViewScene   item={item} index={index} total={total} duration={duration} />;
    case 'notebook':    return <NotebookScene    item={item} index={index} total={total} duration={duration} />;
    case 'cinematic':   return <CinematicScene   item={item} index={index} total={total} duration={duration} />;
    case 'hologram':    return <HologramScene    item={item} index={index} total={total} duration={duration} />;
    case 'blueprint':   return <BlueprintScene   item={item} index={index} total={total} duration={duration} />;
    case 'glass':       return <GlassScene       item={item} index={index} total={total} duration={duration} />;
    case 'retrocrt':    return <RetroCRTScene    item={item} index={index} total={total} duration={duration} />;
    case 'neonsign':    return <NeonSignScene    item={item} index={index} total={total} duration={duration} />;
    case 'newspaper':   return <NewspaperScene   item={item} index={index} total={total} duration={duration} />;
    case 'darkminimal': return <DarkMinimalScene item={item} index={index} total={total} duration={duration} />;
    case 'cardstack':   return <CardStackScene   item={item} index={index} total={total} duration={duration} />;
    case 'vaporwave':   return <VaporwaveScene   item={item} index={index} total={total} duration={duration} />;
    case 'infographic': return <InfographicScene item={item} index={index} total={total} duration={duration} />;
    case 'comic':       return <ComicPanelScene  item={item} index={index} total={total} duration={duration} />;
    case 'terminal':
    default:
      if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
      return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
  }
};

export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  if (!scenes?.length) return <AbsoluteFill style={{ background: '#04040A' }} />;

  // تعديل: البحث عن التمبلت في كل السيز (scenes) مش بس اللي مش انترو
  const videoTemplate = useMemo<TemplateId>(() => {
    // 1. شوف لو الانترو نفسه معاه تمبلت محدد
    if (scenes[0]?.template) return scenes[0].template as TemplateId;
    // 2. شوف أول مشهد بعده معاه تمبلت
    const sceneWithTemplate = scenes.find(s => s.template);
    if (sceneWithTemplate?.template) return sceneWithTemplate.template as TemplateId;
    // 3. عشوائي لو مفيش خالص
    return ALL_TEMPLATES[Math.floor(Math.random() * ALL_TEMPLATES.length)]!;
  }, [scenes]);

  const durations = scenes.map(item => Math.max(SCENE_MIN, Math.ceil(item.calculatedDuration ?? SCENE_MIN)));

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
        const audioSrc = item.voiceFile ? staticFile(`assets/Elevsound/${item.voiceFile}`) : null;

        return (
          <Sequence key={`scene-${index}`} from={start} durationInFrames={dur + (isLast ? 15 : OVERLAP_FRAMES)}>
            {audioSrc && <Audio src={audioSrc} />}
            <SceneFade duration={dur} isFirst={isFirst} isLast={isLast}>
              <Scene item={item} index={index} total={scenes.length} duration={dur} tmpl={videoTemplate} />
            </SceneFade>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
  
