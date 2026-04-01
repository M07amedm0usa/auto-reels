import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
// هنغير اسم المكون ده في الملف الجاي لـ ModernTypewriter
import { TypewriterWithPen } from './TypewriterWithPen'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './style.css';

const ENTRANCE_OFFSET = 20;
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const text = item.content || item.code || "";
    
    // 1. أنيميشن الظهور (Scale + Spring)
    const scale = spring({ fps, frame, config: { damping: 12 } });

    // 2. حركة الـ 3D Perspective (بتخلي الكارت يميل ببطء بيدي شكل بروفيشنال)
    const rotationY = interpolate(frame, [0, durationInFrames], [-5, 5]);
    const rotationX = interpolate(frame, [0, durationInFrames], [2, -2]);

    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: '1200px' }}>
            
            {/* أصوات الـ Transition */}
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.6} />
            </Sequence>

            {/* التعليق الصوتي من ElevenLabs */}
            {item.voiceFile && (
                <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} volume={1} />
            )}

            {/* الكارت المودرن الجديد - استبدلنا sketch-box بـ modern-tech-card */}
            <div 
                className={`modern-tech-card ${item.color}`} 
                style={{ 
                    transform: `scale(${scale}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* شريط أدوات النافذة (Mac Style) */}
                <div className="window-header">
                    <div className="window-dots">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                    </div>
                    <div className="window-title">{item.title}</div>
                </div>

                <div className="card-body-content" style={{ direction: item.type === 'code' ? 'ltr' : 'rtl' }}>
                    
                    {/* عرض النصوص بـ Modern Typewriter */}
                    {item.type === 'box' && (
                        <div className="modern-text-body">
                           <TypewriterWithPen 
                                text={text} 
                                frameOffset={10} 
                            />
                        </div>
                    )}

                    {/* عرض الكود بتنسيق نظيف جداً */}
                    {item.type === 'code' && (
                        <div className="modern-code-wrapper">
                            <SyntaxHighlighter 
                                language="dart" 
                                style={vscDarkPlus}
                                customStyle={{ 
                                    background: 'transparent', 
                                    padding: '20px', 
                                    margin: '0',
                                    fontSize: '28px',
                                    lineHeight: '1.6'
                                }}
                            >
                                {text}
                            </SyntaxHighlighter>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar تحت خالص بلون البراند */}
            <div className="video-progress-bar" style={{ width: `${(frame / durationInFrames) * 100}%` }} />
        </AbsoluteFill>
    );
};

export const MyVideo = ({ scenes }: { scenes: any[] }) => {
    let currentFrameOffset = 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#0a0a0a' }}> {/* خلفية غامقة بروفيشنال */}
            {scenes.map((item, index) => {
                const sceneDuration = Math.ceil(item.calculatedDuration); 
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
