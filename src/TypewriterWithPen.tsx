import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const Cursor = ({ color }: { color?: string }) => (
  <span style={{
    width: '4px',
    height: '1.2em', 
    backgroundColor: color || '#00B4D8',
    boxShadow: `0 0 12px ${color || '#00B4D8'}`,
    borderRadius: '2px',
    marginLeft: '8px', 
    display: 'inline-block',
    verticalAlign: 'text-bottom', 
  }} />
);

export const TypewriterWithPen: React.FC<{ text: string; frameOffset: number; color?: string }> = ({ text, frameOffset, color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  // تقليل الأوفست لضمان استمرار الكتابة لنهاية المشهد تقريباً
  const END_SAFE_OFFSET = 15; 
  const availableFrames = Math.max(1, durationInFrames - frameOffset - END_SAFE_OFFSET);
  
  const typingSpeed = availableFrames / (text.length || 1); 
  const activeCharIndex = Math.max(0, Math.floor((frame - frameOffset) / typingSpeed));

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
    <div style={{ 
      whiteSpace: 'pre-wrap', 
      position: 'relative',
      display: 'block', 
      width: '100%',    
      textAlign: 'right', 
      direction: 'rtl',   
      lineHeight: '1.5',  
      fontSize: '46px', // تكبير الخط ليناسب شاشة الموبايل
      fontWeight: 'bold'
    }}>
      <span style={{ color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
        {visibleText}
      </span>
      
      {(isTyping || isFinished) && (
        <span style={{ 
            opacity: isTyping ? 1 : cursorOpacity, 
            display: 'inline-block',
            whiteSpace: 'nowrap' 
        }}>
          <Cursor color={color} />
        </span>
      )}
      
      {/* نص مخفي للحفاظ على أبعاد الحاوية ومنع الـ Layout Shift */}
      <span style={{ opacity: 0, pointerEvents: 'none' }}>
        {text.substring(activeCharIndex)}
      </span>
    </div>
  );
};
    
