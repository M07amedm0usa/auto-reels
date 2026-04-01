import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const RemotionRoot: React.FC = () => {
  // بنقرأ الداتا اللي جاية من n8n أو الملف الافتراضي
  const inputProps = getInputProps();
  const defaultData = inputProps.scenes || [];

  return (
    <Composition
      id="ReelAutomationScene"
      component={MyVideo}
      defaultProps={{
        scenes: defaultData as any[],
      }}
      calculateMetadata={async ({ props }) => {
        const fps = 30;
        let totalDuration = 0;

        const enrichedScenes = await Promise.all(
          props.scenes.map(async (item: any, index: number) => {
            let voiceDurationFrames = 150; // افتراضي 5 ثواني
            
            try {
              if (item.voiceFile) {
                [span_1](start_span)// حساب دقيق لطول صوت ElevenLabs[span_1](end_span)
                const durationInSeconds = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                [span_2](start_span)// بنزود 10 فريمات أمان فقط عشان السرعة[span_2](end_span)
                voiceDurationFrames = Math.ceil(durationInSeconds * fps) + 10;
              }
            } catch (err) {
              console.log(`⚠️ ملف الصوت غير موجود: ${item.voiceFile}`);
            }

            const text = item.content || item.code || "";
            
            // تعديل سرعة الكتابة: المتابعين مبيحبوش البطء
            [span_3](start_span)// المشهد الأول (الخطاف) بنخليه سريع جداً (45 فريم) عشان يلحقوا يشوفوه[span_3](end_span)
            const textDurationFrames = index === 0 ? 45 : (text.length * 1.5) + 60;
            
            const finalSceneDuration = Math.max(voiceDurationFrames, textDurationFrames);

            return {
              ...item,
              calculatedDuration: finalSceneDuration 
            };
          })
        );

        [span_4](start_span)// حساب إجمالي وقت الفيديو بناءً على المشاهد[span_4](end_span)
        totalDuration = enrichedScenes.reduce((acc, scene) => acc + scene.calculatedDuration, 0);

        [span_5](start_span)// إضافة ثانية واحدة (30 فريم) في الآخر للـ Outro[span_5](end_span)
        totalDuration += 30;

        return {
          durationInFrames: Math.max(totalDuration, 30),
          props: {
            scenes: enrichedScenes 
          }
        };
      }}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
                  
