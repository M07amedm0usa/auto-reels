import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// 💡 استبدلنا القلم بـ "مؤشر نيون" (Neon Cursor) بيتحرك مع الكتابة
const Cursor = ({ color }: { color?: string }) => (
  <div style={{
    width: '4px',
    height: '40px',
    backgroundColor: color || '#00B4D8', // لون فلاتر المميز
    boxShadow: `0 0 10px ${color || '#00B4D8'}`,
    borderRadius: '2px',
    marginLeft: '4px',
    display: 'inline-block',
    verticalAlign: 'middle',
  }} />
);

export const TypewriterWithPen: React.FC<{ text: string; frameOffset: number; color?: string }> = ({ text, frameOffset, color }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  
  // 🎯 تقليل الـ Offset لزيادة سرعة القراءة
  const END_SAFE_OFFSET = 30; 
  const availableFrames = Math.max(1, durationInFrames - frameOffset - END_SAFE_OFFSET);
  
  // سرعة كتابة ديناميكية تجعل النص يظهر بسلاسة مع الصوت
  const typingSpeed = availableFrames / (text.length || 1); 
  const activeCharIndex = Math.max(0, Math.floor((frame - frameOffset) / typingSpeed));

  // تأثير "النبض" للمؤشر (Blinking effect)
  const cursorOpacity = interpolate(
    (frame % 20),
    [0, 10, 20],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  const visibleText = text.substring(0, activeCharIndex);
  const isTyping = activeCharIndex < text.length && frame > frameOffset;
  const isFinished = activeCharIndex >= text.length;

  return (
    <span style={{ 
      whiteSpace: 'pre-wrap', 
      unicodeBidi: 'plaintext', 
      position: 'relative',
      display: 'inline-block',
      lineHeight: '1.4'
    }}>
      {/* النص الظاهر حالياً */}
      <span style={{ color: '#fff', textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>
        {visibleText}
      </span>
      
      {/* المؤشر الذكي: يظهر أثناء الكتابة ويستمر في النبض بعد النهاية */}
      {(isTyping || isFinished) && (
        <span style={{ 
            opacity: isTyping ? 1 : cursorOpacity, 
            display: 'inline-block',
            transition: 'opacity 0.1s ease'
        }}>
          <Cursor color={color} />
        </span>
      )}
      
      {/* نص مخفي للحفاظ على أبعاد الحاوية (Container) ومنع الـ Layout Shift */}
      <span style={{ opacity: 0 }}>{text.substring(activeCharIndex)}</span>
    </span>
  );
};
