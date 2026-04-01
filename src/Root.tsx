import React from 'react';
import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo, SceneItem } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import fallbackData from '../public/assets/data.json';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps() as any;

  const parsedPropsScenes = (Array.isArray(inputProps) && inputProps.length > 0)
    ? inputProps
    : inputProps?.scenes;

  const parsedFallbackScenes = Array.isArray(fallbackData)
    ? fallbackData
    : (fallbackData as any).scenes;

  const defaultData: SceneItem[] = parsedPropsScenes || parsedFallbackScenes || [];

  return (
    <Composition
      id="ReelAutomationScene"
      component={MyVideo}
      defaultProps={{ scenes: defaultData }}
      calculateMetadata={async ({ props }) => {
        const enrichedScenes = await Promise.all(
          props.scenes.map(async (item: SceneItem, index: number) => {
            let audioFrames = 150;
            try {
              if (item.voiceFile) {
                const seconds = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                audioFrames = Math.ceil(seconds * FPS) + 15;
              }
            } catch (e) {
              console.warn(`[Scene ${index}] Audio error:`, e);
            }

            const text = item.content || item.code || '';
            const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
            const textFrames = item.type === 'intro'
              ? 90
              : Math.ceil((wordCount / 1.8) * FPS) + 20;

            return {
              ...item,
              calculatedDuration: Math.max(audioFrames, textFrames),
            };
          })
        );

        const total = enrichedScenes.reduce((acc, s) => acc + (s.calculatedDuration ?? 0), 0) + 30;

        return {
          fps: FPS,
          durationInFrames: Math.max(total, 30),
          props: { scenes: enrichedScenes },
        };
      }}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
                           
