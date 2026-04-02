import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import './style.css';

import { SCENE_MIN } from './types';
import type { SceneItem } from './types';

import { Enter } from './primitives';
import { TerminalIntro, GenericTextScene, GenericCodeScene } from './TemplateTerminal';
import { SplitViewScene }  from './TemplateSplitView';
import { NotebookScene }   from './TemplateNotebook';
import { CinematicScene }  from './TemplateCinematic';

// ─────────────────────────────────────────────────
// SCENE ROUTER
// ─────────────────────────────────────────────────
const Scene: React.FC<{ item: SceneItem; index: number; total: number; duration: number }> = ({ item, index, total, duration }) => {
  const tmpl = item.template ?? 'terminal';
  const type = item.type    ?? 'text';

  if (tmpl === 'terminal') {
    if (type === 'intro') return <TerminalIntro item={item} duration={duration} />;
    if (type === 'code')  return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
    return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
  }
  if (tmpl === 'splitview')  return <SplitViewScene  item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'notebook')   return <NotebookScene   item={item} index={index} total={total} duration={duration} />;
  if (tmpl === 'cinematic')  return <CinematicScene  item={item} index={index} total={total} duration={duration} />;

  // fallback
  if (type === 'code') return <Enter><GenericCodeScene item={item} index={index} total={total} duration={duration} /></Enter>;
  return <Enter><GenericTextScene item={item} index={index} total={total} duration={duration} /></Enter>;
};

// ─────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────
export const MyVideo: React.FC<{ scenes: SceneItem[] }> = ({ scenes }) => {
  if (!scenes?.length) return <AbsoluteFill style={{ background:'#04040A' }} />;

  // [FIX PERFORMANCE + LOGIC] حساب durations و offsets خارج الـ render — بدل mutation داخله
  const durations = scenes.map(item =>
    Math.max(SCENE_MIN, Math.ceil(item.calculatedDuration ?? SCENE_MIN))
  );

  const offsets = durations.reduce<number[]>((acc, _, i) => {
    if (i === 0) return [0];
    return [...acc, (acc[i - 1] ?? 0) + (durations[i - 1] ?? 0)];
  }, []);

  return (
    <AbsoluteFill style={{ background:'#04040A' }}>
      {scenes.map((item, index) => {
        const duration = durations[index] ?? SCENE_MIN;
        const start    = offsets[index]   ?? 0;
        return (
          <Sequence key={`scene-${index}`} from={start} durationInFrames={duration}>
            <Scene item={item} index={index} total={scenes.length} duration={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
