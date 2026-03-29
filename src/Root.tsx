import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import data from '../public/assets/data.json';

export const RemotionRoot: React.FC = () => {
  const sceneDuration = 150; // 5 ثواني لكل مشهد
  
  // السحر هنا: بنضرب عدد المشاهد في وقتها ونزود 30 فريم (ثانية واحدة) تثبيت في الآخر
  const totalDuration = (data.length * sceneDuration) + 30; 

  return (
    <>
      <Composition
        id="HelloWorld"
        component={MyVideo}
        durationInFrames={totalDuration}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
