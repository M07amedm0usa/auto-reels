import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
import { TypewriterWithPen } from './TypewriterWithPen'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './style.css';

const ENTRANCE_OFFSET = 20;
// تأكد إن ملفات الصوت دي موجودة في فولدر public/assets/sfx/ أو امسح الكود بتاعها لو مش بتستخدمها
const FLIP_SOUNDS = ['1.wav', '2.wav', '3.wav', '4.mp3', '5.mp3', '6.mp3'];

// 🎨 دالة مساعدة لتحويل اسم الكلاس للون حقيقي عشان المؤشر النيون والـ Progress Bar
const getNeonColor = (colorClass: string) => {
    switch(colorClass) {
        case 'c-blue': return '#00B4D8';
        case 'c-green': return '#00FF00';
        case 'c-purple': return '#B026FF';
        case 'c-orange': return '#FF8C00';
        case 'c-magenta': return '#FF00FF';
        case 'c-red': return '#FF3333';
        default: return '#00B4D8'; // اللون الافتراضي (فلاتر بلو)
    }
};

const Scene = ({ item, index }: { item: any, index: number }) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    
    // سحب النص أو الكود، والتأكد إنه String عشان ميعملش إيرور
    const text = item.content || item.code || "";
    const neonColor = getNeonColor(item.color);
    
    // 1. أنيميشن الظهور (Scale + Spring)
    const scale = spring({ fps, frame, config: { damping: 12 } });

    // 2. حركة الـ 3D Perspective (ميلان خفيف جداً واحترافي)
    const rotationY = interpolate(frame, [0, durationInFrames], [-2, 2]);
    const rotationX = interpolate(frame, [0, durationInFrames], [1, -1]);

    const flipSound = FLIP_SOUNDS[index % FLIP_SOUNDS.length];

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', perspective: '1200px' }}>
            
            {/* أصوات الانتقال (SFX) */}
            <Sequence from={0} durationInFrames={ENTRANCE_OFFSET}>
                <Audio src={staticFile(`assets/sfx/${flipSound}`)} volume={0.6} />
            </Sequence>

            {/* التعليق الصوتي من ElevenLabs */}
            {item.voiceFile && (
                <Audio src={staticFile(`assets/Elevsound/${item.voiceFile}`)} volume={1} />
            )}

            {/* 💻 الكارت المودرن (Glassmorphism) */}
            <div 
                className={`modern-tech-card ${item.color || 'c-blue'}`} 
                style={{ 
                    transform: `scale(${scale}) rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
                    transformStyle: 'preserve-3d',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '85%',         // عرض ثابت لمنع تغير الحجم
                    maxWidth: '900px',
                    minHeight: '400px',   // ارتفاع أدنى لمنع الكارت من "القفز"
                }}
            >
                {/* شريط أدوات النافذة (Mac Style) */}
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

                {/* 📝 محتوى الكارت (النص أو الكود) */}
                <div 
                    className="card-body-content" 
                    style={{ 
                        direction: item.type === 'code' ? 'ltr' : 'rtl',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', // توسيط المحتوى عمودياً
                        flex: 1,
                        padding: '40px' // مساحة تنفس مريحة للعين
                    }}
                >
                    {/* عرض الشرح النصي */}
                    {item.type === 'box' && (
                        <div className="modern-text-body" style={{ width: '100%' }}>
                           <TypewriterWithPen 
                                text={text} 
                                frameOffset={10} 
                                color={neonColor} // تمرير اللون للمؤشر
                            />
                        </div>
                    )}

                    {/* عرض الأكواد */}
                    {item.type === 'code' && (
                        <div className="modern-code-wrapper" style={{ width: '100%', direction: 'ltr', textAlign: 'left' }}>
                            <SyntaxHighlighter 
                                language="dart" 
                                style={vscDarkPlus}
                                customStyle={{ 
                                    background: 'transparent', 
                                    padding: '0', 
                                    margin: '0',
                                    fontSize: '28px', // حجم خط مناسب للموبايل
                                    lineHeight: '1.6',
                                }}
                            >
                                {text}
                            </SyntaxHighlighter>
                        </div>
                    )}
                </div>
            </div>

            {/* 📏 Progress Bar سفلي بيتحرك مع وقت المشهد */}
            <div 
                className="video-progress-bar" 
                style={{ 
                    width: `${(frame / durationInFrames) * 100}%`,
                    backgroundColor: neonColor, // بياخد نفس لون الثيم
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

    // حماية لو مفيش مشاهد واصلة
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
            
