import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

// 💡 مؤشر نيون (Neon Cursor) بيتحرك مع الكتابة
const Cursor = ({ color }: { color?: string }) => (
  <span style={{
    width: '4px',
    height: '1.2em', // مرتبط بحجم الخط بدل قيمة ثابتة 40px
    backgroundColor: color || '#00B4D8',
    boxShadow: `0 0 10px ${color || '#00B4D8'}`,
    borderRadius: '2px',
    marginLeft: '6px', // مسافة أكبر شوية
    marginRight: '2px',
    display: 'inline-block',
    verticalAlign: 'text-bottom', // يتماشى مع السطر بشكل أفضل
  }} />
);

export const TypewriterWithPen: React.FC<{ text: string; frameOffset: number; color?: string }> = ({ text, frameOffset, color }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  
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
    // 1️⃣ استخدام div بدل span مع تحديد الاتجاه والمحاذاة
    <div style={{ 
      whiteSpace: 'pre-wrap', 
      position: 'relative',
      display: 'block', // Block بدل inline-block
      width: '100%',    // يأخذ عرض الحاوية بالكامل
      textAlign: 'right', // إجبار المحاذاة لليمين
      direction: 'rtl',   // إجبار الاتجاه لليمين
      lineHeight: '1.6',  // تباعد أسطر أريح للعين
      fontSize: '32px'    // تكبير الخط قليلاً لملء المساحة
    }}>
      {/* النص الظاهر حالياً */}
      <span style={{ color: '#fff', textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>
        {visibleText}
      </span>
      
      {/* المؤشر الذكي */}
      {(isTyping || isFinished) && (
        <span style={{ 
            opacity: isTyping ? 1 : cursorOpacity, 
            display: 'inline-block',
            transition: 'opacity 0.1s ease',
            // منع المؤشر من النزول لسطر جديد وحده
            whiteSpace: 'nowrap' 
        }}>
          <Cursor color={color} />
        </span>
      )}
      
      {/* 2️⃣ النص المخفي (مهم جداً أن يكون له نفس الـ styling بالضبط) */}
      <span style={{ 
        opacity: 0,
        pointerEvents: 'none' // تأكيد على عدم التفاعل معه
      }}>
        {text.substring(activeCharIndex)}
      </span>
    </div>
  );
};
