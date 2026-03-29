import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import data from '../public/assets/data.json';

export const RemotionRoot: React.FC = () => {
  const sceneDuration = 150; // لازم يكون نفس الرقم اللي في MyVideo.tsx
  const totalDuration = data.length * sceneDuration;

  return (
    <>
      <Composition
        id="HelloWorld" // لازم نفس الاسم اللي في render.yml
        component={MyVideo}
        durationInFrames={totalDuration}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
