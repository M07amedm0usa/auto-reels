import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

const containsArabic = (str: string) => /[\u0600-\u06FF]/.test(str);

const Cursor: React.FC<{ color: string }> = ({ color }) => (
  <span style={{
    display: 'inline-block',
    width: '3px',
    height: '1em',
    background: color,
    borderRadius: '2px',
    marginLeft: '6px',
    verticalAlign: 'middle',
    boxShadow: `0 0 18px ${color}, 0 0 40px ${color}55`,
  }} />
);

export const TypewriterWithPen: React.FC<{
  text: string;
  frameOffset: number;
  color?: string;
  fontSize?: number;
}> = ({ text, frameOffset, color = '#00FFD1', fontSize = 48 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const isRTL = containsArabic(text);

  const availableFrames = Math.max(1, durationInFrames - frameOffset - 15);
  const typingSpeed = availableFrames / (text.length || 1);
  const activeCharIndex = Math.max(0, Math.floor((frame - frameOffset) / typingSpeed));

  const cursorOpacity = interpolate(frame % 24, [0, 12, 24], [1, 0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const visibleText = text.substring(0, activeCharIndex);
  const isTyping = activeCharIndex < text.length && frame > frameOffset;
  const isFinished = activeCharIndex >= text.length;

  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      direction: isRTL ? 'rtl' : 'ltr',
      textAlign: isRTL ? 'right' : 'left',
      width: '100%',
      lineHeight: 1.55,
      fontSize,
      fontWeight: 700,
      color: '#FFFFFF',
      fontFamily: "'IBM Plex Sans Arabic', 'IBM Plex Mono', monospace",
      letterSpacing: isRTL ? '0' : '-0.5px',
    }}>
      <span>{visibleText}</span>
      {(isTyping || isFinished) && (
        <span style={{ opacity: isTyping ? 1 : cursorOpacity }}>
          <Cursor color={color} />
        </span>
      )}
      <span style={{ opacity: 0, pointerEvents: 'none' }}>{text.substring(activeCharIndex)}</span>
    </div>
  );
};
