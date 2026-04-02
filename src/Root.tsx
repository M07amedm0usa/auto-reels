import React from 'react'; // [FIX CRITICAL] حرف i سمول
import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo, type SceneItem } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import fallbackData from '../public/assets/data.json';

// [FIX LOGIC] تحميل الخطوط برمجياً عشان تظهر في GitHub Actions (Headless)
import { loadFont as loadCairo } from '@remotion/google-fonts/Cairo';
import { loadFont as loadJetBrains } from '@remotion/google-fonts/JetBrainsMono';

loadCairo();
loadJetBrains();

// [FIX CONSISTENCY] FPS constant
const FPS  = 30;
const TAIL = 20; // frames بعد انتهاء الصوت
const MIN  = 60; // أقل مشهد = ثانيتين

// ── معادلة المدة الصح للنص العربي مع الـ Guardrails ────────
function calcTextFrames(item: SceneItem): number {
  const text = item.content ?? '';
  // [FIX CRITICAL] fallback لـ content لو الـ code مش مبعوت
  const code = item.code ?? item.content ?? '';

  if (item.type === 'intro') return 150;

  if (item.type === 'code') {
    // [FIX CRITICAL] حماية: أقصى حاجة 20 سطر عشان الـ Render مايضربش
    const lines = Math.min(code.split('\n').length, 20);
    return lines * 22 + 60;
  }

  // text فقط
  // [FIX CRITICAL] حماية: أقصى حاجة 60 كلمة للمشهد
  const wordCount = Math.min(text.trim().split(/\s+/).filter(Boolean).length, 60);
  const base = Math.ceil((wordCount / 1.8) * FPS) + TAIL;

  // templates زيادة 30 frame عشان الـ animation بتاعتها أطول
  if (item.template === 'notebook' || item.template === 'cinematic') {
    return base + 30;
  }

  return base;
}

export const RemotionRoot: React.FC = () => {
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

            const calculatedDuration = Math.max(
              MIN,
              audioFrames > 0 ? Math.max(audioFrames, textFrames) : textFrames
            );

            return { ...item, calculatedDuration };
          })
        );

        // [FIX CONSISTENCY] استخدام FPS بدل 30
        const total =
          enriched.reduce(
            (acc, s) => acc + (s.calculatedDuration ?? MIN),
            0
          ) + FPS;

        // [FIX CRITICAL] حماية إجمالي مدة الفيديو (أقصى حاجة 90 ثانية)
        const MAX_REEL_FRAMES = 90 * FPS;
        const finalDuration = Math.min(Math.max(total, FPS), MAX_REEL_FRAMES);

        if (total > MAX_REEL_FRAMES) {
          console.warn(`🚨 [WARNING] Video too long (${total} frames). Capped to ${MAX_REEL_FRAMES}! Check n8n payload.`);
        }

        return {
          fps: FPS,
          durationInFrames: finalDuration,
          props: { scenes: enriched },
        };
      }}
    />
  );
};
