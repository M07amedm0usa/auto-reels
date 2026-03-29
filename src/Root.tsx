import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import data from '../public/assets/data.json';

// إعدادات السرعة (لازم تكون موحدة في كل الملفات)
export const TYPING_SPEED = 2; // فريم لكل حرف
export const READ_BUFFER = 60; // 2 ثانية انتظار بعد ما يخلص كتابة
export const ENTRANCE_OFFSET = 20; // وقت ظهور البوكس

export const RemotionRoot: React.FC = () => {
  // دالة تحسب مدة كل مشهد لوحده
  const calculateSceneDuration = (item: any) => {
    const text = item.content || item.code || "";
    return (text.length * TYPING_SPEED) + READ_BUFFER + ENTRANCE_OFFSET;
  };

  // إجمالي وقت الفيديو = مجموع أوقات المشاهد + ثانية التثبيت في الآخر
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
