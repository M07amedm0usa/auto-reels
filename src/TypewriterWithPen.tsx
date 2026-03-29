import React from 'react';
import { useCurrentFrame } from 'remotion';

// رسمة القلم 
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
  const typingSpeed = 2; // سرعة الكتابة 
  
  // حساب عدد الحروف اللي المفروض تظهر في الفريم الحالي
  const activeCharIndex = Math.max(0, Math.floor((frame - frameOffset) / typingSpeed));

  // هزة القلم
  const wiggle = Math.sin(frame) * 10 - 15; 
  
  // السحر هنا: بنعرض النص ككتلة واحدة عشان المتصفح ميتلخبطش في الإنجليزي والعربي
  const visibleText = text.substring(0, activeCharIndex);
  const hiddenText = text.substring(activeCharIndex);
  
  // هل القلم لسه بيكتب؟
  const isTyping = activeCharIndex < text.length && frame > frameOffset;

  return (
    <span style={{ whiteSpace: 'pre-wrap', unicodeBidi: 'plaintext' }}>
      {/* الجزء اللي اتكتب */}
      <span>{visibleText}</span>
      
      {/* القلم بيترسم بالضبط في الفاصل بين اللي اتكتب واللي لسه مخفي */}
      {isTyping && (
        <span style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            top: -80,
            right: -20, // تظبيط مكان السن عشان يمشي مع العربي صح
            zIndex: 100,
            transform: `rotate(${wiggle}deg)`, 
            pointerEvents: 'none'
          }}>
            <Pen />
          </div>
        </span>
      )}
      
      {/* الجزء اللي لسه هيتكتب (مخفي عشان يحافظ على أبعاد البوكس) */}
      <span style={{ opacity: 0 }}>{hiddenText}</span>
    </span>
  );
};
