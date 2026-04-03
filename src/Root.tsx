import React from 'react';
import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo, type SceneItem } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { SCENE_MIN, OVERLAP_FRAMES } from './types';
import fallbackData from '../public/assets/data.json';

const FPS     = 30;
const TAIL    = 20;  // frames بعد انتهاء الصوت

// ── معادلة المدة للنص العربي ──────────────────────
function calcTextFrames(item: SceneItem): number {
  const text = item.content ?? '';
  const code = item.code ?? '';

  if (item.type === 'intro') return 150;

  if (item.type === 'code') {
    const lines = code.split('\n').length;
    return lines * 22 + 60;
  }

  // text — معادلة الكلمات
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.ceil((wordCount / 1.8) * FPS) + TAIL;

  // زيادة frames حسب تعقيد animation كل تمبلت
  const heavyAnims  = ['notebook', 'cinematic', 'hologram', 'vaporwave', 'neonsign'];
  const mediumAnims = ['glass', 'cardstack', 'blueprint', 'infographic', 'comic'];
  if (item.template && heavyAnims.includes(item.template))  return base + 40;
  if (item.template && mediumAnims.includes(item.template)) return base + 20;

  return base;
}

export const RemotionRoot: React.FC = () => {
  // getInputProps() دايمًا بيرجع object — مش array مباشرة
  const inputProps = getInputProps() as Record<string, unknown>;

  const parsedInput: SceneItem[] | null =
    Array.isArray((inputProps as { scenes?: unknown }).scenes)
      ? (inputProps as { scenes: SceneItem[] }).scenes
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
        // normalize: --props ممكن يجي كـ {scenes:[...]} أو array مباشرة
        const rawScenes: SceneItem[] = Array.isArray(props.scenes)
          ? props.scenes
          : [];

        if (rawScenes.length === 0) {
          return { fps: FPS, durationInFrames: 30, props: { scenes: [] } };
        }

        const enriched = await Promise.all(
          rawScenes.map(async (item: SceneItem, i: number) => {
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

            // في صوت  → audioFrames هو المرجع
            // مفيش صوت → textFrames
            const calculatedDuration = Math.max(
              SCENE_MIN,
              audioFrames > 0 ? audioFrames : textFrames
            );

            return { ...item, calculatedDuration };
          })
        );

        // يطابق منطق cursor في MyVideo.tsx:
        // كل مشهد يبدأ بعد (dur - OVERLAP_FRAMES) من السابق
        // الأخير يأخذ dur + 15 كامل
        let total = 0;
        for (let i = 0; i < enriched.length; i++) {
          const dur    = Math.max(SCENE_MIN, Math.ceil(enriched[i]?.calculatedDuration ?? SCENE_MIN));
          const isLast = i === enriched.length - 1;
          total += isLast ? dur + 15 : Math.max(SCENE_MIN / 2, dur - OVERLAP_FRAMES);
        }
        total += 30; // ثانية extra في الآخر

        return {
          fps: FPS,
          durationInFrames: Math.max(total, 30),
          props: { scenes: enriched },
        };
      }}
    />
  );
};
