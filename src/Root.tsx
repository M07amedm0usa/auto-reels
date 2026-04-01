import { Composition, staticFile, getInputProps } from 'remotion';
import { MyVideo } from './MyVideo';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import fallbackData from '../public/assets/data.json';

export const RemotionRoot: React.FC = () => {
  const inputProps = getInputProps() as any;

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
      defaultProps={{ scenes: defaultData as any[] }}
      calculateMetadata={async ({ props }) => {
        const fps = 30;
        const enrichedScenes = await Promise.all(
          props.scenes.map(async (item: any, index: number) => {
            let audioFrames = 150;
            try {
              if (item.voiceFile) {
                const seconds = await getAudioDurationInSeconds(staticFile(`assets/Elevsound/${item.voiceFile}`));
                audioFrames = Math.ceil(seconds * fps) + 15;
              }
            } catch (e) { console.log(e); }

            const text = item.content || item.code || "";
            const textFrames = index === 0 ? 45 : (text.length * 1.6) + 60;
            
            return { ...item, calculatedDuration: Math.max(audioFrames, textFrames) };
          })
        );

        const total = enrichedScenes.reduce((acc, s) => acc + s.calculatedDuration, 0) + 30;

        return {
          durationInFrames: Math.max(total, 30),
          props: { scenes: enrichedScenes }
        };
      }}
      fps={30} width={1080} height={1920}
    />
  );
};
                    
