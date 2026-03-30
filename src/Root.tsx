import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import data from '../public/assets/data.json';

export const RemotionRoot: React.FC = () => {
  /**
   * دالة ذكية لحساب مدة كل مشهد:
   * بتشوف أيهما أطول (مدة التعليق الصوتي القادم من n8n) أو (مدة كتابة النص)
   */
  const calculateSceneDuration = (item: any) => {
    const fps = 30;
    // المدة القادمة من n8n بالفريمات (مثلاً لو صوت 5 ثواني يبقى 150 فريم)
    const voiceDuration = item.voiceDuration || 0; 
    
    // مدة الكتابة التقليدية (عدد الحروف * 2 فريم) + وقت الظهور والانتظار (80 فريم)
    const text = item.content || item.code || "";
    const textDuration = (text.length * 2) + 80;

    // نختار الأطول عشان نضمن إن الشرح يخلص براحته والقلم ميكروتش الكلام
    return Math.max(voiceDuration, textDuration);
  };

  // إجمالي وقت الفيديو = مجموع أوقات المشاهد + ثانية واحدة أمان في الآخر
  const totalDuration = data.reduce((acc, item) => acc + calculateSceneDuration(item), 0) + 30;

  return (
    <>
      <Composition
        id="ReelAutomationScene"
        component={MyVideo}
        durationInFrames={totalDuration}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
