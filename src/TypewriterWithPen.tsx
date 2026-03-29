import React from 'react';
import { useCurrentFrame } from 'remotion';

// رسمة القلم SVG
const Pen = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 120 }}>
    <rect x="22" y="3" width="18" height="40" rx="5" fill="#222831" stroke="#111" strokeWidth="1.5"/>
    <rect x="22" y="3" width="18" height="10" rx="4" fill="#e74c3c" stroke="#c0392b" strokeWidth="1.2"/>
    <path d="M22,43 L40,43 L33,57 L29,57 Z" fill="#e8dcc8" stroke="#888" strokeWidth="1.2"/>
    <rect x="28" y="55" width="6" height="5" rx="1" fill="#111"/>
  </svg>
);

export const TypewriterWithPen: React.FC<{ text: string; frameOffset: number }> = ({ text, frameOffset }) => {
  const frame = useCurrentFrame();
  const typingSpeed = 2; // سرعة الكتابة (حرف كل 2 فريم)
  const activeCharIndex = Math.floor((frame - frameOffset) / typingSpeed);

  // أنيميشن هزة القلم مع الفريمات
  const wiggle = Math.sin(frame) * 10 - 15; 

  return (
    <span>
      {text.split('').map((char, index) => {
        const isVisible = index <= activeCharIndex;
        const isCurrent = index === activeCharIndex;
        
        if (char === '\n') return <br key={index} />;
        
        return (
          <span key={index} style={{ opacity: isVisible ? 1 : 0, position: 'relative' }}>
            {char}
            {isCurrent && (
              <div style={{
                position: 'absolute',
                top: -80, // تظبيط مكان القلم فوق الحرف
                left: -30,
                zIndex: 100,
                transform: `rotate(${wiggle}deg)`, 
                pointerEvents: 'none'
              }}>
                <Pen />
              </div>
            )}
          </span>
        );
      })}
    </span>
  );
};
                          
