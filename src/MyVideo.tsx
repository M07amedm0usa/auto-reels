import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import './style.css';

const ENTRANCE_OFFSET = 20;
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const text = item.content || item.code || "";
    
    // شيلنا الحسابات اليدوية من هنا لأن Root.tsx بقى بيبعت الوقت محسوب جاهز
    const scale = spring({ fps, frame, config: { damping: 12 } });
    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            
            {/* 1. أصوات الـ Transition القصيرة */}
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.6} />
            </Sequence>

            {/* 🎤 2. التعليق الصوتي (Voiceover) */}
            {item.voiceFile && (
                <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} volume={1} />
            )}

            <div className={`sketch-box ${item.style} ${item.color}`} style={{ transform: `scale(${scale})` }}>
                <div className="box-title" dir="rtl" style={{ unicodeBidi: 'plaintext' }}>{item.title}</div>
                
                <div className={item.type === 'box' ? 'box-body' : 'code-block'} 
                     style={{ direction: item.type === 'code' ? 'ltr' : 'rtl' }}>
                    
                    {frame > 15 && (
                        <TypewriterWithPen 
                            text={text} 
                            frameOffset={15} 
                        />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};

// 🎯 التعديل الأساسي هنا: بنستقبل scenes من Root بدال ما نقرا ملف json
export const MyVideo = ({ scenes }: { scenes: any[] }) => {
    let currentFrameOffset = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#d8dde6' }}>

            {scenes.map((item, index) => {
                // 🎯 بناخد الوقت بالمللي ثانية اللي Root.tsx حسبه من ملف الصوت الفعلي
                const sceneDuration = item.calculatedDuration; 
                const startFrom = currentFrameOffset;
                
                currentFrameOffset += sceneDuration;

                return (
                    <Sequence key={index} from={startFrom} durationInFrames={sceneDuration}>
                        <Scene item={item} index={index} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
                            
