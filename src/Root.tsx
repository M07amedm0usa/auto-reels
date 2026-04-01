import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const RemotionRoot: React.FC = () => {
  // قراءة الداتا من n8n أو الـ Props الممررة
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
            let voiceDurationFrames = 150; // افتراضي 5 ثواني لو مفيش صوت
            
            try {
              if (item.voiceFile) {
                // حساب طول الصوت الحقيقي من ملفات ElevenLabs
                const durationInSeconds = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                // تحويل الثواني لفريمات مع إضافة هامش بسيط (10 فريمات)
                voiceDurationFrames = Math.ceil(durationInSeconds * fps) + 10;
              }
            } catch (err) {
              console.log(`⚠️ ملف الصوت غير موجود أو فيه مشكلة: ${item.voiceFile}`);
            }

            const text = item.content || item.code || "";
            
            // حساب سرعة الكتابة (كل حرف بياخد 1.5 فريم + 60 فريم أمان)
            // المشهد الأول دايماً أسرع (45 فريم) عشان الـ Hook
            const textDurationFrames = index === 0 ? 45 : (text.length * 1.5) + 60;
            
            // بنختار الوقت الأطول بين الكتابة والصوت عشان نضمن إن مفيش حاجة تتقص
            const finalSceneDuration = Math.max(voiceDurationFrames, textDurationFrames);

            return {
              ...item,
              calculatedDuration: finalSceneDuration 
            };
          })
        );

        // جمع كل الفريمات لكل المشاهد
        totalDuration = enrichedScenes.reduce((acc, scene) => acc + scene.calculatedDuration, 0);

        // إضافة ثانية أمان (30 فريم) في نهاية الفيديو بالكامل
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
