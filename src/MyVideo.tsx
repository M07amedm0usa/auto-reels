import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen';
import data from '../public/assets/data.json';
import './style.css';

const Scene = ({ item }: { item: any }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    
    // أنيميشن دخول البوكس (Pop in)
    const scale = spring({ fps, frame, config: { damping: 12 } });
    
    // القلم يبدأ يكتب بعد ما البوكس يظهر (بعد 15 فريم)
    const textStartFrame = 15;

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div className={`sketch-box ${item.style} ${item.color}`} style={{ transform: `scale(${scale})` }}>
                <div className="box-title">{item.title}</div>
                
                <div className={item.type === 'box' ? 'box-body' : 'code-block'} 
                     style={{ direction: item.type === 'code' ? 'ltr' : 'rtl' }}>
                     
                    {/* استدعاء الكومبوننت بتاع القلم */}
                    {frame > textStartFrame && (
                        <TypewriterWithPen 
                            text={item.content || item.code} 
                            frameOffset={textStartFrame} 
                        />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};

export const MyVideo = () => {
    const sceneDuration = 150; // مدة المشهد الواحد (5 ثواني)

    return (
        <AbsoluteFill style={{ 
            backgroundColor: '#d8dde6',
            backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', 
            backgroundSize: '30px 30px'
        }}>
            {data.map((item, index) => (
                <Sequence key={index} from={index * sceneDuration} durationInFrames={sceneDuration}>
                    <Scene item={item} />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};
                              
