import React from 'react';
import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo } from './MyVideo';
import type { SceneItem } from './types'; // تأكد إن الـ Import ده من ملف الـ types
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { SCENE_MIN, OVERLAP_FRAMES } from './types';
import fallbackData from '../public/assets/data.json';

const FPS     = 30;
const TAIL    = 20;  // frames بعد انتهاء الصوت كـ Padding

// ── معادلة المدة للنص العربي في حالة عدم وجود صوت ──────────────────────
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

// ── 🔥 التعديل هنا: قراءة الداتا كاملة (المشاهد + الإعدادات) ──────
function resolveData() {
  const inp = getInputProps() as any;
  
  // سحب المشاهد
  const scenes: SceneItem[] = 
    inp.scenes || 
    (fallbackData as any).scenes || 
    (Array.isArray(fallbackData) ? fallbackData : []);

  // سحب الإعدادات العامة (عشان التمبلت)
  const videoConfig = inp.videoConfig || (fallbackData as any).videoConfig || {};

  return { scenes, videoConfig };
}

export const RemotionRoot: React.FC = () => {
  const { scenes: defaultScenes, videoConfig: defaultVideoConfig } = resolveData();

  return (
    <Composition
      id="ReelAutomationScene" // أو MyVideo حسب اسم الكومبوننت اللي إنت عايزه في الرندر
      component={MyVideo}
      // 🔥 تمرير الـ videoConfig مع المشاهد
      defaultProps={{ scenes: defaultScenes, videoConfig: defaultVideoConfig }}
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={async ({ props }) => {
        // حساب الـ Metadata بشكل غير متزامن لضمان قراءة الصوت
        const rawScenes: SceneItem[] = Array.isArray(props.scenes) ? props.scenes : [];

        if (rawScenes.length === 0) {
          // الحفاظ على الـ videoConfig حتى لو المشاهد فاضية
          return { fps: FPS, durationInFrames: 30, props: { scenes: [], videoConfig: props.videoConfig } };
        }

        const enriched = await Promise.all(
          rawScenes.map(async (item: SceneItem, i: number) => {
            let audioFrames = 0;

            if (item.voiceFile) {
              try {
                // تنبيه: تأكد أن ملفات الصوت تنزل في هذا المسار التابع لـ public
                const sec = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                audioFrames = Math.ceil(sec * FPS) + TAIL;
              } catch (e) {
                console.warn(`[Scene ${i}] Audio error (Fallback to text logic):`, e);
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
        let total = 0;
        for (let i = 0; i < enriched.length; i++) {
          const dur    = Math.max(SCENE_MIN, Math.ceil(enriched[i]?.calculatedDuration ?? SCENE_MIN));
          const isLast = i === enriched.length - 1;
          total += isLast ? dur + 15 : Math.max(SCENE_MIN / 2, dur - OVERLAP_FRAMES);
        }
        total += 30; // ثانية extra في الآخر للأمان

        return {
          fps: FPS,
          durationInFrames: Math.max(total, 30),
          props: { 
            scenes: enriched,
            videoConfig: props.videoConfig // 🔥 إرجاع الـ config تاني بعد الحسابات
          },
        };
      }}
    />
  );
};
      
