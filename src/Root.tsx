import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import fallbackData from '../public/assets/data.json';

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps() as any;

  // استخراج الداتا بذكاء لتفادي الشاشة السودة
  const parsedPropsScenes = (Array.isArray(inputProps) && inputProps.length > 0) 
    ? inputProps 
    : inputProps.scenes;

  const parsedFallbackScenes = Array.isArray(fallbackData) 
    ? fallbackData 
    : (fallbackData as any).scenes;

  const defaultData = parsedPropsScenes || parsedFallbackScenes || [];

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
            let voiceDurationFrames = 150; 
            
            try {
              if (item.voiceFile) {
                const durationInSeconds = await getAudioDurationInSeconds(
                  staticFile(`assets/Elevsound/${item.voiceFile}`)
                );
                voiceDurationFrames = Math.ceil(durationInSeconds * fps) + 10;
              }
            } catch (err) {
              console.log(`⚠️ ملف الصوت غير موجود: ${item.voiceFile}`);
            }

            const text = item.content || item.code || "";
            const textDurationFrames = index === 0 ? 45 : (text.length * 1.5) + 60;
            const finalSceneDuration = Math.max(voiceDurationFrames, textDurationFrames);

            return {
              ...item,
              calculatedDuration: finalSceneDuration 
            };
          })
        );

        totalDuration = enrichedScenes.reduce((acc, scene) => acc + scene.calculatedDuration, 0);
        totalDuration += 30; // 30 فريم أمان في النهاية

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
                  
