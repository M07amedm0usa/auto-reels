import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import data from '../public/assets/data.json';
import './style.css';

const ENTRANCE_OFFSET = 20;
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const text = item.content || item.code || "";
    
    // حساب سرعة القلم عشان يخلص بالظبط مع نهاية الصوت
    const totalSceneFrames = (item.voiceDuration || text.length * 2) + 60;
    const typingDuration = totalSceneFrames - 40; 
    
    const scale = spring({ fps, frame, config: { damping: 12 } });
    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            
            {/* 1. أصوات الـ Transition القصيرة */}
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.6} />
            </Sequence>

            {/* 🎤 2. التعليق الصوتي (Voiceover) - بيقرأ من الفولدر الجديد */}
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
                            // تعديل بسيط في المكون ده عشان نتحكم في السرعة بناءً على طول الصوت
                        />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const MyVideo = () => {
    let currentFrameOffset = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#d8dde6' }}>
            {/* موسيقى هادية جداً في الخلفية */}
            <Audio src={staticFile("assets/music.mp3")} volume={0.05} loop />

            {data.map((item, index) => {
                const text = item.content || item.code || "";
                const sceneDuration = Math.max(item.voiceDuration || 0, text.length * 2) + 80;
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
        
