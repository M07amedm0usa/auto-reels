import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

// رسمة القلم المطورة 🖋️
const Pen = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
    <rect x="22" y="3" width="18" height="40" rx="5" fill="#222831" stroke="#111" strokeWidth="1.5"/>
    <rect x="22" y="3" width="18" height="10" rx="4" fill="#e74c3c" stroke="#c0392b" strokeWidth="1.2"/>
    <path d="M22,43 L40,43 L33,57 L29,57 Z" fill="#e8dcc8" stroke="#888" strokeWidth="1.2"/>
    <rect x="28" y="55" width="6" height="5" rx="1" fill="#111"/>
  </svg>
);

export const TypewriterWithPen: React.FC<{ text: string; frameOffset: number }> = ({ text, frameOffset }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
  /**
   * 🎯 سر الاحتراف هنا:
   * القلم بيوزع وقته عشان يخلص كتابة النص بالكامل قبل ما المشهد يخلص بـ 45 فريم (ثانية ونص كاملة).
   * الـ 45 فريم دي هي الوقت اللي المشاهد بيلحق يقرأ فيه الجملة كاملة، والصوت لسه بينطق آخر كلمتين.
   */
  const END_SAFE_OFFSET = 45; 
  const availableFrames = Math.max(1, durationInFrames - frameOffset - END_SAFE_OFFSET);
  const typingSpeed = availableFrames / (text.length || 1); 
  
  // حساب عدد الحروف اللي تظهر حالياً
  const activeCharIndex = Math.max(0, Math.floor((frame - frameOffset) / typingSpeed));

  // هزة القلم الطبيعية أثناء الكتابة
  const wiggle = Math.sin(frame * 0.8) * 8 - 12; 
  
  const visibleText = text.substring(0, activeCharIndex);
  const hiddenText = text.substring(activeCharIndex);
  
  const isTyping = activeCharIndex < text.length && frame > frameOffset;

  return (
    <span style={{ 
      whiteSpace: 'pre-wrap', 
      unicodeBidi: 'plaintext', 
      position: 'relative',
      display: 'inline-block' 
    }}>
      {/* النص المكتوب */}
      <span>{visibleText}</span>
      
      {/* القلم الذكي: بيتحرك مع الحروف */}
      {isTyping && (
        <span style={{ position: 'relative', display: 'inline-block', width: 0 }}>
          <div style={{
            position: 'absolute',
            top: -65,
            right: -10, 
            zIndex: 100,
            transform: `rotate(${wiggle}deg)`, 
            pointerEvents: 'none',
            transition: 'all 0.1s linear'
          }}>
            <Pen />
          </div>
        </span>
      )}
      
      {/* النص المخفي (للحفاظ على المساحة) */}
      <span style={{ opacity: 0 }}>{hiddenText}</span>
    </span>
  );
};
