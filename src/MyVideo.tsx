import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './style.css';

const ENTRANCE_OFFSET = 20;
// لو مش بتستخدم أصوات SFX، ممكن تمسح السطرين الجايين عادي
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

// تحويل كلاس اللون للون حقيقي عشان المؤشر النيون
const getNeonColor = (colorClass: string) => {
    switch(colorClass) {
        case 'c-green': return '#00FF00';
        case 'c-purple': return '#B026FF';
        case 'c-orange': return '#FF8C00';
        case 'c-magenta': return '#FF00FF';
        case 'c-red': return '#FF3333';
        case 'c-blue': 
        default: return '#00B4D8'; 
    }
};

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    
    const text = item.content || item.code || "";
    const neonColor = getNeonColor(item.color);
    
    const scale = spring({ fps, frame, config: { damping: 12 } });
    const rotationY = interpolate(frame, [0, durationInFrames], [-2, 2]);
    const rotationX = interpolate(frame, [0, durationInFrames], [1, -1]);

    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: '1200px' }}>
            
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                {/* امسح سطر الصوت ده لو مفيش فولدر sfx عندك */}
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.6} />
            </Sequence>

            {item.voiceFile && (
                <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} volume={1} />
            )}

            <div 
                className={`modern-tech-card ${item.color || 'c-blue'}`} 
                style={{ 
                    transform: `scale(${scale}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
                    transformStyle: 'preserve-3d',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '85%',         
                    maxWidth: '900px',
                    minHeight: '400px',   
                }}
            >
                <div className="window-header">
                    <div className="window-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <div className="window-title" style={{ fontFamily: 'monospace', opacity: 0.8 }}>
                        {item.title || 'FlutterByMousa'}
                    </div>
                </div>

                <div 
                    className="card-body-content" 
                    style={{ 
                        direction: item.type === 'code' ? 'ltr' : 'rtl',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        flex: 1,
                        padding: '40px' 
                    }}
                >
                    {item.type === 'box' && (
                        <div className="modern-text-body" style={{ width: '100%' }}>
                           <TypewriterWithPen 
                                text={text} 
                                frameOffset={10} 
                                color={neonColor} 
                            />
                        </div>
                    )}

                    {item.type === 'code' && (
                        <div className="modern-code-wrapper" style={{ width: '100%', direction: 'ltr', textAlign: 'left' }}>
                            <SyntaxHighlighter 
                                language="dart" 
                                style={vscDarkPlus}
                                customStyle={{ 
                                    background: 'transparent', 
                                    padding: '0', 
                                    margin: '0',
                                    fontSize: '28px', 
                                    lineHeight: '1.6',
                                }}
                            >
                                {text}
                            </SyntaxHighlighter>
                        </div>
                    )}
                </div>
            </div>

            <div 
                className="video-progress-bar" 
                style={{ 
                    width: `${(frame / durationInFrames) * 100}%`,
                    backgroundColor: neonColor, 
                    height: '6px',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    boxShadow: `0 0 10px ${neonColor}`
                }} 
            />
        </AbsoluteFill>
    );
};

export const MyVideo = ({ scenes }: { scenes: any[] }) => {
    let currentFrameOffset = 0;

    if (!scenes || scenes.length === 0) {
        return <AbsoluteFill style={{ backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '40px' }}>جاري تحميل البيانات...</AbsoluteFill>;
    }

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}>
            {scenes.map((item, index) => {
                const sceneDuration = Math.ceil(item.calculatedDuration || 150); 
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
    
