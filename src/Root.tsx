import React from 'react';
import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo, type SceneItem } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import fallbackData from '../public/assets/data.json';

const FPS  = 30;
const TAIL = 20; // frames بعد انتهاء الصوت
const MIN  = 60; // أقل مشهد = ثانيتين

// ── معادلة المدة الصح للنص العربي ──────────────────
function calcTextFrames(item: SceneItem): number {
  const text = item.content ?? '';
  const code = item.code ?? '';

  if (item.type === 'intro') return 150;

  if (item.type === 'code') {
    const lines = code.split('\n').length;
    return lines * 22 + 60;
  }

  // text | tip | fact — معادلة الكلمات
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.ceil((wordCount / 1.8) * FPS) + TAIL;

  // templates زيادة 30 frame عشان الـ animation بتاعتها أطول
  if (item.template === 'notebook' || item.template === 'cinematic') {
    return base + 30;
  }

  return base;
}

export const RemotionRoot: React.FC = () => {
  // getInputProps() بيرجع الـ --props اللي ممرها لـ remotion render
  const inputProps = getInputProps() as Record<string, unknown>;

  const parsedInput: SceneItem[] | null =
    Array.isArray(inputProps)
      ? (inputProps as SceneItem[])
      : Array.isArray((inputProps as { scenes?: unknown }).scenes)
      ? ((inputProps as { scenes: SceneItem[] }).scenes)
      : null;

  const parsedFallback: SceneItem[] =
    Array.isArray(fallbackData)
      ? (fallbackData as SceneItem[])
      : ((fallbackData as { scenes: SceneItem[] }).scenes ?? []);

  const defaultData: SceneItem[] = parsedInput ?? parsedFallback;

  return (
    <Composition
      id="ReelAutomationScene"
      component={MyVideo}
      defaultProps={{ scenes: defaultData }}
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={async ({ props }) => {
        const enriched = await Promise.all(
          props.scenes.map(async (item: SceneItem, i: number) => {
            let audioFrames = 0;

            if (item.voiceFile) {
              try {
                const sec = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                audioFrames = Math.ceil(sec * FPS) + TAIL;
              } catch (e) {
                console.warn(`[Scene ${i}] Audio error:`, e);
              }
            }

            const textFrames = calcTextFrames(item);

            // لو في صوت: خد الأطول منهم، لو ماكنش: خد textFrames
            const calculatedDuration = Math.max(
              MIN,
              audioFrames > 0 ? Math.max(audioFrames, textFrames) : textFrames
            );

            return { ...item, calculatedDuration };
          })
        );

        const total =
          enriched.reduce(
            (acc, s) => acc + (s.calculatedDuration ?? MIN),
            0
          ) + 30; // 1 ثانية extra في الآخر

        return {
          fps: FPS,
          durationInFrames: Math.max(total, 30),
          props: { scenes: enriched },
        };
      }}
    />
  );
};
