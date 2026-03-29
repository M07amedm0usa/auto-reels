import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import data from '../public/assets/data.json';
import './style.css';

// استيراد الإعدادات من الـ Root
const TYPING_SPEED = 2;
const READ_BUFFER = 60;
const ENTRANCE_OFFSET = 20;

const Scene = ({ item }: { item: any }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const scale = spring({ fps, frame, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className={`sketch-box ${item.style} ${item.color}`} style={{ transform: `scale(${scale})` }}>
                <div className="box-title" dir="rtl" style={{ unicodeBidi: 'plaintext' }}>{item.title}</div>
                <div className={item.type === 'box' ? 'box-body' : 'code-block'} 
                     style={{ direction: item.type === 'code' ? 'ltr' : 'rtl' }}>
                    {frame > 15 && (
                        <TypewriterWithPen 
                            text={item.content || item.code} 
                            frameOffset={15} 
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
        <AbsoluteFill style={{ 
            backgroundColor: '#d8dde6',
            backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', 
            backgroundSize: '30px 30px'
        }}>
            {data.map((item, index) => {
                const text = item.content || item.code || "";
                const sceneDuration = (text.length * TYPING_SPEED) + READ_BUFFER + ENTRANCE_OFFSET;
                const startFrom = currentFrameOffset;
                
                // تحديث الـ Offset للمشهد اللي بعده
                currentFrameOffset += sceneDuration;

                return (
                    <Sequence key={index} from={startFrom} durationInFrames={sceneDuration}>
                        <Scene item={item} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
