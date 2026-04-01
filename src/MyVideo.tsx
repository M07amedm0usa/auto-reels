import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './style.css';

const ENTRANCE_OFFSET = 20;
const containsArabic = (str: string) => /[\u0600-\u06FF]/.test(str);

const getNeonColor = (colorClass: string) => {
    const colors: Record<string, string> = {
        'c-green': '#00FF00',
        'c-purple': '#B026FF',
        'c-red': '#FF3333',
        'c-blue': '#00B4D8'
    };
    return colors[colorClass] || '#00B4D8';
};

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const text = item.content || item.code || "";
    const neonColor = getNeonColor(item.color);
    
    // اكتشاف اللغة لتحديد الاتجاه
    const isRTL = containsArabic(text);

    const scale = spring({ fps, frame, config: { damping: 12 } });
    const rotationY = interpolate(frame, [0, durationInFrames], [-3, 3]);
    const rotationX = interpolate(frame, [0, durationInFrames], [2, -2]);

    return (
        <AbsoluteFill style={{ 
            justifyContent: 'center', 
            alignItems: 'center', 
            perspective: '1200px',
            background: 'radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)' 
        }}>
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
                    width: '90%',         
                    minHeight: '450px',
                    boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${neonColor}33`
                }}
            >
                <div className="window-header">
                    <div className="window-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <div className="window-title">{item.title || 'FlutterByMousa'}</div>
                </div>

                <div className="card-body-content" style={{ 
                    padding: '50px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {item.type !== 'code' ? (
                        <TypewriterWithPen text={text} frameOffset={10} color={neonColor} />
                    ) : (
                        <div style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                            <SyntaxHighlighter 
                                language="dart" 
                                style={vscDarkPlus}
                                customStyle={{ background: 'transparent', fontSize: '32px', padding: 0 }}
                            >
                                {text}
                            </SyntaxHighlighter>
                        </div>
                    )}
                </div>
            </div>

            <div className="video-progress-bar" style={{ 
                width: `${(frame / durationInFrames) * 100}%`,
                backgroundColor: neonColor,
                boxShadow: `0 0 15px ${neonColor}`
            }} />
        </AbsoluteFill>
    );
};

export const MyVideo = ({ scenes }: { scenes: any[] }) => {
    let offset = 0;
    if (!scenes || scenes.length === 0) return <AbsoluteFill style={{backgroundColor:'#000'}} />;

    return (
        <AbsoluteFill>
            {scenes.map((item, index) => {
                const duration = Math.ceil(item.calculatedDuration || 150);
                const start = offset;
                offset += duration;
                return (
                    <Sequence key={index} from={start} durationInFrames={duration}>
                        <Scene item={item} index={index} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
        
