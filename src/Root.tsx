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
            // نعتمد على الحسبة اللي جاية من n8n كقيمة مبدئية
            let finalDuration = item.calculatedDuration || 150; 
            
            try {
              if (item.voiceFile) {
                // لو فيه صوت، مدة المشهد هتكون مدة الصوت بالظبط + نص ثانية أمان
                const seconds = await getAudioDurationInSeconds(staticFile(`assets/Elevsound/${item.voiceFile}`));
                finalDuration = Math.ceil(seconds * fps) + 15;
              }
            } catch (e) { 
              console.log("Audio not found", e); 
            }

            // لغينا حسبة الحروف عشان Typewriter بقى ذكي وبيسرع نفسه أوتوماتيك
            return { ...item, calculatedDuration: finalDuration };
          })
        );

        // تجميع وقت المشاهد كلها + ثانية أمان في النهاية
        const total = enrichedScenes.reduce((acc, s) => acc + s.calculatedDuration, 0) + 30;

        return {
          durationInFrames: Math.max(total, 60),
          props: { scenes: enrichedScenes }
        };
      }}
      fps={30} width={1080} height={1920}
    />
  );
};
