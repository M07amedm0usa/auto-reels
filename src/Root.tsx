import { Composition, staticFile } from 'remotion';
import { MyVideo } from './MyVideo';
import data from '../public/assets/data.json';
import { getAudioDurationInSeconds } from '@remotion/media-utils';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ReelAutomationScene"
      component={MyVideo}
      // بنمرر الداتا الأصلية كـ props مبدئية
      defaultProps={{
        scenes: data as any[],
      }}
      // السحر هنا: الدالة دي بتشتغل قبل الرندر عشان تقرأ ملفات الـ MP3 وتحسب الوقت الحقيقي
      calculateMetadata={async ({ props }) => {
        const fps = 30;
        let totalDuration = 0;

        // بنعمل لوب على كل المشاهد ونقرأ طول ملف الصوت الفعلي
        const enrichedScenes = await Promise.all(
          props.scenes.map(async (item: any) => {
            // لو مفيش صوت لسبب ما، هياخد القيمة اللي جاية من n8n كاحتياطي
            let voiceDurationFrames = item.voiceDuration || 150; 
            
            try {
              if (item.voiceFile) {
                // بيقيس مدة الصوت بالثواني والمللي ثانية
                const durationInSeconds = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                
                // بنحول الثواني لفريمات + بنزود 15 فريم (نص ثانية تقريباً) أمان عشان نهاية الكلام
                voiceDurationFrames = Math.round(durationInSeconds * fps) + 15;
              }
            } catch (err) {
              console.log(`⚠️ مش قادر أقرأ ملف الصوت: ${item.voiceFile}`, err);
            }

            totalDuration += voiceDurationFrames;

            return {
              ...item,
              calculatedDuration: voiceDurationFrames // ده الوقت الدقيق اللي المشهد هياخده
            };
          })
        );

        // إضافة ثانيتين (60 فريم) للمشهد الأخير عشان يقفل براحته
        if (enrichedScenes.length > 0) {
          enrichedScenes[enrichedScenes.length - 1].calculatedDuration += 60;
          totalDuration += 60;
        }

        return {
          durationInFrames: Math.max(totalDuration, 30), // إجمالي وقت الفيديو الفعلي
          props: {
            scenes: enrichedScenes // بنبعت الداتا الجديدة المحسوبة لـ MyVideo
          }
        };
      }}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
