import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, Audio, staticFile, getInputProps } from 'remotion';
import './style.css';

import { SCENE_MIN, OVERLAP_FRAMES } from './types';
import type { SceneItem, TemplateId } from './types';

import { Enter } from './primitives';

// -- استيراد التمبلتس --
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

const SceneFade: React.FC<{ children: React.ReactNode; duration: number; isFirst: boolean; isLast: boolean; }> = ({ children, duration, isFirst, isLast }) => {
  const frame = useCurrentFrame();
  const fadeIn = isFirst ? 1 : interpolate(frame, [0, OVERLAP_FRAMES], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fadeOut = isLast ? 1 : interpolate(frame, [duration - OVERLAP_FRAMES, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ width: '100%', height: '100%', opacity: Math.min(fadeIn, fadeOut) }}>{children}</div>;
};

const Scene: React.FC<{ item: SceneItem; index: number; total: number; duration: number; tmpl: TemplateId; }> = ({ item, index, total, duration, tmpl }) => {
  const type = item.type ?? 'text';
  
  // دمج الـ Topic لو موجود بره الـ scenes
  const inputProps = getInputProps() as any;
  const enrichedItem = { ...item, topic: inputProps.topic || (item as any).topic };

  // الـ Intro يتبع التمبلت المختار لو كان Terminal، غير كدة يروح للتمبلت نفسه
  if (type === 'intro' && tmpl === 'terminal') {
    return <TerminalIntro item={enrichedItem} duration={duration} />;
  }

  // الـ Router بيختار التمبلت بناءً على الـ tmpl اللي محسوب تحت
  switch (tmpl) {
    case 'infographic': return <InfographicScene item={item} index={index} total={total} duration={duration} />;
    case 'notebook':    return <NotebookScene    item={enrichedItem} index={index} total={total} duration={duration} />;
    case 'splitview':   return <SplitViewScene   item={item} index={index} total={total} duration={duration} />;
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
    case 'comic':       return <ComicPanelScene  item={item} index={index} total={total} duration={duration} />;
    case 'terminal':
    default:
      if (type === 'intro') return <TerminalIntro item={enrichedItem} duration={duration} />;
      if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
      return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
  }
};

export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  const inputProps = getInputProps() as any;

  // ── التعديل الجوهري لالتقاط التمبلت من الداتا الجديدة ──────────
  const videoTemplate = useMemo<TemplateId>(() => {
    // 1. محاولة قراءة التمبلت من videoConfig (زي الداتا اللي إنت بعتها)
    const configTmpl = inputProps.videoConfig?.template || (inputProps as any).template;
    if (configTmpl && ALL_TEMPLATES.includes(configTmpl as TemplateId)) {
        return configTmpl as TemplateId;
    }

    // 2. محاولة قراءة التمبلت من أول مشهد (fallback)
    const firstScene = scenes[0];
    const sceneTmpl = firstScene?.template || (firstScene as any)?.Template;
    if (sceneTmpl && ALL_TEMPLATES.includes(sceneTmpl as TemplateId)) {
        return sceneTmpl as TemplateId;
    }

    // 3. لو مفيش خالص، افتراضي terminal
    return 'terminal'; 
  }, [scenes, inputProps]);

  if (!scenes?.length) return <AbsoluteFill style={{ background: '#04040A' }} />;

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
                                           
