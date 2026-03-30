import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import data from '../public/assets/data.json';
import './style.css';

const TYPING_SPEED = 2;
const READ_BUFFER = 60;
const ENTRANCE_OFFSET = 20;

// 🎵 مصفوفة الأصوات الـ 6 للـ Swoosh/Flip
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const text = item.content || item.code || "";
    
    const scale = spring({ fps, frame, config: { damping: 12 } });

    // اختيار صوت مختلف لكل مشهد من الترسانة الصوتية
    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            
            {/* 1. أصوات الـ Transition (Swoosh/Flip) */}
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.7} />
            </Sequence>

            <div className={`sketch-box ${item.style} ${item.color}`} style={{ transform: `scale(${scale})` }}>
                <div className="box-title" dir="rtl" style={{ unicodeBidi: 'plaintext' }}>{item.title}</div>
                
                <div className={item.type === 'box' ? 'box-body' : 'code-block'} 
                     style={{ direction: item.type === 'code' ? 'ltr' : 'rtl' }}>
                    
                    {frame > 15 && (
                        <TypewriterWithPen text={text} frameOffset={15} />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const MyVideo = () => {
    let currentFrameOffset = 0;

    return (
        <AbsoluteFill style={{ 
            backgroundColor: '#d8dde6',
            backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', 
            backgroundSize: '30px 30px'
        }}>
            
            {/* 🎵 موسيقى الخلفية (اختياري - لو موجودة فك عنها الـ Comment) */}
            {/* <Audio src={staticFile("assets/music.mp3")} volume={0.1} loop /> */}

            {data.map((item, index) => {
                const text = item.content || item.code || "";
                const sceneDuration = (text.length * TYPING_SPEED) + READ_BUFFER + ENTRANCE_OFFSET;
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
